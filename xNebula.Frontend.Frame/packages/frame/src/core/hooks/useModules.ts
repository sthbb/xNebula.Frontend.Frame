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
import type { AssetPath } from '@/types';

type Modules = Record<string, AssetPath>;

const confKey = Symbol('globalModules');

let isProvided = false;

export const useModules = () => {
  return inject<ComputedRef<Modules>>(confKey);
};

export const provideModules = (conf: Ref<Modules> | Modules) => {
  const _conf = isProvided ? useModules() : null;
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
    computed<Modules>(() => context.value),
  );
};
