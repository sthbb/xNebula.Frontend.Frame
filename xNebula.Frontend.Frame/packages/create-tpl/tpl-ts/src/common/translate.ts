import { Exposed } from '@xnebula/frame';
import { plgName } from './plgName';

const { t } = Exposed.i18n();

export const $t = (...args: any) => {
  return t(plgName, ...args);
};
