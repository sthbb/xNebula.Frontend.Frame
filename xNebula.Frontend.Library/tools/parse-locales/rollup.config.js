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
      cli: path.resolve(__dirname, 'src/cli.js'),
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
      commonjs({
        extensions: ['.js'],
        sourceMap: false,
      }),
      json(),
    ],
  },
]);
