import { Definition } from './Definition';
import Widget from './src/chart.vue';
import type { IWidget } from '@lcp/xrenderer';

const widget: IWidget = {
  Widget,
  Definition,
};

export * from './src/name';

export default widget;
