<!--
 * @Author: Huangjs
 * @Date: 2024-03-06 16:32:07
 * @LastEditors: Huangjs
 * @LastEditTime: 2024-03-19 09:29:30
 * @Description: ******
-->
<template>
  <component :is="Table" ref="compRef" v-bind="$props" @change="change">
    <template v-if="$slots.headCell" #headCell="scope">
      <slot name="headCell" v-bind="scope"></slot>
    </template>
    <template v-if="$slots.bodyCell" #bodyCell="scope">
      <slot name="bodyCell" v-bind="scope"></slot>
    </template>
    <template v-if="$slots.empty" #empty>
      <slot name="empty"></slot>
    </template>
  </component>
</template>
<script lang="ts" setup>
import { ref } from 'vue';
import type { ChangeEventParams, Slots, Emits, Props, Expose } from './types';
import { component } from './register';

const Table = component();

defineOptions({ name: 'XTable' });

defineSlots<Slots>();

defineProps<Props>();

const emit = defineEmits<Emits>();
const change = (args: ChangeEventParams) => emit('change', args);

const compRef = ref();
const expose: Expose = {
  clearSort: (...args) => compRef.value?.clearSort?.(...args),
  clearFilter: (...args) => compRef.value?.clearFilter?.(...args),
};
defineExpose<Expose>(expose);
</script>
