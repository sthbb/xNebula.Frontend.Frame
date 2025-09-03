/*
 * @Author: Huangjs
 * @Date: 2024-01-31 17:44:51
 * @LastEditors: Huangjs
 * @LastEditTime: 2024-02-20 10:35:05
 * @Description: ******
 */
import type { App, Plugin } from 'vue';
import HostTree from './host-tree.vue';

import type { MoveType, TreeData, Props, Emits, Expose } from './types';
import type { ElementPlusTypes } from '@xnebula/components';

export type HostTreeMoveType = MoveType;
export type HostTreeKey = ElementPlusTypes.TreeType.TreeKey;
export type HostTreeData = TreeData;
export type HostTreeProps = Props;
export type HostTreeEmits = Emits;
export type HostTreeExpose = Expose;
export type HostTreeInstance = InstanceType<typeof HostTree>;

HostTree.install = (app: App): void => {
  app.component(HostTree.name || 'HostTree', HostTree);
};

export default HostTree as typeof HostTree & Plugin;
