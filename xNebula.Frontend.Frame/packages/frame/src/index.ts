/*
 * @Author: Huangjs
 * @Date: 2024-02-22 17:15:02
 * @LastEditors: Huangjs
 * @LastEditTime: 2024-07-24 09:52:12
 * @Description: ******
 */

import initialize from 'virtual:inject-dependencies';
import type { Config, Plugins, AssetPath } from '@/types';

export * from 'virtual:inject-dependencies';
export * from '@/types';

const IS_PROD = __FRAME_MODE__ !== 'DEV' && __FRAME_MODE__ !== 'PUB';
const proxy = __PLUGIN_PREFIX__;
const modParse = (
  astModules: Record<string, AssetPath>,
  ast: string,
  la: 'js' | 'css',
) => {
  const match = ast.match(/^dist\.(.*)\.index.*$/);
  if (match && match[1]) {
    const key = match[1].replace(/\./g, '_');
    if (!astModules[key]) {
      astModules[key] = {};
    }
    astModules[key][la] = `${proxy}${ast}`;
  }
};
const loadConfAndMod = async () => {
  const [mods, cfgs, vals] = await Promise.all<
    [
      Promise<{ PluginName: string; Js: string[]; Css: string[] }[]>,
      Promise<Record<string, string>>,
      Promise<Record<string, string>>,
    ]
  >([
    fetch('/api/frame/plugin/modules')
      .then((response) => response.json())
      .then((json) => (json.code === 2000 ? json.data : []))
      .catch(() => []),
    fetch('/api/frame/configs')
      .then((response) => response.json())
      .then((json) => (json.code === 2000 ? json.data : {}))
      .catch(() => ({})),
    fetch('/api/frame/parameters/values', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([
        'IsHidePortal',
        'IsEnableCdn',
        'CdnUrl',
        'HomeIconUrl',
        'HomeLogoUrl',
        'DocumentUrl',
        'PwdStrongEnable',
        'PwdLength',
        'PwdStrength',
      ]),
    })
      .then((response) => response.json())
      .then((json) => (json.code === 2000 ? json.data : {}))
      .catch(() => ({})),
  ]);
  let isPortal = false;
  let isSso = false;
  let useLCP = false;
  let hasBigscreen = false;
  const modules: Record<string, AssetPath> = {};
  mods.forEach(({ PluginName, Js, Css }) => {
    // 当前系统是否是门户系统(主系统)
    isPortal = !isPortal ? PluginName === 'Portal' : isPortal;
    isSso = !isSso ? PluginName === 'Sso' : isSso;
    useLCP = !useLCP ? PluginName === 'LCP.Extend' : useLCP;
    hasBigscreen = !hasBigscreen ? PluginName === 'XBigScreen' : hasBigscreen;
    Js.forEach((j) => modParse(modules, j, 'js'));
    Css.forEach((c) => modParse(modules, c, 'css'));
  });
  if (!IS_PROD && isPortal) {
    if (!mods.find(({ PluginName }) => PluginName === 'Oauth')) {
      console.warn(
        '该系统安装了 Portal 插件, 而 Portal 插件依赖 Oauth 插件, 请安装 Oauth 插件...',
      );
    }
    if (!mods.find(({ PluginName }) => PluginName === 'Sys')) {
      console.warn(
        '该系统安装了 Portal 插件, 而 Portal 插件依赖 Sys 插件, 请安装 Sys 插件...',
      );
    }
  }
  const config: Config = {
    hidePortal: (() => {
      let hidePortal = false;
      try {
        hidePortal = JSON.parse(vals.IsHidePortal);
      } catch (_e) {
        hidePortal = false;
      }
      return hidePortal;
    })(),
    cdnUrl: (() => {
      let cdnUrl = '';
      try {
        cdnUrl = !JSON.parse(vals.IsEnableCdn) ? '' : (vals.CdnUrl ?? '');
      } catch (_e) {
        cdnUrl = '';
      }
      return cdnUrl.replace(/(\/+)$/, '') || __PUBLIC_PATH__; // cdnUrl 去掉最后一个斜杠
    })(),
    favUrl: vals.HomeIconUrl || '',
    logoUrl: vals.HomeLogoUrl || '',
    docUrl: vals.DocumentUrl || '',
    pwdConf: (() => {
      let pwdConf = null;
      try {
        pwdConf = !JSON.parse(vals.PwdStrongEnable)
          ? null
          : {
              size: +vals.PwdLength,
              strength: JSON.parse(vals.PwdStrength) as string[],
            };
      } catch (_e) {
        pwdConf = null;
      }
      return pwdConf;
    })(),
    title: 'title',
    mtitle: 'platform',
    loginBg: '',
    portalBg: '',
    isPortal,
    isSso,
    useLCP,
    hasBigscreen,
    portalUrl: await (async () => {
      try {
        return new URL(
          await (isSso
            ? fetch('/api/sso/auth/loginUrl')
                .then((response) => response.json())
                .then((json) => (json.code === 2000 ? json.data || '' : ''))
                .catch(() => '')
            : isPortal
              ? location.href
              : ''),
        ).origin;
      } catch (_e) {
        /* empty */
      }
      return '';
    })(),
    minioUrl: cfgs.minioUrl || '',
    signalrUrl: cfgs.signalrUrl || '',
    version: cfgs.Version || '',
    appKey: cfgs.appKey || '',
  };
  return { modules, config };
};

export async function start(
  selector: string | Element,
  staticPlugins?: () => Plugins | Promise<Plugins>,
) {
  // 取 CDN url 和一些配置,插件信息等
  const { config, modules } = await loadConfAndMod();
  // 装载插件对象
  window.xNebula = window.xNebula || {};
  window.xNebula.FramePlugins = {};
  window.process = { env: { NODE_ENV: 'production' } };
  // 加载对应的依赖库:
  // 生产模式下使用 umd 构造 script 和 link 加载公共库和 core 模块
  // 开发模式和发布模式下使用 es6 import 直接引用 core 模块, 并把 core 暴露给全局, 供插件使用
  return await (
    await initialize(config)
  )(selector, config, modules, staticPlugins);
}
