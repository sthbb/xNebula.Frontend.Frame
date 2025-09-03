<!--
 * @Author: Huangjs
 * @Date: 2022-10-25 14:30:25
 * @LastEditors: Huangjs
 * @LastEditTime: 2022-11-21 08:56:15
 * @Description: ******
-->
<template>
  <el-scrollbar :class="cls('left-menu')">
    <el-menu
      :popper-class="cls('popper-menu')"
      :default-active="current"
      :collapse="isCollapse"
      unique-opened>
      <menu-item
        :preview="preview"
        :menus="menus"
        @favorite="(id: string) => $emit('favorite', id)" />
    </el-menu>
  </el-scrollbar>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { route as useRoute } from '@@/router';
import { usePrefixCls } from '@@/hooks';
import { authority, collapse } from '@@/store';
import MenuItem from './MenuItem.vue';

const cls = usePrefixCls();
const route = useRoute();

defineOptions({
  name: 'LeftMenu',
});
withDefaults(
  defineProps<{
    preview?: boolean;
    menus?: authority.AuthMenu[];
  }>(),
  {
    preview: () => false,
    menus: () => [],
  },
);
defineEmits<{
  (e: 'favorite', id: string): void;
}>();

const { isCollapse } = collapse;
const current = computed(() => route.meta.id);
</script>
