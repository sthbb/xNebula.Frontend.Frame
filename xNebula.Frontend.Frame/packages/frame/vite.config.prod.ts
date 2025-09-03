/*
 * @Author: Huangjs
 * @Date: 2024-02-22 17:15:02
 * @LastEditors: Huangjs
 * @LastEditTime: 2024-07-24 11:21:54
 * @Description: ******
 */
import path from 'node:path';
import { defineConfig, type PluginOption, type Rollup } from 'vite';
import vue from '@vitejs/plugin-vue';
import { viteStaticCopy as copy } from 'vite-plugin-static-copy';
import virtual from '@rollup/plugin-virtual';
import html from './plugin-html';
import {
  modules,
  setImport,
  setExpose,
  setExport,
  setLoadMethod,
} from './modules';
import pkg from './package.json';

// 后续 monaco 不要了，直接去掉相关代码及模块

const { MOD_ENV } = process.env;

const publicPath = './www/';
const plugins: PluginOption = [];
const rollupPlugins: Rollup.InputPluginOption = [];
const external: Rollup.ExternalOption = [];
const globals: Rollup.GlobalsOption = {};
if (MOD_ENV === 'CORE') {
  plugins.push(
    vue(),
    virtual({
      'virtual:lazy-dependencies': `
      export default () => {
        return ${JSON.stringify(modules.map((v, i) => setImport('prod', v, i)).filter((dep) => typeof dep !== 'string'))};
      };
    `,
    }),
  );
  // 排除所有全局依赖模块，生产环境会从 lib 库里拿，并得到全局变量
  modules.forEach(({ moduleName, globalName, cssPath }) => {
    external.push(moduleName);
    if (cssPath) {
      external.push(`${moduleName}/${cssPath}`);
    }
    // 对应的全局变量
    globals[moduleName] = globalName;
  });
} else {
  // 打包产品时需要把安装的 module 内的 umd 复制到 lib 库，同时加入加载他们的的代码
  plugins.push(
    copy({
      targets: modules
        .filter((m) => !m.extendLib) // extendLib 的 不需要 copy
        .map(({ moduleName, jsPath, cssPath }) => ({
          src: [
            `node_modules/${moduleName}/${jsPath}`,
            cssPath ? `node_modules/${moduleName}/${cssPath}` : '',
          ].filter((o) => !!o),
          // monaco-editor copy 特殊处理一下
          dest: `lib/${moduleName}${moduleName === 'monaco-editor' ? '/vs' : ''}`,
        })),
    }),
    // 生产模式，所有库全部 script 加载，core 部分也 script加载并会自动注入全局，初始化函数返回给 index 使用
    virtual({
      'virtual:inject-dependencies': `
        ${setLoadMethod()}
        ${setExport('prod')}
        export default async (config) => {
          const { cdnUrl: path, useLCP } = config;
          // LCP 需要优先加载 monaco
          if(useLCP){
            await loadScript(path + '/lib/monaco-editor/vs/loader.js').catch(() => {});
            require.config({ paths: { 'vs': path + '/lib/monaco-editor/vs' } });
            await new Promise((resolve) => {
              require(['vs/editor/editor.main'], function (_monaco) {
                window.define.amd = null;
                window.MonacoEditor = _monaco;
                resolve();
              });
            });
          }
          ${modules
            .map((v, i) => setImport('prod', v, i))
            .filter((dep) => typeof dep === 'string')
            .join('\n')}
          // 加载 Frame, 加载后Frame 内部接口会自动暴露到 FrameCore
          await Promise.all([
            loadScript(path + '/lib/index.umd.js?v=${pkg.version}').catch(() => {}),
            loadStyle(path + '/lib/index.css?v=${pkg.version}').catch(() => {}),
          ]);
          ${modules.map((v, i) => setExpose('prod', v, i)).join('\n')}
          return window.xNebula.FrameCore._initialize;
        };
      `,
    }),
  );
  // 这个 html 插件在 lib 模式下 build 不会生成 html，而 @rollup/plugin-html 可以
  // 该插件不放进顶层 vite plugins 里是因为，vite 会在 build 的时候把 lib 模式下的 css 资源 给去掉
  rollupPlugins.push(
    html({
      publicPath: `${(publicPath || '').replace(/(\/+)$/, '')}/`, // 加载资源 index 资源
      template: {
        version: pkg.version,
        depsJs: ['/api/frame/default/value'],
        tmpl: path.resolve(__dirname, './index.html'),
      },
    }),
  );
}

export default defineConfig({
  define: {
    // 生产模式是需要 __PUBLIC_PATH__ 的，主要用于加载公共和 core 资源
    __PUBLIC_PATH__: JSON.stringify(publicPath.replace(/(\/+)$/, '')),
    // 生产模式加载插件不用代理，无需前缀
    __PLUGIN_PREFIX__: JSON.stringify(''),
  },
  plugins,
  build: {
    outDir: './prod',
    // 设置为 false，则不删除上次构建的产物
    emptyOutDir: MOD_ENV === 'CORE',
    lib: {
      entry: path.resolve(
        __dirname,
        MOD_ENV === 'CORE' ? './src/core/index.ts' : './src/main.ts',
      ),
      name: MOD_ENV === 'CORE' ? 'xNebula.FrameCore' : 'xNebula.FrameEntry',
      formats: [MOD_ENV === 'CORE' ? 'umd' : 'iife'],
      fileName: () => (MOD_ENV === 'CORE' ? 'lib/index.umd.js' : 'index.js'),
    },
    rollupOptions: {
      plugins: rollupPlugins,
      external: external,
      output: {
        globals,
        assetFileNames: MOD_ENV === 'CORE' ? 'lib/index.css' : 'index.css',
      },
    },
  },
});
