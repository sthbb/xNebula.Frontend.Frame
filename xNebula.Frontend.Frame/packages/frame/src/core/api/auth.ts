/*
 * @Author: Huangjs
 * @Date: 2024-03-06 10:57:01
 * @LastEditors: Huangjs
 * @LastEditTime: 2024-07-16 18:22:06
 * @Description: ******
 */
import { request } from '@xnebula/commons';

export function getAuthCode(key: string) {
  return request({
    url: `/portal/${encodeURIComponent(key)}/redirecturl?unLoad=1`,
    method: 'get',
  });
}
export function refreshAuthToken(token: string, refreshToken: string) {
  return request({
    url: '/Oauth/Auth/token/update',
    method: 'post',
    data: { Token: token, RefreshToken: refreshToken },
    meta: { noMessage: true },
  });
}
export function getLocaleToken() {
  return request({
    url: '/locale/login',
    method: 'get',
  });
}
export function getAuthToken(code: string) {
  return request({
    url: `/sso/auth/token/${encodeURIComponent(code)}`,
    method: 'get',
  });
}
export function getPortalUrl() {
  return request({
    url: '/sso/auth/loginUrl',
    method: 'get',
  });
}

export function updatePassword(data: {
  OldPassword: string;
  NewPassword: string;
  ConfirmPassword: string;
}) {
  return request({
    url: '/frame/user/password',
    method: 'put',
    data,
  });
}

export function getFavMenus() {
  return request({
    url: '',
    method: 'get',
  });
}

export function addFavMenu() {
  return request({
    url: '',
    method: 'post',
  });
}
