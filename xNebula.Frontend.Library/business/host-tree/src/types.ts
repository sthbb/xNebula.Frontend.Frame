/*
 * @Author: Huangjs
 * @Date: 2024-02-01 16:44:50
 * @LastEditors: Huangjs
 * @LastEditTime: 2024-02-28 15:36:32
 * @Description: ******
 */
import type { ElementPlusTypes } from '@xnebula/components';

export type TreeData = {
  id: ElementPlusTypes.TreeType.TreeKey; // data.Id
  parent?: TreeData; // 父节点数据，方便取用父数据
  label?: string; // data.Name||'未分组'
  fixed?: boolean; // 是否是固定的，就是id为0的默认未分组的组，编辑状态的情况下用到，不编辑的可以不提供
  sublabel?: string; // MonitKind.getText(data.Kind)，三级结构的用到
  host?: boolean; //data.Kind === 'host' ? data.IP : ''，二级结构的用到
  online?: boolean; // +child.Status === 1，二级结构的用到
  icon?: string; // data.OS == '1' ? 'fa fa-linux' : 'fa fa-windows'，二级结构的用到
  leaf?: boolean; // 是否叶子节点，懒加载判断是否有子节点
  editInput?: boolean; // 当前节点是否是编辑框，编辑状态的情况下用到，内部使用
  disabled?: boolean; // 禁用当前节点，有checkbox（多选）的时候用到，内部会自动用，可以提供覆盖
  class?: string; // 节点类名，内部自动用到，也可以提供覆盖
  data?: any; // 转换前的原始数据
} & ElementPlusTypes.TreeType.TreeNodeData;
export type MoveType =
  | 'groupBefore'
  | 'hostBefore'
  | 'groupAfter'
  | 'hostAfter'
  | 'hostToGroup'
  | '';
export type Props = {
  isEditable?: boolean;
  isMultiple?: boolean;
  height?: number | string;
  getNodeData: (level: number, parent: TreeData) => Promise<TreeData[]>;
  moveNode?: (
    type: MoveType,
    data0: TreeData,
    data: TreeData,
  ) => Promise<boolean | 'forceUpdate'>;
  delNode?: (data: TreeData) => Promise<boolean | 'forceUpdate'>;
  saveNode?: (data: TreeData) => Promise<TreeData | 'forceUpdate'>;
};
export type Expose = {
  updateNode: (data: TreeData[]) => void;
  setCheckeds: (data: TreeData[]) => void;
  getCheckeds: () => TreeData[];
  getData: (key?: ElementPlusTypes.TreeType.TreeKey) => TreeData[];
};
export type Emits = {
  (type: 'selectNode', data: TreeData): void;
};
