<!--
 * @Author: Huangjs
 * @Date: 2024-03-11 16:20:17
 * @LastEditors: Huangjs
 * @LastEditTime: 2024-03-19 13:26:47
 * @Description: ******
-->
<template>
  <div>
    <el-table
      ref="tableRef"
      v-bind="computedProps.table"
      @filter-change="filterChange"
      @sort-change="sortChange">
      <template v-for="(column, i) in computedProps.columns || []">
        <el-table-column
          v-if="column.type && column.type !== 'default'"
          :index="
            column.type === 'sequence' ? computedProps.seqMethod : undefined
          "
          :key="`${column.type}-${i}`"
          v-bind="column" />
        <el-table-column v-else :key="column.prop" v-bind="column">
          <template v-if="$slots.headCell" #header="scope">
            <slot
              name="headCell"
              :column="props.columns?.[i]"
              :title="scope.column.label"></slot>
          </template>
          <template v-if="$slots.bodyCell" #default="scope">
            <slot
              name="bodyCell"
              :column="props.columns?.[i]"
              :index="scope.$index"
              :row="scope.row"
              :text="scope.row[scope.column.property]"></slot>
          </template>
        </el-table-column>
      </template>
      <template v-if="$slots.empty" #empty>
        <slot name="empty"></slot>
      </template>
    </el-table>
    <el-pagination
      style="margin-top: 10px; justify-content: flex-end"
      v-if="computedProps.pagination"
      v-bind="computedProps.pagination"
      @size-change="(v: number) => pageChange('size', v)"
      @current-change="(v: number) => pageChange('current', v)" />
  </div>
</template>
<script lang="ts" setup>
import { ref, computed } from 'vue';
import { ElPagination, ElTable, ElTableColumn } from 'element-plus';
import type { Props, Emits, Slots, Expose } from '../types';

defineOptions({ name: 'XElTable' });
defineSlots<Slots>();
const emit = defineEmits<Emits>();
const props = defineProps<Props>();
// 改进：
// 1，使用 toRefs 将 props 解构出来不丢失响应性
// 2，分别对各自的属性部分进行 computed
const computedProps = computed(() => {
  const { seqMethod, columns, pagination, ...tableProps } = props;
  const columnProps = columns?.map((column) => {
    const { type, sortBy, filterMethod, ...restColumns } = column;
    return {
      ...restColumns,
      type:
        type === 'sequence'
          ? 'index'
          : type === 'checkbox' || type === 'radio'
            ? 'selection'
            : type,
      columnKey: restColumns.prop,
      sortBy:
        typeof sortBy === 'function' ? (row: any) => sortBy(row) : undefined,
      filterMethod:
        typeof filterMethod === 'function'
          ? (value: any, row: any) => filterMethod(value, row, column)
          : undefined,
    };
  });
  let pager = undefined;
  if (pagination) {
    const { layout, ...restPagination } = pagination;
    pager = {
      ...restPagination,
      layout: !layout ? 'prev, pager, next, sizes, jumper, total' : layout,
    };
  }
  return {
    seqMethod,
    table: tableProps,
    columns: columnProps,
    pagination: pager,
  };
});
// el-table的过滤事件每次只有当前过滤项，没有所有的，这里存储一下所有的
const allFilters: Record<string, string[] | null> = {};
const filterChange = (filter: Record<string, string[] | null>) => {
  Object.keys(filter).forEach((key) => {
    allFilters[key] = filter[key];
  });
  emit('change', {
    action: 'filter',
    filter: allFilters,
  });
};
const sortChange = (sort: {
  prop: string;
  order: 'ascending' | 'descending' | null;
}) => {
  emit('change', {
    action: 'sort',
    sorter: {
      column: props.columns?.find(({ prop }) => prop === sort.prop),
      order: sort.order,
      field: sort.prop,
    },
  });
};
const pageChange = (type: 'current' | 'size', value: number) => {
  emit('change', {
    action: 'paginate',
    pagination: {
      currentPage: type === 'size' ? props.pagination?.currentPage : value,
      pageSize: type === 'current' ? props.pagination?.pageSize : value,
      total: props.pagination?.total,
    },
  });
};

const tableRef = ref<InstanceType<typeof ElTable>>();
defineExpose<Expose>({
  clearSort: () => {
    tableRef.value?.clearSort();
  },
  clearFilter: () => {
    tableRef.value?.clearFilter();
  },
});
</script>
