<template>
  <XLCPEmbed :config="pageSchema" :pluginName="plgName"></XLCPEmbed>
</template>

<script setup lang="ts">
import { shallowRef } from 'vue';
import { XLCPEmbed, type SchemaType } from '@lcp/xrenderer';
import { plgName } from '@/common';
import schema from './schema.json';

const pageSchema = shallowRef<SchemaType>(schema as SchemaType);
</script>
