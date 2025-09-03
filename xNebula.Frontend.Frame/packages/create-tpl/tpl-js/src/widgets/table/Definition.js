import { baseDefinitions } from '@lcp/xrenderer';

const { baseWidgetDefinition } = baseDefinitions;

export const Definition = {
  name: 'cxtable',
  label: '表格',
  description: '这是一个表格',
  containerMode: 'none',
  scopedMode: 'use',
  propsDefinition: {
    ...baseWidgetDefinition.propsDefinition,
    style: {
      type: Object,
      required: false,
      default: () => {},
    },
    dataSource: {
      type: Object,
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
