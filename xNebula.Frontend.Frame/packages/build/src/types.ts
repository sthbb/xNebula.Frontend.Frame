/*
 * @Author: Huangjs
 * @Date: 2024-02-22 17:15:02
 * @LastEditors: Huangjs
 * @LastEditTime: 2024-07-24 11:43:15
 * @Description: ******
 */
import type {
  UserConfig,
  BuildOptions,
  ServerOptions,
  LibraryOptions,
} from 'vite';
import type { Options as PluginVueOptions } from '@vitejs/plugin-vue';
import type { RollupVirtualOptions as PluginVirtualOptions } from '@rollup/plugin-virtual';

type JSONPlain = string | number | boolean | null;
type JSONObject = {
  [key in string | number]?: JSONType;
};
export type JSONType = JSONPlain | JSONPlain[] | JSONObject | JSONObject[];

type RollupOptions = Required<BuildOptions>['rollupOptions'];
type OutputOptions = Exclude<Required<RollupOptions>['output'], any[]>;
type ProxyDataVal = {
  headers?: Record<string, number | string | string[]>;
  proxy?: string;
  hack?: boolean;
  data?: ((source?: JSONType) => JSONType) | JSONType;
};
export type ProxyData = Record<
  string,
  | ((a: string, b: string[], c?: string, d?: boolean) => ProxyDataVal)
  | ProxyDataVal
>;

export type DefineConfig = Omit<UserConfig, 'server' | 'build'> & {
  pluginVueOptions?: PluginVueOptions;
  pluginVirtualOptions?: PluginVirtualOptions;
  entry?: {
    pluginName?: string;
    customToken?: string;
    showServerMenus?: boolean;
    pagesDir?: string;
    include?: string | RegExp | (string | RegExp)[];
    exclude?: string | RegExp | (string | RegExp)[];
    setupFile?: string;
    localeFile?: string;
  };
  server?: ServerOptions & {
    proxyServer?: string;
    proxyData?: ProxyData;
  };
  build?: Omit<BuildOptions, 'lib' | 'rollupOptions'> & {
    lib?: LibraryOptions;
    rollupOptions?: Omit<RollupOptions, 'output'> & {
      output?: OutputOptions;
    };
  };
};

export type ResolvedConfig = Omit<
  DefineConfig,
  'entry' | 'server' | 'build'
> & {
  entry: Omit<
    Required<DefineConfig>['entry'],
    'pagesDir' | 'include' | 'exclude' | 'setupFile'
  > & {
    pagesDir: string;
    include: string | RegExp | (string | RegExp)[];
    exclude: string | RegExp | (string | RegExp)[];
    setupFile: string;
    localeFile: string;
  };
  server: Omit<Required<DefineConfig>['server'], 'proxyData'> & {
    proxyData: ProxyData;
  };
  build: Omit<
    Required<DefineConfig>['build'],
    'outDir' | 'lib' | 'rollupOptions'
  > & {
    outDir: string;
    lib: LibraryOptions;
    rollupOptions: Omit<RollupOptions, 'output'> & {
      output: OutputOptions;
    };
  };
};

export enum Env {
  development = 'development',
  production = 'production',
  test = 'test',
}

export type Package = Record<string, string | Record<string, any>>;
