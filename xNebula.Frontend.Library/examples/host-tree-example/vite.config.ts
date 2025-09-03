/*
 * @Author: Huangjs
 * @Date: 2024-01-31 17:57:52
 * @LastEditors: Huangjs
 * @LastEditTime: 2024-02-06 16:43:48
 * @Description: ******
 */
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    host: true,
    port: 2877,
  },
});
