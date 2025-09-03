/*
 * @Author: Huangjs
 * @Date: 2024-03-06 10:57:01
 * @LastEditors: Huangjs
 * @LastEditTime: 2024-03-06 11:40:52
 * @Description: ******
 */
import { request } from '@xnebula/commons';

export function getLocaleList() {
  return new Promise<any>((resolve) => {
    resolve([
      {
        label: '简体中文',
        value: 'zh-CN',
      },
      {
        label: 'English',
        value: 'en-US',
      },
      {
        label: '한국인',
        value: 'ko-KR',
      },
    ]);
  });
  /* return request({
    url: '',
    method: 'get',
    params,
  }); */
}

export function saveLocale(locale: string) {
  return request({
    url: `/frame/user/language/${encodeURIComponent(locale)}`,
    method: 'put',
  });
}

export function getServerMessages() {
  return request({
    url: '/frame/i18n/custom',
    method: 'get',
  });
}

export function getI18nList(data: {
  Page: number;
  Count: number;
  keywords: string;
  pluginNames: string[];
}) {
  return request({
    url: '/frame/i18n/list',
    method: 'post',
    data,
  });
}
export function delI18nOne(id: string) {
  return request({
    url: `/frame/i18n/${encodeURIComponent(id)}`,
    method: 'delete',
  });
}
export function editI18ns(
  data: {
    ID: string | null;
    PLUGIN_NAME: string;
    KEY: string;
    CN: string;
    EN: string;
    KO: string;
  }[],
) {
  return request({
    url: '/frame/i18ns',
    method: 'put',
    data,
  });
}
