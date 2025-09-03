import type { PropType, CSSProperties } from 'vue';
import {
  baseDefinitions,
  type ApiSchemaType,
  type IWidgetDefinition,
} from '@lcp/xrenderer';

export const Definition: IWidgetDefinition = {
  name: 'XVChart',
  label: 'XVChart',
  description: 'XVChart 图表组件',
  // 目前还未被实际使用，后续可能会使用，暂时起到语义上的作用
  // form form表单类型的组件
  // app 应用组件，多页面组件，目前就一个routerApp
  // container容器组件，一般是指会定义子组件的组件
  // none 常规组件，一般没有子组件
  containerMode: 'none', //是否是容器组件 none | container | form | app
  // create 代表本组件会创建自己的数据域，一般需要在 props 里传递 data 和 canAccessSuperData，
  // 同时会通过 canAccessSuperData 来控制是否 使用父级数据域来映射当前数据域，并且把父级合并到映射后的数据域
  // chart 目前是和 create 一样，后续会更改
  // dialog 模式一般只需要在 props 里传递 data，并且默认使用父级数据域来映射当前数据域，但是不做合并。
  // use 代表本组件不会创建自己的数据域（props 里不传递 data），直接使用父级数据域
  scopedMode: 'use', //是否创建自身数据域 use | create |dialog | chart
  propsDefinition: {
    ...baseDefinitions.baseWidgetDefinition.propsDefinition,
    style: {
      type: Object as PropType<CSSProperties>,
      required: false,
      default: () => {},
    },
    spec: {
      type: Object,
      required: true,
      default: () => {},
      edit: 'json',
      label: '图表的spec配置',
      description: 'vchart图表的spec配置',
      isExpression: false,
      isI18n: false,
    },
    options: {
      type: Object,
      required: true,
      default: () => {},
      edit: 'json',
      label: '图表配置',
      description: 'vchart 图表配置',
      isExpression: false,
      isI18n: false,
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
    // 覆盖 baseWidgetDefinition.propsDefinition.events 里的定义
    vChartEvents: {
      type: Array,
      required: false,
      default: () => [],
      edit: 'input-events',
      label: '事件',
      description: '事件',
    },
  },
  methodsDefinition: {
    supports: [
      ...baseDefinitions.baseWidgetDefinition.methodsDefinition.supports,
      {
        name: 'execMethod',
        args: [],
      },
      {
        name: 'readAttribute',
        args: [],
      },
      {
        name: 'getInstance',
        args: [],
      },
    ],
  },
  eventsDefinition: {
    supports: [
      ...baseDefinitions.baseWidgetDefinition.methodsDefinition.supports,
    ],
  },
};
