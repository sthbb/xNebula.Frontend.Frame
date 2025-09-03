/*
 * @Author: Huangjs
 * @Date: 2024-01-31 17:57:52
 * @LastEditors: Huangjs
 * @LastEditTime: 2024-03-19 10:54:04
 * @Description: ******
 */
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  server: {
    host: true,
    port: 2256,
    // 打开 build 之后的产物进行测试，其实就是开启的服务器用 dist 下面的文件而不是开发环境生成的
    // open: './dist/index.html',
  },
});
