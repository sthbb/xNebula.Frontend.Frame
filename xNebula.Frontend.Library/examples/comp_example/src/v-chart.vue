<template>
  <x-v-chart
    ref="vchartRef"
    style="height: 500px"
    :spec="spec"
    :options="options"
    :events="events"></x-v-chart>
</template>
<script lang="ts" setup>
import { onMounted, ref, shallowRef } from 'vue';
import { XVChart } from '@xnebula/vchart';
const vchartRef = ref();
const spec = shallowRef();
const options = shallowRef({}); // 注意这里options后续的修改是不做watch处理的，所以一开始的时候就必须配置到位
const events = shallowRef([
  {
    event: 'pointerdown',
    query: { nodeName: 'axis-label' },
    callback: (...args: any[]) => {
      console.log('pointerdown', ...args);
    },
  },
]);

onMounted(() => {
  console.log('haha');
  spec.value = {
    data: [
      {
        id: 'barData',
        values: [
          { month: 'Monday', sales: 22 },
          { month: 'Tuesday', sales: 13 },
          { month: 'Wednesday', sales: 25 },
          { month: 'Thursday', sales: 29 },
          { month: 'Friday', sales: 38 },
        ],
      },
    ],
    type: 'bar',
    xField: 'month',
    yField: 'sales',
  };
});
</script>
