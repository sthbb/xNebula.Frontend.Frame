/*
 * @Author: Huangjs
 * @Date: 2024-02-22 17:15:02
 * @LastEditors: Huangjs
 * @LastEditTime: 2024-03-06 12:04:20
 * @Description: ******
 */
import path from 'node:path';
import { defineConfig, type Rollup } from 'vite';
import vue from '@vitejs/plugin-vue';
import dts from 'vite-plugin-dts';
import virtual from '@rollup/plugin-virtual';
import { modules, setImport, setExpose, setExport } from './modules';

const external: Rollup.ExternalOption = [];
// 排除所有全局依赖模块，安装 frame 之后会自动安装，有需要，用户也可以自己单独安装
modules.forEach(({ moduleName, cssPath }) => {
  external.push(moduleName);
  if (cssPath) {
    external.push(`${moduleName}/${cssPath}`);
  }
});

export default defineConfig({
  define: {
    // 发布模式是不需要 __PUBLIC_PATH__ 的，这里直接设置为根就可以
    __PUBLIC_PATH__: JSON.stringify('./'),
    // 发布模式设置插件资源请求代理前缀为 plugin
    __PLUGIN_PREFIX__: JSON.stringify('plugin/'),
  },
  plugins: [
    vue(),
    dts({
      entryRoot: './src',
      outDir: './dist',
      tsconfigPath: './tsconfig.app.json',
      rollupTypes: true, // If you want to merge all declarations into one file
      beforeWriteFile: (filePath, content) => {
        // 对于虚拟依赖的文件类型，可以在这里进行类型处理
        if (content.includes('virtual:inject-dependencies')) {
          const mods = modules.filter(({ frameCoreName }) => !!frameCoreName);
          // 基本依赖的类型加入
          const importReplace = mods
            .map(
              ({ frameCoreName, moduleName }) =>
                `import * as ${frameCoreName} from '${moduleName}';`,
            )
            // Expose 的类型处理
            .concat([`import { Exposed } from './core/index`])
            .join('\n');
          const exportReplace = `export { ${mods
            .map(({ frameCoreName }) => frameCoreName)
            .concat(['Exposed'])
            .join(',')} };`;
          return {
            filePath,
            content: content.replace(
              /\n(.+)virtual:inject-dependencies(.+)\n/,
              `\n${importReplace}\n${exportReplace}\n`,
            ),
          };
        }
        // else 将按照默认逻辑处理文件
      },
    }),
    virtual({
      'virtual:inject-dependencies': `
        import * as core from '/src/core/index';
        ${modules.map((v, i) => setImport('pub', v, i)).join('\n')}
        ${setExport('pub')}
        export default async () => {
          // Frame 内部接口暴露到 FrameCore
          window.xNebula.FrameCore = { ...core };
          ${modules.map((v, i) => setExpose('pub', v, i)).join('\n')}
          return core._initialize;
        };
      `,
      'virtual:lazy-dependencies': `
        export default () => [];
      `,
    }),
  ],
  build: {
    // minify: false,
    sourcemap: true,
    lib: {
      // 库打包入口文件
      entry: path.resolve(__dirname, './src/index.ts'),
      // 需要打包的格式，这里只要两种
      formats: ['es', 'cjs'],
      // 打包出来的文件名称
      fileName: (format, entryName) => {
        // 这个是 vite-plugin-dts 插件在 rollupTypes 为 true 时调用的情况，直接返回 dts 入口文件名称即可
        // 它会解析 vite-plugin-dts 配置的 outDir 里找入口
        if (path.isAbsolute(entryName)) {
          return 'index.d.ts';
        }
        return `${entryName}.${format === 'cjs' ? 'cjs' : 'mjs'}`;
      },
    },
    outDir: `./dist/`,
    rollupOptions: {
      external,
      output: {
        // 代码中有 import() 的动态加载时, 打包输出的文件不对动态加载的文件进行分块, 而是合并到一个文件
        // 只不过此时算不上动态加载了, 就是单纯的做了一个 Promise
        inlineDynamicImports: true,
        assetFileNames: () => 'index.css',
      },
    },
  },
});
