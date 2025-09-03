/*
 * @Author: Huangjs
 * @Date: 2022-10-25 09:37:24
 * @LastEditors: Huangjs
 * @LastEditTime: 2022-11-17 11:23:21
 * @Description: ******
 */
import { storage } from '@xnebula/utils';
import { Notification } from '@xnebula/components';
import { i18n as getI18n } from '@@/i18n';
import { ACCESS_USER, warn } from '@@/utils';
import { type Config } from '@/types';

export enum FixedPath {
  portal = '/Portal_portal',
  login = '/Portal_login',
  auth = '/Portal_auth',
  sso = '/Sso_sso',
  main = '/home',
  bigscreen = '/XBigScreen_bigscreen',
  i18n = '/Frame_i18n',
  plugin = '/Frame_plugin',
  theme = '/Frame_theme',
  param = '/Frame_parameter',
  notFound = '/404',
}

export const getDefPath = (config: Config) => {
  // 如果路由里有 Home 就 Home, 没有, 就第一个路由, 如果一个也没有, 就门户主系统门户页(子系统没有门户页, 所以会自动显示 NotFound )
  const menuRouter = (storage.get(ACCESS_USER)?.menus || []) as {
    url?: string;
    subs?: { url?: string }[];
  }[];
  const hasHomePage = menuRouter.find(
    (o) =>
      (o?.url || '').replace(/\//, '') === FixedPath.main.replace(/\//, ''),
  );
  if (hasHomePage) {
    return FixedPath.main;
  }
  const firstPage =
    menuRouter[0]?.subs && menuRouter[0].subs.length > 0
      ? menuRouter[0].subs[0]?.url
      : menuRouter[0]?.url;
  if (firstPage) {
    return `/${firstPage}`.replace(/^\/+/, '/');
  }
  const { t } = getI18n();
  Notification({
    title: t('Frame', 'common.info'),
    type: 'warning',
    message: t('Frame', 'error.noMenus'),
  });
  warn(
    `当前系统没有菜单页面, 可能是该登录账号没有该系统的权限, 请查看 LocalStorage 里的 Access-User 下的对应的 menus 里是否有菜单项`,
  );
  return config.hasBigscreen
    ? FixedPath.bigscreen
    : !config.hidePortal
      ? FixedPath.portal
      : FixedPath.notFound; // 走到这个，其实就是显示 notFound
};
