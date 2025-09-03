/*
 * @Author: Huangjs
 * @Date: 2022-10-25 09:37:24
 * @LastEditors: Huangjs
 * @LastEditTime: 2022-11-17 11:23:21
 * @Description: ******
 */
import { warn } from './console';

export const getURLQuery = (url: string) => {
  const query: Record<string, string> = {};
  url
    .substring(url.indexOf('?') + 1)
    .split('&')
    .forEach((kv) => {
      const [key, value] = kv.split('=');
      query[decodeURIComponent(key)] = decodeURIComponent(value);
    });
  return query;
};

export const joinURLQuery = (query: Record<string, string>) => {
  let queryStr = '';
  Object.keys(query).forEach((key) => {
    const val = String(query[key]);
    if (val) {
      queryStr += `&${encodeURIComponent(key)}=${encodeURIComponent(val)}`;
    }
  });
  return queryStr.substring(1);
};

export const isSameOrigin = (purl: URL, curl: URL) =>
  purl.origin === curl.origin ||
  ((purl.hostname === 'localhost' || purl.hostname === '127.0.0.1') &&
    (curl.hostname === 'localhost' || curl.hostname === '127.0.0.1'));

export const ssoFailed = () => {
  const messages: string[] = [];
  messages.push(
    `该系统(子系统)安装了 Sso 插件, 但是并没有进行正确配置, 请按照以下步骤进行配置: `,
  );
  messages.push(
    `1, 请首先找一个(线上已部署好的, 或者本地开启的)主系统(配置了 Portal 插件, 拥有登录页和平台首页的系统)`,
  );
  messages.push(
    `2, 登录主系统, 进入 [门户管理 - 客户端管]  页面, 查询是否有你正在开发的系统(后续称子系统)配置, 有则跳第 4 步`,
  );
  messages.push(
    `3, 新增一个客户端, 填写基本信息, 门户数据(跳转路径, 请填写子系统的地址, 可参考已有配置填写), 授权信息等保存`,
  );
  messages.push(
    `4, 找到子系统配置记录, 点击修改, 点击授权信息, 分别显示 App Key, App Secrect, RSA_PUBLIC_KEY`,
  );
  messages.push(
    `5, 打开子系统(插件)开发目录中的配置文件: xNebula.Plugins.XXX/publish/data/FRAME/appsettings.json`,
  );
  messages.push(
    `6, 找到 Token 这一项, 分别把第 4 步显示出来的值拷贝对应填写到配置文件里的: AppKey: App Key,AppSecret: App Secrect,RsaPublicKey: RSA_PUBLIC_KEY(RSA_PUBLIC_KEY 拷贝要去头: -----BEGIN PUBLIC KEY-----, 去尾: -----END PUBLIC KEY-----, 只要中间部分)`,
  );
  messages.push(
    `7, 配置文件里的 Issuer 和 Audience 两项都填写: wuxixinxiang.com`,
  );
  messages.push(
    `8, 配置文件里的 ParentUrl 填写主系统的地址(只需 IP 和端口, 比如: http://192.168.1.1:8008)`,
  );
  messages.push(
    `9, 进行以上操作后，分别重启前后端服务, 清空 LocalStorage 后再试`,
  );
  warn(messages.join('\n'));
};

export const getRedirectPath = (redirect: string) => {
  let url: string | URL | null = null;
  try {
    url = new URL(redirect);
    if (url.origin === new URL(window.location.href).origin) {
      url = url.href.substring(url.origin.length);
      if (url.match(/^\/.*#/)) {
        url = url.substring(url.indexOf('#') + 1);
      }
    }
    return url;
  } catch (_e) {
    if (typeof redirect === 'string' && redirect.startsWith('/')) {
      url = redirect;
    }
  }
  return url;
};
export const getRedirectQuery = (query: Record<string, any>) => {
  const _query: Record<string, string> = {};
  Object.keys(query).forEach((key) => {
    _query[key.replace(/^_rd_/, '')] = query[key]?.toString() || '';
  });
  return _query;
};
export const joinRedirectQuery = (query: Record<string, string>) => {
  let queryStr = '';
  Object.keys(query).forEach((key) => {
    const val = String(query[key]);
    if (val) {
      queryStr += `&_rd_${encodeURIComponent(key)}=${encodeURIComponent(val)}`;
    }
  });
  return queryStr.substring(1);
};
