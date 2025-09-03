<!--
 * @Author: Huangjs
 * @Date: 2024-03-07 17:25:51
 * @LastEditors: Huangjs
 * @LastEditTime: 2024-03-21 15:04:36
 * @Description: ******
-->
<template>
  <p>{{ state2.double }}</p>
  <button @click="click">click</button>
</template>
<script lang="ts" setup>
import {
  ref,
  reactive,
  computed,
  watch,
  /* watchEffect,
  watchPostEffect, */
} from 'vue';
const refData = ref({
  number: {
    bb: 1,
  },
});
const number = refData.value.number;
const click = () => {
  // refData.value.number.bb += 1;
  state2.double = 999;
  console.log(999);
};
const state = reactive({
  count: 0,
});
const state2 = reactive({
  double: computed({
    get: () => state.count * 2,
    set: (val) => {
      state.count = val;
    },
  }),
});
/* const result = computed(() => {
  console.log(1);
  const k = refData.value.number * 2;
  console.log(2);
  return k;
});
const result2 = computed(() => {
  console.log(3);
  const k = result.value * 2;
  console.log(4);
  return k;
}); */
watch(
  // 该函数第一次运行为了追踪响应式数据，后续运行是为了给第二个函数提供newVal
  // immediate: true, 时该函数第一次运行为了追踪响应式数据并提供第一次的newVal
  () => {
    console.log(number);
    return number.bb;
  },
  (a, b) => {
    console.log(a, b);
  },
);
/* watch(
  () => {
    console.log('getter2', refData.value.number);
    return refData.value.number;
  },
  (a, b) => {
    console.log(a, b);
  },
  { immediate: true, flush: 'post' },
);
watchPostEffect(async () => {
  await new Promise((r) => {
    setTimeout(r, 1000);
  });
  console.log('getter3', refData.value.number);
});
console.log(3333333);
setTimeout(() => {
  watchEffect(() => {
    console.log('getter4', refData.value.number);
  });
}, 1000); */
</script>
