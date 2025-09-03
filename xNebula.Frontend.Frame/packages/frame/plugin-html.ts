/*
 * @Author: Huangjs
 * @Date: 2024-03-04 10:29:48
 * @LastEditors: Huangjs
 * @LastEditTime: 2024-03-05 16:31:46
 * @Description: ******
 */
import fs from 'fs';
import html, {
  makeHtmlAttributes,
  type RollupHtmlOptions,
  type RollupHtmlTemplateOptions,
} from '@rollup/plugin-html';
export * from '@rollup/plugin-html';

export type RollupHtmlOptionsExtend =
  | {
      template?:
        | {
            depsJs?: string[];
            depsCss?: string[];
            version?: string;
            tmpl: string;
          }
        | ((templateoptions?: RollupHtmlTemplateOptions) => string);
    }
  | RollupHtmlOptions;

function readFile(filePath: string) {
  return new Promise<string>((resolve, reject) => {
    fs.readFile(filePath, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data.toString());
      }
    });
  });
}

function htmlExtend(opts: RollupHtmlOptionsExtend) {
  const { template, ...restOpts } = opts;
  if (!template) {
    return html({ ...restOpts });
  }
  if (typeof template === 'function') {
    return html({
      template,
      ...restOpts,
    });
  }
  const extendTemplate = async (options?: RollupHtmlTemplateOptions) => {
    // 表示路径
    const { depsJs, depsCss, tmpl, version } = template;
    let bundleJs: string[] = [];
    let bundleCss: string[] = [];
    if (options) {
      const { attributes, files, publicPath = '/' } = options;
      bundleJs = (depsJs || [])
        .map((path) => `<script src="${path}"></script>`)
        .concat(
          (files.js || []).map(({ fileName }) => {
            const src = `${publicPath}${(fileName || '').replace(/^(\/+)/, '')}`;
            return `<script src="${src.indexOf('?') !== -1 ? `${src}&v=${version}` : `${src}?v=${version}`}"${makeHtmlAttributes(attributes.script)}></script>`;
          }),
        );
      bundleCss = (depsCss || [])
        .map((path) => `<link href="${path}" rel="stylesheet" />`)
        .concat(
          (files.css || []).map(({ fileName }) => {
            const href = `${publicPath}${(fileName || '').replace(/^(\/+)/, '')}`;
            return `<link href="${href.indexOf('?') !== -1 ? `${href}&v=${version}` : `${href}?v=${version}`}" rel="stylesheet"${makeHtmlAttributes(attributes.link)} />`;
          }),
        );
    }
    let htmlStr: string = tmpl;
    if (tmpl.toLocaleLowerCase().indexOf('<!doctype html>') === -1) {
      htmlStr = await readFile(tmpl);
    }
    // . 匹配除 \n 之外的任何单个字符。(.|\n) 匹配包括 \n 在内的任何字符。
    // + 贪婪的匹配，尽可能多的匹配 (.|\n) ，即使遇到 <\/script> 也不结束，除非是最后一个才结束。
    // +? 非贪婪匹配，尽可能少的匹配 (.|\n)，遇到第一个 <\/script> 就结束。
    // +? 的好处在于，当有两个 script 标签，中间有一些 div，此时 +? 会保留中间的 div，但是 + 会全部去掉。
    // 去掉模板中自带的 script 标签（去掉是因为这里这个 script 是开发模式用到的，所以若要加额外的js，请放入 depsJs）
    htmlStr = htmlStr.replace(/<script(.|\n)+?<\/script>/g, '');
    // 插入css
    let htmlArr = htmlStr.split('</head>');
    htmlArr.splice(1, 0, bundleCss.join(''), '</head>');
    htmlStr = htmlArr.join('');
    // 插入js
    htmlArr = htmlStr.split('</body>');
    htmlArr.splice(1, 0, bundleJs.join(''), '</body>');
    htmlStr = htmlArr.join('');
    return htmlStr.replace(/\s+?</g, '<');
  };
  return html({
    // @ts-ignore
    template: extendTemplate,
    ...restOpts,
  });
}

export default htmlExtend;
