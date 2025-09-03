/*
 * @Author: Huangjs
 * @Date: 2024-02-22 17:15:02
 * @LastEditors: Huangjs
 * @LastEditTime: 2024-03-06 11:54:58
 * @Description: ******
 */

import {
  provide,
  inject,
  unref,
  computed,
  type Ref,
  type ComputedRef,
} from 'vue';
import type { Config } from '@/types';

const confKey = Symbol('globalConfig');

let isProvided = false;

export const useConfig = () => {
  return inject<ComputedRef<Config>>(confKey);
};

export const provideConfig = (conf: Ref<Config> | Config) => {
  const _conf = isProvided ? useConfig() : null;
  const context = computed(() => {
    const cfg = unref(conf);
    if (!_conf?.value) return cfg;
    return {
      ..._conf.value,
      ...cfg,
    };
  });
  isProvided = true;
  provide(
    confKey,
    computed<Config>(() => context.value),
  );
};
