import type { PropType, CSSProperties } from 'vue';
import {
  baseDefinitions,
  type ApiSchemaType,
  type IWidgetDefinition,
} from '@lcp/xrenderer';

const { baseWidgetDefinition } = baseDefinitions;

export const Definition: IWidgetDefinition = {
  name: 'cxtable',
  label: '表格',
  description: '这是一个表格',
  containerMode: 'none',
  scopedMode: 'use',
  propsDefinition: {
    ...baseWidgetDefinition.propsDefinition,
    style: {
      type: Object as PropType<CSSProperties>,
      required: false,
      default: () => {},
    },
    dataSource: {
      type: Object as PropType<ApiSchemaType>,
      required: false,
      default: () => undefined,
      edit: 'input-api',
      label: '数据源',
      description: '数据源配置',
      isExpression: false,
      isI18n: false,
    },
  },
  methodsDefinition: {
    supports: [...baseWidgetDefinition.methodsDefinition.supports],
  },
  eventsDefinition: {
    supports: [...baseWidgetDefinition.methodsDefinition.supports],
  },
};
