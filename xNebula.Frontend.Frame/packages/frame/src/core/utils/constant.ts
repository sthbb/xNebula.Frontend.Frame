/*
 * @Author: Huangjs
 * @Date: 2022-10-26 11:23:47
 * @LastEditors: Huangjs
 * @LastEditTime: 2024-07-16 17:51:59
 * @Description: ******
 */
export const API_PREFIX = '/api';

export const ACCESS_USER = 'Access-User';
export const ACCESS_TOKEN = 'Access-Token';
export const TEMP_MENU_TAG = 'Temp-Menu-Tag';

export const URL_REGEXP = /^(https?):\/\/.+$/;

export const IS_PROD = __FRAME_MODE__ !== 'DEV' && __FRAME_MODE__ !== 'PUB';
