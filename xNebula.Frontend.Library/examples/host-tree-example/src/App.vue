<!--
 * @Author: Huangjs
 * @Date: 2024-01-31 17:51:41
 * @LastEditors: Huangjs
 * @LastEditTime: 2024-02-21 13:48:15
 * @Description: ******
-->
<template>
  <header>Example HostTree</header>
  <main>
    <ht-general />
    <ht-editable />
    <ht-checkbox />
    <ht-multilevel />
  </main>
</template>

<script setup lang="ts">
import HtGeneral from './components/ht-general.vue';
import HtMultilevel from './components/ht-multilevel.vue';
import HtCheckbox from './components/ht-checkbox.vue';
import HtEditable from './components/ht-editable.vue';
</script>

<style scoped>
header {
  line-height: 1.5;
  text-align: center;
}

main {
  display: flex;
  padding: 10px;
  margin: 16px auto 0;
  text-align: center;
  gap: 16px;
  align-items: flex-start;
  justify-content: center;
}
</style>
