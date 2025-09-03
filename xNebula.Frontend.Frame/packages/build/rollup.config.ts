/*
 * @Author: Huangjs
 * @Date: 2024-02-22 17:15:02
 * @LastEditors: Huangjs
 * @LastEditTime: 2024-07-16 13:32:06
 * @Description: ******
 */

import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'rollup';
import esbuildPlugin from 'rollup-plugin-esbuild';
import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(
  fs.readFileSync(new URL('./package.json', import.meta.url)).toString(),
);

export default defineConfig([
  {
    input: {
      index: path.resolve(__dirname, 'src/index.ts'),
      cli: path.resolve(__dirname, 'src/cli.ts'),
    },
    output: [
      {
        exports: 'named',
        format: 'es',
        dir: './dist',
      },
    ],
    external: [...Object.keys(pkg.dependencies)],
    plugins: [
      nodeResolve(),
      esbuildPlugin({
        define: {
          __VERSION__: JSON.stringify(pkg.version),
        },
        minify: true,
        tsconfig: path.resolve(__dirname, './tsconfig.json'),
      }),
      commonjs({
        extensions: ['.js'],
        sourceMap: false,
      }),
      json(),
    ],
  },
]);
