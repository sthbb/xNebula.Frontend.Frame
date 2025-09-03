<!--
 * @Author: Huangjs
 * @Date: 2024-03-07 17:25:51
 * @LastEditors: Huangjs
 * @LastEditTime: 2024-03-20 14:38:57
 * @Description: ******
-->
<template>
  <x-v-pivot-chart
    ref="vtableRef"
    style="height: 820px"
    :options="options"
    :events="events"
    :records="data" />
</template>
<script lang="ts" setup>
import { onMounted, ref, shallowRef } from 'vue';
import {
  XVPivotChart,
  type PivotChartEvents,
  type PivotChartOptions,
} from '@xnebula/vtable';

const vtableRef = ref<InstanceType<typeof XVPivotChart>>();
onMounted(() => {
  console.log(vtableRef.value?.readAttribute('autoFillWidth'));
  const vtableInstance = vtableRef.value?.getInstance();
  console.log(vtableInstance?.getTheme());
});
const options = shallowRef<PivotChartOptions>({
  hideIndicatorName: true,
  rows: [
    {
      dimensionKey: 'Order Year',
      title: 'Order Year',
      headerStyle: {
        textStick: true,
      },
    },
    'Ship Mode',
  ],
  columns: [
    {
      dimensionKey: 'Region',
      title: 'Region',
      headerStyle: {
        textStick: true,
      },
    },
    'Category',
  ],
  indicators: [
    {
      indicatorKey: 'Quantity',
      title: 'Quantity',
      cellType: 'chart',
      chartModule: 'vchart',
      chartSpec: {
        // type: 'common',
        stack: true,
        type: 'pie',
        data: {
          id: 'data',
          fields: {
            'Segment-Indicator': {
              sortIndex: 1,
              domain: [
                'Consumer-Quantity',
                'Corporate-Quantity',
                'Home Office-Quantity',
              ],
            },
          },
        },
        categoryField: 'Segment-Indicator',
        valueField: 'Quantity',
        scales: [
          {
            id: 'color',
            type: 'ordinal',
            domain: [
              'Consumer-Quantity',
              'Corporate-Quantity',
              'Home Office-Quantity',
            ],
            range: ['#2E62F1', '#4DC36A', '#FF8406'],
          },
        ],
      },
      style: {
        padding: 1,
      },
    },
  ],
  defaultRowHeight: 200,
  defaultHeaderRowHeight: 50,
  defaultColWidth: 280,
  defaultHeaderColWidth: 100,
  indicatorTitle: '指标',
  autoWrapText: true,
  widthMode: 'adaptive',
  heightMode: 'adaptive',
  select: {
    disableSelect: true,
  },
  corner: {
    titleOnDimension: 'row',
    headerStyle: {
      autoWrapText: true,
    },
  },
  legends: {
    orient: 'bottom',
    type: 'discrete',
    data: [
      {
        label: 'Consumer-Quantity',
        shape: {
          fill: '#2E62F1',
          symbolType: 'circle',
        },
      },
      {
        label: 'Corporate-Quantity',
        shape: {
          fill: '#4DC36A',
          symbolType: 'square',
        },
      },
      {
        label: 'Home Office-Quantity',
        shape: {
          fill: '#FF8406',
          symbolType: 'square',
        },
      },
    ],
  },
});
const events = shallowRef<PivotChartEvents>({
  CLICK_CELL: (args) => {
    console.log('click_cell:', args);
  },
  VCHART_EVENT_TYPE: (args) => {
    console.log('VCHART_EVENT_TYPE:', args);
  },
  'VCHART-pointerup': (...args) => {
    console.log('pointerup:', args);
  },
  'VCHART-pointerdown': {
    query: {
      type: 'pie',
    },
    handler: (...args) => {
      console.log('pointerdown:', args);
    },
  },
});
const data = shallowRef([]);
fetch(
  'https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VTable/North_American_Superstore_Pivot_Chart_data.json',
)
  .then((res) => res.json())
  .then((records) => {
    data.value = records;
  });
</script>
