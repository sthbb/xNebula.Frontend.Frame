/*
 * @Author: Huangjs
 * @Date: 2024-02-22 17:15:02
 * @LastEditors: Huangjs
 * @LastEditTime: 2024-03-06 11:54:58
 * @Description: ******
 */

import { ref, readonly } from 'vue';

const collapse = ref(false);

export const setCollapse = (value: boolean) => {
  collapse.value = value;
};
export const toggleCollapse = () => {
  collapse.value = !collapse.value;
};

export const isCollapse = readonly(collapse);
