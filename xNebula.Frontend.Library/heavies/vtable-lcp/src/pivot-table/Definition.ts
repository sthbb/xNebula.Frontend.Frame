import type { PropType, CSSProperties } from 'vue';
import {
  baseDefinitions,
  type ApiSchemaType,
  type ActionsObjectSchemaType,
  type IWidgetDefinition,
} from '@lcp/xrenderer';
import { PivotTableEventTypes, type PivotTableOptions } from '@xnebula/vtable';

type Events = Partial<
  Record<keyof typeof PivotTableEventTypes, ActionsObjectSchemaType>
>;

export const Definition: IWidgetDefinition = {
  name: 'XVPivotTable',
  label: 'XVPivotTable',
  description: 'XVPivotTable表格组件',
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
    options: {
      type: [Object, String] as PropType<PivotTableOptions | string>,
      required: false,
      default: () => {},
      // Object 类型使 json 编辑器直接配置,String 类型使用 javascript 编辑定义 iife 函数，返回配置
      edit: 'json | javascript',
      label: '参数配置',
      description: '表格参数配置',
      isExpression: true,
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
    events: {
      type: Object as PropType<Events>,
      required: false,
      default: () => {},
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
    ],
  },
  eventsDefinition: {
    supports: [
      ...baseDefinitions.baseWidgetDefinition.methodsDefinition.supports,
      // 设计器是否可以提供输入事件名称，然后配置该事件的 actions
      // 渲染器 registerCommon 内部组装事件 actions 应该遍历 props.events 的 key，而不是遍历这个列表
      ...Object.keys(PivotTableEventTypes).map((key) => ({
        name: key,
        label: key,
        description: `${key}事件`,
      })),
    ],
  },
};
