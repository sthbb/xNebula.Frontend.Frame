/*
 * @Author: Huangjs
 * @Date: 2024-02-22 17:15:02
 * @LastEditors: Huangjs
 * @LastEditTime: 2024-03-06 11:54:58
 * @Description: ******
 */

import { ref } from 'vue';

const color2Array = (color: string) => {
  if (color && typeof color === 'string') {
    const lowColor = color.toLocaleLowerCase().trim();
    // 16进制
    if (lowColor.indexOf('#') === 0) {
      const ncolor = lowColor.split('');
      if (ncolor.length === 4) {
        return [
          parseInt(`${ncolor[1]}${ncolor[1]}`, 16),
          parseInt(`${ncolor[2]}${ncolor[2]}`, 16),
          parseInt(`${ncolor[3]}${ncolor[3]}`, 16),
          255,
        ];
      }
      if (ncolor.length === 5) {
        return [
          parseInt(`${ncolor[1]}${ncolor[1]}`, 16),
          parseInt(`${ncolor[2]}${ncolor[2]}`, 16),
          parseInt(`${ncolor[3]}${ncolor[3]}`, 16),
          parseInt(`${ncolor[4]}${ncolor[4]}`, 16),
        ];
      }
      if (ncolor.length === 7) {
        return [
          parseInt(`${ncolor[1]}${ncolor[2]}`, 16),
          parseInt(`${ncolor[3]}${ncolor[4]}`, 16),
          parseInt(`${ncolor[5]}${ncolor[6]}`, 16),
          255,
        ];
      }
      if (ncolor.length === 9) {
        return [
          parseInt(`${ncolor[1]}${ncolor[2]}`, 16),
          parseInt(`${ncolor[3]}${ncolor[4]}`, 16),
          parseInt(`${ncolor[5]}${ncolor[6]}`, 16),
          parseInt(`${ncolor[7]}${ncolor[8]}`, 16),
        ];
      }
    }
    if (lowColor.indexOf('rgb') !== -1) {
      const ta = lowColor
        .replace(/rgba?\((.+)\)/, (_, b) => b)
        .split(',')
        .map((v) => +v);

      return ta.length === 4 ? ta : [...ta, 255];
    }
  }
  return [0, 0, 0, 0];
};

const colorMixin = (c1: string, c2: string, ratio: number) => {
  ratio = Math.max(Math.min(Number(ratio), 1), 0);
  const [r1, g1, b1] = color2Array(c1);
  const [r2, g2, b2] = color2Array(c2);
  const r0 = Math.round(r2 * (1 - ratio) + r1 * ratio);
  const g0 = Math.round(g2 * (1 - ratio) + g1 * ratio);
  const b0 = Math.round(b2 * (1 - ratio) + b1 * ratio);
  const r = `0${(r0 || 0).toString(16)}`.slice(-2);
  const g = `0${(g0 || 0).toString(16)}`.slice(-2);
  const b = `0${(b0 || 0).toString(16)}`.slice(-2);
  return `#${r}${g}${b}`;
};
//设置主题混入颜色
const themeMixins = (dom: HTMLElement) => {
  const pre = '--el-color';
  const types = ['primary', 'success', 'warning', 'danger', 'error', 'info'];
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  const _color = getComputedStyle(dom).getPropertyValue('--el-bg-color');
  types.forEach((type) => {
    const color = getComputedStyle(dom).getPropertyValue(`${pre}-${type}`);
    numbers.forEach((number) => {
      const a = colorMixin(_color, color, number / 10);
      dom.style.setProperty(`${pre}-${type}-light-${number}`, a);
    });
    dom.style.setProperty(
      `${pre}-${type}-dark-2`,
      colorMixin('#FFFFFF', color, 0.2),
    );
  });
};

const themeKeys = {
  fontSize: '--theme-font-size',
  titleColor: '--theme-title-size',
  tagViewHeight: '--theme-tag-view-height',
  tagViewColor: '--theme-tag-view-color',
  tagViewBgColor: '--theme-tag-view-bg-color',
  tagViewActiveColor: '--theme-tag-view-active-color',
  tagViewActiveBgColor: '--theme-tag-view-active-bg-color',
  headerHeight: '--theme-header-height',
  headerColor: '--theme-header-color',
  headerBgColor: '--theme-header-bg-color',
  headerBgImage: '--theme-header-bg-image',
  sidebarBgColor: '--theme-siderbar-bg-color',
  sidebarBgImage: '--theme-siderbar-bg-image',
  menuOpenedBgColor: '--x-menu-opened-bg-color',
  menuItemColor: '--x-menu-item-color',
  menuItemHoverColor: '--x-menu-item-hover-color',
  menuItemHoverBgColor: '--x-menu-item-hover-bg-color',
  menuItemActiveColor: '--x-menu-item-active-color',
  menuItemActiveBgColor: '--x-menu-item-active-bg-color',
  menuItemFavoriteColor: '--x-menu-item-favorite-color',
  menuItemAllColor: '--x-menu-item-all-color',
  menuItemHeight: '--x-menu-item-height',
  menuWidth: '--x-menu-width',
  themeBgLayout: '--theme-bg-layout',
  themeTwoColumns: '--theme-two-columns',
  themePrimary: '--el-color-primary',
  themeSuccess: '--el-color-success',
  themeInfo: '--el-color-info',
  themeWarn: '--el-color-warning',
  themeDanger: '--el-color-danger',
  themeColor: '--el-text-color-regular',
  themeBorder: '--el-border-color',
  themeBgLight: '--el-fill-color-blank',
  themeBgLighter: '--el-fill-color-light',
  themeFormColor: '--theme-form-color',
  themeTableHeaderBg: '--theme-table-header-bg',
  themeTableHeaderColor: '--theme-table-header-color',
  themeTableBodyBg: '--theme-table-body-bg',
  tableHeadRowPadding: '--table-head-row-padding',
  tableBodyRowPadding: '--table-body-row-padding',
  tableHeadColumnPadding: '--table-head-column-padding',
  tableBodyColumnPadding: '--table-body-column-padding',
};

const themeStyles = {
  xnebula: {
    fontSize: '15px',
    titleColor: '#ffffff',
    tagViewHeight: '2.5rem',
    tagViewColor: '#86909c',
    tagViewBgColor: '#f4f4f4',
    tagViewActiveColor: '#ffffff',
    tagViewActiveBgColor: '#169ce3',
    headerHeight: '3rem',
    headerColor: '#86909c',
    headerBgColor: '#ffffff',
    headerBgImage: '',
    sidebarBgColor: '#1b294e',
    sidebarBgImage: '',
    menuWidth: '12.5rem',
    menuOpenedBgColor: '#0f1b3f',
    menuItemColor: '#d3ecf9',
    menuItemHoverColor: '#ffffff',
    menuItemHoverBgColor: '#31466a',
    menuItemActiveColor: '#ffffff',
    menuItemActiveBgColor: '#1661ab',
    menuItemFavoriteColor: '#ffa100',
    menuItemAllColor: '#51c4d3',
    menuItemHeight: '2.25rem',
    themeTwoColumns: '12px',
    themeBgLayout: '#ffffff',
    themePrimary: '#169ce3',
    themeSuccess: '#67c32a',
    themeInfo: '#909399',
    themeWarn: '#e6a23c',
    themeDanger: '#f56c6c',
    themeColor: '#202023',
    themeBorder: '#c9cdd4',
    themeBgLight: '#ffffff',
    themeBgLighter: '#f5f7fa',
    themeFormColor: '#4E5969',
    themeTableHeaderBg: '#34495E',
    themeTableHeaderColor: '#ffffff',
    themeTableBodyBg: '#ffffff',
    tableHeadRowPadding: '6px',
    tableBodyRowPadding: '6px',
    tableHeadColumnPadding: '8px',
    tableBodyColumnPadding: '8px',
  },
  test: {
    fontSize: '20px',
    titleColor: '#ffffff',
    headerColor: '#EF0303',
    headerBgColor: '#ffffff',
    headerBgImage: 'industry-green-headerBgImage.png',
    sidebarBgColor: '#6EEB0E',
    sidebarBgImage: '',
    menuWidth: '14rem',
    menuOpenedBgColor: '#0C33A7',
    menuItemColor: '#39AAE6',
    menuItemHoverColor: '#E77F7F',
    menuItemHoverBgColor: '#BAAA35',
    menuItemActiveColor: '#D75B1C',
    menuItemActiveBgColor: '#1582ED',
    menuItemFavoriteColor: '#ED9E17',
    menuItemAllColor: '#51c4d3',
    themeTwoColumns: '12px',
    menuItemHeight: '2.25rem',
    themeBgLayout: '#1879AA',
    themePrimary: '#05780E',
    themeSuccess: '#67c32a',
    themeInfo: '#DCA605',
    themeWarn: '#e6a23c',
    themeDanger: '#210202',
    themeColor: '#D27021',
    themeBorder: '#D62D27',
    themeBgLight: '#21969A',
    themeBgLighter: '#681F7A',
    themeFormColor: '#A2BFE8',
    themeTableHeaderBg: '#67B007',
    themeTableHeaderColor: '#042588',
    themeTableBodyBg: '#13A298',
    tableHeadRowPadding: '16px',
    tableBodyRowPadding: '16px',
    tableHeadColumnPadding: '18px',
    tableBodyColumnPadding: '18px',
    headerHeight: '3.3rem',
    tagViewColor: '#1D6DCD',
    tagViewBgColor: '#6A3434',
    tagViewActiveColor: '#DA9797',
    tagViewActiveBgColor: '#084769',
    tagViewHeight: '2.9rem',
  },
};

export type ThemeKey = keyof typeof themeKeys;
export type ThemeStyle = keyof typeof themeStyles;
export type ThemeValues = (typeof themeStyles)[keyof typeof themeStyles];

let defaultStyle: ThemeStyle = 'xnebula';
let defaultValues: ThemeValues = themeStyles[defaultStyle];
let themeImages:
  | {
      name: string;
      url: string;
    }[]
  | null = null;

const themeStyle = ref<ThemeStyle>(defaultStyle);
const themeValues = ref<ThemeValues>({
  ...defaultValues,
});

const loadThemeImage = (file?: string) => {
  if (!themeImages) {
    const metaGlob = import.meta.glob('@@/assets/theme/*.*', {
      eager: true,
    }) as Record<string, { default: string }>;
    themeImages = Object.keys(metaGlob).map((key) => ({
      name: key.substring(key.lastIndexOf('/') + 1),
      url: metaGlob[key].default,
    }));
  }
  if (typeof file === 'undefined') {
    return themeImages;
  }
  const find = themeImages.find(({ name }) => name === file);
  if (!find) {
    return [{ url: '', name: '' }];
  }
  return [find];
};
const setTheme = (prefix: string, element?: HTMLElement) => {
  const el = element || document.documentElement;
  Object.keys(themeKeys).forEach((key) => {
    const tkey = key as ThemeKey;
    el.style.setProperty(
      themeKeys[tkey],
      key.indexOf('Image') !== -1
        ? `url(${loadThemeImage(themeValues.value[tkey])[0].url})`
        : themeValues.value[tkey] || 'transparent',
    );
  });
  themeMixins(el);
  el.classList.add(
    ...[...el.classList].filter((v) => !v.match(/theme/)),
    `${prefix}theme${!element ? '-' : '-inner-'}${themeStyle.value}`,
  );
};
const resetTheme = (key?: ThemeKey) => {
  if (!key) {
    themeStyle.value = defaultStyle;
    themeValues.value = {
      ...defaultValues,
    };
    return;
  }
  if (themeStyle.value === defaultStyle) {
    themeValues.value = {
      ...themeValues.value,
      [key]: defaultValues[key],
    };
  } else {
    themeValues.value = {
      ...themeValues.value,
      [key]: themeStyles[themeStyle.value][key],
    };
  }
};
const setDefaultTheme = (style: ThemeStyle, values: ThemeValues) => {
  defaultStyle = style;
  defaultValues = { ...values };
};

export {
  themeStyles,
  themeStyle,
  themeValues,
  setTheme,
  setDefaultTheme,
  resetTheme,
  loadThemeImage,
};
