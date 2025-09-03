/*
 * @Author: Huangjs
 * @Date: 2024-01-31 17:57:52
 * @LastEditors: Huangjs
 * @LastEditTime: 2024-07-15 17:23:52
 * @Description: ******
 */
import process from 'node:process';
import fsPromises from 'node:fs/promises';
import path from 'node:path';
import { defineConfig, type UserConfig, type LibraryFormats } from 'vite';
import vue from '@vitejs/plugin-vue';
import dts from 'vite-plugin-dts';

const prefix = 'xNebula.';
const {
  PKG_ENV = 'packages',
  MOD_ENV = '',
  FORMAT_ENV = 'es,cjs,umd',
  CLEAR_ENV = '1',
} = process.env;

// 中线转换为首字母大写：axs-bxs-cxs => AxsBxsCxs
const upperCase = (f: string = '', type?: number): string => {
  return f
    .split('-')
    .map((a) => {
      const ak = a.split('');
      ak[0] = ak[0]?.toUpperCase();
      if (type === 1) {
        // @lcp 前两个字母大写
        ak[1] = ak[1]?.toUpperCase();
      } else if (type === 2) {
        // @xnebula 前面加一个前缀
        ak.unshift(prefix);
      }
      return ak.join('');
    })
    .join('');
};
const config = fsPromises
  .readFile(path.resolve(__dirname, `./${PKG_ENV}/${MOD_ENV}/package.json`), {
    encoding: 'utf-8',
  })
  .then((data) => JSON.parse(data.toString()))
  .then<UserConfig>((pkg) => ({
    define: {
      __VERSION__: JSON.stringify(pkg.version),
    },
    plugins: [
      vue(),
      dts({
        entryRoot: `./${PKG_ENV}/${MOD_ENV}/src/`,
        outDir: `./${PKG_ENV}/${MOD_ENV}/dist/`,
        tsconfigPath: './tsconfig.app.json',
        rollupTypes: true,
      }),
    ],
    build: {
      // minify: false,
      sourcemap: true, // 'inline'
      lib: {
        // 库打包入口文件
        entry: path.resolve(__dirname, `./${PKG_ENV}/${MOD_ENV}/src/index.ts`),
        // umd | iife(自执行函数) 模式下当前库暴露的变量挂到全局变量的名称
        name: `${prefix}${upperCase(MOD_ENV)}`,
        // 需要打包的格式，这里三种都需要
        formats: FORMAT_ENV.split(',') as LibraryFormats[],
        // 打包出来的文件名称
        fileName: (format, entryName) => {
          // 这个是 vite-plugin-dts 插件在 rollupTypes 为 true 时调用的情况，直接返回 dts 入口文件名称即可
          // 它会解析 vite-plugin-dts 配置的 outDir 里找入口
          if (path.isAbsolute(entryName)) {
            return 'index.d.ts';
          }
          return `${entryName}.${format === 'umd' ? 'umd.js' : format === 'cjs' ? 'cjs' : 'mjs'}`;
        },
      },
      // es,cjs,umd,css 统一输出到对应的 dist
      outDir: `./${PKG_ENV}/${MOD_ENV}/dist/`,
      emptyOutDir: +CLEAR_ENV === 1,
      rollupOptions: {
        // 排除不需要打进来的包
        // 这里在打包为 es 或 cjs 的时候可以把 dependencies 里的也排掉（因为开发阶段会自动安装的）
        // 打包 umd 的时候只排除 peerDependencies
        external: [
          ...Object.keys(pkg.peerDependencies || {}),
          ...(FORMAT_ENV.indexOf('umd') !== -1
            ? []
            : // dependencies 里只排除 @xnebula 包
              Object.keys(pkg.dependencies || {}).filter((dep) =>
                dep.startsWith('@xnebula'),
              )),
        ],
        output: {
          exports: 'named',
          // umd时挂在全局变量下的公共模块名称
          globals: (() => {
            const map: { [key: string]: string } = {};
            Object.keys(pkg.peerDependencies || {}).forEach((dep) => {
              map[dep] = dep.startsWith('@lcp/')
                ? upperCase(dep.split('/')[1], 1)
                : dep.startsWith('@xnebula/')
                  ? upperCase(dep.split('/')[1], 2)
                  : upperCase(dep);
            });
            return map;
          })(),
          assetFileNames: 'index.css',
        },
      },
    },
  }));
export default defineConfig(config);
