<!--
 * @Author: Huangjs
 * @Date: 2024-03-06 16:32:07
 * @LastEditors: Huangjs
 * @LastEditTime: 2024-03-20 17:43:46
 * @Description: ******
-->
<template>
  <div ref="elRef"></div>
</template>
<script lang="ts" setup>
import { ref, shallowRef, watch, onMounted, onUnmounted } from 'vue';
import { PivotTable } from '@visactor/vtable';
import type {
  Props,
  Expose,
  Events,
  Instance,
  EventType,
  EventHandler,
  EventTypeVCHART,
  EventHandlerVCHART,
} from './types';

defineOptions({ name: 'XVPivotTable' });
const props = defineProps<Props>();
const elRef = ref<HTMLDivElement>();
const eventIds = shallowRef<
  Partial<Record<keyof Events, number | EventHandlerVCHART>>
>({});
const pivotTable = shallowRef<Instance>();
watch(
  () => props.options,
  (options) => {
    options && pivotTable.value?.updateOption(options);
  },
  // 只要有一个配置项变化就需要更新，所以要深度监听
  // 考虑配置项也是一个整体，提高性能，外部传入的配置变化最好是变化后的新对象
  { deep: true },
);
watch(
  () => props.records, // 数据源变化，需要重新传入新数据对象，不能只改变数据内部的
  (records) => {
    records && pivotTable.value?.setRecords(records);
  },
);
watch(
  () => props.events,
  (events) => updateEvents(events || {}),
  // 事件因为只有单层，所以可以考虑只改变内部某一个事件
  { deep: true },
);
const updateEvents = (events: Events) => {
  // 解除所有事件
  Object.keys(eventIds.value).forEach((key) => {
    const eventId = eventIds.value[key as keyof Events];
    typeof eventId === 'number'
      ? pivotTable.value?.off(eventId || 0)
      : pivotTable.value?.offVChartEvent(
          key.replace(/VCHART-/, ''),
          typeof eventId === 'function' ? eventId : eventId?.handler,
        );
  });
  eventIds.value = {};
  // 然后重新注册
  Object.keys(events).forEach((key) => {
    const ktype = key as keyof Events;
    const khandler = events[ktype];
    if (key.startsWith('VCHART-')) {
      (<T extends EventTypeVCHART>(type: T, handler: EventHandlerVCHART) => {
        // 代表注册表格内部的 chart 事件
        const _type = type.replace(/VCHART-/, '') as string;
        if (typeof handler === 'function') {
          eventIds.value[type] = handler;
          pivotTable.value?.onVChartEvent(_type, handler);
        } else if (handler) {
          const { query, handler: _handler } = handler;
          if (_handler) {
            query
              ? pivotTable.value?.onVChartEvent(_type, query, _handler)
              : pivotTable.value?.onVChartEvent(_type, _handler);
          }
        }
      })(ktype as EventTypeVCHART, khandler as EventHandlerVCHART);
    } else {
      (<T extends EventType>(type: T, handler: EventHandler<T>) => {
        if (handler) {
          eventIds.value[type] = pivotTable.value?.on(
            PivotTable.EVENT_TYPE[type],
            handler,
          );
        }
      })(ktype as EventType, khandler as EventHandler<EventType>);
    }
  });
};
onMounted(() => {
  if (elRef.value) {
    pivotTable.value = new PivotTable(elRef.value, {
      ...(props.options || {}),
      records: props.records || [],
    });
    updateEvents(props.events || {});
  }
});
onUnmounted(() => {
  // release 的时候会解除所有 events
  pivotTable.value?.release();
});
defineExpose<Expose>({
  execMethod(method, args) {
    return pivotTable.value?.[method]?.(...args);
  },
  readAttribute(attr) {
    return pivotTable.value?.[attr];
  },
  getInstance() {
    return pivotTable.value;
  },
  getElement() {
    return elRef.value;
  },
});
</script>
