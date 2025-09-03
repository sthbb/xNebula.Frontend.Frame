/*
 * @Author: Huangjs
 * @Date: 2024-03-11 13:21:17
 * @LastEditors: Huangjs
 * @LastEditTime: 2024-03-20 17:56:03
 * @Description: ******
 */
import { PivotTable, TYPES } from '@visactor/vtable';
import type { Attribute, Method } from '@xnebula/utils';

// table 事件
export type EventType = keyof typeof PivotTable.EVENT_TYPE;
export type EventHandler<P extends EventType> = TYPES.TableEventListener<
  (typeof PivotTable.EVENT_TYPE)[P]
>;
export type EventTypeVCHART = `VCHART-${string}`;
export type EventHandlerVCHART<Q = any> =
  | TYPES.AnyFunction
  | {
      query?: Q;
      handler?: TYPES.AnyFunction;
    };
export type Events = {
  [P in EventType]?: EventHandler<P>;
} & {
  [P in EventTypeVCHART]?: EventHandlerVCHART;
};

// table 配置
export type Options = TYPES.PivotTableConstructorOptions;

// table 实例
export type Instance = InstanceType<typeof PivotTable>;

// options 里面可以传入 records，
// 单独配置是为了把数据和配置分开，
// 另外，options 里面如果传 container 则不会使用
// events 没有使用 vue emit 传入而是作为 props 传入
export type Props<D = any> = {
  records?: D[];
  options?: Options;
  events?: Events;
};

// 对外暴露方法，TYPES.PivotTableAPI 没有 Instance 全面
export type Expose = {
  execMethod: Method<Instance>; // Method<TYPES.PivotTableAPI>;
  readAttribute: Attribute<Instance>; // Attribute<TYPES.PivotTableAPI>;
  getInstance: () => Instance | undefined;
  getElement: () => HTMLElement | undefined;
};
