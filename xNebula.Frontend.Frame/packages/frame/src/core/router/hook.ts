/*
 * @Author: Huangjs
 * @Date: 2022-10-25 09:37:24
 * @LastEditors: Huangjs
 * @LastEditTime: 2024-07-16 19:21:25
 * @Description: ******
 */
import { h, type App } from 'vue';
import NProgress from 'nprogress';
import { type vueRouter } from '@xnebula/commons';
import { authority } from '@@/store';
import { getAuthCode, getAuthToken } from '@@/api';
import { type Config, type Plugins } from '@/types';
import { i18n } from '@@/i18n';
import {
  warn,
  IS_PROD,
  getURLQuery,
  joinURLQuery,
  isSameOrigin,
  ssoFailed,
  getRedirectPath,
  getRedirectQuery,
  joinRedirectQuery,
} from '@@/utils';
import { FixedPath, getDefPath } from './path';
import { asyncComponent } from './async';

// vue-router query 里没有编码, 但是 return 跳转的时候, query 放在 url 时会编码
export function hook(
  vueApp: App,
  router: vueRouter.Router,
  rootName: symbol,
  config: Config,
  plugins: Plugins,
) {
  const { isPortal, isSso, hasBigscreen, hidePortal, portalUrl, appKey } =
    config;
  // 将本地插件放进去
  const allPlugins = {
    ...plugins,
    // 这里使用异步，既使用懒加载，又避免循环引用
    [FixedPath.i18n.substring(1)]: () =>
      import('@@/views/i18n/I18nManage.vue').then((v) => v.default),
    [FixedPath.theme.substring(1)]: () =>
      import('@@/views/theme/ThemeOverview.vue').then((v) => v.default),
    [FixedPath.plugin.substring(1)]: () =>
      import('@@/views/plugin/PluginManage.vue').then((v) => v.default),
    [FixedPath.param.substring(1)]: () =>
      import('@@/views/param/ParamConfig.vue').then((v) => v.default),
  };
  // 重置清空路由
  const removeRoutes: (() => void)[] = [];
  const resetRouter = () => {
    removeRoutes.forEach((cb) => cb());
    removeRoutes.splice(0);
  };
  const loginRouteName = Symbol(FixedPath.login);
  const bigscreenRouteName = Symbol(FixedPath.bigscreen);
  const ssoAuth = async (code: string, _path: string) => {
    // 如果 code 存在, 则可以认为是需要重新登录认证
    const success = await authority.setToken(await getAuthToken(code));
    if (!success) {
      warn('没有获取到正确的 Token');
      // 跳到门户主页, 让用户自行选择
      const redirect = encodeURIComponent(FixedPath.portal);
      // 没拿到 token, 重新进入门户登录
      if (
        !portalUrl ||
        isSameOrigin(new URL(portalUrl), new URL(window.location.href))
      ) {
        ssoFailed();
      } else {
        const rt = window.confirm(i18n().t('Frame', 'error.tokenConfirm'));
        if (rt) {
          window.location.href = `${portalUrl}/#${FixedPath.login}?_kill=1&redirect=${redirect}`;
        }
      }
    }
    return success;
  };
  // 跳转需要携带 redirect 时候, 如果 redirect 不是 router path 而是完整地址, 甚至地址里仍然携带 query, 可进行平铺处理(可参考退出登录逻辑)
  router.beforeEach(async ({ path, fullPath, query }) => {
    NProgress.start();
    // 如果需要路由切换的时候修改网页 title, 可以在这里进行修改, meta 里加入 i8nkey
    // document.title = `${document.title} - ${t(meta.i18nKey?.[0], meta.i18nKey?.[1])}`;
    // 根据 token 是否存在, 判断是否为已登录
    // 实际还要看请求接口时, token 是否过期
    // 过期即服务端离线, 会跳转到登录(具体在 request 中做拦截)
    const token = await authority.getToken();
    // 进入大屏路由,无论有没有token，无论是主还是子系统，只要有大屏插件，都可以进入
    if (hasBigscreen && path === FixedPath.bigscreen) {
      // 先获取下登录信息
      if (!authority.auth.value.ready) {
        await authority.fetchAuth(token);
      }
      if (!router.hasRoute(bigscreenRouteName)) {
        // 进入前加入大屏路由
        router.addRoute({
          path: FixedPath.bigscreen,
          name: bigscreenRouteName,
          sensitive: true,
          component: () => {
            return asyncComponent(
              vueApp,
              FixedPath.bigscreen,
              config,
              allPlugins,
              // 大屏里是否有需要壳处理的事情，比如退出登录，有的话放开下面传参
              /* false,
              {
                delToken: authority.delToken,
              }, */
            );
          },
        });
        return { path, query, replace: true };
      }
      return true;
    }
    // 门户主系统已登录时, 进入门户登录页或 /, 跳转到指定内部页面
    // 如果 !isPortal 也可以走这里
    if (!isSso && token && (path === FixedPath.login || path === '/')) {
      // 登录页单独处理
      if (path === FixedPath.login) {
        // 这是已经解码过的
        const { _kill, ...restQuery } = query;
        // 如果传了查询字符串 _kill=1, 代表子系统退出登录, 删除主系统的 token, 进入登录
        if (_kill && +_kill === 1) {
          await authority.delToken();
          // 删除 token 后 重新进入登录(不直接放过是为了让它统一走下面处理插件式登录)
          return {
            path,
            query: {
              ...restQuery,
            },
            replace: true,
          };
        }
        const { redirect, ...otherQuery } = restQuery;
        const redirectUrl = getRedirectPath(redirect?.toString() || '');
        const redirectQuery = getRedirectQuery(otherQuery);
        if (redirectUrl) {
          if (typeof redirectUrl === 'string') {
            return {
              path: redirectUrl,
              query: {
                ...redirectQuery,
              },
              replace: true,
            };
          }
          const jq = joinURLQuery(redirectQuery);
          window.location.replace(`${redirectUrl}${jq ? `?${jq}` : ''}`);
          NProgress.done();
          return false;
        }
      }
      // 登录页不满足上面情况, 或者路径为 /, 跳默认页
      return {
        path: getDefPath(config),
        replace: true,
      };
    }
    // 门户主系统已登录时, 进入门户鉴权取 Code 的页面
    if (isPortal && token && path === FixedPath.auth) {
      // router.query 会自动解码
      const { key, origin: _origin, redirect: cpath } = query;
      const { redirectUrl, NoPermission, msg } =
        (await getAuthCode(key?.toString() || '')) || {};
      if (NoPermission) {
        const origin = _origin || 'redirectUrl';
        warn(`${origin}: ${msg}`);
        // 没有拿到认证 code, 重新登录(需要删除失效的 token)
        await authority.delToken();
        // 如果反复拿取 code 失败,  redirect 直接设置为 Portal_portal
        return {
          path: FixedPath.portal,
        };
      }
      try {
        // getURLQuery 也被自动解码
        const { code } = getURLQuery(redirectUrl);
        // 如果有指定携带来的地址就用指定的, 否则用 redirectUrl 里的
        const origin = _origin || new URL(redirectUrl).origin;
        // 拿到 Code,  跳转到子系统进行 SSO 登录, 并取消当前导航
        window.location.href = `${origin}/#${FixedPath.sso}?code=${encodeURIComponent(code)}&redirect=${encodeURIComponent(cpath?.toString() || '')}`;
        NProgress.done();
        return false;
      } catch (_e) {
        warn('没有获取到正确的认证 Code');
        // 没有拿到认证 code, 重新登录(需要删除失效的 token)
        await authority.delToken();
        // 如果反复拿取 code 失败,  redirect 直接设置为 Portal_portal
        return {
          path: FixedPath.login,
          // 跳到门户主页, 让用户自行选择
          query: {
            redirect: FixedPath.portal,
          },
        };
      }
    }
    // 子系统已登录时, 将要进入 SSO 路由或 /, 跳转到指定内部页面
    if (isSso && token && (path === FixedPath.sso || path === '/')) {
      let _cpath;
      if (path === FixedPath.sso) {
        // router.query 会自动解码
        const { code, redirect: cpath } = query;
        _cpath = cpath?.toString() || '';
        const _code = code?.toString() || '';
        if (_code) {
          // 如果 code 存在, 则可以认为是需要重新登录认证
          const success = await ssoAuth(_code, _cpath);
          if (!success) {
            NProgress.done();
            return false;
          }
        }
      }
      // 跳默认页
      return {
        path: _cpath || getDefPath(config),
        replace: true,
      };
    }
    // 门户主系统未登录时, 将要进入内部页面, 重定向到门户登录页面
    // 如果 !isPortal 也可以走这里
    if (!isSso && !token && path !== FixedPath.login) {
      return {
        path: FixedPath.login,
        query: fullPath === '/' ? {} : { redirect: fullPath },
      };
    }
    // 门户主系统未登录时, 将要进入登录页面
    // 如果 !isPortal 也可以走这里
    if (!isSso && !token && path === FixedPath.login) {
      if (IS_PROD && !isPortal) {
        warn('该系统既没有配置 Portal 插件也没有配置 Sso 插件, 无法跳转登录页');
        return false;
      }
      if (!router.hasRoute(loginRouteName)) {
        // 进入前加入登录路由
        router.addRoute({
          path: FixedPath.login,
          name: loginRouteName,
          sensitive: true,
          component: () => {
            const postLogin = async (authData: any) => {
              const success = await authority.setToken(authData);
              if (success) {
                // 这是已经解码过的
                const { redirect, ...otherQuery } = getURLQuery(
                  window.location.href,
                );
                // 这里需要二次解码
                const redirectUrl = getRedirectPath(redirect || '');
                const redirectQuery = getRedirectQuery(otherQuery);
                if (redirectUrl) {
                  if (typeof redirectUrl === 'string') {
                    router.replace({
                      path: redirectUrl,
                      query: {
                        ...redirectQuery,
                      },
                    });
                  } else {
                    const jq = joinURLQuery(redirectQuery);
                    window.location.replace(
                      `${redirectUrl.href}${jq ? `?${jq}` : ''}`,
                    );
                  }
                } else {
                  router.replace(getDefPath(config));
                }
              }
            };
            if (!IS_PROD && !isPortal) {
              // 这里使用异步，既使用懒加载，又避免循环引用
              return import('@@/views/error/LocaleLogin.vue').then((v) => {
                return {
                  name: FixedPath.login,
                  setup() {
                    return () => h(v.default, { postLogin });
                  },
                };
              });
            }
            return asyncComponent(
              vueApp,
              FixedPath.login,
              config,
              allPlugins,
              false,
              {
                postLogin,
              },
            );
          },
        });
        // 这是已经解码过的
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { _kill, ...restQuery } = query;
        return {
          path,
          query: {
            ...restQuery,
          },
          replace: true,
        };
      }
      return true;
    }
    // 子系统未登录时, 将要进入 SSO 拿 token
    if (isSso && !token && path === FixedPath.sso) {
      // router.query 会自动解码
      const { code, redirect: cpath } = query;
      const _cpath = cpath?.toString();
      const success = await ssoAuth(code?.toString() || '', _cpath || '');
      if (!success) {
        NProgress.done();
        return false;
      }
      // 进入指定的路由 path
      return {
        path: _cpath || getDefPath(config),
        replace: true,
      };
    }
    // 子系统未登录时, 进如子系统其它页面, 要去门户主系统鉴权取 Code 再跳回来认证(带上要进去的页面 path)
    if (isSso && !token && path !== FixedPath.sso) {
      // 没有配置 portalUrl 或 portalUrl 地址和当前系统地址一样, 则报告提示
      if (
        !portalUrl ||
        isSameOrigin(new URL(portalUrl), new URL(window.location.href))
      ) {
        ssoFailed();
      } else {
        // 去门户鉴权, 强制主系统退出登录, 让其重新登录
        // 传入 _kill=1 为了删除门户系统的 localStorage
        const jq = joinRedirectQuery({
          key: appKey || '',
          origin: IS_PROD ? '' : new URL(window.location.href).origin,
          redirect: path,
        });
        window.location.href = `${portalUrl}/#${FixedPath.login}?_kill=1&redirect=${encodeURIComponent(FixedPath.auth)}&${jq}`;
      }
      NProgress.done();
      return false;
    }
    // 进入前, 判断是否已获取并生成过
    if (!authority.auth.value.ready) {
      // 获取用户信息, 权限菜单等并生成路由
      const auth = await authority.fetchAuth(token);
      if (auth) {
        // 把语言切换到用户指定的语言
        if (auth.user.locale) {
          await i18n().switchLocale(auth.user.locale);
        }
        // 重置路由, 防止退出重新登录导致的路由重复添加
        resetRouter();
        // 门户主系统(并显示 Portal )加入门户路由
        if (isPortal && !hidePortal) {
          removeRoutes.push(
            router.addRoute({
              path: FixedPath.portal,
              name: Symbol(FixedPath.portal),
              sensitive: true,
              component: () =>
                asyncComponent(
                  vueApp,
                  FixedPath.portal,
                  config,
                  allPlugins,
                  false,
                  {
                    delToken: authority.delToken,
                  },
                ),
            }),
          );
        }
        // 加入内部菜单路由
        auth.menuRoutes.forEach(({ id, path: _path, view }) => {
          // 这三个已经特殊处理加进去了
          if (
            _path &&
            _path !== FixedPath.bigscreen &&
            _path !== FixedPath.portal &&
            _path !== FixedPath.login
          ) {
            removeRoutes.push(
              router.addRoute(rootName, {
                path: _path,
                name: Symbol(_path),
                sensitive: true,
                meta: { id },
                component: () =>
                  asyncComponent(vueApp, view || '', config, allPlugins),
              }),
            );
          }
        });
        return { path, query, replace: true };
      }
      // 获取相关信息失败
      await authority.delToken();
      return {
        path: FixedPath.login,
        query: fullPath === '/' ? {} : { redirect: fullPath },
      };
    }
    // 如果要进去的路由并不存在, 则跳到默认路由(排除 getDefPath 方法返回的兜底路由 bigscreen 和 portal 和 404)
    if (
      (!hasBigscreen || path !== FixedPath.bigscreen) &&
      (hidePortal || path !== FixedPath.portal) &&
      path !== FixedPath.notFound &&
      !authority.auth.value.menuRoutes.find(({ path: _path }) => _path === path)
    ) {
      return { path: getDefPath(config), replace: true };
    }
    // 对于子系统跳转到 portal
    if (isSso && path === FixedPath.portal) {
      if (
        !portalUrl ||
        isSameOrigin(new URL(portalUrl), new URL(window.location.href))
      ) {
        ssoFailed();
      } else {
        window.location.href = `${portalUrl}/#${FixedPath.portal}`;
      }
      NProgress.done();
      return false;
    }
    // 放过, 进入对应路由
    return true;
  });
  router.afterEach(() => {
    // finish progress bar
    NProgress.done();
  });
}
