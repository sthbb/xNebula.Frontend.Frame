/*
 * @Author: Huangjs
 * @Date: 2024-02-22 17:15:02
 * @LastEditors: Huangjs
 * @LastEditTime: 2024-03-06 11:50:43
 * @Description: ******
 */
import process from 'node:process';
import yParser from 'yargs-parser';
import { Service } from './service';
import { DEV_COMMAND, BUILD_COMMANDS } from './constants';
import { Env } from './types';
import pkg from '../package.json';

export async function run(opts?: { args?: yParser.Arguments }) {
  const args =
    opts?.args ||
    yParser(process.argv.slice(2), {
      alias: {
        version: ['v'],
      },
      boolean: ['version'],
    });
  // 表示查看版本号
  if (args.version && !args._[0]) {
    console.log(pkg.version);
  } else {
    const command = String(args._[0]);
    if (DEV_COMMAND.includes(command)) {
      process.env.NODE_ENV = Env.development;
      process.on('SIGINT', () => process.exit(0));
    } else if (BUILD_COMMANDS.includes(command)) {
      process.env.NODE_ENV = Env.production;
    }
    try {
      const service = new Service();
      await service.run({ command, args });
      // handle restart for dev command
      if (DEV_COMMAND.includes(command)) {
        const listener = async function (data: any) {
          if (data?.type === 'RESTART') {
            // off self
            process.off('message', listener);
            // restart
            run({ args });
          }
        };
        process.on('message', listener);
      }
    } catch (_e) {
      process.exit(1);
    }
  }
}
