/*
 * @Author: Huangjs
 * @Date: 2024-07-24 13:37:28
 * @LastEditors: Huangjs
 * @LastEditTime: 2024-07-24 13:57:37
 * @Description: ******
 */
export default {
  [`plgName`]: {
    aaa: 'AAA',
    bbb: {
      ccc: 'CCC',
      ddd: 'DDD',
    },
    eee: {
      fff: 'fff',
      ggg: {
        hhh: 'eee',
        ooo: {},
      },
    },
    helloKey: (ctx) => `Hello, ${ctx.list(0)}!`, // $t('helloKey', ['小明'])
  },
};
