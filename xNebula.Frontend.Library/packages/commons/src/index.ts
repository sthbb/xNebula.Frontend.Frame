/*
 * @Author: Huangjs
 * @Date: 2024-03-06 16:31:37
 * @LastEditors: Huangjs
 * @LastEditTime: 2024-03-20 15:03:39
 * @Description: ******
 */
import * as signalr from '@xnebula/signalr';

export { signalr };
export const SignalR = signalr.SignalR;
export * from '@xnebula/request';
export * from '@xnebula/i18n';
export * from '@xnebula/router';
// export * from '@xnebula/model';
// export * from '@xnebula/theme';
export const version = __VERSION__;
