/*
 * @Author: Huangjs
 * @Date: 2024-03-06 10:57:01
 * @LastEditors: Huangjs
 * @LastEditTime: 2024-03-06 11:40:52
 * @Description: ******
 */
import { request } from '@xnebula/commons';

export function getParameterModules() {
  return request({
    url: '/frame/plugin/parameters',
    method: 'get',
  });
}
export function getParameters() {
  return request({
    url: '/frame/parameters',
    method: 'get',
  });
}
export function saveParameters(
  data: any /*  Record<string, Record<string, string>> */,
) {
  return request({
    url: '/frame/parameters',
    method: 'post',
    data,
  });
}
