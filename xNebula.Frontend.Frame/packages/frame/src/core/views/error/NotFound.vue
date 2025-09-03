<!--
 * @Author: Huangjs
 * @Date: 2022-10-25 18:01:58
 * @LastEditors: Huangjs
 * @LastEditTime: 2024-07-24 10:43:27
 * @Description: ******
-->
<template>
  <el-result icon="error" title="404" :sub-title="t('Frame', 'error.notFound')">
    <template #extra>
      <el-button type="primary" @click="toHome">{{
        t('Frame', 'error.goHome')
      }}</el-button>
    </template>
  </el-result>
</template>

<script setup lang="ts">
import { router as useRouter } from '@@/router';
import { i18n as useI18n } from '@@/i18n';

defineOptions({
  name: 'notFound',
  inheritAttrs: false,
});
const { t } = useI18n();
const router = useRouter();
const toHome = () => {
  router.push({ path: '/' });
};
</script>
