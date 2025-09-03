<!--
 * @Author: Huangjs
 * @Date: 2022-10-25 18:01:58
 * @LastEditors: Huangjs
 * @LastEditTime: 2022-10-27 15:41:26
 * @Description: ******
-->
<template>
  <AsyncModules
    :class="cls('oth-config')"
    :modelValue="value"
    @update:modelValue="(v: Conf) => $emit('change', v)" />
</template>

<script setup lang="ts">
import {
  h,
  onMounted,
  toRaw,
  watch,
  defineAsyncComponent,
  type PropType,
  type Component,
  type ComponentPublicInstance,
} from 'vue';
import { usePrefixCls } from '@@/hooks';
import { Expose } from '@@/expose';
import { getParameterModules } from '@@/api';

type Conf = Record<string, Record<string, string | number | boolean>>;
type Instance = ComponentPublicInstance<{
  setData: (v: Conf) => void;
}>;

defineOptions({
  name: 'OthConfig',
});
defineProps<{
  value: Conf;
}>();
defineEmits<{
  (e: 'change', value: Conf): void;
}>();
const cls = usePrefixCls();

const AsyncModules = defineAsyncComponent({
  loader: async (): Promise<Component> => {
    const components = (await Expose.loadPlugin(
      await getParameterModules(),
    )) as (Component | null)[];
    return {
      name: 'AsyncModules',
      props: {
        modelValue: { type: Object as PropType<Conf>, required: true },
      },
      emits: ['update:modelValue'],
      setup(props, { emit }) {
        const instances: Instance[] = [];
        watch(
          () => props.modelValue,
          (val) => {
            instances.forEach((instance) => {
              instance.setData({ ...val });
            });
          },
        );
        onMounted(() => {
          instances.forEach((instance) => {
            instance.setData({ ...props.modelValue });
          });
        });
        return () =>
          h(
            'div',
            components.map((component) =>
              component
                ? h(component, {
                    ref: (instance: Instance) => {
                      instances.push(instance);
                    },
                    onConfigChange: (data: Conf) => {
                      emit('update:modelValue', {
                        ...props.modelValue,
                        ...toRaw(data),
                      });
                    },
                  })
                : null,
            ),
          );
      },
    };
  },
  // 加载异步组件时使用的组件
  // loadingComponent: LoadingComponent,
  // 展示加载组件前的延迟时间, 默认为 200ms
  // delay: 200,
  // 加载失败后展示的组件
  // errorComponent: ErrorComponent,
  // 如果提供了一个 timeout 时间限制, 并超时了
  // 也会显示这里配置的报错组件, 默认值是: Infinity
  // timeout: 3000,
});
</script>
