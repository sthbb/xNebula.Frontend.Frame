import { Exposed } from '@xnebula/frame';
import { plgName } from './plgName';

const { t } = Exposed.i18n();

export const $t = (...args) => {
  return t(plgName, ...args);
};
