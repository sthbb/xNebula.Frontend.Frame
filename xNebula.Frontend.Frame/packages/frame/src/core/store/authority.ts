import { unref, shallowRef, shallowReadonly } from 'vue';
import { storage } from '@xnebula/utils';
import { ACCESS_TOKEN, ACCESS_USER, TEMP_MENU_TAG, lookup } from '@@/utils';

type OriginMenu = {
  menu_id?: string;
  i18n_key?: string;
  url?: string;
  icon?: string;
  view_url?: string;
  affix?: boolean;
  subs?: OriginMenu[];
};
export type AuthMenu = {
  id?: string;
  path?: string;
  view?: string;
  i18nKey?: [string, string];
  icon?: string;
  affix?: boolean;
  favor?: boolean;
  parent?: AuthMenu;
  children?: AuthMenu[];
  origin?: OriginMenu;
};
export type AuthUser = {
  userId?: string;
  userName?: string;
  userNameEn?: string;
  userNameKo?: string;
  locale?: string;
  origin?: any;
};

const _auth = shallowRef<{
  ready: boolean;
  user: AuthUser;
  menus: AuthMenu[];
  menuRoutes: AuthMenu[];
}>({
  ready: false,
  user: {},
  menus: [],
  menuRoutes: [],
});

const parse = (menus: OriginMenu[], parent?: AuthMenu) => {
  return menus.map((m) => {
    const i18nKeys = m.i18n_key?.split('.') || ['Frame', '_mu_._home'];
    const current: AuthMenu = {
      id: m.menu_id,
      path: `/${
        (m.url || '')
          .replace(/^\/+/, '') // 去掉开头所有 /
          .replace(/\/+$/, '') // 去掉结尾所有 /
          .replace(/\/+/g, '/') // 中间多个 / 转换成一个 /
      }`,
      view: m.view_url,
      icon: m.icon,
      i18nKey: [i18nKeys[0], i18nKeys.slice(1).join('.')],
      affix: m.affix,
      favor: false,
      parent: parent,
      origin: m,
    };
    if (m.subs && m.subs.length) {
      current.children = parse(m.subs, current);
    }
    return current;
  });
};

export const auth = shallowReadonly(_auth);

export const fetchAuth = async (token: string) => {
  let tokenUser = null;
  if (storage.get(ACCESS_TOKEN) === token) {
    // 目前从 localStorage 取, 万一哪天从后端取值, 可更改
    // 菜单需要从后端获取, 每次登录之后, 都需要重新获取菜单
    tokenUser = storage.get(ACCESS_USER);
  }
  if (tokenUser) {
    const {
      menus,
      tokenClaim,
      userId,
      lang,
      user_id,
      user_name,
      user_name_en,
      user_name_ko,
    } = tokenUser;
    const parseMenus = parse(menus);
    _auth.value = {
      ready: true,
      user: {
        locale: lang || tokenClaim?.language,
        userId: user_id || userId || tokenClaim?.userId,
        userName: user_name || tokenClaim?.userName,
        userNameEn: user_name_en || user_name || tokenClaim?.userName,
        userNameKo: user_name_ko || user_name || tokenClaim?.userName,
        origin: { ...tokenUser },
      },
      menus: parseMenus,
      menuRoutes: lookup(parseMenus, (m) => !m.children),
    };
    // getAuth 之后返回的是非响应式数据
    return { ...unref(_auth) };
  }
  return null;
};

export const getToken = async () => {
  return storage.get(ACCESS_TOKEN);
};

export const setToken = async (authData?: Record<string, any> | null) => {
  // 重新设置之前, 先删除
  await delToken();
  if (authData && authData.token) {
    const { token } = authData;
    // 写入 token
    storage.set(ACCESS_TOKEN, token);
    storage.set(ACCESS_USER, authData);
    return true;
  }
  return false;
};

export const delToken = async () => {
  _auth.value = {
    ready: false,
    user: {},
    menus: [],
    menuRoutes: [],
  };
  storage.remove(ACCESS_TOKEN);
  storage.remove(ACCESS_USER);
  storage.remove(TEMP_MENU_TAG);
  // storage.clear();
};
