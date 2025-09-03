<template>
  <div
    :class="className"
    :style="style"
    :data-dnd-key="dndKey"
    :data-style-key="styleKey"
    v-show="visible"
    v-loading="loading">
    <x-v-chart
      ref="vchartRef"
      style="width: 100%; height: 100%"
      :spec="vchartSpec"
      :options="refOptions"
      :events="vchartEvents"></x-v-chart>
  </div>
</template>
<script lang="ts" setup>
import { ref, shallowRef, toRef, computed, watch } from 'vue';
import type { Ref } from 'vue';
import {
  InstanceRegister,
  Api,
  type RegisterMethodsType,
} from '@lcp/xrenderer';
import { Definition } from '../Definition';
import { widgetName } from './name';
import { XVChart, type VChartExpose } from '@xnebula/vchart';
// const { WidgetEventTrigger } = Hooks;

// inheritAttrs 不透传
defineOptions({ name: widgetName, inheritAttrs: false });
const props = defineProps(Definition.propsDefinition);

const refSpec = toRef(props, 'spec');
const refOptions = toRef(props, 'options');
const refEvents = toRef(props, 'vChartEvents');

const vchartSpec = shallowRef();
const vchartEvents = shallowRef<any>([]);

vchartSpec.value = refSpec.value;

// 取出 base 里定义的 props 注册到引擎，设置公共部分
const {
  renderMode, //渲染模式 run | design
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

const _vchartEvents: any[] = [];
refEvents.value.forEach((item: any) => {
  const { event, query } = item;
  _vchartEvents.push({
    event,
    query,
    callback: (args: any) => {
      console.log(args);
    },
  });
});
vchartEvents.value = _vchartEvents;

watch(
  () => data.value,
  (newValue) => {
    if (newValue) {
      const { records } = newValue;
      vchartSpec.value = { ...vchartSpec.value, data: records };
    }
  },
  {
    deep: true,
  },
);

// 对外暴露方法
const vchartRef: Ref = ref<InstanceType<typeof XVChart>>();
defineExpose<VChartExpose & RegisterMethodsType>({
  ...methods,
  reload() {
    forceRefresh.value();
    return reqPromise.value;
  },
  execMethod(params: any) {
    const { args } = params;
    const { methodName, methodArgs } = args;
    return vchartRef.value?.execMethod(methodName, methodArgs);
  },
  readAttribute(params: any) {
    const { args } = params;
    const { attrName } = args;
    return vchartRef.value?.readAttribute(attrName);
  },
  getInstance() {
    return vchartRef.value;
  },
});
</script>
