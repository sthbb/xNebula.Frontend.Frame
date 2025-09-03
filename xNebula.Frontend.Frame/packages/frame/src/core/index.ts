/*
 * @Author: Huangjs
 * @Date: 2024-02-22 17:15:02
 * @LastEditors: Huangjs
 * @LastEditTime: 2024-07-23 17:25:39
 * @Description: ******
 */
import { createApp } from 'vue';
import { SignalR } from '@xnebula/commons';
import { XCompPlugin } from '@xnebula/components';
import type { Config, Plugins } from '@/types';
import { createI18n } from '@@/i18n';
import { createRouter } from '@@/router';
import { loadSetup, IS_PROD, URL_REGEXP } from '@@/utils';
import App from '@@/App.vue';
import lcp from '@@/lcp';
import { vxeTableConf, initRequest } from '@@/init';
import { createExpose, Expose as Exposed } from '@@/expose';
import '@xnebula/components/dist/index.css';
import '@@/styles/index.scss';

export { Exposed };

export async function _initialize(
  selector: string | Element,
  config: Config,
  modules: Plugins,
  staticPlugins?: () => Plugins | Promise<Plugins>,
) {
  // 初始化请求配置
  initRequest(config);
  // 初始化暴露文件
  const expose = await createExpose(config, modules);
  // 创建 i18n
  const i18n = await createI18n();
  // 创建 router
  const router = await createRouter(config);
  // 这里将传入的插件进行标准化处理
  const plugins = {
    ...modules,
    ...((await staticPlugins?.()) || {}),
  };
  // 处理插件需要初始安装的东西
  const setup = await loadSetup(plugins);
  // 创建 vue app, 并且把配信息传入进去
  const vueApp = createApp(App, { config, modules });
  // 连接 signalr
  if (URL_REGEXP.test(config.signalrUrl || '')) {
    vueApp.use(SignalR, { url: config.signalrUrl });
  }
  // 安装组件库
  vueApp.use(XCompPlugin);
  // 为 expose 提供 vueApp
  expose(vueApp);
  // 安装 i18n
  i18n(vueApp);
  // 安装 router
  router(vueApp, plugins);
  // vxe-table 全局配置
  vxeTableConf(vueApp);
  // 加个 IS_PROD 判断, 可以让代理到未使用 LCP 的服务器的开发依然能用 LCP(只要安装了 LCP 资源)
  if (!IS_PROD || config.useLCP) {
    // 安装 LCP 和插件初化的始东西
    lcp(vueApp);
  }
  // 安装插件的全局东西
  setup(vueApp);
  // 挂载 app
  vueApp.mount(selector);
}
