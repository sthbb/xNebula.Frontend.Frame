/*
 * @Author: Huangjs
 * @Date: 2024-03-11 13:21:17
 * @LastEditors: Huangjs
 * @LastEditTime: 2024-03-20 17:56:03
 * @Description: ******
 */
import type { App, Plugin } from 'vue';

type SFC<T> = T & Plugin;

// 安装 vue 组件
export function withInstall<T extends Record<string, any>>(comp: T) {
  (comp as SFC<T>).install = (app: App): App => {
    app.component(comp.name || comp.__name, comp);
    return app;
  };
  return comp as SFC<typeof comp>;
}
