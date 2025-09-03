/*
 * @Author: Huangjs
 * @Date: 2024-02-01 16:44:50
 * @LastEditors: Huangjs
 * @LastEditTime: 2024-02-06 11:23:00
 * @Description: ******
 */

export type Org = {
  id: string;
  label: string;
  icon?: string;
  disabled?: boolean;
  children?: Org[];
  data?: any;
};
export type User = {
  id: string;
  name: string;
  code?: string;
  account?: string;
  orgNames?: string[];
  data?: any;
};
export type Params = {
  pageIndex: number;
  pageSize: number;
  keyword: string;
  currentOrg: Org | null;
};
export type TotalUser = {
  data: User[];
  total: number;
};
export type Props = {
  isMultiple?: boolean;
  selectedUser?: User[];
  requestOrg: () => Promise<Org[]>;
  requestUser: (params: Params) => Promise<TotalUser>;
};
export type Emits = {
  (type: 'confirm', data: User[]): void;
  (type: 'cancel'): void;
};

export type Slots = {
  action(): any;
};
