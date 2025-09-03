<!--
 * @Author: Huangjs
 * @Date: 2022-10-25 18:01:58
 * @LastEditors: Huangjs
 * @LastEditTime: 2024-07-24 10:12:37
 * @Description: ******
-->
<template>
  <div :class="cls('cdn-config')">
    <h4>{{ t('Frame', 'param.cdnConfig') }}</h4>
    <el-card>
      <el-row>
        <el-col class="flex">
          <span class="label">{{ t('Frame', value.IsEnableCdn.REMARK) }}</span>
          <el-switch
            :modelValue="
              value.IsEnableCdn.VALUE === 'true' ||
              value.IsEnableCdn.VALUE === true
                ? true
                : false
            "
            @update:modelValue="
              (v: boolean) =>
                $emit('change', {
                  IsEnableCdn: {
                    ...value.IsEnableCdn,
                    VALUE: v,
                  },
                })
            "
            :active-value="true"
            :inactive-value="false" />
        </el-col>
        <el-col class="flex">
          <span class="label">{{ t('Frame', value.CdnUrl.REMARK) }}</span>
          <el-input
            :modelValue="value.CdnUrl.VALUE || ''"
            @update:modelValue="
              (v: string) =>
                $emit('change', {
                  CdnUrl: {
                    ...value.CdnUrl,
                    VALUE: v,
                  },
                })
            " />
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { i18n as useI18n } from '@@/i18n';
import { usePrefixCls } from '@@/hooks';

type Conf = Record<string, Record<string, string | number | boolean>>;

defineOptions({
  name: 'CdnConfig',
});
defineProps<{
  value: Conf;
}>();
defineEmits<{
  (e: 'change', value: Conf): void;
}>();
const { t } = useI18n();
const cls = usePrefixCls();
</script>
