/*
 * @Author: Huangjs
 * @Date: 2024-03-11 13:27:22
 * @LastEditors: Huangjs
 * @LastEditTime: 2024-03-12 15:41:31
 * @Description: ******
 */
import type { Component, DefineComponent } from 'vue';
import XElTable from './el-table';

let XTable: Component = XElTable;

export const register = (component: Component | DefineComponent) => {
  XTable = component || XElTable;
};

export const component = (): Component | DefineComponent => {
  if (!XTable) {
    throw new Error('no register a valid component.');
  }
  return XTable;
};
