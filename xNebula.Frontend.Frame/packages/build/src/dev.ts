/*
 * @Author: Huangjs
 * @Date: 2024-02-22 17:15:02
 * @LastEditors: Huangjs
 * @LastEditTime: 2024-07-17 09:00:55
 * @Description: ******
 */
import chalk from 'chalk';
import { createServer, type ProxyOptions } from 'vite';
import vue from '@vitejs/plugin-vue';
import virtual from '@rollup/plugin-virtual';
import { Env, type Package, type ResolvedConfig } from './types';

const safeUrl = (url: string) => {
  try {
    new URL(url || '');
    return url;
  } catch (_e) {
    return '';
  }
};

export default async (
  cwd: string,
  pkg: Package,
  pages: string[],
  virtualCode: string,
  pluginName: string,
  config: ResolvedConfig,
  customToken?: string,
) => {
  const {
    root,
    base,
    mode,
    define,
    plugins,
    pluginVueOptions,
    pluginVirtualOptions,
    entry,
    build,
    server,
    ...restConfig
  } = config;
  const {
    proxyServer: _proxyServer,
    proxyData,
    proxy,
    ...restServer
  } = server || {};
  const proxyServer = safeUrl(_proxyServer || '');
  const defProxy: Record<string, string | ProxyOptions> = {};
  Object.keys(proxyData).forEach((api) => {
    const _proxyDataVal = proxyData[api];
    const proxyDataVal =
      typeof _proxyDataVal === 'function'
        ? _proxyDataVal(pluginName, pages, customToken, entry.showServerMenus)
        : _proxyDataVal;
    const {
      data: _data,
      headers: _headers,
      hack: _hack,
      proxy: _url,
    } = proxyDataVal;
    const data = _data || null;
    const url = safeUrl(_url || '');
    const hack = proxyServer ? _hack : false;
    let headers = _headers;
    if (!headers) {
      headers = {};
    }
    if (!headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }
    defProxy[api] = {
      target: url ? url : hack ? proxyServer : '/',
      changeOrigin: true,
      selfHandleResponse: hack,
      configure: (_proxy) => {
        if (hack) {
          _proxy.on('proxyRes', (proxyRes, _, res) => {
            const chunks: Buffer[] = [];
            proxyRes.on('data', (chunk) => chunks.push(chunk));
            proxyRes.on('end', () => {
              res.end(
                Buffer.from(
                  JSON.stringify(
                    typeof data === 'function'
                      ? data(JSON.parse(Buffer.concat(chunks).toString()))
                      : data,
                  ),
                ),
              );
            });
          });
        }
      },
      bypass: (_, res) => {
        if (!hack) {
          Object.keys(headers).forEach((key) => {
            res.setHeader(key, headers[key]);
          });
          res.end(JSON.stringify(typeof data === 'function' ? data() : data));
          return false;
        }
      },
    };
  });
  if (proxyServer) {
    defProxy['/plugin'] = {
      target: proxyServer,
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/plugin/, ''),
    };
    defProxy['/api'] = {
      target: proxyServer,
      changeOrigin: true,
    };
  }
  try {
    if (pluginVirtualOptions && pluginVirtualOptions['virtual:inject-pages']) {
      throw new Error(
        `'virtual:inject-pages' has been used internally, please change to another name.`,
      );
    }
    const _server = await createServer({
      ...restConfig,
      configFile: false,
      envFile: false,
      root: root || cwd,
      base: base || '/',
      mode: mode || Env.development,
      define: {
        __PLG_NAME__: JSON.stringify(pluginName),
        __VERSION__: JSON.stringify(pkg.version),
        ...(define || {}),
      },
      plugins: [
        vue(pluginVueOptions),
        virtual({
          ...(pluginVirtualOptions || {}),
          'virtual:inject-pages': virtualCode,
        }),
        ...(plugins || []),
      ],
      server: {
        ...restServer,
        proxy: {
          ...(proxy || {}),
          ...defProxy,
        },
      },
    });
    if (!_server.httpServer) {
      throw new Error('HTTP server not available.');
    }
    // TODO: 直接这么配置用不了, 需要以插件的形式配置
    /* _server.middlewares.use((req, res, next) => {
      next();
    });
    plugins: [
      vue(),
      {
        name: 'configure-server',
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            next();
          });
        },
      },
    ]; */
    await _server.listen();
    console.log(chalk.green(`Server is started:\n`));
    _server.printUrls();
    _server.bindCLIShortcuts({ print: true });
  } catch (e) {
    console.error(chalk.red(`error when starting dev server:\n${e.stack}`), {
      error: e,
    });
    process.exit(1);
  }
};
