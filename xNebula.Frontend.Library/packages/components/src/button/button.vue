<!--
 * @Author: Huangjs
 * @Date: 2024-03-06 16:32:07
 * @LastEditors: Huangjs
 * @LastEditTime: 2024-03-19 09:29:30
 * @Description: ******
-->
<template>
  <el-button></el-button>
</template>
<script lang="ts" setup>
import { ElButton } from 'element-plus';
import type { Slots, Emits, Props, Expose } from './types';

defineOptions({ name: 'XButton' });

defineSlots<Slots>();

defineProps<Props>();

defineEmits<Emits>();

defineExpose<Expose>({});
</script>
