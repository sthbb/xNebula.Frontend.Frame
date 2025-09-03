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

const prefixKey = Symbol('prefixCls');

export const usePrefixCls = () => {
  const _prefixCls = inject<ComputedRef<string>>(prefixKey);
  return (cls: string) => `${_prefixCls?.value}__${cls}`;
};

export const providePrefixCls = (prefixCls: Ref<string> | string) => {
  provide(
    prefixKey,
    computed<string>(() => unref(prefixCls)),
  );
};
