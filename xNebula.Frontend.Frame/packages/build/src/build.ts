/*
 * @Author: Huangjs
 * @Date: 2024-02-22 17:15:02
 * @LastEditors: Huangjs
 * @LastEditTime: 2024-07-16 13:34:43
 * @Description: ******
 */
import path from 'node:path';
import chalk from 'chalk';
import { build } from 'vite';
import vue from '@vitejs/plugin-vue';
import defaultConfig, { fixedGlobals, fixedExternal } from './defaultConfig';
import { Env, type Package, type ResolvedConfig } from './types';

export default async (
  cwd: string,
  pkg: Package,
  entryFile: string,
  moduleName: string,
  pluginName: string,
  config: ResolvedConfig,
) => {
  const {
    root,
    base,
    mode,
    define,
    plugins,
    pluginVueOptions,
    pluginVirtualOptions,
    entry,
    server,
    build: buildConf,
    ...restConfig
  } = config;
  const { outDir, lib, rollupOptions, ...restBuild } = buildConf;
  const { fileName } = lib;
  const { external, output, ...restRollupOptions } = rollupOptions;
  const { assetFileNames, globals, ...restOutput } = output;

  try {
    await build({
      ...restConfig,
      root: root || cwd,
      base: base || '/',
      mode: mode || Env.production,
      define: {
        __PLG_NAME__: JSON.stringify(pluginName),
        __VERSION__: JSON.stringify(pkg.version),
        ...(define || {}),
      },
      plugins: [vue(pluginVueOptions), ...(plugins || [])],
      build: {
        ...restBuild,
        outDir: path.normalize(
          `${path.isAbsolute(outDir) ? outDir : path.join(cwd, outDir)}/${moduleName}/`,
        ),
        lib: {
          entry: entryFile,
          formats: ['umd'],
          name: `xNebula.FramePlugins.${pluginName}_${moduleName}`,
          fileName: fileName || defaultConfig.build.lib.fileName,
        },
        rollupOptions: {
          ...restRollupOptions,
          external:
            typeof external === 'function'
              ? (
                  source: string,
                  importer: string | undefined,
                  isResolved: boolean,
                ) => {
                  if (fixedExternal.indexOf(source) !== -1) {
                    return true;
                  }
                  return external(source, importer, isResolved);
                }
              : [
                  ...fixedExternal,
                  ...(Array.isArray(external)
                    ? external
                    : external
                      ? [external]
                      : []),
                ],
          output: {
            ...restOutput,
            globals:
              typeof globals === 'function'
                ? (name: string) => fixedGlobals[name] || globals(name)
                : {
                    ...fixedGlobals,
                    ...(globals || {}),
                  },
            assetFileNames:
              assetFileNames ||
              defaultConfig.build.rollupOptions.output.assetFileNames,
          },
        },
      },
    });
  } catch (e) {
    console.error(chalk.red(`error during build:\n${e.stack}`), {
      error: e,
    });
    process.exit(1);
  }
};
