/*
 * @Author: Huangjs
 * @Date: 2024-03-11 13:27:22
 * @LastEditors: Huangjs
 * @LastEditTime: 2024-03-13 11:15:44
 * @Description: ******
 */
import type { AppContext, App, Component, Plugin } from 'vue';
import 'font-awesome/css/font-awesome.css';
import * as XEUtils from 'xe-utils';
import * as VXETable from 'vxe-table';
import en_vt from 'vxe-table/lib/locale/lang/en-US';
import zhCN_vt from 'vxe-table/lib/locale/lang/zh-CN';
import 'vxe-table/lib/style.css';
import * as ElementPlusIcons from '@element-plus/icons-vue';
import * as ElementPlus from 'element-plus';
import type * as ElementPlusTypes from './el-types';
import en from 'element-plus/es/locale/lang/en.mjs';
import ko from 'element-plus/es/locale/lang/ko.mjs';
import zhCN from 'element-plus/es/locale/lang/zh-cn.mjs';
import 'element-plus/dist/index.css';
import plugin from './plugin';

export const INSTALLED_KEY = Symbol('INSTALLED_KEY');

export const XCompPlugin = {
  install: (app: App) => {
    if ((app as any)[INSTALLED_KEY]) return;
    (app as any)[INSTALLED_KEY] = true;
    // 安装 xnebula 组件库
    plugin.forEach((p) => app.use(p));
    app.use(ElementPlus.default);
    for (const [key, component] of Object.entries<Component>(
      ElementPlusIcons,
    )) {
      app.component(key, component);
    }
    app.use(VXETable.default);
  },
} as Plugin;

export const version = __VERSION__;

export {
  ElementPlus,
  type ElementPlusTypes,
  ElementPlusIcons,
  VXETable,
  XEUtils,
};

export function getUILocaleMessages(
  locale: string = 'zh-CN',
  ui: 'el' | 'vxe' = 'el',
) {
  switch (locale) {
    case 'en':
      return ui === 'el' ? en : en_vt;
    case 'en-US':
      return ui === 'el' ? en : en_vt;
    case 'ko':
      // vxe-table 没有韩文翻译，用英文代替
      return ui === 'el' ? ko : en_vt;
    case 'ko-KR':
      // vxe-table 没有韩文翻译，用英文代替
      return ui === 'el' ? ko : en_vt;
    default:
      return ui === 'el' ? zhCN : zhCN_vt;
  }
}

// 导出 xnebula 组件库
export * from './comp';

const { ElNotification, ElMessageBox, ElMessage, ElLoading } = ElementPlus;
const Notification = ElNotification as typeof ElNotification & {
  notify: (
    options: ElementPlus.NotificationParams,
  ) => ReturnType<typeof ElNotification>;
};
const MessageBox = ElMessageBox as typeof ElMessageBox & {
  message: (
    options: ElementPlus.MessageParams,
    appContext?: null | AppContext,
  ) => ReturnType<typeof ElMessage>;
};
const Message = ElMessage as typeof ElMessage & {};
const Loading = ElLoading as typeof ElLoading & {
  showLoading: () => ReturnType<typeof ElLoading.service>;
  closeLoading: () => Promise<void>;
};

Notification['notify'] = (options: ElementPlus.NotificationParams) => {
  return ElNotification(
    !options || typeof options === 'string' || options.type
      ? options
      : {
          ...(options as Partial<ElementPlus.NotificationOptions>),
          appendTo: window.document.body,
        },
  );
};
MessageBox['message'] = (
  options: ElementPlus.MessageParams,
  appContext?: null | AppContext,
) => ElMessage(options, appContext);
Loading['showLoading'] = () => {
  return ElLoading.service({
    fullscreen: true,
    lock: true,
    text: '',
    background: 'rgba(0, 0, 0, 0.6)',
  });
};
Loading['closeLoading'] = () => {
  const instance = ElLoading.service({ fullscreen: true });
  return new Promise((resolve) =>
    setTimeout(() => {
      instance.close();
      resolve();
    }, 1),
  );
};

// 你也可以自行封装这些弹框
export { Notification, MessageBox, Message, Loading };
