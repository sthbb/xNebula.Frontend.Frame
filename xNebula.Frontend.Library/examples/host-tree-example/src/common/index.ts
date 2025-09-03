/*
 * @Author: Huangjs
 * @Date: 2024-01-31 17:51:41
 * @LastEditors: Huangjs
 * @LastEditTime: 2024-02-21 09:45:56
 * @Description: ******
 */

import { hostData, cacheData } from './data';

export const MonitKind = {
  Host: 0,
  Process: 1,
  FSVolume: 2,
  Network: 3,
  File: 4,
  getText(value: string | number) {
    switch (+value) {
      case 0:
        return '主机';
      case 1:
        return '进程';
      case 2:
        return '系统';
      case 3:
        return '网络';
      case 4:
        return '文件';
    }
  },
};
let ID = 1000;
export const request = (type: string, ...args: any[]) => {
  return new Promise((resolve) =>
    setTimeout(() => {
      if (type === 'getGroupHosts') {
        resolve(hostData);
      } else if (type === 'getFromCache') {
        resolve(
          cacheData.map(({ Id, ...rest }) => ({
            Id: `${args[0]}-${Id}`,
            ...rest,
          })),
        );
      } else if (type === 'deleteGroup') {
        resolve({ data: true });
      } else if (type === 'saveGroup') {
        resolve({ data: args[0] === 0 ? ++ID : args[0] });
      } else if (type === 'groupBefore') {
        resolve({ data: true });
      } else if (type === 'groupAfter') {
        resolve({ data: true });
      } else if (type === 'hostBefore') {
        resolve({ data: true });
      } else if (type === 'hostAfter') {
        resolve({ data: true });
      } else if (type === 'hostToGroup') {
        resolve({ data: true });
      }
    }, 1000),
  );
};
