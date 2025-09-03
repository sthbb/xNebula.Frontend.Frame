<template>
  <div>
    <el-icon><Bell /></el-icon>
    <span>{{ $t(text) }}</span>
  </div>
</template>

<script setup>
import { XComponents } from '@xnebula/frame';
import { $t } from '@/common';

defineProps(['text']);

const { Bell } = XComponents.ElementPlusIcons;
</script>
