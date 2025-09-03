<template>
  <el-row>
    <el-col><SubComp text="text_no" /></el-col>
    <el-col><SubComp text="text_ok" /></el-col>
  </el-row>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { $t, Message } from '@/common';
import SubComp from './SubComp.vue';
import { getText } from '../api';

const text = ref('Hello World !');

onMounted(() => {
  getText({ id: 1 }).then((data) => {
    if (data) {
      console.log(data);
      text.value = data;
    } else {
      Message({
        type: 'warning',
        message: $t('text_message'),
      });
    }
  });
});
</script>
