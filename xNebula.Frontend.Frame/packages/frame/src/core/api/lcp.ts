/*
 * @Author: Huangjs
 * @Date: 2024-03-06 10:57:01
 * @LastEditors: Huangjs
 * @LastEditTime: 2024-03-06 11:40:52
 * @Description: ******
 */
import { request } from '@xnebula/commons';

export function getLCPJSON(url: string) {
  return request({
    url: url,
    method: 'get',
  });
}
