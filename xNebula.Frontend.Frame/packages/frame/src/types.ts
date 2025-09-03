/*
 * @Author: Huangjs
 * @Date: 2024-02-22 17:15:02
 * @LastEditors: Huangjs
 * @LastEditTime: 2024-07-23 17:18:11
 * @Description: ******
 */
import type { Component, App } from 'vue';
import type { vueI18n } from '@xnebula/commons';

export type AssetPath = { js?: string; css?: string };
export type AssetSetup = () => Promise<(app?: App) => void>;
export type AssetCommonParams = {
  vueApp: App;
  setI18nMessages: (
    messages: Record<vueI18n.Locale, Record<string, any>>,
    plgName?: string,
  ) => void;
};
export type AssetCommon = {
  (params: AssetCommonParams): void | Promise<void>;
  isExecuted?: boolean;
};
export type AssetFunComp = (app?: App) => Component | Promise<Component>;
export type Plugins = Record<
  string,
  AssetPath | AssetSetup | AssetCommon | (AssetFunComp | Component)
>;

export type Config = {
  title?: string;
  favUrl?: string;
  mtitle?: string;
  version?: string;
  logoUrl?: string;
  docUrl?: string;
  loginBg?: string;
  portalBg?: string;
  isSso?: boolean;
  isPortal?: boolean;
  useLCP?: boolean;
  hasBigscreen?: boolean;
  portalUrl?: string;
  cdnUrl?: string;
  hidePortal?: boolean;
  pwdConf?: {
    size: number;
    strength: string[];
  } | null;
  minioUrl?: string;
  signalrUrl?: string;
  appKey?: string;
};
