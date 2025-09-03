/*
 * @Author: Huangjs
 * @Date: 2024-02-22 17:15:02
 * @LastEditors: Huangjs
 * @LastEditTime: 2024-07-16 13:34:26
 * @Description: ******
 */

export enum Bool {
  yes = 'Yes',
  no = 'No',
}

export enum Tpl {
  js = 'js',
  ts = 'ts',
}

export enum Npm {
  npm = 'npm',
  yarn = 'yarn',
  pnpm = 'pnpm',
}

export type Option = {
  name: string;
  tpl: Tpl;
  npm: Npm;
  lcp: Bool;
};

export type SelectOptions<T> = {
  label: T;
  value: T;
}[];

export type Copy = {
  source: string;
  target: string;
  registry: string;
  name: string;
  npm: Npm;
  useLCP: boolean;
  version: string;
};
