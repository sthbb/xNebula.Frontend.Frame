import path from 'node:path';
import { defineConfig } from '@xnebula/build';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    // 这里提供一个代理服务器, 可以是已经部署好的服务, 也可以是本地服务
    proxyServer: 'http://localhost:5000/',
  },
  build: {
    // minify: false
  },
});
