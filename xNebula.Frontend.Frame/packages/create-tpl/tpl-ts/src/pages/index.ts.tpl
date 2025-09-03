import { type AssetCommonParams } from '@xnebula/frame';
import locales from '../locales';
import { plgName } from '../common';
{{#useLCP}}
import { WidgetsPlugin } from '../widgets';
{{/useLCP}}

export default ({ {{#useLCP}}vueApp, {{/useLCP}}setI18nMessages }: AssetCommonParams) => {
  // 这里做一些初始化逻辑
  // init something...
  setI18nMessages(locales, plgName);
  {{#useLCP}}
  vueApp.use(WidgetsPlugin);
  {{/useLCP}}
};

// 如果需要先做一些异步操作, 则使用以下导出
// 若不使用 async/await 函数, 也可以使用 Promise
/* export default async ({ vueApp, setI18nMessages }: AssetCommonParams) => {
  // 这里做一些异步逻辑
  // await fetch something...
  // 这里做一些初始化逻辑
  // init something...
}; */
