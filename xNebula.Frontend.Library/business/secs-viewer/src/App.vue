<template>
  <div style="height: 100%">
    <div class="nav">
      <RouterLink to="/edit">编辑模式</RouterLink>
      <RouterLink to="/view">查看模式</RouterLink>
    </div>
    <RouterView />
  </div>
</template>
<script setup>
import { RouterView } from 'vue-router';
</script>

<style scoped>
.nav {
  display: flex;
  height: 20px;
  font-size: 14px;
  line-height: 20px;
  justify-content: space-around;
}
</style>
