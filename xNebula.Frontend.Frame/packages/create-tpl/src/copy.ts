/*
 * @Author: Huangjs
 * @Date: 2024-07-18 16:49:04
 * @LastEditors: Huangjs
 * @LastEditTime: 2024-07-25 11:44:29
 * @Description: ******
 */
import fs from 'node:fs';
import path from 'node:path';
import Mustache from 'mustache';
import { Copy, Npm } from './types';

const baseRegistry = 'http://registry.npmmirror.com';

const copyFile = (
  src: string,
  dest: string,
  data: any,
  condition: (src: string, dest: string) => boolean,
) => {
  if (condition(src, dest)) {
    const stat = fs.statSync(src);
    if (stat.isDirectory()) {
      fs.mkdirSync(dest, { recursive: true });
      for (const file of fs.readdirSync(src)) {
        const srcFile = path.resolve(src, file);
        const destFile = path.resolve(dest, file);
        copyFile(srcFile, destFile, data, condition);
      }
    } else {
      if (src.endsWith('.tpl')) {
        const tpl = fs.readFileSync(src, 'utf-8');
        const content = Mustache.render(tpl, data);
        fs.writeFileSync(dest.replace(/\.tpl$/, ''), content, 'utf-8');
      } else {
        fs.copyFileSync(src, dest);
      }
    }
  }
};

export default async ({
  source,
  target,
  registry,
  name,
  npm,
  useLCP,
  version,
}: Copy) => {
  const files = fs.readdirSync(source);
  for (const file of files.filter((f) => f !== 'package.json')) {
    copyFile(
      path.resolve(source, file),
      path.resolve(target, file),
      {
        name: name.replace(
          /[A-Z]/g,
          (v, i) => `${i === 0 ? '' : '-'}${v.toLocaleLowerCase()}`,
        ),
        useLCP,
        version,
      },
      (src) => {
        if (
          // setup 文件不提供给模板, 需要的话自己手动创建
          /\\setup\.(j|t)s$/.test(src) ||
          // 使用 LCP 不给 text 和 translate.js 模板
          (useLCP &&
            (/\\pages\\text$/.test(src) ||
              /\\common\\translate\.(j|t)s$/.test(src))) ||
          // 不使用 LCP, 不给 widgets 和 table 模板
          (!useLCP && (/\\widgets$/.test(src) || /\\pages\\table$/.test(src)))
        ) {
          return false;
        }
        return true;
      },
    );
  }
  fs.writeFileSync(
    path.resolve(target, '.npmrc'),
    `registry=${baseRegistry}\n@xnebula:registry=${registry}\n@lcp:registry=${registry}`,
  );
  fs.writeFileSync(
    path.resolve(target, 'build.bat'),
    npm === Npm.npm
      ? 'npm -v && npm install && npm run build'
      : `npm install -g ${npm} && ${npm} -v && ${npm} install && ${npm} run build`,
  );
};
