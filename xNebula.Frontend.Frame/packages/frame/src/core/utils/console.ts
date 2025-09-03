/*
 * @Author: Huangjs
 * @Date: 2024-03-06 10:57:01
 * @LastEditors: Huangjs
 * @LastEditTime: 2024-03-06 11:40:52
 * @Description: ******
 */
export const log = (...args: any[]) => {
  return console.log(...args);
};
export const warn = (...args: any[]) => {
  if (args[3] === 'translate') {
    return;
  }
  // console.log(`%cI will change red`, `color:red`);
  return console.warn(...args);
};
export const error = (...args: any[]) => {
  return console.error(...args);
};
