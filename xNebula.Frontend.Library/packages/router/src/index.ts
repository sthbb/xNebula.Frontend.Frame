/*
 * @Author: Huangjs
 * @Date: 2024-03-06 16:31:37
 * @LastEditors: Huangjs
 * @LastEditTime: 2024-03-20 15:03:39
 * @Description: ******
 */
import type { App } from 'vue';
import * as vueRouter from 'vue-router';

export function createRouter(
  options: Partial<vueRouter.RouterOptions> & {
    base?: string;
    type?: 'hash' | 'history';
  } = {},
  app?: App,
) {
  // 默认使用 hash route
  const router = vueRouter.createRouter({
    history:
      options.type === 'history'
        ? vueRouter.createWebHistory(options.base || '')
        : vueRouter.createWebHashHistory(options.base || ''),
    routes: [],
    ...options,
  });
  if (app) {
    app.use(router);
  }
  return router;
}

export function useRouter() {
  return vueRouter.useRouter();
}

export function useRoute() {
  return vueRouter.useRoute();
}

export { vueRouter };

export const version = __VERSION__;
