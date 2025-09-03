import { type IWidget } from '@lcp/xrenderer';
import { Definition } from './Definition';
import MyWidget from './src/table.vue';

export * from './src/name';

const widget: IWidget = {
  Definition: Definition,
  Widget: MyWidget,
};

export default widget;
