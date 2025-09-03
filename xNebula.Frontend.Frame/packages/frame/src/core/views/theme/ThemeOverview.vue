<!--
 * @Author: Huangjs
 * @Date: 2022-10-25 18:01:58
 * @LastEditors: Huangjs
 * @LastEditTime: 2022-10-27 15:41:26
 * @Description: ******
-->
<template>
  <el-container :class="cls('theme-overview')">
    <el-main :class="cls('overview-main')">
      <div ref="overviewRef" :class="cls('overview-wrapper')">
        <base-layout
          :title="t('Frame', config?.mtitle || '')"
          :version="config?.version || ''"
          :logoUrl="config?.logoUrl || defaultLogo"
          :docUrl="config?.docUrl || ''">
          <theme-model />
        </base-layout>
      </div>
    </el-main>
    <el-aside width="320px" :class="cls('overview-aside')">
      <theme-setting :getOverviewElement="getOverviewElement" />
    </el-aside>
  </el-container>
</template>
<script lang="ts" setup>
import { ref } from 'vue';
import BaseLayout from '@@/layout/BaseLayout.vue';
import { i18n as useI18n } from '@@/i18n';
import { useConfig, usePrefixCls } from '@@/hooks';
import { defaultLogo } from '@@/icon';
import ThemeModel from './ThemeModel.vue';
import ThemeSetting from './ThemeSetting.vue';

defineOptions({
  name: 'ThemeOverview',
});
const { t } = useI18n();
const cls = usePrefixCls();
const config = useConfig();
const overviewRef = ref();
const getOverviewElement = () => overviewRef.value;
</script>
