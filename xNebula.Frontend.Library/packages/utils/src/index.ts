/*
 * @Author: Huangjs
 * @Date: 2024-03-06 16:31:37
 * @LastEditors: Huangjs
 * @LastEditTime: 2024-03-20 15:03:39
 * @Description: ******
 */
/* // 相比 lodash-unified 更稳定，更兼容
import lodash from 'lodash';
// 相比 moment 更轻量级，更兼容
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import 'dayjs/locale/en';
import 'dayjs/locale/ko';

export { dayjs, lodash }; */
import * as uuid from 'uuid';

export * from './withInstall';
export * from './storage';
export * from './loader';
export * from './types';
export { uuid };
export const version = __VERSION__;
