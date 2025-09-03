import { start } from '@xnebula/frame';
import '@xnebula/frame/dist/index.css';
import getPages from 'virtual:inject-pages';
/* // 该段代码用于开发模式下使用 monaco-editor, 如果你使用到了 monaco-editor 请放开
// 这个是本地开发使用, 如果线上某个页面用到, 需要使用 loadDependencies 方法加载 monaco-editor
import * as MonacoEditor from 'monaco-editor';
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';

if (!(window || self).MonacoEditor) {
  (window || self).MonacoEditor = MonacoEditor;
}
if (!(window || self).MonacoEnvironment) {
  (window || self).MonacoEnvironment = {
    getWorker(_, label) {
      if (label === 'json') {
        return new jsonWorker();
      }
      if (label === 'css' || label === 'scss' || label === 'less') {
        return new cssWorker();
      }
      if (label === 'html' || label === 'handlebars' || label === 'razor') {
        return new htmlWorker();
      }
      if (label === 'typescript' || label === 'javascript') {
        return new tsWorker();
      }
      return new editorWorker();
    },
  };
} */

start('#app', getPages());
