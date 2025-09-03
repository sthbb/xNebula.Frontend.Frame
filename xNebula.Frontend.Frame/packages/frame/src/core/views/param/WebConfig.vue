<!--
 * @Author: Huangjs
 * @Date: 2022-10-25 18:01:58
 * @LastEditors: Huangjs
 * @LastEditTime: 2024-07-24 10:13:10
 * @Description: ******
-->
<template>
  <div :class="cls('web-config')">
    <h4>{{ t('Frame', 'param.webConfig') }}</h4>
    <el-card>
      <el-row>
        <el-col :span="12">
          <el-row>
            <el-col class="flex">
              <span class="label">{{ t('Frame', 'param.platformTitle') }}</span>
              <span class="i18n-key">Frame.platform</span>
              <el-tag class="tag">{{ t('Frame', 'platform') }}</el-tag>
            </el-col>
            <el-col>
              <div class="flex">
                <span class="label">{{
                  t('Frame', value.HomeLogoUrl.REMARK)
                }}</span>
                <el-input
                  :modelValue="value.HomeLogoUrl.VALUE || ''"
                  @update:modelValue="
                    (v: string) =>
                      $emit('change', {
                        HomeLogoUrl: {
                          ...value.HomeLogoUrl,
                          VALUE: v,
                        },
                      })
                  " />
              </div>
              <div
                class="image-thumb"
                :style="{
                  backgroundImage: `url(${value.HomeLogoUrl.VALUE || defaultLogo})`,
                }"></div>
            </el-col>
            <el-col class="flex">
              <span class="label">{{
                t('Frame', value.DocumentUrl.REMARK)
              }}</span>
              <el-input
                :modelValue="value.DocumentUrl.VALUE || ''"
                @update:modelValue="
                  (v: string) =>
                    $emit('change', {
                      DocumentUrl: {
                        ...value.DocumentUrl,
                        VALUE: v,
                      },
                    })
                " />
            </el-col>
          </el-row>
        </el-col>
        <el-col :span="12">
          <el-row>
            <el-col class="flex">
              <span class="label">{{ t('Frame', 'param.webTitle') }}</span>
              <span class="i18n-key">Frame.title</span>
              <el-tag class="tag">{{ t('Frame', 'title') }}</el-tag>
            </el-col>
            <el-col>
              <div class="flex">
                <span class="label">{{
                  t('Frame', value.HomeIconUrl.REMARK)
                }}</span>
                <el-input
                  :modelValue="value.HomeIconUrl.VALUE || ''"
                  @update:modelValue="
                    (v: string) =>
                      $emit('change', {
                        HomeIconUrl: {
                          ...value.HomeIconUrl,
                          VALUE: v,
                        },
                      })
                  " />
              </div>
              <div
                class="image-thumb"
                :style="{
                  backgroundImage: `url(${value.HomeIconUrl.VALUE || defaultLogo})`,
                }"></div>
            </el-col>
            <el-col class="flex">
              <span class="label">{{
                t('Frame', value.IsHidePortal.REMARK)
              }}</span>
              <el-switch
                :modelValue="
                  value.IsHidePortal.VALUE === 'true' ||
                  value.IsHidePortal.VALUE === true
                    ? true
                    : false
                "
                @update:modelValue="
                  (v: boolean) =>
                    $emit('change', {
                      IsHidePortal: {
                        ...value.IsHidePortal,
                        VALUE: v,
                      },
                    })
                "
                :active-value="true"
                :inactive-value="false" />
            </el-col>
          </el-row>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { i18n as useI18n } from '@@/i18n';
import { usePrefixCls } from '@@/hooks';
import { defaultLogo } from '@@/icon';

type Conf = Record<string, Record<string, string | number | boolean>>;

defineOptions({
  name: 'WebConfig',
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
