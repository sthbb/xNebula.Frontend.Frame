<!--
 * @Author: Huangjs
 * @Date: 2024-03-07 17:25:51
 * @LastEditors: Huangjs
 * @LastEditTime: 2024-03-21 15:09:18
 * @Description: ******
-->
<template>
  <div>{{ a.a }}</div>
  <div>{{ b }}</div>
  <div>{{ object.ostring }}</div>
  <div>{{ ostring1 }}</div>
  <div>{{ num1 }}</div>
  <button @click="click1">click111</button>
  <button @click="click2">click222</button>
</template>
<script lang="ts" setup>
import {
  // ref,
  // shallowRef,
  reactive,
  // shallowReactive,
  // readonly,
  // shallowReadonly,
  toRef,
  // toRefs,
  // toRaw,
  // computed,
  watch,
} from 'vue';
const props = defineProps<{
  string: any;
  num: number;
}>();
// 取到的本身就是响应式的对象
const string = props.string;
// 取到的本身就是响应式的对象
const object = props.string.object;
// 只能取到字符串值
const ostring = props.string.object.ostring;
// 取到响应式包装对象 ObjectRef 与 props 建立连接，可直接被监听，可响应模板
const ostring1 = toRef(object, 'ostring');
// 建了一个响应式对象 Ref，但是无法与 props 建立连接，相当于 ref(props.string.object.ostring)
const ostring2 = toRef(object.ostring);
// 只能取到数值
const num = props.num;
// 取到响应式包装对象 ObjectRef 与 props 建立连接，可直接被监听，可响应模板
const num1 = toRef(props, 'num');
// 建了一个响应式对象 Ref，但是无法与 props 建立连接，相当于 ref(props.num)
const num2 = toRef(props.num);
// 点击父节点的 click 按钮，观察以下几种 watch 各种传值的监听触发情况
console.log(0, string, object, ostring, ostring1, ostring2, num, num1, num2);
// 尝试直接传 string ，传 props.string ，传 () => string ，传 () => props.string
watch(
  () => props.string,
  (val: any) => {
    console.log(1, val);
  },
);
// 尝试直接传 object ，传 props.string.object ，传 () => object ，传 () => props.string.object
watch(
  () => props.string.object,
  (val: any) => {
    console.log(2, val);
  },
);
// 尝试直接传 ostring ，传 props.string.object.ostring ，传 () => ostring ，传 () => props.string.object.ostring
// 尝试直接传 ostring1 ，传 () => ostring1 ，传 ostring2 ，传 () => ostring2
watch(
  () => props.string.object.ostring,
  (val: any) => {
    console.log(3, val);
  },
);
// 尝试直接传 num ，传 props.num ，传 () => num ，传 () => props.num
// 尝试直接传 num1 ，传 () => num1 ，传 num2 ，传 () => num2
watch(
  () => props.num,
  (val: any) => {
    console.log(4, val);
  },
);
console.log(1111111111111111);
console.log(props);
console.log(props.string);
console.log(props.string);
console.log(props.string.object);
console.log({ ...props });
console.log(2222222222222222);
const a = reactive({ a: 1 });
const b = toRef(a, 'a');
const click1 = () => {
  console.log(a, b);
  b.value = 2;
  console.log(a, b);
};
const click2 = () => {
  console.log(a, b);
  a.a = 3;
  console.log(a, b);
};
</script>
