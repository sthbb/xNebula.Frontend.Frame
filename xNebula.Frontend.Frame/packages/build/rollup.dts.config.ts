/*
 * @Author: Huangjs
 * @Date: 2024-02-22 17:15:02
 * @LastEditors: Huangjs
 * @LastEditTime: 2024-03-06 11:50:43
 * @Description: ******
 */

import fs from 'node:fs';
import { defineConfig } from 'rollup';
import dts from 'rollup-plugin-dts';

const pkg = JSON.parse(
  fs.readFileSync(new URL('./package.json', import.meta.url)).toString(),
);

export default defineConfig([
  {
    input: {
      index: './temp/index.d.ts',
    },
    output: {
      dir: './dist',
      format: 'es',
    },
    external: [...Object.keys(pkg.dependencies)],
    plugins: [dts()],
  },
]);
