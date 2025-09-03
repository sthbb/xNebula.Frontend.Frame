import type {
  ISpec,
  IInitOption,
  EventType,
  EventQuery,
  EventParams,
} from '@visactor/vchart';
import VChart from '@visactor/vchart';

// 事件相关
export type { ISpec, IInitOption, EventType, EventQuery, EventParams };
export type Event = {
  event: EventType;
  query?: EventQuery;
  callback: (params: EventParams) => void;
};
export type Events = Event[];

export type Props = {
  spec: ISpec;
  options: IInitOption;
  events?: Event[];
};

// vchart 实例
export type Instance = InstanceType<typeof VChart>;

// 对外暴露方法，一般用作对instance的操作
export type Expose = {
  execMethod: (method: string, args?: any[]) => any;
  readAttribute: (key: string) => any;
  getInstance: () => Instance | undefined;
};
