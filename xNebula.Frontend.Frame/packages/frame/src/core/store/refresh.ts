/*
 * @Author: Huangjs
 * @Date: 2024-02-22 17:15:02
 * @LastEditors: Huangjs
 * @LastEditTime: 2024-03-06 11:54:58
 * @Description: ******
 */

import { ref, readonly } from 'vue';

const refresh = ref(false);

export const setRefresh = (value: boolean) => {
  refresh.value = value;
};

export const isRefresh = readonly(refresh);
