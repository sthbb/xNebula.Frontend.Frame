import { withInstall } from '@xnebula/utils';
import Chart from './chart.vue';
import type {
  ISpec,
  IInitOption,
  EventType,
  EventQuery,
  EventParams,
  Event,
  Props,
  Expose,
  Instance,
} from './types';

export const XVChart = withInstall(Chart);
export type {
  ISpec as VChartISpec,
  IInitOption as VChartIInitOption,
  EventType as VChartEventType,
  EventQuery as VChartEventQuery,
  EventParams as VChartEventParams,
  Event as VChartEvent,
  Props as VChartProps,
  Expose as VChartExpose,
  Instance as VChartInstance,
};
