/*
 * @Author: Huangjs
 * @Date: 2024-03-06 16:31:37
 * @LastEditors: Huangjs
 * @LastEditTime: 2024-03-20 15:03:39
 * @Description: ******
 */
import type { App } from 'vue';
import { AbilityRegister } from '@lcp/xrenderer';
import ListTable, { widgetName as listTableName } from './list-table';
import PivotTable, { widgetName as pivotTableName } from './pivot-table';
import PivotChart, { widgetName as pivotChartName } from './pivot-chart';

export const WidgetsPlugin = {
  install(app: App) {
    //注册 widgets
    AbilityRegister.registWidgets(app, {
      [listTableName]: ListTable,
      [pivotTableName]: PivotTable,
      [pivotChartName]: PivotChart,
    });
    // 这里注册一个函数表达式，功能是执行传入的函数
    AbilityRegister.registFunction(
      'EXECFUNCTION',
      (fn: (...args: any[]) => any, ...args: any[]) =>
        typeof fn === 'function' ? fn(...args) : fn,
    );
  },
};
