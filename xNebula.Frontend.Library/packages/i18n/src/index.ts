/*
 * @Author: Huangjs
 * @Date: 2024-03-06 16:31:37
 * @LastEditors: Huangjs
 * @LastEditTime: 2024-03-20 15:03:39
 * @Description: ******
 */
import type { App } from 'vue';
import * as vueI18n from 'vue-i18n';

type LocaleMessage<Message = string> = Record<
  string,
  vueI18n.LocaleMessageValue<Message>
>;

export function createI18n(
  options: vueI18n.I18nOptions = {},
  app?: App,
): vueI18n.I18n<
  {
    [x: string]: LocaleMessage<vueI18n.VueMessageType>;
  },
  {},
  {},
  string,
  false
> {
  // 使用 i18n 的 组合式 API
  const i18n = vueI18n.createI18n({
    fallbackLocale: '',
    locale: '',
    messages: {},
    ...options,
    legacy: false,
    allowComposition: true,
  });
  if (app) {
    app.use(i18n);
  }
  return i18n;
}

export function useI18n(options?: vueI18n.UseI18nOptions): vueI18n.Composer<
  {
    [x: string]: LocaleMessage<vueI18n.VueMessageType>;
  },
  {
    [x: string]: vueI18n.IntlDateTimeFormat;
  },
  {
    [x: string]: vueI18n.IntlNumberFormat;
  },
  string,
  string,
  string
> {
  return vueI18n.useI18n(options);
}

export { vueI18n };

export const version = __VERSION__;
