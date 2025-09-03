/*
 * @Author: Huangjs
 * @Date: 2022-10-26 11:23:47
 * @LastEditors: Huangjs
 * @LastEditTime: 2024-07-16 17:47:42
 * @Description: ******
 */
import type { App } from 'vue';
import { loadScript, loadStyle } from '@xnebula/utils';
import type { AssetPath, AssetSetup, Plugins } from '@/types';

export const loadAssets = <T extends Plugins[keyof Plugins]>(
  astPath: AssetPath,
  key: string,
) => {
  return new Promise<T | null>((resolve) => {
    // 组件已经加载过
    let asset: T = window.xNebula.FramePlugins[key] as T;
    if (isComponent(asset) || isFunction(asset)) {
      resolve(asset);
    } else if (astPath && astPath.js) {
      const { js, css } = astPath;
      Promise.all([
        // js 加载成功后, 会自动执行并注入到 window.xNebula.FramePlugins
        loadScript(js).catch(() => {}),
        // css 资源加载成功与否不影响页面渲染, 不作判断
        css ? loadStyle(css).catch(() => {}) : Promise.resolve(),
      ]).then(() => {
        asset = window.xNebula.FramePlugins[key] as T;
        if (isComponent(asset) || isFunction(asset)) {
          resolve(asset);
        } else {
          resolve(null);
        }
      });
    } else {
      // 没有资源
      resolve(null);
    }
  });
};

export async function loadSetup(plugins: Plugins) {
  const promises: ReturnType<AssetSetup>[] = [];
  Object.keys(plugins).forEach((key) => {
    if (key.indexOf('__setup__') !== -1) {
      const setup = plugins[key];
      if (!isFunction(setup)) {
        promises.push(
          loadAssets<AssetSetup>(setup as AssetPath, key).then((_setup) =>
            _setup ? _setup() : () => {},
          ),
        );
      } else {
        promises.push((setup as AssetSetup)());
      }
    }
  });
  const installs = await Promise.all(promises);
  return (vueApp: App) => installs.forEach((install) => install(vueApp));
}

export const isComponent = (obj: any) => {
  // 组合式
  if (
    obj &&
    (typeof obj.render === 'function' || typeof obj.setup === 'function')
  ) {
    return true;
  }
  // 配置式
  if (obj && (obj.$el || obj.$options || obj.$props || obj.$emit)) {
    return true;
  }
  // 函数式
  if (typeof obj === 'function' && (obj.props || obj.emits)) {
    return true;
  }
  return false;
};

export const isFunction = (obj: any) => {
  return typeof obj === 'function';
};

export const handleView = (view?: string) => {
  const match = (view || '').match(/^@lcp:(.+)$/);
  if (match && match[1]) {
    const [pluginName, lcpAPI] = match[1].split(':');
    const key = `${pluginName}_${lcpAPI.replace(/\/+/g, '_')}`;
    return { key, lcpAPI, pluginName };
  }
  const key = (view || '') // 中间多个 /._ 转成 _;
    .replace(/^(\/|\.|_)+/, '') // 去掉开头所有 /._
    .replace(/(\/|\.|_)+(Index)?(\/|\.|_)*$/, '') // 去掉结尾所有 /._(Index)/._
    .replace(/(\/|\.|_)+/g, '_');

  const pluginName = key.split('_')[0];
  return { key, lcpAPI: null, pluginName };
};

export const checkPageInactivity = (
  duration: number,
  fn: (inactivity: boolean) => void,
) => {
  // 要求 token 过期时间至少要大于 1s
  const leastSecond = 1;
  if (duration <= leastSecond) {
    fn(false);
  }
  let timer = 0;
  let lastTime = 0;
  const check = () => {
    const currentTime = Date.now();
    if (currentTime - lastTime > leastSecond * 1000) {
      lastTime = currentTime;
      clearTimeout(timer);
      timer = setTimeout(() => {
        fn(true);
      }, duration * 1000);
    }
  };
  document.addEventListener('keydown', check, true);
  document.addEventListener('touchstart', check, true);
  document.addEventListener('mousedown', check, true);
  document.addEventListener('mousewheel', check, true);
  document.addEventListener('mousemove', check, true);
  return () => {
    clearTimeout(timer);
    document.removeEventListener('keydown', check, true);
    document.removeEventListener('touchstart', check, true);
    document.removeEventListener('mousedown', check, true);
    document.removeEventListener('mousewheel', check, true);
    document.removeEventListener('mousemove', check, true);
  };
};
