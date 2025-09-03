/*
 * @Author: Huangjs
 * @Date: 2024-06-26 18:29:56
 * @LastEditors: Huangjs
 * @LastEditTime: 2024-07-25 09:18:40
 * @Description: ******
 */
import type { App } from 'vue';
import { request } from '@xnebula/commons';
import { XRenderer } from '@lcp/xrenderer';
import { XComponentsPlugin } from '@lcp/xcomponents';
import { WidgetsPlugin } from '@lcp/xwidgets';
import { Expose } from '@@/expose';
import { API_PREFIX } from '@@/utils';
import '@lcp/xcomponents/dist/style.css';
import '@lcp/xwidgets/dist/style.css';

export default (vueApp: App) => {
  vueApp.use(WidgetsPlugin);
  vueApp.use(XComponentsPlugin, {
    useElementPlus: false,
    useElementPlusIcon: false,
    useVxeTable: false,
  });
  vueApp.use(XRenderer, {
    enableSignalR: false,
    enableBus: false,
    commonHttp: {
      request: (a, b) => {
        // 判断一下是否是文件上传
        const headers: Record<string, string> = b?.headers || {};
        const formData = new FormData();
        if (a.file) {
          headers['Content-Type'] = 'application/x-www-form-urlencoded';
          const append = (fData: any) => {
            for (const [key, value] of fData) {
              // 如果数据是一个 formData，则平铺出来
              if (value instanceof FormData) {
                append(value);
              } else {
                formData.append(key, value);
              }
            }
          };
          append(Object.entries(a.reqData));
        }
        const reg = new RegExp(`^(${API_PREFIX}/)`);
        const url = `/${a.url || ''}`.replace(/^(\/+)/, '/');
        return request({
          // lcp 的一些请求地址都是携带有 /api
          url: url.replace(reg, '/'),
          method: a.method || 'get',
          params:
            !a.method || a.method.toLocaleLowerCase() === 'get'
              ? a.reqData
              : {},
          data: a.file ? formData : a.reqData,
          headers: headers,
          responseType: a.blob ? 'blob' : a.responseType || b?.responseType,
          timeout: (a as any)?.timeout ?? (b as any)?.timeout,
          meta: {
            // 携带有 /api 的地址响应结果都没有剥离
            unstrip: !!url.match(reg),
            response: (a as any)?.response ?? (b as any)?.response,
          },
        });
      },
    },
    router: {
      useRouter: () => Expose.router(),
      useRoute: () => Expose.route(),
    },
    i18n: {
      useI18n: () => Expose.i18n(),
      messages: () => Expose.i18n().messages.value,
      list: () => Expose.i18n().localeList,
    },
    user: {
      getUser: () => {
        try {
          // lcp 可能存在未登录就需要渲染得情况，这里处理下
          return Expose.getUser().origin;
        } catch (_e) {
          return null;
        }
      },
    },
  });
};
