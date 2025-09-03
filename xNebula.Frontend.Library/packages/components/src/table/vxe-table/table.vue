<!--
 * @Author: Huangjs
 * @Date: 2024-03-11 16:20:17
 * @LastEditors: Huangjs
 * @LastEditTime: 2024-03-21 13:34:19
 * @Description: ******
-->
<template>
  <div>
    <vxe-table
      ref="tableRef"
      v-bind="computedProps.table"
      @filter-change="filterChange"
      @sort-change="sortChange">
      <template v-for="(column, i) in computedProps.columns || []">
        <vxe-column
          v-if="column.type"
          :key="`${column.type}-${i}`"
          v-bind="column" />
        <vxe-column v-else :key="column.field" v-bind="column">
          <template v-if="$slots.headCell" #header="scope">
            <slot
              name="headCell"
              :column="props.columns?.[i]"
              :title="scope.column.title"></slot>
          </template>
          <template v-if="$slots.bodyCell" #default="scope">
            <slot
              name="bodyCell"
              :column="props.columns?.[i]"
              :index="scope.rowIndex"
              :row="scope.row"
              :text="scope.row[scope.column.field]"></slot>
          </template>
        </vxe-column>
      </template>
      <template v-if="$slots.empty" #empty>
        <slot name="empty"></slot>
      </template>
    </vxe-table>
    <vxe-pager
      v-if="computedProps.pagination"
      v-bind="computedProps.pagination"
      @page-change="pageChange" />
  </div>
</template>
<script lang="ts" setup>
import { ref, computed } from 'vue';
import {
  VxePager,
  VxeTable,
  VxeColumn,
  type VxeTableDefines,
  type VxeTableInstance,
  type VxeColumnPropTypes,
  type VxeTablePropTypes,
  type VxePagerDefines,
  type VxePagerPropTypes,
} from 'vxe-table';
import type { Props, Emits, Slots, Expose } from '../types';

defineOptions({ name: 'XVxeTable' });
defineSlots<Slots>();
const emit = defineEmits<Emits>();
const props = defineProps<Props>();
// 改进：
// 1，使用 toRefs 将 props 解构出来不丢失响应性
// 2，分别对各自的属性部分进行 computed
const computedProps = computed(() => {
  const { seqMethod, columns, pagination, size, rowKey, ...restProps } = props;
  const table = {
    ...restProps,
    size: (size === 'small' ? 'small' : 'medium') as VxeTablePropTypes.Size,
    columnConfig: {
      useKey: true,
    },
    seqConfig:
      typeof seqMethod === 'function'
        ? ({
            seqMethod: ({ rowIndex }) => seqMethod(rowIndex),
          } as VxeTablePropTypes.SeqConfig)
        : undefined,
    rowConfig:
      typeof rowKey === 'string'
        ? {
            keyField: rowKey,
          }
        : undefined,
  };
  const columnProps = columns?.map((column) => {
    const {
      type,
      label,
      prop,
      showOverflowTooltip,
      filters,
      sortBy,
      filterMethod,
      ...restColumns
    } = column;
    return {
      ...restColumns,
      type: (type === 'sequence' ? 'seq' : type) as VxeColumnPropTypes.Type,
      title: label,
      field: prop,
      showOverflow: showOverflowTooltip,
      filters: filters?.map(({ text, value }) => ({ label: text, value })),
      sortBy:
        typeof sortBy === 'function'
          ? ((({ row }) => sortBy(row)) as VxeColumnPropTypes.SortBy)
          : undefined,
      filterMethod:
        typeof filterMethod === 'function'
          ? ((({ value, row }) =>
              filterMethod(
                value,
                row,
                column,
              )) as VxeColumnPropTypes.FilterMethod)
          : undefined,
    };
  });
  let pager = undefined;
  if (pagination) {
    const {
      layout,
      hideOnSinglePage,
      prevIcon,
      prevText,
      nextIcon,
      nextText,
      ...restPagination
    } = pagination;
    pager = {
      ...restPagination,
      layouts: (!layout
        ? ['PrevPage', 'Number', 'NextPage', 'Sizes', 'FullJump', 'Total']
        : layout.split(',').map((k: string) => {
            const key = k.trim();
            if (key === 'prev') return 'PrevPage';
            if (key === 'next') return 'NextPage';
            if (key === 'pager') return 'Number';
            if (key === 'sizes') return 'Sizes';
            if (key === 'total') return 'Total';
            if (key === 'jumper') return 'FullJump';
            if (key === '->') return '';
          })) as VxePagerPropTypes.Layouts,
      autoHidden: hideOnSinglePage,
      iconPrevPage: typeof prevIcon === 'string' ? prevIcon : prevText,
      iconNextPage: typeof nextIcon === 'string' ? nextIcon : nextText,
    };
  }
  return {
    table,
    columns: columnProps,
    pagination: pager,
  };
});
const filterChange = (filter: VxeTableDefines.FilterChangeEventParams) => {
  const _filter: Record<string, string[] | null> = {};
  filter.filterList.forEach(({ field, values }) => {
    _filter[field] = values;
  });
  emit('change', {
    action: 'filter',
    filter: _filter,
  });
};
const sortChange = (sort: VxeTableDefines.SortChangeEventParams) => {
  emit('change', {
    action: 'sort',
    sorter: {
      column: props.columns?.find(({ prop }) => prop === sort.field),
      order:
        sort.order === 'asc'
          ? 'ascending'
          : sort.order === 'desc'
            ? 'descending'
            : null,
      field: sort.field,
    },
  });
};
const pageChange = (pager: VxePagerDefines.PageChangeEventParams) => {
  emit('change', {
    action: 'paginate',
    pagination: {
      currentPage: pager.currentPage,
      pageSize: pager.pageSize,
    },
  });
};
const tableRef = ref<VxeTableInstance>();
defineExpose<Expose>({
  clearSort: () => {
    tableRef.value?.clearSort();
  },
  clearFilter: () => {
    tableRef.value?.clearFilter();
  },
});
</script>
