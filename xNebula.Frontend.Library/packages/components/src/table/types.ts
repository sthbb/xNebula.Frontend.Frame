/*
 * @Author: Huangjs
 * @Date: 2024-03-11 13:21:17
 * @LastEditors: Huangjs
 * @LastEditTime: 2024-03-20 15:00:35
 * @Description: ******
 */
import type { Component } from 'vue';

type DefaultRowType = any;

export type Column<T = DefaultRowType> = {
  //'default' | 'selection' | 'index' | 'expand'
  //'seq' | 'checkbox' | 'radio' | 'expand'
  type?: 'sequence' | 'default' | 'checkbox' | 'radio' | 'expand';
  className?: string; //列的自定义类
  label?: string; // 列表头的名称    title
  prop?: string; // 列取数据中哪个字段显示   field
  align?: 'left' | 'center' | 'right'; // 对齐方式
  headerAlign?: 'left' | 'center' | 'right'; // 对齐方式
  showOverflowTooltip?: boolean; // show-overflow
  width?: string | number; // 固定宽度
  minWidth?: string | number; // 最小宽度
  fixed?: 'left' | 'right'; // 当前列是否固定在左侧还是右侧，或者不固定
  sortable?: boolean;
  // columnKey?: string; // 默认使用prop
  sortBy?: (row: T) => string;
  filters?: { text: string; value: string }[]; // text-->label
  filterMultiple?: boolean;
  filterMethod?: (value: any, row: T, column: Column<T>) => boolean; //{ value, option, cellValue, row, column }
};

export type Pagination = {
  small?: boolean;
  layout?: string;
  pageSize?: number;
  currentPage?: number;
  total?: number;
  pagerCount?: 5 | 7 | 9 | 11 | 13 | 15 | 17 | 19 | 21;
  background?: boolean;
  pageSizes?: number[];
  hideOnSinglePage?: boolean;
  prevText?: string;
  prevIcon?: string | Component;
  nextText?: string;
  nextIcon?: string | Component;
};

export type BaseProps<T = DefaultRowType> = {
  data?: T[]; // 数据源
  height?: string | number; // 高度
  maxHeight?: string | number; // 最大高度
  border?: boolean; // 是否有边框
  stripe?: boolean; // 是否为斑马纹
  showHeader?: boolean; // 是否显示表头
  size?: 'large' | 'default' | 'small'; // 尺寸  medium, small, mini
  rowKey?: ((row: T) => string) | string; // 数据行的key row-config.keyField
  emptyText?: string;
};
// 1，考虑把 sequence，radio，checkbox，expand 的相关配置放置到 props 里,用位置来区分放在哪一列，而不是在 props.column 里。
// 2，el+ 中的 radio 方式可以考虑将原来的单行选择逻辑以 radio 方式展示，而不是另外再实现。
// 3，单元格合并的配置逻辑加进来，多级表头递归 el-table-column
// 4，行内编辑使用 bodyCell 插槽，根据传入的data中的数据类型（用户指定），判断输入类型，封装一个 EditCell 组件插入，参考 antd-vue 的 table 整行编辑
export type Props<T = DefaultRowType> = {
  loading?: boolean;
  seqMethod?: (index: number) => number; // seq-config.seqMethod //({ row, rowIndex, column, columnIndex }) => number
  columns?: Column<T>[];
  pagination?: Pagination;
  // sequence?: Sequence & BaseColumn; // 提供此配置会生成一个索引列
  // selection?: Selection<T> & BaseColumn; // 提供此配置会生成一个
} & BaseProps<T>;

/* export type Filter<T> = {
  filters?: { text: string; value: string }[]; // 过滤项（text为显示值，value为使用值）
  placement?: Placement; // 过滤气泡的位置
  className?: string; // 过滤气泡类名称
  multiple?: boolean; // 是否可以多选过滤
  value?: string[]; // 选中的数据过滤项，如果需要自定义表头过滤的渲染方式，可能会需要此属性
  method?: (value: any, row: T, column: any Column<T>) => boolean; // 过滤条件逻辑
};
// 将排序部分的 props 单独提出来
export type Sortable<T> = {
  remote?: boolean; // 服务端排序
  orders?: ('ascending' | 'descending' | null)[]; // 降序还是升序
  method?: (a: T, b: T) => number; // 排序方法
  by?: ((row: T, index: number) => string) | string | string[]; // 排序方法
};
// 将序列单独提出来，放到 table props 里传入
export type Sequence = {
  placement?: 'left' | 'right'; // 放在最后一列还是第一列
  index?: number | ((index: number) => number);
};
// 将选择提出来，放到 table props 里传入
export type Selection<T> = {
  placement?: 'left' | 'right'; // 放在最后一列还是第一列，会在 sequence 的外层
  hideSelectAll?: boolean; // 是否隐藏全选按钮
  selectedRowKeys?: string[];
  type?: 'checkbox' | 'radio'; // 单选还是多选
  indeterminate?: boolean; // 是否有半选
  selectable?: (row: T, index: number) => boolean; // 选择时判断是否可以被选择
}; */

export type ChangeEventParams<T = DefaultRowType> = {
  action: 'paginate' | 'filter' | 'sort';
  pagination?: {
    currentPage?: number;
    pageSize?: number;
    total?: number;
  };
  filter?: Record<string, string[] | null>;
  sorter?: {
    column?: Column<T>;
    order?: 'ascending' | 'descending' | null;
    field?: string;
  };
};

export type Emits<T = DefaultRowType> = {
  (e: 'change', args: ChangeEventParams<T>): void; // 筛选，排序，分页 变化后 统一事件
};

export type Slots<T = DefaultRowType> = {
  empty(): any; // 空数据插槽
  headCell(params: { title?: string; column?: Column<T> }): any; // 头部单元格插槽  column header
  bodyCell(params: {
    index?: number;
    row: T;
    text?: string;
    column?: Column<T>;
  }): any; // 表格单元格插槽  column default
};

export type Expose = {
  clearSort: () => void;
  clearFilter: () => void;
};
