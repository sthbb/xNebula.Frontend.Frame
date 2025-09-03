/*
 * @Author: Huangjs
 * @Date: 2024-01-31 17:44:51
 * @LastEditors: Huangjs
 * @LastEditTime: 2024-02-06 15:04:32
 * @Description: ******
 */
import type { App, Plugin } from 'vue';
import UserSelect from './user-select.vue';

import type {
  User,
  Org,
  TotalUser,
  Params,
  Props,
  Emits,
  Slots,
} from './types';
export type { User, Org, TotalUser };
export type RequestUserParams = Params;
export type UserSelectProps = Props;
export type UserSelectEmits = Emits;
export type UserSelectSlots = Slots;
export type UserSelectInstance = InstanceType<typeof UserSelect>;

UserSelect.install = (app: App): void => {
  app.component(UserSelect.name || 'UserSelect', UserSelect);
};

export default UserSelect as typeof UserSelect & Plugin;
