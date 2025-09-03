/*
 * @Author: Huangjs
 * @Date: 2024-03-06 16:31:37
 * @LastEditors: Huangjs
 * @LastEditTime: 2024-03-20 15:03:39
 * @Description: ******
 */
import { PivotChart, register } from '@visactor/vtable';
import { withInstall } from '@xnebula/utils';
import Table from './table.vue';
/* import {
  InputEditor,
  DateInputEditor,
  ListEditor,
} from '@visactor/vtable-editors'; */
import VChart from '@visactor/vchart';
import type {
  EventType,
  EventHandler,
  EventTypeVCHART,
  EventHandlerVCHART,
  Events,
  Options,
  Props,
  Instance,
  Expose,
} from './types';

// 在使用编辑表格的时候需要配置编辑类型
// 设置 option.columns[x].editor = 'input-editor' | 'date-input-editor' | 'list-editor'
/* register.editor('input-editor', new InputEditor());
register.editor('date-input-editor', new DateInputEditor());
register.editor('list-editor', new ListEditor({ values: ['girl', 'boy'] })); */
// 在使用 PivotChart 的时候，需要注册表格内的 chart 为 VChart
register.chartModule('vchart', VChart);

export const XVPivotChart = withInstall(Table);
export const PivotChartEventTypes: typeof PivotChart.EVENT_TYPE =
  PivotChart.EVENT_TYPE;
export type {
  EventType as PivotChartEventType,
  EventHandler as PivotChartEventHandler,
  EventTypeVCHART as PivotChartEventTypeVCHART,
  EventHandlerVCHART as PivotChartEventHandlerVCHART,
  Events as PivotChartEvents,
  Options as PivotChartOptions,
  Props as PivotChartProps,
  Instance as PivotChartInstance,
  Expose as PivotChartExpose,
};
