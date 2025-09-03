import yParser from 'yargs-parser';
import process from 'node:process';
import * as core from './core';
import { getURLQuery } from './utils';
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
    const srcDir = args.srcDir || './src/';
    const outDir = args.outDir || './locales/';
    const api = args.api;
    const method = args.method || 'GET';
    try {
      const urlOpts = new URL(api);
      const query = getURLQuery(urlOpts.href);
      const paramKey = Object.keys(query)[0];
      if (!paramKey) {
        console.error(`Please give some lanaguage`);
        return;
      }
      const paramValues = query[paramKey].split(',');
      await core.getHttpI18nInfo({
        api: `${urlOpts.origin}${urlOpts.pathname}`,
        srcDir,
        outDir,
        method,
        paramKey,
        paramValues,
      });
    } catch (e) {
      console.error(`Error: ${e}`);
    }
  }
}
