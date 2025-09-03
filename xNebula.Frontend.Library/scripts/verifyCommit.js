// Invoked on the commit-msg git hook by yorkie.

// source：https://github.com/umijs/fabric/blob/master/src/verifyCommit.ts

import chalk from 'chalk';
import process from 'node:process';
import fs from 'node:fs';

const commitRE =
  /^(feat|fix|docs|refactor|scripts|build|workflow|tests|types|dep|i18n|publish)(\(.+\))?: .{1,50}/;

(() => {
  const msgPath = process.env.GIT_PARAMS || process.env.HUSKY_GIT_PARAMS;
  const msg = fs.readFileSync(msgPath, 'utf-8').trim();
  if (!commitRE.test(msg)) {
    console.error(
      `  ${chalk.bgRed.white(' ERROR ')} ${chalk.red(`提交日志不符合规范`)}\n\n${chalk.red(`  合法的提交日志格式如下：\n\n`)}
    ${chalk.green(`<type>[(scope)?]: <message>\n`)}
    ${chalk.green('feat: 添加了个很棒的功能')}
    ${chalk.green('fix: 修复了一些 bug')}
    ${chalk.green('docs: 更新了一下文档')}
    ${chalk.green('tests: 更改了一些测试文件')}
    ${chalk.green('scripts: 对 node 执行文件做了些更改')}
    ${chalk.green('publish: 发布 request@1.0.1')}
    ${chalk.green('i18n: 为国际化做了微小的贡献')}
    ${chalk.green('\n其他提交类型: refactor, workflow, build, types, dep\n')}`,
    );
    process.exit(1);
  }
})();
