<template>
  <XLCPEmbed :config="pageSchema" :pluginName="plgName"></XLCPEmbed>
</template>

<script setup>
import { ref } from 'vue';
import { XLCPEmbed } from '@lcp/xrenderer';
import { plgName } from '@/common';
import schema from './schema.json';

const pageSchema = ref(schema);
</script>
