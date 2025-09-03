<template>
  <div
    :class="className"
    :style="style"
    :data-dnd-key="dndKey"
    :data-style-key="styleKey">
    <form>
      <input type="text" />
    </form>
  </div>
</template>
<script setup>
import { computed } from 'vue';
import { InstanceRegister } from '@lcp/xrenderer';
import { Definition } from '../Definition';
import { widgetName } from './name';

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
</script>
