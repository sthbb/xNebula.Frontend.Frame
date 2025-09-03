/*
 * @Author: Huangjs
 * @Date: 2024-02-22 17:15:02
 * @LastEditors: Huangjs
 * @LastEditTime: 2024-07-17 13:37:50
 * @Description: ******
 */
import { type App, type Component } from 'vue';
import { loadScript, loadStyle } from '@xnebula/utils';
import { i18n } from '@@/i18n';
import { router, route, FixedPath, asyncComponent } from '@@/router';
import { ACCESS_USER, ACCESS_TOKEN, IS_PROD, URL_REGEXP, warn } from '@@/utils';
import { authority } from '@@/store';
import type { Config, Plugins } from '@/types';
import getLazyModules from 'virtual:lazy-dependencies';

const getUser = () => {
  if (!authority.auth.value.ready) {
    throw new Error('No fetch auth');
  }
  return authority.auth.value.user;
};

let _config: Config | null = null;
const getConfig = () => {
  if (!_config) {
    throw new Error('No yet initialize');
  }
  return _config;
};
let _modules: Plugins | null = null;
const getModules = () => {
  if (!_modules) {
    throw new Error('No yet initialize');
  }
  return _modules;
};

let _vueApp: App | null = null;
const getVueApp = () => {
  if (!_vueApp) {
    throw new Error('No yet initialize');
  }
  return _vueApp;
};

const loadPlugin = async (
  names: string | string[],
  props?: Record<string, any> | Record<string, any>[],
) => {
  const nameArray = Array.isArray(names) ? names : [names];
  const propArray = Array.isArray(props) ? props : [props];
  // 由于 monaco-editor 懒加载 amd 问题, 这里的插件只能使用串行
  const components: (Component | null)[] = [];
  for (const [index, name] of nameArray.entries()) {
    const component = await asyncComponent(
      getVueApp(),
      name,
      getConfig(),
      getModules(),
      false,
      propArray[index],
    ).then((comp) => {
      return comp.name && comp.name.indexOf('Error') !== -1 ? null : comp;
    });
    components.push(component);
  }
  return Array.isArray(names) ? components : components[0];
};
const getDependencies = () => {
  return getLazyModules().map(({ moduleName }) => moduleName);
};
const loadDependencies = async (assets: string | string[]) => {
  if (IS_PROD) {
    const config = getConfig();
    const assetArray = Array.isArray(assets) ? assets : [assets];
    // 要根据数组顺序进行依赖加载
    for (const asset of assetArray) {
      if (URL_REGEXP.test(asset) || asset.startsWith('/')) {
        const address = asset.startsWith('/')
          ? `${config.cdnUrl}${asset}`
          : asset;
        const frag = asset.split('?')[0].split('#')[0];
        if (frag.endsWith('.js')) {
          await loadScript(address).catch(() => {});
        } else if (frag.endsWith('.css')) {
          await loadStyle(address).catch(() => {});
        } else {
          warn(`依赖: [${asset}] 似乎不是一个有效的 js 或 css 资源`);
        }
      } else {
        const { moduleName, globalName, frameCoreName, jsPath, cssPath } =
          getLazyModules().find(({ moduleName: m }) => asset === m) || {};
        if (globalName && moduleName) {
          if (!(window as any)[globalName]) {
            if (moduleName === 'monaco-editor') {
              // monaco-editor 特殊加载
              const paths = jsPath?.split('*') || [];
              await loadScript(
                `${config.cdnUrl}${paths[0]}vs/loader.js${paths[1]}`,
              ).catch(() => {});
              (window as any).require.config({
                paths: { vs: `${config.cdnUrl}${paths[0]}vs` },
              });
              await new Promise<void>((resolve) => {
                (window as any).require(
                  [`vs/editor/editor.main`],
                  (me: any) => {
                    (window as any).define.amd = null;
                    (window as any).MonacoEditor = me;
                    resolve();
                  },
                );
              });
            } else if (moduleName) {
              await Promise.all([
                loadScript(`${config.cdnUrl}${jsPath}`),
                cssPath
                  ? loadStyle(`${config.cdnUrl}${cssPath}`)
                  : Promise.resolve(),
              ]);
              if (frameCoreName) {
                window.xNebula.FrameCore[frameCoreName] = (window as any)[
                  globalName
                ];
              }
            }
          } else if (!IS_PROD) {
            warn(`依赖: [${asset}] 已经加载, 不需要再重复加载`);
          }
        } else {
          warn(
            `依赖: [${asset}] 不存在, 请检查该资源名称, 可以执行 getDependencies() 方法获取可加载资源的列表`,
          );
        }
      }
    }
  } else {
    warn(
      `loadDependencies() 方法只适用于线上生产阶段, 开发阶段使用 ESModule 加载`,
    );
  }
};

export const createExpose = async (config: Config, modules: Plugins) => {
  _modules = modules;
  _config = config;
  // 如果需要, 这里倒是可以搞异步获取
  return (vueApp: App) => {
    _vueApp = vueApp;
  };
};

export const Expose = {
  i18n,
  router,
  route,
  getUser,
  getConfig,
  getVueApp,
  getModules,
  loadPlugin,
  loadDependencies,
  getDependencies,
  isProduction: () => IS_PROD,
  getFixedPath: () => FixedPath,
  version: __FRAME_VERSION__,
  accessKeys: { ACCESS_USER, ACCESS_TOKEN },
};
