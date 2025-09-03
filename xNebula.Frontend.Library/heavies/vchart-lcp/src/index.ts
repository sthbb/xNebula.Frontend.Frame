import type { App } from 'vue';
import { AbilityRegister } from '@lcp/xrenderer';
import VChart, { widgetName as vChartName } from './v-chart';

export const WidgetsPlugin = {
  install(app: App) {
    //注册 widgets
    AbilityRegister.registWidgets(app, {
      [vChartName]: VChart,
    });
    // 这里注册一个函数表达式，功能是执行传入的函数
    AbilityRegister.registFunction(
      'EXECFUNCTION',
      (fn: (...args: any[]) => any, ...args: any[]) =>
        typeof fn === 'function' ? fn(...args) : fn,
    );
  },
};
