<template>
  <div ref="elRef"></div>
</template>
<script lang="ts" setup>
import { ref, shallowRef, onUnmounted, onMounted, watch } from 'vue';
import type { Ref, ShallowRef } from 'vue';
import VChart from '@visactor/vchart';
import type {
  Props,
  Expose,
  Instance,
  Event,
  Events,
  EventType,
  EventParams,
} from './types';

defineOptions({ name: 'XVChart' });
const props = defineProps<Props>();
const elRef: Ref = ref<HTMLDivElement>();
const vChart: ShallowRef = shallowRef<Instance>();
const eventIds: ShallowRef = shallowRef<
  Partial<Record<EventType, (params: EventParams) => void>>
>({});

watch(
  () => props.spec,
  (spec) => {
    const options = Object.assign({}, props.options, { dom: elRef.value });
    if (vChart.value) {
      spec && vChart.value.updateSpec(spec);
    } else {
      vChart.value = new VChart(props.spec, options);
      vChart.value.renderSync(); // 绘制
      updateEvents(props.events || []);
    }
  },
  { deep: true },
);

watch(
  () => props.events,
  (events) => updateEvents(events || []),
  // 事件因为只有单层，所以可以考虑只改变内部某一个事件
  { deep: true },
);

// 清空事件绑定
const resetEventsHandle = () => {
  // 移除之前注册的事件
  Object.keys(eventIds.value).forEach((event) => {
    const callback = eventIds.value[event];
    callback && vChart.value?.off(event, callback);
  });
  // 重置事件仓库
  eventIds.value = {};
};

const updateEvents = (events: Events) => {
  resetEventsHandle();

  // 重新绑定事件
  events.forEach((e: Event) => {
    let event = e.event as EventType;
    const query = e.query || {};
    const callback = e.callback;
    if (!eventIds.value[event]) {
      eventIds.value[event] = callback;
    } else {
      console.log(`事件${event}已存在请不要重复绑定`);
    }
    vChart.value?.on(event, query, callback);
  });
};

onMounted(() => {
  if (elRef.value) {
    // 注意这里props.options后续的修改是不做watch处理的
    const options = Object.assign({}, props.options, { dom: elRef.value });
    if (props.spec) {
      vChart.value = new VChart(props.spec, options);
      vChart.value.renderSync(); // 绘制
      updateEvents(props.events || []);
    }
  }
});

onUnmounted(() => {
  resetEventsHandle();
});

defineExpose<Expose>({
  execMethod(method, args) {
    return args ? vChart.value?.[method](...args) : vChart.value?.[method]();
  },
  readAttribute(key) {
    return vChart.value?.[key];
  },
  getInstance() {
    return vChart.value;
  },
});
</script>
