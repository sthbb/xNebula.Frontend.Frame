/*
 * @Author: Huangjs
 * @Date: 2024-02-22 17:15:02
 * @LastEditors: Huangjs
 * @LastEditTime: 2024-07-25 09:53:51
 * @Description: ******
 */
import { v4 } from 'uuid';
import type { JSONType, ProxyData } from './types';

/*

一: 代理指向本地服务:
1, 本地配置了 portal（主系统, 装了该插件, 必须安装 sys 和 ouath 插件, 这三个是相互依赖的插件）:
登录时如何把自己的页面菜单插进去?在本系统的菜单管理里配置
2, 本地配置了 sso（子系统）:
sso 配置文件里 必须配置主系统（可能在线上）, 在对应主系统的菜单管理配置（会污染代理服务器）
3, 本地两种都未配置:

二, 代理指向线上服务:
1, 线上服务配置了 portal 插件（主系统）:
登录时如何把自己的页面菜单插进去?去主系统的菜单管理里配置（会污染代理服务器）
2, 线上服务配置了 sso 插件（子系统）:
线上必然会有个主系统, sso 登录时如何把自己的页面菜单插进去?去主系统的菜单管理里配置（会污染代理服务器）
三, 可在 proxy 里配置一些特定接口到特定服务, 比如, 配置了线上服务之后, 可以在再配置自己的接口到自己的服务
四, 可在 proxyData 里配置一些接口, 返回需要自定义的数据, 比如获取多语言数据

*/

const createMenuData = (pkey: string, key: string, index: number) => {
  return {
    menu_id: v4(),
    url: `/${!pkey ? '' : `${pkey}_`}${key}`,
    view_url: !pkey ? '' : `${pkey}/${key}/Index`,
    icon: !pkey ? 'fa fa-home' : '',
    name: key,
    index,
    i18n_key: `${!pkey ? key : pkey}._mu_.${!pkey ? '_' : `${key}`}`,
  };
};

const loginHack = (
  plgName: string,
  pages: string[],
  _token?: string,
  showServerMenus?: boolean,
) => {
  return {
    hack: true,
    data: (source: JSONType = null) => {
      if (!source || typeof source !== 'object' || Array.isArray(source)) {
        return source;
      }
      const _source = source as Record<string, any>;
      // 过滤掉菜单中已经存在的 plgName 菜单
      const menuData = showServerMenus
        ? ((_source.data || {}).menus || []).filter(
            ({ name, url }: { name?: string; url?: string }) =>
              (name || url || '').replace(/^\//, '') !== plgName,
          )
        : [];
      return {
        ..._source,
        data: {
          ...(_source.data || {}),
          menus: [
            ...menuData,
            {
              ...createMenuData('', plgName, 0),
              // 过滤掉不走菜单的页面
              subs: pages.map((page, i) => createMenuData(plgName, page, i)),
            },
          ],
        },
      };
    },
  };
};

const proxyData: ProxyData = {
  '/api/locale/login': (plgName, pages, token) => {
    const id = v4();
    return {
      hack: false,
      data: {
        msg: 'success',
        code: 2000,
        data: {
          token: token,
          menus: [
            {
              ...createMenuData('', plgName, 0),
              subs: pages.map((page, i) => createMenuData(plgName, page, i)),
            },
          ],
          tokenClaim: {
            orgId: v4(),
            orgName: '测试公司',
            userAccount: 'Developer',
            userId: id,
            userName: '开发者',
          },
          user_id: id,
          user_name: '开发者',
          user_name_en: 'Developer',
        },
      },
    };
  },
  '^/api/(p|P)ortal/(l|L)ogin': loginHack,
  '^/api/sso/auth/token/.+': loginHack,
};
export default proxyData;
