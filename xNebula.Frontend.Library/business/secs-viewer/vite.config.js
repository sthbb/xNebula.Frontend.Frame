import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, './src/index.js'),
    },
    sourcemap: true, // 输出.map文件
    rollupOptions: {
      external: ['vue'],
      output: [
        {
          format: 'esm',
          dir: './dist',
          entryFileNames: 'index.mjs',
          assetFileNames: (assetInfo) => {
            if (assetInfo.name === 'style.css') return 'index.css';
            return assetInfo.name;
          },
        },
      ],
    },
  },
});
