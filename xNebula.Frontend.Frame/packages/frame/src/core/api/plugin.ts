/*
 * @Author: Huangjs
 * @Date: 2024-03-06 10:57:01
 * @LastEditors: Huangjs
 * @LastEditTime: 2024-03-06 11:40:52
 * @Description: ******
 */
import { request } from '@xnebula/commons';

export function getPluginsModules() {
  return request({
    url: '/frame/plugin/modules',
    method: 'get',
  });
}

export function getConfigs() {
  return request({
    url: '/frame/configs',
    method: 'get',
  });
}

export function getPluginsList(params: {
  keyword: string;
  // pageIndex: number;
  // pageSize: number;
}) {
  return request({
    url: '/frame/plugins',
    method: 'post',
    params,
  });
}
