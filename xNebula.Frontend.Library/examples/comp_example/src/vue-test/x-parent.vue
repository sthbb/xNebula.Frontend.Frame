<!--
 * @Author: Huangjs
 * @Date: 2024-03-07 17:25:51
 * @LastEditors: Huangjs
 * @LastEditTime: 2024-03-21 15:04:36
 * @Description: ******
-->
<template>
  <div style="display: flex; gap: 16px">
    <div>{{ refData[0].string }}</div>
    <div></div>
    <div></div>
  </div>
  <x-child :string="refData[0]" :num="num" />
  <button @click="click">click</button>
</template>
<script lang="ts" setup>
// toRef 和 toRefs 可将对象 A 转换成响应式对象 B，它的作用是转换后的值 B 改变，被转换的那个值 A 也改变，A 改变，B 也会改变。
// 如果 A 是普通原始对象，那么，即使模板中用了 B，模板也不会随着 B 的变化而更新，因为 A 是非响应式的。
// 如果 A 是响应式对象，那么，模板中用了 B，模板会随着 B 的变化而更新，也会随着 A 的变化而更新，因为 A 是响应式的。
// 所以 上述两个函数，只是将 A 和 B 保持同步，但并不会触发模板响应式更新（响应式更新的函数最终还是被A的属性去依赖的），触发的最终还是靠 A（当 A 是响应式的，A改变，会直接触发A依赖里的更新函数，B 改变，内部会调用 A 改变，从而触发）。
import {
  ref,
  // shallowRef,
  reactive,
  // shallowReactive,
  // readonly,
  // shallowReadonly,
  // toRef,
  // toRefs,
  toRaw,
  // computed,
} from 'vue';
import XChild from './x-child.vue';
const rawData1 = [
  {
    string: 'string',
    object: {
      ostring: 'nnnn',
    },
  },
];
const refData = ref(rawData1);
// const refData = shallowRef(rawData1);
console.log(refData);
console.log(refData.value);
console.log(refData.value[0]);
console.log(refData.value[0].object);
console.log(toRaw(refData.value));
console.log([...refData.value]);
console.log(toRaw(refData.value)[0]);
const rawData2 = [
  {
    string: 'string',
    object: {
      ostring: 'nnnn',
    },
  },
];
const reactiveData = reactive(rawData2);
// const reactiveData = shallowReactive(rawData2);
console.log(reactiveData);
console.log(reactiveData[0]);
console.log(reactiveData[0].object);
console.log(toRaw(reactiveData));
console.log([...reactiveData]);
console.log(toRaw(reactiveData)[0]);
const num = ref(1);
const click = () => {
  refData.value[0].object.ostring = 'bbbbbb';
  num.value = 2;
};
</script>
