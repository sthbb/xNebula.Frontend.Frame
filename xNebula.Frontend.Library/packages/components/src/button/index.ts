/*
 * @Author: Huangjs
 * @Date: 2024-03-11 13:27:22
 * @LastEditors: Huangjs
 * @LastEditTime: 2024-03-13 11:15:44
 * @Description: ******
 */
import { withInstall } from '@xnebula/utils';
import Button from './button.vue';

const XButton = withInstall(Button);

import type { Props, Emits, Slots, Expose } from './types';

export type {
  Props as XButtonProps,
  Emits as XButtonEmits,
  Slots as XButtonSlots,
  Expose as XButtonExpose,
};

export { XButton };

export default XButton;
