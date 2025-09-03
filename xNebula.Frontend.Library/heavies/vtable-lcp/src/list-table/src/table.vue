<!--
 * @Author: Huangjs
 * @Date: 2024-03-06 16:32:07
 * @LastEditors: Huangjs
 * @LastEditTime: 2024-03-20 17:43:46
 * @Description: ******
-->
<template>
  <div
    :class="className"
    :style="style"
    :data-dnd-key="dndKey"
    :data-style-key="styleKey"
    v-show="visible"
    v-loading="loading">
    <x-v-list-table
      style="width: 100%; height: 100%"
      ref="tableRef"
      :options="options"
      :records="data.records"
      :events="fnEvents" />
  </div>
</template>
<script lang="ts" setup>
import { ref, shallowRef, toRef, computed } from 'vue';
import {
  InstanceRegister,
  Api,
  Hooks,
  type MethodParamsType,
  type RegisterMethodsType,
} from '@lcp/xrenderer';
import { Definition } from '../Definition';
import { widgetName } from './name';
import {
  VTable,
  VChart,
  XVListTable,
  type ListTableOptions,
  type ListTableEvents,
  type ListTableInstance,
  type ListTableEventType,
  type ListTableEventHandler,
  type ListTableEventTypeVCHART,
  type ListTableEventHandlerVCHART,
} from '@xnebula/vtable';
import type { Method, Attribute } from '@xnebula/utils';

type EventHandler<T> = T extends ListTableEventType
  ? ListTableEventHandler<T>
  : T extends ListTableEventTypeVCHART
    ? ListTableEventHandlerVCHART
    : never;

const { WidgetEventTrigger } = Hooks;

// inheritAttrs 不透传
defineOptions({ name: widgetName, inheritAttrs: false });

const props = defineProps(Definition.propsDefinition);

// 取出 base 里定义的 props 注册到引擎，设置公共部分
const {
  renderMode, //渲染模式 run | design
  events,
  methods,
  scopedData,
} = InstanceRegister.WidgetRegister.registCommon(Definition, props);

const className = computed(() => {
  let cls = [widgetName];
  if (renderMode?.value === 'design') {
    cls.push('dnd-widget');
    cls.push('dnd-container');
  }
  cls.push(props.className);
  return cls;
});
const style = computed(() => ({
  ...props.style,
  ...props.wrapperCustomStyle,
  ...props.customStyle,
}));
const dndKey = computed(() =>
  renderMode?.value === 'design' ? props.dndKey : undefined,
);
const styleKey = computed(() => props.styleKey || props.dndKey);
// 计算配置部分
const options = computed<ListTableOptions>(() =>
  typeof props.options === 'string'
    ? new Function('v', 'c', `return (${props.options})(v,c)`)(VTable, VChart)
    : props.options,
);
// 根据数据源获取数据
const {
  data,
  loading,
  p: reqPromise,
  methods: { forceRefresh },
  // Api.useApi 还必须传入 ref 的 数据源
} = Api.useApi(toRef(props, 'dataSource'), scopedData, {
  defaultValue: { records: [] },
  renderMode,
});
// 事件转化
const fnEvents = shallowRef<ListTableEvents>({});
Object.keys(events).forEach((_key) => {
  (<T extends keyof ListTableEvents>(key: T) => {
    fnEvents.value[key] = ((event: EventHandler<T>) => {
      events[_key].value.handle(
        WidgetEventTrigger.createEvtContext({
          event: {
            getData: () => ({
              event,
              VTable,
              VChart,
            }),
          },
          data: {},
          // deepData: {},
          // normalData: event,
        }),
      );
    }) as ListTableEvents[T];
  })(_key as keyof ListTableEvents);
});
// 对外暴露方法
const tableRef = ref<InstanceType<typeof XVListTable>>();
defineExpose<
  {
    reload: () => Promise<{ records: any[] }>;
    execMethod: (
      params: Omit<MethodParamsType, 'args'> & {
        args: {
          methodName: Parameters<Method<ListTableInstance>>[0];
          methodArgs: Parameters<Method<ListTableInstance>>[1];
        };
      },
    ) => ReturnType<Method<ListTableInstance>>;
    readAttribute: (
      params: Omit<MethodParamsType, 'args'> & {
        args: { attrName: Parameters<Attribute<ListTableInstance>>[0] };
      },
    ) => ReturnType<Attribute<ListTableInstance>>;
  } & RegisterMethodsType
>({
  ...methods,
  reload() {
    forceRefresh.value();
    return reqPromise.value;
  },
  execMethod(params) {
    const { args } = params;
    const { methodName, methodArgs } = args;
    return tableRef.value?.execMethod(methodName, methodArgs);
  },
  readAttribute(params) {
    const { args } = params;
    const { attrName } = args;
    return tableRef.value?.readAttribute(attrName);
  },
});
</script>
