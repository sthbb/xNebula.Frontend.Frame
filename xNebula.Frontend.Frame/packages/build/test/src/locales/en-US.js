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
