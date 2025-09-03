<!--
 * @Author: Huangjs
 * @Date: 2022-10-25 18:01:58
 * @LastEditors: Huangjs
 * @LastEditTime: 2022-10-27 15:41:26
 * @Description: ******
-->
<template>
  <el-result
    icon="error"
    title="Failed"
    :sub-title="t('Frame', 'error.pageError')">
    <template #extra>
      <template v-if="messages && messages.length > 0">
        <p class="tip" v-for="(message, i) in messages" :key="i">
          {{ message }}
        </p>
      </template>
      <template v-else>
        <p class="tip">
          {{ t('Frame', 'error.errorReason') }}
        </p>
      </template>
    </template>
  </el-result>
</template>

<script setup lang="ts">
import { i18n as useI18n } from '@@/i18n';

defineOptions({
  name: 'PageError',
  inheritAttrs: false,
});
defineProps<{ messages?: string[] }>();
const { t } = useI18n();
</script>
<style lang="scss" scoped>
.tip {
  font-size: 12px;
  color: var(--el-color-error);
  text-align: left;
}
</style>
