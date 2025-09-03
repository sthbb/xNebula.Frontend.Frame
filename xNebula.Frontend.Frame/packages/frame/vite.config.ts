/*
 * @Author: Huangjs
 * @Date: 2024-02-22 17:15:02
 * @LastEditors: Huangjs
 * @LastEditTime: 2024-07-24 14:47:47
 * @Description: ******
 */
import path from 'node:path';
import fs from 'node:fs';
import { defineConfig } from 'vite';
import devConfig from './vite.config.dev';
import pubConfig from './vite.config.pub';
import prodConfig from './vite.config.prod';
import pkg from './package.json';
import locales from './src/core/locales';

const { MOD_ENV } = process.env;
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

export default defineConfig(() => {
  if (!MOD_ENV) {
    fs.writeFileSync(
      path.resolve(__dirname, './prod/locales.json'),
      JSON.stringify(
        (() => {
          const _locales: Record<string, Record<string, string>> = {};
          Object.keys(locales).forEach((key) => {
            const json = toSimpleJSON(
              (locales as Record<string, Record<string, any>>)[key],
            );
            const newJson: Record<string, string> = {};
            Object.keys(json).forEach((_key) => {
              newJson[`Frame.${_key}`] = json[_key];
            });
            _locales[key.replace(/-/g, '_')] = newJson;
          });
          return _locales;
        })(),
      ),
    );
  }
  const config =
    MOD_ENV === 'DEV' ? devConfig : MOD_ENV === 'PUB' ? pubConfig : prodConfig;
  return {
    ...config,
    define: {
      // 插件里用了 process.env.NODE_ENV
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      __FRAME_MODE__: JSON.stringify(MOD_ENV),
      __FRAME_VERSION__: JSON.stringify(pkg.version),
      ...config.define,
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@@': path.resolve(__dirname, './src/core'),
      },
    },
    build: {
      minify: true,
      // sourcemap: true,
      ...config.build,
    },
  };
});
