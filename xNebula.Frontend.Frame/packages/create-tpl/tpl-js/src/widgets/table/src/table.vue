<template>
  <div
    :class="className"
    :style="style"
    :data-dnd-key="dndKey"
    :data-style-key="styleKey">
    <table>
      <th>1</th>
      <tr>
        <td>11</td>
        <td>12</td>
      </tr>
    </table>
  </div>
</template>
<script setup>
import { computed, onMounted } from 'vue';
import { InstanceRegister } from '@lcp/xrenderer';
import { Notification } from '@/common';
import { Definition } from '../Definition';
import { widgetName } from './name';
import { getSomething } from '../api';

// inheritAttrs 不透传
defineOptions({ name: widgetName, inheritAttrs: false });

const props = defineProps(Definition.propsDefinition);
const {
  renderMode, //渲染模式 run | design
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

onMounted(() => {
  getSomething({ id: 2 }).then((data) => {
    if (data) {
      console.log(data);
    } else {
      Notification.notify({
        title: 'success',
        type: 'success',
        message: 'Update Failed!',
      });
    }
  });
});
</script>
