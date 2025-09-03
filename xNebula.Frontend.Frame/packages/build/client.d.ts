/// <reference types="vite/client" />

declare const __VERSION__: string;
declare const __PLG_NAME__: string;
declare const __filename: string;
declare const __dirname: string;
declare module 'virtual:inject-pages' {
  export default function getPages(): () => Promise<Record<string, any>>;
}
