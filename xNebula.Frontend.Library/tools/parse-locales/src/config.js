export default {
  // 匹配对应类型文件中关于国际化的代码模式
  i18nKeyRegs: [
    {
      suffix: '.vue',
      reg: /\bt\(("|')+([A-Za-z0-9_]*)("|')+(,|\))/gi,
      searchvalue: '$2',
    },
    {
      suffix: '.js',
      reg: /\bt\(("|')+([A-Za-z0-9_]*)("|')+(,|\))/gi,
      searchvalue: '$2',
    },
    {
      suffix: '.json',
      reg: /"(content|label|placeholder)":(\s)?"(.*)"/g,
      searchvalue: '$3',
    },
    {
      suffix: '.json',
      reg: /\bt\(("|')+([A-Za-z0-9_]*)("|')+(,|\))/gi,
      searchvalue: '$2',
    },
  ],
  // 输出文件配置
  saveInfo: {
    fileName: 'i18n',
    suffix: '.json',
  },
};
