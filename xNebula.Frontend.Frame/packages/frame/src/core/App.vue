<!--
 * @Author: Huangjs
 * @Date: 2024-02-22 17:15:02
 * @LastEditors: Huangjs
 * @LastEditTime: 2024-07-24 14:46:46
 * @Description: ******
-->
<template>
  <router-view v-slot="{ Component }">
    <el-config-provider :locale="message">
      <component
        :is="Component"
        :title="t('Frame', mtitle)"
        :version="version"
        :logoUrl="logoUrl || defaultLogo"
        :docUrl="docUrl"
        :portalBg="portalBg"
        :loginBg="loginBg" />
    </el-config-provider>
  </router-view>
</template>

<script setup lang="ts">
import { shallowRef, watch, onMounted } from 'vue';
import { getUILocaleMessages } from '@xnebula/components';
import { i18n as useI18n } from '@@/i18n';
import { provideConfig, provideModules, providePrefixCls } from '@@/hooks';
import { defaultLogo } from '@@/icon';
import locales from '@@/locales';
import type { Config, AssetPath } from '@/types';

defineOptions({
  name: 'App',
  inheritAttrs: false,
});
const props = defineProps<{
  config: Config;
  modules: Record<string, AssetPath>;
}>();
// 设置样式的全局前缀, 注意需要同步设置 style 的配置, 在 styles/prefix.scss 里
providePrefixCls('xnebula-frame');
provideConfig({ ...props.config });
provideModules({ ...props.modules });
const {
  title = '',
  favUrl = '',
  mtitle = '',
  version = '',
  logoUrl = '',
  docUrl = '',
  loginBg = '',
  portalBg = '',
} = props.config;
const { mergeLocaleMessages, locale, t } = useI18n();
// 合并 Frame 的语言
mergeLocaleMessages(locales, 'Frame');
const message = shallowRef({});
watch(
  locale,
  (v) => {
    document.title = t('Frame', title);
    // 组件内置的提示语翻译
    message.value = getUILocaleMessages(v);
  },
  {
    immediate: true,
  },
);
onMounted(() => {
  const faviconDom =
    document.head.querySelector<HTMLLinkElement>('link[rel=icon]');
  if (faviconDom) {
    faviconDom.href = favUrl || defaultLogo;
  }
});
</script>
