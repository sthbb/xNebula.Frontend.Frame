/*
 * @Author: Huangjs
 * @Date: 2022-10-25 09:37:24
 * @LastEditors: Huangjs
 * @LastEditTime: 2024-07-23 17:27:48
 * @Description: ******
 */
import { h, defineComponent, type Component, type App } from 'vue';
import { XLCPEmbed } from '@lcp/xrenderer';
import {
  loadAssets,
  isComponent,
  isFunction,
  handleView,
  IS_PROD,
  warn,
} from '@@/utils';
import { i18n as useI18n } from '@@/i18n';
import { usePrefixCls } from '@@/hooks';
import { getLCPJSON } from '@@/api';
import type {
  AssetPath,
  AssetCommon,
  AssetFunComp,
  Plugins,
  Config,
} from '@/types';

const loadCommon = async (vueApp: App, plugins: Plugins, commonKey: string) => {
  const common = plugins[commonKey];
  const execCommon = async (_common: AssetCommon | null) => {
    // 只执行一次, 执行完成不再执行
    if (_common && !_common.isExecuted) {
      _common.isExecuted = true;
      await _common({
        vueApp,
        setI18nMessages: (messages, plgName) => {
          const { mergeLocaleMessages } = useI18n();
          mergeLocaleMessages(messages, plgName);
        },
      });
    }
  };
  if (!isFunction(common)) {
    await loadAssets<AssetCommon>(common as AssetPath, commonKey).then(
      (_common) => execCommon(_common),
    );
  } else {
    await execCommon(common as AssetCommon);
  }
};

export const asyncComponent = async (
  vueApp: App,
  view: string,
  config: Config,
  plugins: Plugins = {},
  wrapper: string | false = 'div', // 是否在组件外包裹一层实际元素
  props?: Record<string, any>, // 是否传入 props, 如果传入, 则会包一层虚拟元素(就是没有 div, span 等实际元素包裹的), 否则直接返回或渲染 component
) => {
  const { key, lcpAPI, pluginName } = handleView(view);
  // lcp 渲染组件
  if (lcpAPI) {
    // 加个 IS_PROD 判断, 可以让代理到未使用 LCP 的服务器的开发依然能用 LCP(只要安装了 LCP 资源)
    if (!IS_PROD || config.useLCP) {
      const jsonStr = await getLCPJSON(lcpAPI);
      try {
        const _config = JSON.parse(jsonStr);
        await loadCommon(vueApp, plugins, `${pluginName}___common__`);
        return defineComponent({
          name: key,
          setup() {
            const cls = usePrefixCls();
            return () =>
              wrapper
                ? h(
                    wrapper,
                    { class: [key, cls('inherit')] },
                    h(XLCPEmbed, {
                      config: _config,
                      ...(props || {}),
                      pluginName,
                    }),
                  )
                : h(XLCPEmbed, {
                    config: _config,
                    pluginName,
                  });
          },
        });
      } catch (_e) {
        /* empty */
      }
    }
    // 这里使用异步，既使用懒加载，又避免循环引用
    const pageError = await import('@@/views/error/PageError.vue').then(
      (v) => v.default,
    );
    return pageError;
  }
  // 预先加载 __common__
  await loadCommon(vueApp, plugins, `${pluginName}___common__`);
  // 动态加载插件
  const plugin = plugins[key];
  let component: Component | null = null;
  if (isComponent(plugin)) {
    component = plugin as Component;
  } else if (isFunction(plugin)) {
    component = await (plugin as AssetFunComp)(vueApp);
  } else {
    component = await loadAssets<Component | AssetFunComp>(
      plugin as AssetPath,
      key,
    ).then((comp) => {
      if (isComponent(comp)) {
        return comp as Component;
      }
      if (isFunction(comp)) {
        return (comp as AssetFunComp)(vueApp);
      }
      return null;
    });
  }
  if (component) {
    return wrapper
      ? defineComponent({
          name: key,
          setup() {
            const cls = usePrefixCls();
            return () =>
              h(
                wrapper,
                { class: [key, cls('inherit')] },
                props ? h(component, { ...props }) : h(component),
              );
          },
        })
      : props
        ? defineComponent({
            name: key,
            setup() {
              return () => h(component, { ...props });
            },
          })
        : component;
  }
  const messages: string[] = [];
  if (!plugin) {
    messages.push(
      `1, 当前菜单对应的视图地址没有配置或配置错误, 请查看 LocalStorage 里的 Access-User 下的对应的 menus 里该菜单的 view_url 的值是否正确`,
    );
    messages.push(
      `2, api/frame/plugin/modules 接口未获取到该插件或该插件对应页面的 js 等资源, 请检查后端嵌入资源(可能这些资源没有通过一键打包生成, 而是手动复制, 复制后又没有手动设置作为嵌入资源)`,
    );
  } else {
    const pageKey = Object.keys(window.xNebula.FramePlugins).find(
      (_key) => key.toLocaleLowerCase() === _key.toLocaleLowerCase(),
    );
    if (pageKey) {
      messages.push(
        `插件开发时, 你的 src/pages 下, 该页面的目录名称与你配置的当前菜单对应的视图地址大小写不匹配: 插件名称: [${pageKey}], 视图地址: [${key}] [${view}], 检查比较 LocalStorage 里的 Access-User 下的对应的 menus 里该菜单的 view_url 和开发下 src/pages 里该插件的目录名称`,
      );
    } else {
      messages.push(
        `1, 插件开发时, 你的 src/pages 下, 该页面的目录名称与你配置的当前菜单对应的视图地址不匹配, 检查比较 LocalStorage 里的 Access-User 下的对应的 menus 里该菜单的 view_url 和开发下 src/pages 里该插件的目录名称`,
      );
      messages.push(
        `2, 插件开发时, 你的插件名称(即 xNebula.Plugins.XXX.UI 目录的 XXX)未在 package.json 中的 name 里, 或 build.config 中的 entry.pluginName 里正确配置, 请参考模板中 README.md 进行正确配置`,
      );
      messages.push(
        `3, 加载 [${key}] [${(plugin as AssetPath).js}] 失败, 检查 NetWork 查看资源是否加载失败, 检查后端是否提供该 js 该资源`,
      );
      messages.push(
        `4, 执行 [${key}] [${(plugin as AssetPath).js}] 报错, 检查 Console 是否有报错信息, 并定位报错信息检查插件代码`,
      );
    }
  }
  warn('插件加载失败, 可能原因如下: \n' + messages.join('\n'));
  // 这里使用异步，既使用懒加载，又避免循环引用
  const pageError = await import('@@/views/error/PageError.vue').then(
    (v) => v.default,
  );
  return {
    name: `${key}_Error`,
    setup() {
      return () => h(pageError, { messages: IS_PROD ? [] : messages });
    },
  };
};
