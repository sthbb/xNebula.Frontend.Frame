/*
 * @Author: Huangjs
 * @Date: 2024-02-22 17:15:02
 * @LastEditors: Huangjs
 * @LastEditTime: 2024-03-06 12:04:20
 * @Description: ******
 */
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import virtual from '@rollup/plugin-virtual';
import { modules, setImport, setExpose, setExport } from './modules';

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    // 开发模式是不需要 __PUBLIC_PATH__ 的，这里直接设置为根就可以
    __PUBLIC_PATH__: JSON.stringify('./'),
    // 开发模式设置插件资源请求代理前缀为 plugin
    __PLUGIN_PREFIX__: JSON.stringify('plugin/'),
  },
  plugins: [
    vue(),
    virtual({
      'virtual:inject-dependencies': `
        import * as core from '/src/core/index';
        ${modules.map((v, i) => setImport('dev', v, i)).join('\n')}
        ${setExport('dev')}
        export default async () => {
          // Frame 内部接口暴露到 FrameCore
          window.xNebula.FrameCore = { ...core };
          ${modules.map((v, i) => setExpose('dev', v, i)).join('\n')}
          return core._initialize;
        };
      `,
      'virtual:lazy-dependencies': `
        export default () => [];
      `,
    }),
  ],
  server: {
    host: true,
    port: 2250,
    proxy: {
      '/api': {
        target: 'http://10.1.20.82:8001/',
        // target: 'http://10.1.20.82:8005/',
        changeOrigin: true,
      },
      '/plugin': {
        target: 'http://10.1.20.82:8001/',
        // target: 'http://10.1.20.82:8005/',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/plugin/, ''),
      },
    },
  },
});
