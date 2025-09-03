/*
 * @Author: Huangjs
 * @Date: 2024-03-06 10:57:01
 * @LastEditors: Huangjs
 * @LastEditTime: 2024-03-06 11:40:52
 * @Description: ******
 */
import { request } from '@xnebula/commons';

export function getTheme() {
  return request({
    url: '/frame/userprofile/clienttheme',
    method: 'get',
  });
}
export function saveTheme(data: { ThemeData: string }) {
  return request({
    url: '/frame/userprofile/clienttheme',
    method: 'put',
    data,
  });
}
