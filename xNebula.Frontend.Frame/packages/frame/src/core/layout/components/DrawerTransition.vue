<!--
 * @Author: Huangjs
 * @Date: 2022-10-25 14:30:25
 * @LastEditors: Huangjs
 * @LastEditTime: 2022-11-21 08:56:15
 * @Description: ******
-->
<template>
  <transition :name="cls('drawer')" v-bind="listeners">
    <slot />
  </transition>
</template>

<script setup lang="ts">
import type { BaseTransitionProps, TransitionProps } from 'vue';
import { usePrefixCls } from '@@/hooks';

defineOptions({
  name: 'DrawerTransition',
});
const cls = usePrefixCls();
const listeners = {
  onBeforeEnter: (el) => {
    el.style.width = '0px';
  },
  onAfterEnter(el) {
    el.style.width = '';
  },
  onBeforeLeave(el) {
    if (!el.dataset) {
      (el as any).dataset = {};
    }
    el.dataset.width = el.clientWidth.toString();
    el.style.width = `${el.dataset.width}px`;
  },
  onLeave(el) {
    el.style.width = '0px';
  },
} as BaseTransitionProps<HTMLElement> as TransitionProps;
</script>
