<template>
  <div>
    <div>历史数据</div>
    <x-v-list-table
      ref="vtableRef"
      style="height: 1440px"
      :options="options"
      :events="events"
      :records="compareRecords" />
  </div>
</template>
<script lang="ts" setup>
import { onMounted, ref, shallowRef } from 'vue';
import {
  XVListTable,
  type ListTableEvents,
  type ListTableOptions,
} from '@xnebula/vtable';
const vtableRef = ref<InstanceType<typeof XVListTable>>();
onMounted(() => {
  console.log(vtableRef.value?.readAttribute('autoFillWidth'));
  const vtableInstance = vtableRef.value?.getInstance();
  console.log(vtableInstance?.getTheme());
});
const options = shallowRef<ListTableOptions>({
  // hierarchyExpandLevel: 'Infinity',
  // 默认样式
  customCellStyle: [
    // 行不存在高亮提示
    {
      id: 'remove',
      style: {
        bgColor: 'red',
      },
    },
    // 新增行高亮提示
    {
      id: 'new',
      style: {
        bgColor: 'green',
      },
    },
    // 行数据被修改高亮提示
    {
      id: 'update',
      style: {
        bgColor: 'yellow',
      },
    },
  ],
  // customCellStyleArrangement: [
  //   {
  //     cellPosition: {
  //       col: 0,
  //       row: 0,
  //     },
  //     customStyleId: 'remove',
  //   }
  // ],
  columns: [
    {
      field: 'order', // 数据源字段
      title: 'Index', // 列标题
      width: 'auto',
      tree: true,
      fieldFormat(rec) {
        return rec['order']; // 数据源字段
      },
    },
    {
      field: 'name', // 数据源字段
      title: 'Name', // 列标题
      width: 'auto',
      fieldFormat(rec) {
        return rec['name']; // 数据源字段
      },
    },
    {
      field: 'cccode', // 数据源字段
      title: 'CCode', // 列标题
      width: 'auto',
      fieldFormat(rec) {
        return rec['cccode']; // 数据源字段
      },
    },
    {
      field: 'value', // 数据源字段
      title: 'Value', // 列标题
      width: 'auto',
      fieldFormat(rec) {
        return rec['value']; // 数据源字段
      },
    },
    {
      field: 'desc', // 数据源字段
      title: 'Desc', // 列标题
      width: 'auto',
      fieldFormat(rec) {
        return rec['desc']; // 数据源字段
      },
    },
    {
      field: 'type', // 数据源字段
      title: 'Type', // 列标题
      width: 'auto',
      fieldFormat(rec) {
        return rec['type']; // 数据源字段
      },
    },
  ],
  widthMode: 'standard',
});

const events = shallowRef<ListTableEvents>({
  // CLICK_CELL: (args) => {
  //   console.log('click_cell:', args);
  // },
});
// const data = shallowRef<Array<Record<string, any>>>([]);
const compareRecords = shallowRef<Array<Record<string, any>>>([]);
// 比较数据
compareRecords.value = [
  // {
  //   id: 1,
  //   order: '1',
  //   name: 'Step1',
  //   cccode: '1',
  //   value: '',
  //   desc: 'Block',
  //   type: '',
  //   children: [],
  // },
  {
    id: 2,
    order: '2',
    name: 'Step2',
    cccode: '2',
    value: '',
    desc: 'Block',
    type: '',
    children: [
      {
        id: 21,
        order: '2.1',
        name: 'P2.1',
        cccode: '',
        value: '2.1',
        desc: 'Item',
        type: 'U4',
        children: [
          {
            id: 212,
            order: '2.1.2',
            name: 'P2.1.2',
            cccode: '',
            value: '2.1.2',
            desc: 'Item',
            type: 'U4',
          },
          {
            id: 213,
            order: '2.1.3',
            name: 'P2.1.3',
            cccode: '',
            value: '2.1.3',
            desc: 'Item',
            type: 'U4',
          },
          {
            id: 214,
            order: '2.1.4',
            name: 'P2.1.4#####',
            cccode: '',
            value: '2.1.4',
            desc: 'Item',
            type: 'U4',
          },
        ],
      },
      {
        id: 22,
        order: '2.2',
        name: 'P2.2',
        cccode: '',
        value: '2.2',
        desc: 'Item',
        type: 'U4',
      },
      {
        id: 23,
        order: '2.3',
        name: 'P2.3',
        cccode: '',
        value: '2.3',
        desc: 'Item',
        type: 'U4',
      },
    ],
  },
  {
    id: 3,
    order: '3',
    name: 'Step3',
    cccode: '3',
    value: '',
    desc: 'Block',
    type: '',
    children: [],
  },
  // {
  //   id: 4,
  //   order: '4',
  //   name: 'Step4',
  //   cccode: '4',
  //   value: '',
  //   desc: 'Block',
  //   type: '',
  //   children: [
  //     {
  //       id: 41,
  //       order: '4.1',
  //       name: 'P4.1',
  //       cccode: '',
  //       value: '4.1',
  //       desc: 'Item',
  //       type: 'U4',
  //     },
  //     {
  //       id: 42,
  //       order: '4.2',
  //       name: 'P4.2',
  //       cccode: '',
  //       value: '4.2',
  //       desc: 'Item',
  //       type: 'U4',
  //     },
  //   ],
  // },
  {
    id: 5,
    order: '5',
    name: 'Step5',
    cccode: '5',
    value: '',
    desc: 'Block',
    type: '',
    children: [],
  },
  {
    id: 6,
    order: '6',
    name: 'Step6',
    cccode: '6',
    value: '',
    desc: 'Block',
    type: '',
    children: [],
  },
  {
    id: 7,
    order: '7',
    name: 'Step7',
    cccode: '7',
    value: '',
    desc: 'Block',
    type: '',
    children: [
      {
        id: 71,
        order: '7.1',
        name: 'P7.1',
        cccode: '',
        value: '7.1',
        desc: 'Item',
        type: 'U4',
      },
    ],
  },
  {
    id: 8,
    order: '8',
    name: 'Step8',
    cccode: '8',
    value: '',
    desc: 'Block',
    type: '',
    children: [
      {
        id: 82,
        order: '8.2',
        name: 'P8.2######',
        cccode: '',
        value: '8.2',
        desc: 'Item',
        type: 'U4',
      },
      {
        id: 83,
        order: '8.3',
        name: 'P8.3',
        cccode: '',
        value: '8.3',
        desc: 'Item',
        type: 'U4',
      },
      {
        id: 84,
        order: '8.4',
        name: 'P8.4',
        cccode: '',
        value: '8.4',
        desc: 'Item',
        type: 'U4',
      },
    ],
  },
];
// fetch('https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VTable/company_struct.json')
//   .then((res) => res.json())
//   .then((records) => {
//     data.value = records;
//   });
</script>
