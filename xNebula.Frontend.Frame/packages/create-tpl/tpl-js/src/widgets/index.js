import { AbilityRegister } from '@lcp/xrenderer';
import tableWidget, { widgetName as tableName } from './table';
import formWidget, { widgetName as formName } from './form';
import { plgName } from '../common';

let __installed__ = false;

export const WidgetsPlugin = {
  install(app) {
    if (__installed__) {
      return;
    }
    __installed__ = true;
    // 组件或函数名称最好像下面那样把自己的插件名称带上, 防止不同种插件之间注册的名称相同导致覆盖
    //注册组件
    AbilityRegister.registWidgets(app, {
      [`${plgName}-${tableName}`]: tableWidget,
      [`${plgName}-${formName}`]: formWidget,
    });
    //注册函数（需要的时候注册）
    // AbilityRegister.registFunction(`${plgName}-test`, () => 'test');
  },
};
