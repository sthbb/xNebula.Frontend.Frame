/*
 * @Author: Huangjs
 * @Date: 2024-03-06 16:31:37
 * @LastEditors: Huangjs
 * @LastEditTime: 2024-03-20 15:03:39
 * @Description: ******
 */
import { PivotTable /* , register */ } from '@visactor/vtable';
import { withInstall } from '@xnebula/utils';
import Table from './table.vue';
/* import {
  InputEditor,
  DateInputEditor,
  ListEditor,
} from '@visactor/vtable-editors'; */
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
export const XVPivotTable = withInstall(Table);
export const PivotTableEventTypes: typeof PivotTable.EVENT_TYPE =
  PivotTable.EVENT_TYPE;
export type {
  EventType as PivotTableEventType,
  EventHandler as PivotTableEventHandler,
  EventTypeVCHART as PivotTableEventTypeVCHART,
  EventHandlerVCHART as PivotTableEventHandlerVCHART,
  Events as PivotTableEvents,
  Options as PivotTableOptions,
  Props as PivotTableProps,
  Instance as PivotTableInstance,
  Expose as PivotTableExpose,
};
