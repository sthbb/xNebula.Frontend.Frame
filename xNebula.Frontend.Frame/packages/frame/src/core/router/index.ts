/*
 * @Author: Huangjs
 * @Date: 2022-10-25 09:37:24
 * @LastEditors: Huangjs
 * @LastEditTime: 2022-11-17 11:23:21
 * @Description: ******
 */
import { getCurrentInstance, type App } from 'vue';
import {
  createRouter as _createRouter,
  useRoute,
  useRouter,
  type vueRouter,
} from '@xnebula/commons';
import { type Config, type Plugins } from '@/types';
import { hook } from './hook';

export * from './path';

export * from './async';

let _router: vueRouter.Router | null = null;
export async function createRouter(config: Config) {
  // 这里可以做一些异步操作的, 目前没有
  const rootName = Symbol('/root');
  _router = _createRouter({
    routes: [
      {
        path: '/',
        name: rootName,
        sensitive: true,
        component: () => import('@@/layout/BaseLayout.vue'), // 这里使用异步，既使用懒加载，又避免循环引用
        children: [],
      },
      {
        path: '/:pathMatch(.*)*',
        name: Symbol('/404'),
        sensitive: true,
        component: () => import('@@/views/error/NotFound.vue'), // 这里使用异步，既使用懒加载，又避免循环引用
      },
    ],
    base: import.meta.env.BASE_URL,
  });
  return (vueApp: App, plugins: Plugins) => {
    if (_router) {
      hook(vueApp, _router, rootName, config, plugins);
      vueApp.use(_router);
    }
  };
}

export function router() {
  if (!_router) {
    throw new Error('No run createRouter()');
  }
  return getCurrentInstance() ? useRouter() : _router;
}

export function route() {
  return getCurrentInstance() ? useRoute() : router().currentRoute.value;
}
