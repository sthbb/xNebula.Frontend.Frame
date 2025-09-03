<!--
 * @Author: Huangjs
 * @Date: 2024-03-07 17:25:51
 * @LastEditors: Huangjs
 * @LastEditTime: 2024-03-21 14:25:16
 * @Description: ******
-->
<template>
  <h1>
    LCP 部件测试
    <router-link to="/designer" style="color: burlywood">设计器</router-link>
  </h1>
  <XRenderer :config="schema" />
</template>
<script lang="ts" setup>
import { shallowRef } from 'vue';
import { XRenderer, type SchemaType } from '@lcp/xrenderer';
import { vueRouter } from '@xnebula/router';
import {
  listTableOptions0,
  listTableOptions,
  pivotTableOptions,
  pivotChartOptions,
} from './options';
import appJson from './app.json';

const { RouterLink } = vueRouter;
// SchemaType 类型较小，需要扩展
const schema = shallowRef<SchemaType>({
  ...appJson,
  body: [
    appJson.body[0],
    {
      ...appJson.body[1],
    },
    {
      ...appJson.body[2],
      options: listTableOptions0,
    },
    {
      ...appJson.body[3],
      options: listTableOptions,
    },
    {
      ...appJson.body[4],
      options: pivotTableOptions,
    },
    {
      ...appJson.body[5],
      options: pivotChartOptions,
    },
  ],
} as SchemaType);
</script>
<style>
.c-page {
  height: auto !important;
}
</style>
