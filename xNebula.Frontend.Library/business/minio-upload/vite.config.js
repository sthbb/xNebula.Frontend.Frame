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
  server: {
    host: true,
    proxy: {
      '/api': {
        // target: "http://localhost:5000",
        // target: 'http://10.1.12.91:5000',
        // target: 'http://10.1.33.163:5000',
        target: 'http://10.1.20.82:8009',
        // target: "http://192.168.1.164:8111",
        changeOrigin: true,
      },
    },
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, './src/components/index.js'),
    },
    sourcemap: true, // 输出.map文件
    rollupOptions: {
      external: ['vue', '@element-plus/icons-vue', 'element-plus'],
      output: [
        {
          format: 'esm',
          dir: './es',
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
