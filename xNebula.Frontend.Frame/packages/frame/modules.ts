/*
 * @Author: Huangjs
 * @Date: 2024-03-04 15:34:21
 * @LastEditors: Huangjs
 * @LastEditTime: 2024-03-12 16:30:34
 * @Description: ******
 */
import process from 'node:process';
import fs from 'node:fs';
import path from 'node:path';
import { loadScript, loadStyle } from '@xnebula/utils';

type Mode = 'pub' | 'dev' | 'prod';
type Module = {
  // node_modules 里该模块的模块名称
  moduleName: string;
  // 该模块的 package.json 指示的 umd 文件路径
  jsPath: string;
  // 该模块的 package.json 指示的 style 文件路径
  cssPath?: string;
  // 该模块 umd 形式下，对外暴露的全局变量名称
  globalName: string;
  // 该模块如果需要从 frame 里出，则在 FrameCore 里的变量名称（内置）
  frameCoreName?: string;
  // 该模块从什么 lib 库下加载，不设置，就默认是 frame 后端的 lib 库，设置了，就会找对应的扩展库（Extend）
  extendLib?: string;
  // 用到时候再加载模块，这个只在生产模式使用umd加载时有效，开发模式因为是本地安装，所以可以直接使用
  lazy?: boolean;
  // 该模块 esModule 时的导出规则
  // exportHandle 不存在, import module0 from 'xxx';window[globalName] = module0;
  // exportHandle: * , import * as module0 from 'xxx';window[globalName] = module0;
  // exportHandle: 'XXX', import XXX from 'xxx';window[globalName] = XXX;
  // exportHandle: {handle:'*',variable:'TTT'}, import * as TTT from 'xxx';window[globalName] = TTT;
  // exportHandle: {handle:'XXX'}, import XXX from 'xxx';window[globalName] = XXX;
  // exportHandle: {handle:'{ AAA }',variable:'AAA'}, import { AAA } from 'xxx';window[globalName] = AAA;
  // exportHandle: {handle:'{ bbb as  BBB }',variable:'BBB'}, import { bbb as BBB } from 'xxx';window[globalName] = BBB;
  exportHandle?: string | { handle: string; variable: string };
};
// modules 里列举了 frame 全局要用的模块，并根据依赖的依赖关系排序，最基本的放在前面
// 在这里添加模块后，如果需要提供到 FrameCore 里而不是 window 里，需要同步在 src/index.ts 里添加导出类型
// 提供到 FrameCore 里的意味着，插件开发者不需要安装这个库，可直接从 frame 里拿到，反之，则需要插件开发者再次安装
export const modules = [
  {
    moduleName: 'vue',
    jsPath: 'dist/vue.global.prod.js',
    globalName: 'Vue',
    exportHandle: '*',
  },
  {
    moduleName: '@xnebula/utils',
    jsPath: 'dist/index.umd.js',
    globalName: 'xNebula.Utils',
    frameCoreName: 'XUtils',
    exportHandle: '*',
  },
  {
    moduleName: '@xnebula/commons',
    jsPath: 'dist/index.umd.js',
    globalName: 'xNebula.Commons',
    frameCoreName: 'XCommons',
    exportHandle: '*',
  },
  {
    moduleName: '@xnebula/components',
    jsPath: 'dist/index.umd.js',
    cssPath: 'dist/index.css',
    globalName: 'xNebula.Components',
    frameCoreName: 'XComponents',
    exportHandle: '*',
  },
  {
    moduleName: 'monaco-editor',
    jsPath: 'min/vs/*',
    globalName: 'MonacoEditor',
    lazy: true,
  },
  {
    moduleName: 'echarts',
    jsPath: 'dist/echarts.min.js',
    globalName: 'echarts',
    frameCoreName: 'Echarts',
    lazy: true,
    exportHandle: '*',
  },
  {
    moduleName: '@lcp/xcommon',
    jsPath: 'dist/index.umd.js',
    globalName: 'XCommon',
    extendLib: 'lcp',
    exportHandle: '*',
  },
  {
    moduleName: '@lcp/xcomponents',
    jsPath: 'dist/index.umd.js',
    cssPath: 'dist/style.css',
    globalName: 'XComponents',
    extendLib: 'lcp',
    exportHandle: '*',
  },
  {
    moduleName: '@lcp/xrenderer',
    jsPath: 'dist/index.umd.js',
    globalName: 'XRenderer',
    extendLib: 'lcp',
    exportHandle: '*',
  },
  {
    moduleName: '@lcp/xwidgets',
    jsPath: 'dist/index.umd.js',
    cssPath: 'dist/style.css',
    globalName: 'XWidgets',
    extendLib: 'lcp',
    exportHandle: '*',
  },
] as Module[];

// 三种模式时导入依赖的方式
export const setImport = (mode: Mode, module: Module, index: number) => {
  const {
    moduleName,
    globalName,
    frameCoreName,
    extendLib,
    lazy,
    exportHandle,
    jsPath,
    cssPath,
  } = module;
  if (mode === 'prod') {
    const pkg = JSON.parse(
      fs
        .readFileSync(
          path.join(process.cwd(), `./node_modules/${moduleName}/package.json`),
        )
        .toString(),
    );
    // 生产模式时，加载依赖用的是 load umd 的方式（会加载到 window 里）
    const loadJS = `loadScript(path + '/${extendLib || 'lib'}/${moduleName}/${path.basename(jsPath)}?v=${pkg.version}').catch(() => {})`;
    const loadCss = !cssPath
      ? ''
      : `, loadStyle(path + '/${extendLib || 'lib'}/${moduleName}/${path.basename(cssPath)}?v=${pkg.version}').catch(() => {})`;
    const loadCode = `await Promise.all([${loadJS}${loadCss}])`;
    // 懒加载就不去加载了（懒加载只会在 prod 模式下生效，需要用户调用方法触发加载），系统使用 lcp 的时候才去加载 lcp
    if (lazy) {
      // 返回出去保留到后面用户懒加载使用
      return {
        moduleName,
        globalName,
        frameCoreName,
        jsPath: `/${extendLib || 'lib'}/${moduleName}/${path.basename(jsPath)}?v=${pkg.version}`,
        cssPath: cssPath
          ? `/${extendLib || 'lib'}/${moduleName}/${path.basename(cssPath)}?v=${pkg.version}`
          : cssPath,
      };
    }
    return extendLib === 'lcp' ? `useLCP && (${loadCode});` : `${loadCode};`;
  }
  if (!frameCoreName && lazy) {
    // 既不放在 FrameCore 又要懒加载的，不进行导入（有一些不放在 FrameCore， 但是壳使用了，比如 @lcp/xrenderer，这一类必然不会懒加载）
    return '';
  }
  // 发布和开发模式 加载依赖用的是 import 导入的
  let mod = '';
  if (!exportHandle) {
    mod = `module${index}`;
  } else if (exportHandle === '*') {
    mod = `* as module${index}`;
  } else if (typeof exportHandle === 'string') {
    mod = exportHandle;
  } else {
    mod = exportHandle.handle;
  }
  return `import ${mod} from '${moduleName}';`;
};
// 三种模式暴露依赖到全局的方式（给 umd 插件使用的）
export const setExpose = (mode: Mode, module: Module, index: number) => {
  const { globalName, frameCoreName, lazy, exportHandle } = module;
  if (mode === 'prod') {
    // 只有放在frameCore里的并且不是懒加载的文件才能在这里（懒加载只会在 prod 模式下生效，需要用户调用方法触发加载）
    if (frameCoreName && !lazy) {
      // 生产模式下，把需要放在 FrameCore 里的依赖放到 FrameCore 里（这些依赖因为生模式下是 umd 加载在 window 里了，所以从 window 里取了）
      return `window.xNebula.FrameCore.${frameCoreName} = window.${globalName}`;
    }
    // 生产模式下不放在 FrameCore 里的依赖 因为已经以 umd 加载，自动放在 window 里了
    return '';
  }
  if (!frameCoreName && lazy) {
    // 既不放在 FrameCore 又要懒加载的，不进行导入（有一些不放在 FrameCore， 但是壳使用了，比如 @lcp/xrenderer，这一类必然不会懒加载）
    return '';
  }
  // 发布和开发模式下，因为是 import 导入的，所以这里拿到导入的变量
  let variable = '';
  if (!exportHandle || exportHandle === '*') {
    variable = `module${index}`;
  } else if (typeof exportHandle === 'string') {
    variable = exportHandle;
  } else {
    variable = exportHandle.variable;
  }
  let core = '';
  if (frameCoreName) {
    // 发布和开发模式下，把需要放在 FrameCore 里的依赖放到 FrameCore 里，提供给其它的 umd 插件使用
    core += `window.xNebula.FrameCore.${frameCoreName} = ${variable};`;
  }
  // 发布和开发模式下，把不放在 FrameCore 里的依赖放到 window 里，提供给其它的 umd 插件使用
  return core + `\nwindow.${globalName} = ${variable}`;
};
// 三种模式 esModule 模式下导出的 FrameCore 内东西
export const setExport = (mode: Mode) => {
  const _export = modules
    .map(({ frameCoreName, exportHandle }, index) => {
      if (frameCoreName) {
        if (mode === 'pub') {
          let variable = '';
          if (!exportHandle || exportHandle === '*') {
            variable = `module${index}`;
          } else if (typeof exportHandle === 'string') {
            variable = exportHandle;
          } else {
            variable = exportHandle.variable;
          }
          // 发布模式，要把 FrameCore 的变量导出去，供插件开发式下使用
          return `export const ${frameCoreName} = ${variable};`;
        }
        // 其它模式，不需要导出，用不到，直接导出空
        return `export const ${frameCoreName} = {}`;
      }
      return '';
    })
    .join('\n');
  const _expose =
    mode === 'pub'
      ? `import { Exposed } from './src/core/index';\nexport { Exposed };`
      : `export const Exposed = {};`;
  return `${_export}\n${_expose}`;
};
// 生产模式时，提供加载 umd 的方法
export const setLoadMethod = () => {
  return [
    `const loadScript = ${loadScript.toString()}`,
    `const loadStyle = ${loadStyle.toString()}`,
  ].join('\n');
};
