/*
 * @Author: Huangjs
 * @Date: 2022-10-25 09:37:24
 * @LastEditors: Huangjs
 * @LastEditTime: 2024-07-24 09:08:44
 * @Description: ******
 */
import { getCurrentInstance, readonly, type Ref, type App } from 'vue';
import {
  createI18n as _createI18n,
  useI18n,
  type vueI18n,
} from '@xnebula/commons';
import { storage } from '@xnebula/utils';
import { getLocaleList, getServerMessages, saveLocale } from '@@/api';
import { authority } from '@@/store';
import { warn, ACCESS_USER } from '@@/utils';

// i18n 被很多地方引用包括 router，所以 i18n 里如果再加入依赖注意不要循环引用

function transform(oo: Record<string, any>) {
  const locales: Record<string, Record<string, string>> = {};
  Object.keys(oo).forEach((key) => {
    locales[key.replace(/_/g, '-')] = ((obj: Record<string, string>) => {
      const result: Record<string, any> = {};
      Object.keys(obj).forEach((ckey) => {
        const val = obj[ckey];
        const isfun =
          val.match(/^function\s.+\(.*\)/) || val.match(/^\(.*\)(\s*)=>/);
        ckey
          .split('.')
          .reduce(
            (o, n, i, a) =>
              (o[n] =
                i === a.length - 1
                  ? isfun
                    ? new Function('return ' + val)
                    : val
                  : o[n] || {}),
            result,
          );
      });
      return result;
    })(oo[key]);
  });
  return locales;
}

function union(oa: Record<string, any>, ob: Record<string, any>) {
  const oo: Record<string, any> = {};
  Object.keys(oa).forEach((key) => {
    if (
      typeof ob[key] === 'string' ||
      typeof ob[key] === 'function' ||
      typeof ob[key] === 'number'
    ) {
      oo[key] = ob[key];
    } else if (
      ob[key] &&
      !Array.isArray(ob[key]) &&
      typeof ob[key] === 'object'
    ) {
      oo[key] = union(oa[key], ob[key]);
    } else {
      oo[key] = oa[key];
    }
  });
  Object.keys(ob).forEach((key) => {
    if (typeof oo[key] === 'undefined') {
      if (
        typeof ob[key] === 'string' ||
        typeof ob[key] === 'function' ||
        typeof ob[key] === 'number'
      ) {
        oo[key] = ob[key];
      } else if (
        ob[key] &&
        !Array.isArray(ob[key]) &&
        typeof ob[key] === 'object'
      ) {
        oo[key] = union({}, ob[key]);
      }
    }
  });
  return oo;
}

export type I18nMessages = Record<vueI18n.Locale, Record<string, any>>;
export type I18nLocaleOption = { label?: string; value?: vueI18n.Locale };
export type I18nSwitchLocale = (locale: vueI18n.Locale) => Promise<void>;
export type I18nGlobalComposer = Omit<
  ReturnType<typeof getComposer>,
  't' | 'locale'
> & {
  locale: Ref<vueI18n.Locale>;
  t: (...args: any) => string;
  updateServerMessages: (init?: boolean) => Promise<void>;
  mergeLocaleMessages: (messages: I18nMessages, plgName?: string) => void;
  localeList: I18nLocaleOption[];
  switchLocale: I18nSwitchLocale;
};
let _i18n: ReturnType<typeof _createI18n> | null = null;
let _switchLocale: I18nSwitchLocale = () => Promise.resolve();
let _localeList: I18nLocaleOption[] = [];
let _serverMessages: I18nMessages = {};
let _updateServerMessages: (init?: boolean) => Promise<void> = () =>
  Promise.resolve();

const getComposer = () => {
  if (!_i18n) {
    throw new Error('No run createI18n()');
  }
  return getCurrentInstance() ? useI18n() : _i18n.global;
};

const priorServerMessages = () => {
  const composer = getComposer();
  const messages = composer.messages as Ref<
    Record<vueI18n.Locale, Record<string, any>>
  >;
  // 循环更新, 将服务器获取的多语言始终覆盖本地文件内的多语言
  Object.keys(messages.value).forEach((locale) => {
    composer.setLocaleMessage(
      locale,
      union(messages.value[locale], _serverMessages[locale] || {}),
    );
  });
};

export async function createI18n() {
  _localeList = await getLocaleList();
  const defaultLocale =
    (
      _localeList.find(({ value }) => value === navigator.language) ||
      _localeList[0]
    )?.value || '';
  const t = (_i18n = _createI18n({
    missing: warn,
    fallbackLocale: defaultLocale,
    locale: defaultLocale,
  }));
  _switchLocale = async (_locale: vueI18n.Locale) => {
    const composer = getComposer();
    if (_locale !== composer.locale.value) {
      composer.locale.value = _locale;
      const token = await authority.getToken();
      if (token) {
        // 更新服务器存储的语言
        await saveLocale(_locale);
        // 更新 LocalStorage 存储的语言
        storage.set(`${ACCESS_USER}.lang`, _locale);
        storage.set(`${ACCESS_USER}.tokenClaim.lang`, _locale);
        // 更新缓存内存储的语言（调用该方法有点得不偿失）
        if (authority.auth.value.ready) {
          await authority.fetchAuth(token);
        }
      }
    }
  };
  _updateServerMessages = async (init) => {
    const result = await getServerMessages();
    _serverMessages = result ? transform(result) : {};
    if (init) {
      const composer = getComposer();
      Object.keys(_serverMessages).forEach((locale) => {
        composer.setLocaleMessage(
          locale,
          union({}, _serverMessages[locale] || {}),
        );
      });
    } else {
      priorServerMessages();
    }
  };
  await _updateServerMessages(true);
  return (vueApp: App) => {
    vueApp.use(t);
  };
}
export function i18n() {
  const composer = getComposer();
  return {
    ...composer,
    locale: readonly(composer.locale),
    mergeLocaleMessages: (messages: I18nMessages, plgName?: string) => {
      // 将插件多语言合进来
      Object.keys(messages).forEach((locale) => {
        if (_localeList.find(({ value }) => value === locale)) {
          const _messages = {
            ...(messages[locale] || {}),
          };
          composer.mergeLocaleMessage(
            locale,
            plgName
              ? {
                  [plgName]: _messages,
                }
              : _messages,
          );
        }
      });
      priorServerMessages();
    },
    t: function translate(this: any, ...args: any) {
      const [plgName, key, ...restArgs] = args;
      if (
        plgName &&
        typeof plgName === 'string' &&
        ((key && typeof key === 'string') || typeof key === 'number')
      ) {
        const result = composer.t.apply(this, [
          `${plgName}.${key}`,
          ...restArgs,
        ] as any);
        // 当前没有翻译成功, 去掉 plgName
        return result.startsWith(`${plgName}.`)
          ? result.split('.').slice(1).join('.')
          : result;
      }
      if (typeof key === 'string' || typeof key === 'number') {
        return composer.t.apply(this, [key, ...restArgs] as any);
      }
      return !key ? '' : String(key);
    },
    updateServerMessages: _updateServerMessages,
    switchLocale: _switchLocale,
    localeList: _localeList,
  } as I18nGlobalComposer;
}
