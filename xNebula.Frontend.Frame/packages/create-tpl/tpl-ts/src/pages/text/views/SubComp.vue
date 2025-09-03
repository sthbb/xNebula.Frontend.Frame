<template>
  <div>
    <el-icon><Bell /></el-icon>
    <span>{{ $t(text) }}</span>
  </div>
</template>

<script setup lang="ts">
import { XComponents } from '@xnebula/frame';
import { $t } from '@/common';

defineProps<{ text: string }>();

const { Bell } = XComponents.ElementPlusIcons;
</script>
