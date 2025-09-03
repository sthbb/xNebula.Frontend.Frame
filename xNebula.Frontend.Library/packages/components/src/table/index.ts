/*
 * @Author: Huangjs
 * @Date: 2024-03-11 13:27:22
 * @LastEditors: Huangjs
 * @LastEditTime: 2024-03-13 11:15:44
 * @Description: ******
 */
import { withInstall } from '@xnebula/utils';
import { register } from './register';
import Table from './base.vue';

const XTable = withInstall(Table);

import type {
  Props,
  Emits,
  Slots,
  Expose,
  BaseProps,
  Column,
  ChangeEventParams,
  Pagination,
} from './types';

export type {
  Props as XTableProps,
  Emits as XTableEmits,
  Slots as XTableSlots,
  Expose as XTableExpose,
  BaseProps as XTableBaseProps,
  Column as XTableColumn,
  ChangeEventParams as XTableChangeEventParams,
  Pagination as XTablePagination,
};

export { XTable, register };

export default XTable;
