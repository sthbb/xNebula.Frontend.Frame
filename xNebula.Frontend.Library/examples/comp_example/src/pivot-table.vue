<!--
 * @Author: Huangjs
 * @Date: 2024-03-07 17:25:51
 * @LastEditors: Huangjs
 * @LastEditTime: 2024-03-20 14:39:02
 * @Description: ******
-->
<template>
  <x-v-pivot-table
    ref="vtableRef"
    style="height: 820px"
    :options="options"
    :events="events"
    :records="data" />
</template>
<script lang="ts" setup>
import { onMounted, ref, shallowRef } from 'vue';
import {
  XVPivotTable,
  type PivotTableEvents,
  type PivotTableOptions,
} from '@xnebula/vtable';

const vtableRef = ref<InstanceType<typeof XVPivotTable>>();
onMounted(() => {
  console.log(vtableRef.value?.readAttribute('autoFillWidth'));
  const vtableInstance = vtableRef.value?.getInstance();
  console.log(vtableInstance?.getTheme());
});
const options = shallowRef<PivotTableOptions>({
  rows: [
    {
      dimensionKey: 'City',
      title: 'City',
      headerStyle: {
        textStick: true,
      },
    },
  ],
  columns: [
    {
      dimensionKey: 'Category',
      title: 'Category',
      headerStyle: {
        textStick: true,
      },
    },
  ],
  indicators: [
    {
      indicatorKey: 'Quantity',
      title: 'Quantity',
      width: 'auto',
      showSort: false,
      headerStyle: {
        fontWeight: 'normal',
        color: 'purple',
      },
      style: {
        padding: [16, 28, 16, 28],
        color(args) {
          if (args.dataValue >= 0) return 'black';
          return 'red';
        },
      },
    },
    {
      indicatorKey: 'Sales',
      title: 'Sales',
      width: 'auto',
      showSort: false,
      headerStyle: {
        fontWeight: 'normal',
        color: 'red',
      },
      format: (rec) => {
        return '$' + Number(rec).toFixed(2);
      },
      style: {
        padding: [16, 28, 16, 28],
        color(args) {
          if (args.dataValue >= 0) return 'black';
          return 'red';
        },
      },
    },
    {
      indicatorKey: 'Profit',
      title: 'Profit',
      width: 'auto',
      showSort: false,
      headerStyle: {
        fontWeight: 'normal',
        color: 'green',
      },
      format: (rec) => {
        return '$' + Number(rec).toFixed(2);
      },
      style: {
        padding: [16, 28, 16, 28],
        color(args) {
          if (args.dataValue >= 0) return 'black';
          return 'red';
        },
      },
    },
  ],
  corner: {
    titleOnDimension: 'row',
    headerStyle: {
      autoWrapText: true,
    },
  },
  indicatorTitle: 'indicators title',
  indicatorsAsCol: false,
  dataConfig: {
    sortRules: [
      {
        sortField: 'Category',
        sortBy: ['Office Supplies', 'Technology', 'Furniture'],
      },
    ],
  },
  defaultHeaderColWidth: [120, 'auto'],
  widthMode: 'standard',
});
const events = shallowRef<PivotTableEvents>({
  CLICK_CELL: (args) => {
    console.log('click_cell:', args);
  },
});
const data = shallowRef([]);
fetch(
  'https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VTable/North_American_Superstore_Pivot_data.json',
)
  .then((res) => res.json())
  .then((records) => {
    data.value = records;
  });
</script>
