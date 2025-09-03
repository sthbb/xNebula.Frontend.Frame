/// <reference types="vite/client" />

declare const __PUBLIC_PATH__: string;
declare const __PLUGIN_PREFIX__: string;
declare const __FRAME_VERSION__: string;
declare const __FRAME_MODE__: string;
declare interface Window {
  process: {
    env: {
      NODE_ENV: string;
    };
  };
  xNebula: {
    FrameCore: Record<string, any>;
    FramePlugins: import('@/types').Plugins;
  };
}
declare module 'virtual:lazy-dependencies' {
  export default function getLazyModules(): {
    moduleName: string;
    globalName: string;
    frameCoreName?: string;
    jsPath: string;
    cssPath?: string;
  }[];
}
declare module 'virtual:inject-dependencies' {
  export default function initialize(
    config: import('@/types').Config,
  ): Promise<
    (
      selector: string | Element,
      config: import('@/types').Config,
      modules: import('@/types').Plugins,
      staticPlugins?: () =>
        | import('@/types').Plugins
        | Promise<import('@/types').Plugins>,
    ) => void
  >;
}
