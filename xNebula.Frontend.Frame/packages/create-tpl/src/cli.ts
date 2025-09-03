/*
 * @Author: Huangjs
 * @Date: 2024-02-22 17:15:02
 * @LastEditors: Huangjs
 * @LastEditTime: 2024-03-06 11:50:43
 * @Description: ******
 */

import path from 'node:path';
import yParser from 'yargs-parser';
import process from 'node:process';
import url from 'node:url';
import fs from 'node:fs';
import chalk from 'chalk';
import prompt from './prompt';
import copy from './copy';
import install from './install';
import { Tpl, Npm, Bool } from './types';
import pkg from '../package.json';

export async function run() {
  const args = yParser(process.argv.slice(2), {
    alias: {
      version: ['v'],
    },
    boolean: ['version'],
  });
  // 表示查看版本号
  if (args.version && !args._[0]) {
    console.log(pkg.version);
  } else {
    const target = path.join(process.cwd(), args.dir || '');
    fs.mkdirSync(target, { recursive: true });
    const targetFiles = fs.readdirSync(target);
    if (
      targetFiles.length > 1 ||
      (targetFiles.length === 1 && targetFiles[0] !== '.npmrc')
    ) {
      console.log(
        chalk.red(
          `Target directory "${target}" is not empty. Please proceed it and try again`,
        ),
      );
      return;
    }
    const registry = args.registry || 'http://192.168.1.168:4873';
    const { name, tpl, npm, lcp } = await prompt({
      name: !args._[0] ? 'PluginTpl' : String(args._[0]),
      tpl: Tpl.js,
      npm: Npm.pnpm,
      lcp: Bool.yes,
    });
    await copy({
      source: path.resolve(
        url.fileURLToPath(import.meta.url),
        '../..',
        `tpl-${tpl}`,
      ),
      target,
      registry,
      name,
      npm,
      useLCP: lcp === Bool.yes,
      version: pkg.version,
    });
    console.log(chalk.green(`Plugin template is copy success`));
    await install(target, npm, lcp === Bool.yes);
  }
}
