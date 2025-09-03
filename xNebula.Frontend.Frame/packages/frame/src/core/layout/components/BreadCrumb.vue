<!--
 * @Author: Huangjs
 * @Date: 2022-10-25 14:30:25
 * @LastEditors: Huangjs
 * @LastEditTime: 2022-11-21 08:56:15
 * @Description: ******
-->
<template>
  <el-breadcrumb :class="cls('bread-crumb')" separator="/">
    <el-breadcrumb-item v-for="item in linked" :key="item.id">{{
      t(item.i18nKey?.[0], item.i18nKey?.[1])
    }}</el-breadcrumb-item>
  </el-breadcrumb>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { route as useRoute } from '@@/router';
import { i18n as useI18n } from '@@/i18n';
import { usePrefixCls } from '@@/hooks';
import { authority } from '@@/store';

defineOptions({
  name: 'BreadCrumb',
});
const cls = usePrefixCls();
const { t } = useI18n();
const route = useRoute();
const linked = computed(() => {
  const _linked = [];
  let menuRoute = authority.auth.value.menuRoutes.find(
    (mr) => route.meta.id == mr.id,
  );
  while (menuRoute) {
    _linked.unshift(menuRoute);
    menuRoute = menuRoute.parent;
  }
  return _linked;
});
</script>
