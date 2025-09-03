<!--
 * @Author: Huangjs
 * @Date: 2024-03-07 17:25:51
 * @LastEditors: Huangjs
 * @LastEditTime: 2024-03-20 14:39:09
 * @Description: ******
-->
<template>
  <x-v-list-table
    ref="vtableRef"
    style="height: 820px"
    :options="options"
    :events="events"
    :records="data" />
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
  columns: [
    {
      field: 'group',
      title: 'department',
      width: 'auto',
      tree: true,
      fieldFormat(rec) {
        return rec['department'] ?? rec['group'] ?? rec['name'];
      },
    },
    {
      field: 'total_children',
      title: 'memebers count',
      width: 'auto',
      fieldFormat(rec) {
        if (rec?.['position']) {
          return `position:  ${rec['position']}`;
        } else return rec?.['total_children'];
      },
    },
    {
      field: 'monthly_expense',
      title: 'monthly expense',
      width: 'auto',
      fieldFormat(rec) {
        if (rec?.['salary']) {
          return `salary:  ${rec['salary']}`;
        } else return rec?.['monthly_expense'];
      },
    },
    {
      field: 'new_hires_this_month',
      title: 'new hires this month',
      width: 'auto',
    },
    {
      field: 'resignations_this_month',
      title: 'resignations this month',
      width: 'auto',
    },
    {
      field: 'complaints_and_suggestions',
      title: 'recived complaints counts',
      width: 'auto',
    },
  ],
  widthMode: 'standard',
});
const events = shallowRef<ListTableEvents>({
  CLICK_CELL: (args) => {
    console.log('click_cell:', args);
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
  'https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VTable/company_struct.json',
)
  .then((res) => res.json())
  .then((records) => {
    data.value = records;
  });
</script>
