/*
 * @Author: Huangjs
 * @Date: 2024-03-04 10:29:48
 * @LastEditors: Huangjs
 * @LastEditTime: 2024-03-05 16:31:46
 * @Description: ******
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import url from 'node:url';

/* 几点说明：
package.json里的type如果指明为module，
则node运行的js需要是esModule系统，
书写的js需要使用上述的import/export，
同时，node执行时的内置__filename,__dirname等变量也不能再使用，需要替换模式：
import path from 'node:path'
import { fileURLToPath } from 'node:url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
process也不能直接使用，需要使用 import process from 'node:process' 导入。
如果非要使用commonjs（就是使用require/exports,内置变量__filename,__dirname等）编写的，
则需要命名为.cjs，明确告诉node使用了commonjs而不是package.json里指明的esModule（type:module）。
当然，如果package.json里未指明type为module，那么默认就是commonjs，可直接按照commonjs编写。
另外，node不能直接执行ts文件，需要先将ts转换成js在执行，或者使用ts-node */

const pkgs = path.resolve(
  path.dirname(url.fileURLToPath(import.meta.url)),
  '../packages',
);

const dev = {
  main: './src/index.ts',
};

const pub = {
  types: './dist/index.d.ts',
  main: './dist/index.cjs',
  module: './dist/index.mjs',
  unpkg: './dist/index.umd.js',
  exports: {
    '.': {
      types: './dist/index.d.ts',
      import: './dist/index.mjs',
      require: './dist/index.cjs',
    },
    './dist/*': './dist/*',
  },
};

function clear(pkg) {
  const _pkg = { ...pkg };
  Object.keys(dev).forEach((key) => {
    delete _pkg[key];
  });
  Object.keys(pub).forEach((key) => {
    delete _pkg[key];
  });
  return _pkg;
}

function error(_path, e) {
  console.error(`❌ ${_path}: ${e.message}`, e);
}

function rewrite(isPub = false) {
  fs.readdir(pkgs, (err, dirs) => {
    if (err) {
      error(pkgs, err);
    } else {
      dirs.forEach((dir) => {
        const file = path.resolve(pkgs, `${dir}/package.json`);
        fs.access(file, (err0) => {
          if (err0) {
            // 文件不存在
            error(file, err0);
          } else {
            fs.readFile(file, (err1, data) => {
              if (err1) {
                error(file, err1);
              } else {
                try {
                  fs.writeFile(
                    file,
                    JSON.stringify(
                      {
                        ...clear(JSON.parse(data.toString())),
                        ...(isPub ? pub : dev),
                      },
                      null,
                      2,
                    ),
                    (err2) => {
                      if (err2) {
                        error(file, err2);
                      } else {
                        console.log(`✅ ${file}: success !`);
                      }
                    },
                  );
                } catch (_e) {
                  error(file, new Error('JSON failed ...'));
                }
              }
            });
          }
        });
      });
    }
  });
}

(async () => {
  const args = process.argv.slice(2);
  rewrite(args[0] === 'pub');
})();
