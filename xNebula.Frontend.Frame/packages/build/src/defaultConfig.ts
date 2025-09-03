/*
 * @Author: Huangjs
 * @Date: 2024-01-31 17:57:52
 * @LastEditors: Huangjs
 * @LastEditTime: 2024-07-24 13:24:52
 * @Description: ******
 */
import proxyData from './proxyData';
import type { ResolvedConfig } from './types';

const defaultConfig: ResolvedConfig = {
  entry: {
    setupFile: './src/setup',
    pagesDir: './src/pages/',
    include: [],
    exclude: [],
    localeFile: './src/locales/',
  },
  server: {
    proxyData,
  },
  build: {
    outDir: './dist',
    lib: {
      entry: '',
      fileName: () => 'index.umd.js',
    },
    rollupOptions: {
      output: {
        assetFileNames: () => 'index.css',
      },
    },
  },
};

export const fixedGlobals: Record<string, string> = {
  '@lcp/xcommon': 'XCommon',
  '@lcp/xcomponents': 'XComponents',
  '@lcp/xrenderer': 'XRenderer',
  '@lcp/xwidgets': 'XWidgets',
  '@xnebula/commons': 'xNebula.Commons',
  '@xnebula/components': 'xNebula.Components',
  '@xnebula/frame': 'xNebula.FrameCore',
  '@xnebula/utils': 'xNebula.Utils',
  echarts: 'Echarts',
  'monaco-editor': 'MonacoEditor',
  vue: 'Vue',
};
export const fixedExternal = [
  '@lcp/xcommon',
  '@lcp/xcomponents',
  '@lcp/xrenderer',
  '@lcp/xwidgets',
  '@xnebula/commons',
  '@xnebula/components',
  '@xnebula/frame',
  '@xnebula/utils',
  'echarts',
  'monaco-editor',
  'vue',
];

export default defaultConfig;
