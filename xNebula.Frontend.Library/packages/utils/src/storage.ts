/*
 * @Author: Huangjs
 * @Date: 2024-03-11 13:21:17
 * @LastEditors: Huangjs
 * @LastEditTime: 2024-03-20 17:56:03
 * @Description: ******
 */
import type { JSONType } from './types';

// storage 可根据传入的 key 获取，设置，删除指定的键值
// storage.get('AA.gg'),storage.set('AA.bb'),storage.remove('AA.gg')

const parseKey = (key: string) => {
  const keyArr: (string | number)[] = [];
  key.split('.').forEach((k) => {
    const match = k.match(/\[\d+\]/);
    if (match) {
      keyArr.push(
        k.split('[')[0],
        parseInt(match[0].substring(1, match[0].length - 1)),
      );
    } else {
      keyArr.push(k);
    }
  });
  return keyArr as [string, ...(string | number)[]];
};

export const storage = {
  get: (key: string) => {
    const [skey, ...okeys] = parseKey(key);
    const string = localStorage.getItem(skey);
    try {
      return (
        string && okeys.reduce((o, k) => (o ? o[k] : o), JSON.parse(string))
      );
    } catch (_e) {
      /* empty */
    }
    return string;
  },
  set: (key: string, val: JSONType) => {
    const [skey, ...okeys] = parseKey(key);
    if (!okeys.length) {
      localStorage.setItem(skey, JSON.stringify(val));
    }
    const data = storage.get(skey) || {};
    okeys.reduce(
      (o, k, i) => (o[k] = i === okeys.length - 1 ? val : o[k] || {}),
      data,
    );
    localStorage.setItem(skey, JSON.stringify(data));
  },
  remove: (key: string) => {
    const [skey, ...okeys] = parseKey(key);
    const data = storage.get(skey);
    if (okeys.length && data) {
      const del = okeys.reduce((o, k, i) => {
        const d = o[k];
        if (o && typeof o[k] !== 'undefined' && i === okeys.length - 1) {
          delete o[k];
        }
        return o ? d : o;
      }, data);
      localStorage.setItem(skey, JSON.stringify(data));
      return del;
    }
    localStorage.removeItem(skey);
    return data;
  },
  clear: () => localStorage.clear(),
};
