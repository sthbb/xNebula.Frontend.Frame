/*
 * @Author: Huangjs
 * @Date: 2024-02-22 17:15:02
 * @LastEditors: Huangjs
 * @LastEditTime: 2024-07-24 16:54:46
 * @Description: ******
 */
import process from 'node:process';
import fs from 'node:fs';
import path from 'node:path';
// import url from 'node:url';
import chalk from 'chalk';
// import { build as esBuild, type Plugin } from 'esbuild';
import { loadConfigFromFile } from 'vite';
import lodash from 'lodash';
import yParser from 'yargs-parser';
import { rimrafSync } from 'rimraf';
import { createFilter } from '@rollup/pluginutils';
import { DEV_COMMAND, BUILD_COMMANDS, CONFIG_FILES } from './constants';
import defaultConfig from './defaultConfig';
import viteDev from './dev';
import viteBuild from './build';
import {
  Env,
  type Package,
  type DefineConfig,
  type ResolvedConfig,
} from './types';

const toSimpleJSON = (obj: Record<string, any>) => {
  const json: Record<string, string> = {};
  Object.keys(obj).forEach((key) => {
    const value = obj[key];
    if (typeof value === 'string') {
      json[key] = value;
    } else if (typeof value === 'function' || typeof value === 'number') {
      json[key] = value.toString();
    } else if (value && !Array.isArray(value) && typeof value === 'object') {
      const child = toSimpleJSON(value);
      Object.keys(child).forEach((ckey) => {
        json[`${key}.${ckey}`] = child[ckey];
      });
    }
  });
  return json;
};

const firstUpper = (pkname: string, noFirst?: boolean) =>
  `${!noFirst ? '-' : ''}${pkname}`
    .replace(/-./g, (v) => v.toLocaleUpperCase())
    .replace(/-/g, '');

const fileExist = (file: string) => {
  if (file.endsWith('.ts') || file.endsWith('.js')) {
    return fs.existsSync(file) ? file : '';
  }
  const _file =
    file.endsWith('/') || file.endsWith('\\') ? `${file}index` : file;
  let _file_ = path.normalize(`${_file}.ts`);
  if (fs.existsSync(_file_)) {
    return _file_;
  }
  _file_ = path.normalize(`${_file}.js`);
  if (fs.existsSync(_file_)) {
    return _file_;
  }
  return '';
};
/* const importFile = async (
  cwd: string,
  fileName: string,
  define?: { attrs: Record<string, string>; plugin: Plugin },
) => {
  const fileBase = `${fileName}.timestamp-${Date.now()}-${Math.random()
    .toString(16)
    .slice(2)}`;
  await esBuild({
    absWorkingDir: cwd,
    entryPoints: [fileName],
    platform: 'node',
    format: 'esm',
    outfile: `${fileBase}.mjs`,
    bundle: true,
    sourcemap: 'inline',
    define: define?.attrs,
    plugins: define ? [define.plugin] : [],
  });
  const fileUrl = `${url.pathToFileURL(fileBase)}.mjs`;
  try {
    return (await import(fileUrl)).default;
  } catch (e) {
    console.error(
      chalk.red(`error when import file: [${fileName}].\n${e.stack}`),
      {
        error: e,
      },
    );
  } finally {
    fs.unlink(`${fileBase}.mjs`, () => {});
  }
}; */
export class Service {
  cwd: string;
  env: Env;
  pkg: Package;
  constructor() {
    this.cwd = process.cwd();
    this.env = process.env.NODE_ENV as Env;
    this.pkg = JSON.parse(
      fs.readFileSync(path.join(this.cwd, './package.json')).toString(),
    );
  }
  async getConfig(command: string, fileName: string) {
    const config = await loadConfigFromFile(
      {
        command: DEV_COMMAND.includes(command) ? 'serve' : 'build',
        mode: command,
        isSsrBuild: false,
        isPreview: false,
      },
      fileName,
      this.cwd,
      'error',
      {
        error: (_: string, { error } = {}) => {
          console.error(
            chalk.red(
              `error when load config file: [${fileName}].\n${error?.stack}`,
            ),
            {
              error,
            },
          );
        },
        info: () => {},
        warn: () => {},
        warnOnce: () => {},
        clearScreen: () => {},
        hasErrorLogged: () => true,
        hasWarned: false,
      },
    );
    return config;
  }
  async parseFile(
    setup: string,
    pages: string,
    include: string | RegExp | (string | RegExp)[],
    exclude: string | RegExp | (string | RegExp)[],
    plgName?: string,
  ) {
    let pluginName = !plgName
      ? firstUpper((this.pkg.name as string) || '')
      : plgName;
    if (!pluginName || !/^[0-9a-zA-Z]+$/.test(pluginName)) {
      console.error(
        chalk.red(`Plugin name must exits, only is number and letters`),
      );
      pluginName = '';
    }
    const setupFile = fileExist(
      path.normalize(
        path.isAbsolute(setup) ? setup : path.join(this.cwd, setup),
      ),
    );
    let commonFile = '';
    const pagesFile: string[][] = [];
    const fileBase = path.normalize(
      path.isAbsolute(pages) ? pages : path.join(this.cwd, pages),
    );
    const filter = createFilter(include, exclude, {
      resolve: fileBase,
    });
    const eachPages = (directory: string, prefixs: string[]) => {
      if (fs.statSync(directory).isDirectory()) {
        const modules = fs.readdirSync(directory);
        // 当前目录下是空的
        if (!modules.length) {
          console.warn(chalk.yellow(`${directory}: `));
          console.warn(
            chalk.yellow(
              !prefixs.length
                ? 'This pages is empty.'
                : 'This page does not have an entry file index.ts or index.js, please modify or delete it.',
            ),
          );
          return;
        }
        modules.forEach((name) => {
          const filePath = path.normalize(`${directory}/${name}`);
          if (!prefixs.length && (name === 'index.js' || name === 'index.ts')) {
            commonFile = fileExist(filePath);
          } else {
            const file = fileExist(path.normalize(`${filePath}/index`));
            if (file) {
              // 文件存在, 表示该目录属于页面目录
              if (filter(filePath)) {
                // 表示文件被 include
                pagesFile.push([
                  firstUpper([...prefixs, name].join('-'), true),
                  file,
                ]);
              } else {
                console.warn(chalk.yellow(`${filePath}: `));
                console.warn(
                  chalk.yellow(
                    'This page has been excluded. If you do not want to be excluded, please modify the [entry.exclude] or [entry.include] in the configuration file.',
                  ),
                );
              }
            } else {
              // 文件不存在, 表示该目录属于分类目录, 或者一个其它文件, 继续向下判断
              eachPages(filePath, [...prefixs, name]);
            }
          }
        });
        return;
      }
      // 表示当前路径不是一个目录
      console.warn(chalk.yellow(`${directory}: `));
      console.warn(
        chalk.yellow(
          !prefixs.length
            ? 'This pages is not a directory.'
            : 'This page appears to be a file rather than a folder, please modify or delete it.',
        ),
      );
    };
    eachPages(fileBase, []);
    return {
      pluginName,
      setupFile,
      commonFile,
      pagesFile,
    };
  }
  async build(config: ResolvedConfig) {
    const {
      pluginName: _pluginName,
      setupFile: _setupFile,
      pagesDir: _pagesDir,
      include,
      exclude,
      localeFile: _localeFile,
    } = config.entry;
    // 清空一下 dist 目录
    const outPath = path.normalize(
      path.isAbsolute(config.build.outDir)
        ? config.build.outDir
        : path.join(this.cwd, config.build.outDir),
    );
    rimrafSync(outPath);
    const { pluginName, setupFile, commonFile, pagesFile } =
      await this.parseFile(
        _setupFile,
        _pagesDir,
        include,
        exclude,
        _pluginName,
      );
    if (!pluginName) {
      return;
    }
    if (setupFile) {
      await viteBuild(
        this.cwd,
        this.pkg,
        setupFile,
        '__setup__',
        pluginName,
        config,
      );
    }
    if (commonFile) {
      await viteBuild(
        this.cwd,
        this.pkg,
        commonFile,
        '__common__',
        pluginName,
        config,
      );
    }
    for (const [name, file] of pagesFile) {
      await viteBuild(this.cwd, this.pkg, file, name, pluginName, config);
    }
    const localeFile = fileExist(
      path.normalize(
        path.isAbsolute(_localeFile)
          ? _localeFile
          : path.join(this.cwd, _localeFile),
      ),
    );
    if (localeFile) {
      const locales = ((
        await loadConfigFromFile(
          {
            command: 'build',
            mode: 'build',
            isSsrBuild: false,
            isPreview: false,
          },
          localeFile,
          this.cwd,
          'error',
          {
            error: (_: string, { error } = {}) => {
              console.error(
                chalk.red(
                  `error when load locales file: [${localeFile}].\n${error?.stack}`,
                ),
                {
                  error,
                },
              );
            },
            info: () => {},
            warn: () => {},
            warnOnce: () => {},
            clearScreen: () => {},
            hasErrorLogged: () => true,
            hasWarned: false,
          },
        )
      )?.config || {}) as Record<string, Record<string, any>>;
      fs.writeFileSync(
        path.resolve(outPath, 'locales.json'),
        JSON.stringify(
          (() => {
            const _locales: Record<string, Record<string, string>> = {};
            Object.keys(locales).forEach((key) => {
              const json = toSimpleJSON(locales[key]);
              const newJson: Record<string, string> = {};
              Object.keys(json).forEach((_key) => {
                newJson[`${pluginName}.${_key}`] = json[_key];
              });
              _locales[key.replace(/-/g, '_')] = newJson;
            });
            return _locales;
          })(),
        ),
      );
      console.log(chalk.green(`Successfully generated locales.json file.`));
    }
  }
  async dev(config: ResolvedConfig) {
    const {
      pluginName: _pluginName,
      setupFile: _setupFile,
      pagesDir: _pagesDir,
      include,
      exclude,
      customToken,
    } = config.entry;
    const { pluginName, setupFile, commonFile, pagesFile } =
      await this.parseFile(
        _setupFile,
        _pagesDir,
        include,
        exclude,
        _pluginName,
      );
    if (!pluginName) {
      return;
    }
    let setupPath = '';
    if (setupFile) {
      setupPath = _setupFile;
    }
    let commonPath = '';
    if (commonFile) {
      commonPath = path.normalize(`${_pagesDir}/index`);
    }
    const virtualCode = `export default () => {
      return async () => {
        const promises = [${setupPath ? `import('/${setupPath.replace(/\\/g, '/')}'),` : ''}
        ${commonPath ? `import('/${commonPath.replace(/\\/g, '/')}'),` : ''}
        ${pagesFile
          .map(([_, file]) => `import('/${file.replace(/\\/g, '/')}')`)
          .join(',')}];
        const [${setupPath ? 'setup,' : ''}${commonPath ? 'common,' : ''}${pagesFile.map(([name]) => name).join(',')}] = await Promise.all(promises);
        return {
          ${setupPath ? `'${pluginName}___setup__': setup.default,` : ''}
          ${commonPath ? `'${pluginName}___common__': common.default,` : ''}
          ${pagesFile.map(([name]) => `'${pluginName}_${name}': ${name}.default,`).join('\n')}
        };
      }
    };`;
    await viteDev(
      this.cwd,
      this.pkg,
      pagesFile.map(([name]) => name),
      virtualCode,
      pluginName,
      config,
      customToken || (this.pkg.token as string),
    );
  }
  async parseConfig(command: string, configPaths: string[]) {
    let config: DefineConfig = {};
    const files: string[] = [];
    for (const configFile of configPaths) {
      if (fs.existsSync(configFile)) {
        try {
          config = lodash.merge(
            {},
            config,
            (await this.getConfig(command, configFile))?.config || {},
          );
        } catch (e) {
          console.error(
            chalk.red(
              `error when parsing config: [${configFile}].\n${e.stack}`,
            ),
            {
              error: e,
            },
          );
        }
      } else {
        files.push(configFile);
      }
    }
    if (files.length === configPaths.length) {
      console.error(
        `${chalk.red(`No correct config file provided, default config will be used.`)}`,
      );
    }
    return config;
  }
  async run(opts: { command: string; args?: yParser.Arguments }) {
    const { command, args } = opts;
    let configPaths: string[] = [];
    if (args?.config) {
      configPaths = [
        path.isAbsolute(args.config)
          ? args.config
          : path.join(this.cwd, args.config),
      ];
    } else {
      configPaths = CONFIG_FILES.map((cfg) => path.join(this.cwd, cfg));
    }
    const userConfig = await this.parseConfig(command, configPaths);
    const config = lodash.merge({}, defaultConfig, userConfig);
    if (DEV_COMMAND.includes(command)) {
      await this.dev(config);
    } else if (BUILD_COMMANDS.includes(command)) {
      await this.build(config);
    }
  }
}
