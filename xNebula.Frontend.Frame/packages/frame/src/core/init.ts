/*
 * @Author: Huangjs
 * @Date: 2024-02-22 17:15:02
 * @LastEditors: Huangjs
 * @LastEditTime: 2024-07-23 17:25:30
 * @Description: ******
 */
import { type App } from 'vue';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import { initRequest as _initRequest, request } from '@xnebula/commons';
import {
  Notification,
  VXETable,
  XEUtils,
  getUILocaleMessages,
} from '@xnebula/components';
import { storage } from '@xnebula/utils';
import { refreshAuthToken } from '@@/api';
import { authority } from '@@/store';
import { ACCESS_TOKEN, ACCESS_USER, API_PREFIX, IS_PROD, warn } from '@@/utils';
import { FixedPath } from '@@/router';
import { i18n } from '@@/i18n';
import type { Config } from '@/types';

NProgress.configure({ showSpinner: false });

function responseData(response: any, errorData?: any) {
  // 配置 meta.unstrip 的不进行剥离 data
  // 配置 meta.response 的返回需要包含 response
  let factData = response?.config?.meta?.unstrip
    ? response?.data
    : response?.data?.data;
  if (typeof errorData !== 'undefined') {
    factData = errorData;
  } else if (typeof factData === 'undefined' || factData === null) {
    factData = true;
  }
  return response?.config?.meta?.response
    ? {
        data: factData,
        response,
      }
    : factData;
}

async function refreshRequest(response: any) {
  if (!response?.config) {
    return responseData(response, null);
  }
  const result = await request({
    url: response?.config?.url,
    method: response?.config?.method,
    params: response?.config?.params,
    data: ((d) => {
      try {
        return JSON.parse(d);
      } catch (_e) {
        /* empty */
      }
      return;
    })(response?.config?.data),
    meta: response?.config?.meta,
    timeout: response?.config?.timeout,
    responseType: response?.config?.responseType,
    baseURL: response?.config?.baseURL,
    headers: ((headers) => {
      const newHeaders: Record<string, string> = {};
      Object.keys(headers).forEach((key) => {
        if (key.toLowerCase() !== 'authorization') {
          newHeaders[key] = headers[key];
        }
      });
      return newHeaders;
    })(response?.config?.headers || {}),
  });
  return result;
}

async function refreshToken(): Promise<boolean> {
  const user = storage.get(ACCESS_USER);
  if (!user.refreshToken || !user.token) {
    return false;
  }
  // 如果过期的 token 是一个篡改 token, 则不会返回新的 token
  const result = await refreshAuthToken(user.token, user.refreshToken);
  if (!result?.Data?.token) {
    return false;
  }
  storage.set(ACCESS_TOKEN, result.Data.token);
  storage.set(ACCESS_USER, {
    ...user,
    ...result.Data,
  });
  // 更新缓存内存储的 token，好像是在 origin 里存储的
  if (authority.auth.value.ready) {
    await authority.fetchAuth(result.Data.token);
  }
  return true;
}

export function initRequest(config: Config) {
  _initRequest({
    baseURL: API_PREFIX,
    getToken: async () => {
      NProgress.start();
      return ['Authorization', `Bearer ${await authority.getToken()}`];
    },
    parseResponse: (response) => {
      const data = response.data;
      if (data instanceof Blob) {
        NProgress.done();
        return data;
      }
      if (data && +(data as any).code === 2000) {
        NProgress.done();
        return responseData(response);
      }
      throw new Error();
    },
    errorHandler: async (error, defMessage) => {
      NProgress.done();
      let isReject = false;
      if (error.request?.responseType === 'blob') {
        // 如果返回结果是 blob 类型, 一般认为就是下载, 此时错误需要向下传递
        isReject = true;
        if (error.response?.data instanceof Blob) {
          try {
            const text = await error.response.data.text();
            error.response.data =
              (error.response.data.type || '').toLowerCase().indexOf('json') !=
              -1
                ? JSON.parse(text) // json 类型时解析出 json
                : { msg: text }; // 文本类型时，当作错误消息
          } catch (_e) {
            /* empty */
          }
        } else {
          // 如果下载请求超时，是没有 response 的
        }
      }
      if (isReject) {
        // blob 下载出错的时候, 这里需要抛出 catch 并且下游的 Promise 不能捕捉这个catch
        // 如需捕捉, 需要在内部继续像这样抛出 error , 否则还是会下载
        return Promise.reject(error);
      }
      const { t } = i18n();
      // 未登录或 token 失效
      if (
        error.response?.status === 401 ||
        +(error.response?.data as any)?.code === 5401
      ) {
        // 本地 Frame 调试的时候可以注释 IS_PROD 判断
        if (IS_PROD) {
          // token 失效的情况下使用 刷新 token 换取新 token
          const refreshSuccess = await refreshToken();
          if (refreshSuccess) {
            const result = await refreshRequest(error.response);
            return result;
          }
        }
        Notification({
          title: t('Frame', 'common.info'),
          type: 'warning',
          message: t(
            'Frame',
            'error.tokenExpiration',
            !IS_PROD ? `(${t('Frame', 'error.escCancel')})` : '',
          ),
        });
        const keydown = (e: KeyboardEvent) => {
          if (e.code === 'Escape') {
            clearTimeout(timer);
            document.removeEventListener('keydown', keydown);
            if (!IS_PROD) {
              const messages: string[] = [];
              messages.push(`Token 失效原因自查: `);
              messages.push(
                `('检查 xNebula.Plugins.XXX/src/xNebula.Plugins.XXX.UI/build.config.js(ts) 文件中的 server.proxyServer 查看你代理的是本地服务还是线上服务');`,
                `if ('本地服务') {`,
                `  ('查看本地服务是一个主系统(安装了 Portal 插件)还是子系统(安装了 Sso 插件), 未知系统(Portal 插件和 Sso 插件都未安装)');`,
                `  ('经检测, 当前本地服务似乎是一个${config.isPortal ? '主系统' : config.isSso ? '子系统' : '未知系统'}');`,
                `  if ('主系统') {`,
                `    ('可能是 Token 真的失效或 Token 错误, 建议重新登录');`,
                `  } else if ('子系统') {`,
                `    ('可能是 Token 真的失效或 Token 错误, 建议重新登录');`,
                `    ('可能是本地系统配置错误, 请按照以下方式进行正确配置: ');`,
                `    ('1, 请首为该系统找一个(线上已部署好的, 或者本地开启的)主系统(配置了 Portal 插件, 拥有登录页和平台首页的系统)');`,
                `    ('2, 登录主系统, 进入 [门户管理 - 客户端管] 页面, 查询是否有该子系统配置, 有则跳第 4 步');`,
                `    ('3, 新增一个客户端, 填写基本信息, 门户数据(跳转路径, 请填写子系统的地址, 可参考已有配置填写), 授权信息等保存');`,
                `    ('4, 找到子系统配置记录, 点击修改, 点击授权信息, 分别显示 App Key, App Secrect, RSA_PUBLIC_KEY');`,
                `    ('5, 打开子系统(插件)开发目录中的配置文件: xNebula.Plugins.XXX/publish/data/FRAME/appsettings.json');`,
                `    ('6, 找到 Token 这一项, 分别把第 4 步显示出来的值拷贝对应填写到: AppKey: App Key,AppSecret: App Secrect,RsaPublicKey: RSA_PUBLIC_KEY(RSA_PUBLIC_KEY 拷贝要去头: -----BEGIN PUBLIC KEY-----, 去尾: -----END PUBLIC KEY-----, 只要中间部分)');`,
                `    ('7, 配置文件里的 Issuer 和 Audience 两项都填写: wuxixinxiang.com');`,
                `    ('8, 配置文件里的 ParentUrl 填写主系统的地址(只要 IP 和端口, 比如: http://192.168.1.1:8008)');`,
                `  } else if ('未知系统') {`,
                `    ('查看 xNebula.Plugins.XXX/src/xNebula.Plugins.XXX.UI/package.json 配置的 token 的来源, 回忆是从哪个系统里拷贝的, 找到这个系统，并判断该系统是主系统(拥有登录页和平台首页的系统)还是子系统(需要通过 Sso 登录的系统)');`,
                `    if ('主系统') {`,
                `      ('只能去发布该主系统的服务器上找到该系统的配置文件(上述的 appsettings.json), 把配置内对应的 Token 项下的 AppKey, AppSecret, RsaPublicKey, Issuer, Audience 值拷贝到自己代理的系统下的 appsettings.json 内对应的配置中, Issuer 和 Audience 两项都填写: wuxixinxiang.com');`,
                `    } else if ('子系统') {`,
                `      ('去发布该子系统的服务器上找到该系统的配置文件(上述的 appsettings.json), 把配置内对应的 Token 项下的 AppKey, AppSecret, RsaPublicKey, Issuer, Audience 值拷贝到自己代理的系统下的 appsettings.json 内对应的配置中, Issuer 和 Audience 两项都填写: wuxixinxiang.com');`,
                `      ||`,
                `      ('去该子系统对应的主系统内(进入子系统后点击右上角门户即可进入对应的主系统), 进入 [门户管理 - 客户端管] 页面, 找到该子系统的配置, 点击编辑, 查看授权信息, 把 App Key, App Secrect, RSA_PUBLIC_KEY(RSA_PUBLIC_KEY 拷贝要去头: -----BEGIN PUBLIC KEY-----, 去尾: -----END PUBLIC KEY-----, 只要中间部分)的值拷贝到自己代理的系统下的 appsettings.json 内对应的配置中，同时 Issuer 和 Audience  两项都填写: wuxixinxiang.com');`,
                `    }`,
                `  }`,
                `} else if ('线上服务') {`,
                `  ('浏览器里访问该地址, 看该地址是一个主系统(拥有登录页面, 和平台首页)还是子系统(需要通过 Sso 登录的系统)');`,
                `  ('经检测, 当前线上服务似乎是一个${config.isPortal ? '主系统' : config.isSso ? '子系统' : '未知系统'}');`,
                `  if ('主系统') {`,
                `    ('可能是 Token 真的失效或 Token 错误, 建议重新登录');`,
                `  } else if ('子系统') {`,
                `    ('可能是 Token 真的失效或 Token 错误, 建议重新登录');`,
                `    ('可能是线上系统配置错误, 重新配置线上服务, 配置方式和上面子系统配置一样');`,
                `  }`,
                `}`,
                `('进行以上操作后，分别重启前后端服务, 清空 LocalStorage 后再试');`,
              );
              warn(messages.join('\n'));
            }
          }
        };
        document.addEventListener('keydown', keydown);
        const timer = setTimeout(() => {
          document.removeEventListener('keydown', keydown);
          authority.delToken();
          if (!config.isPortal && !config.isSso && IS_PROD) {
            window.alert(
              t('Frame', 'error.loginPlg', [
                t('Frame', 'error.joinWord2'),
                t('Frame', 'error.login'),
              ]),
            );
          } else {
            if (
              config.hasBigscreen &&
              window.location.hash.substring(1) === FixedPath.bigscreen
            ) {
              window.location.href = `${window.location.origin}/`;
            } else {
              // 刷新是为了跳到登录页
              window.location.reload();
            }
          }
        }, 2000);
        return responseData(error.response, null);
      }
      if (!error.response?.config?.meta?.noMessage) {
        const message = (error.response?.data as any)?.msg || defMessage;
        Notification({
          title: t('Frame', 'common.info'),
          type: 'error',
          message, // t('Frame', message),
        });
      }
      return responseData(error.response, null);
    },
  });
}

/**
 * @deprecated
 * 未来 vxe-table 可能会被干掉
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function vxeTableConf(_vueApp: App) {
  // 组件内置的提示语翻译
  const { t, localeList, mergeLocaleMessage } = i18n();
  localeList.forEach(({ value }) => {
    value && mergeLocaleMessage(value, getUILocaleMessages(value, 'vxe'));
  });
  VXETable.setConfig({
    i18n: (key, args) => t('', key, args),
    table: {
      border: true,
      stripe: false,
      showOverflow: true,
      showHeaderOverflow: true,
      highlightCurrentRow: true,
      highlightHoverRow: true,
      headerAlign: 'center',
    },
    button: {
      size: 'small',
    },
    pager: {
      size: 'small',
      perfect: true,
      pageSize: 10,
      pagerCount: 7,
      pageSizes: [10, 15, 20, 50, 100],
      layouts: [
        'PrevJump',
        'PrevPage',
        'Jump',
        'PageCount',
        'NextPage',
        'NextJump',
        'Sizes',
        'Total',
      ],
    },
    input: {
      size: 'small',
    },
    modal: {
      escClosable: true,
    },
  });
  // 自定义全局的格式化处理函数
  VXETable.formats.mixin({
    // 格式化性别
    formatSex: {
      cellFormatMethod: ({
        cellValue,
      }: VXETable.VxeGlobalFormatsHandles.FormatMethodParams) =>
        cellValue
          ? cellValue === '1'
            ? t('Frame', 'error.male')
            : t('Frame', 'error.female')
          : '',
    },
    // 格式化下拉选项
    formatSelect: {
      cellFormatMethod: (
        { cellValue }: VXETable.VxeGlobalFormatsHandles.FormatMethodParams,
        list: { value: string; label: string }[],
      ) => {
        const item = list.find((_item) => _item.value === cellValue);
        return item ? item.label : '';
      },
    },
    // 格式化日期, 默认 yyyy-MM-dd HH:mm:ss
    formatDate: {
      cellFormatMethod: (
        { cellValue }: VXETable.VxeGlobalFormatsHandles.FormatMethodParams,
        format: string,
      ) => XEUtils.toDateString(cellValue, format || 'yyyy-MM-dd HH:mm:ss'),
    },
    // 格式金额, 默认2位数
    formatAmount: {
      cellFormatMethod: (
        { cellValue }: VXETable.VxeGlobalFormatsHandles.FormatMethodParams,
        digits: number,
      ) => XEUtils.commafy(cellValue, { digits: digits || 2 }),
    },
    // 格式化银行卡, 默认每4位隔开
    formatBankcard: {
      cellFormatMethod: ({
        cellValue,
      }: VXETable.VxeGlobalFormatsHandles.FormatMethodParams) =>
        XEUtils.commafy(cellValue, { spaceNumber: 4, separator: ' ' }),
    },
    // 四舍五入,默认两位数
    formatFixedNumber: {
      cellFormatMethod: (
        { cellValue }: VXETable.VxeGlobalFormatsHandles.FormatMethodParams,
        digits: number,
      ) => XEUtils.toNumber(cellValue).toFixed(digits || 2),
    },
    // 截取小数,默认两位数
    formatCutNumber: {
      cellFormatMethod: (
        { cellValue }: VXETable.VxeGlobalFormatsHandles.FormatMethodParams,
        digits: number,
      ) =>
        (XEUtils.toString(cellValue).split('.')[1] || '').substring(
          0,
          digits || 2,
        ),
    },
  });
}
