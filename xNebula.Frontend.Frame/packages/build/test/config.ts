/*
 * @Author: Huangjs
 * @Date: 2024-07-04 17:28:45
 * @LastEditors: Huangjs
 * @LastEditTime: 2024-07-24 13:54:20
 * @Description: ******
 */
import path from 'node:path';

export default {
  root: path.resolve(__dirname),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './test'),
    },
  },
  entry: {
    pluginName: 'Test',
    pagesDir: './test/src/pages/',
    setupFile: './test/src/setup',
    localeFile: './test/src/locales/',
  },
  server: {
    proxyServer: 'http://192.168.1.83:8333/',
    host: true,
    prot: 8989,
    // open: './index.html',
    proxy: {
      '/OK': {
        target: 'http://192.168.1.83:8333/',
        changeOrigin: true,
      },
    },
    proxyData: {
      '/api/frame/parameters/values': { a: 1 },
      '/api/frame/pppppppp': { b: 2 },
    },
  },
  build: {
    minify: false,
    outDir: './test/dist',
    rollupOptions: {
      external: ['echarts'],
      output: {
        globals: {
          echarts: 'echarts',
        },
      },
    },
  },
};
