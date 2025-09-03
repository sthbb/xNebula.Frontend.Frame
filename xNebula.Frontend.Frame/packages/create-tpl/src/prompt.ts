import process from 'node:process';
import chalk from 'chalk';
import { isCancel, text, select, intro, outro } from '@clack/prompts';
import { Tpl, Npm, Bool, Option, SelectOptions } from './types';

const exitPrompt = () => {
  outro(chalk.red('Exit create-tpl.'));
  process.exit(1);
};
export default async (opt: Option) => {
  intro(chalk.green(`Start create template:`));
  const name = await text({
    message: `What's the plugin name?`,
    placeholder: opt.name,
    validate: (value) => {
      if (!value || !/^[0-9a-zA-Z]+$/.test(value)) {
        return `Plugin name must exits, only is number and letters`;
      }
    },
    initialValue: opt.name,
  });
  if (isCancel(name)) {
    exitPrompt();
  }
  const tpl = await select<SelectOptions<Tpl>, Tpl>({
    message: 'Pick ts or js template?',
    options: [
      { label: Tpl.js, value: Tpl.js },
      { label: Tpl.ts, value: Tpl.ts },
    ],
    initialValue: Tpl.js,
  });
  if (isCancel(tpl)) {
    exitPrompt();
  }
  const lcp = await select<SelectOptions<Bool>, Bool>({
    message: 'Is the LCP used?',
    options: [
      { label: Bool.yes, value: Bool.yes },
      { label: Bool.no, value: Bool.no },
    ],
    initialValue: Bool.yes,
  });
  if (isCancel(lcp)) {
    exitPrompt();
  }
  const npm = await select<SelectOptions<Npm>, Npm>({
    message: 'Please select NPM client.',
    options: [
      { label: Npm.pnpm, value: Npm.pnpm },
      { label: Npm.npm, value: Npm.npm },
      { label: Npm.yarn, value: Npm.yarn },
    ],
    initialValue: Npm.pnpm,
  });
  if (isCancel(npm)) {
    exitPrompt();
  }
  outro(chalk.green(`You're all set!`));
  return { name, tpl, npm, lcp } as Option;
};
