import chalk from 'chalk';
import { execa, execaCommand } from 'execa';
import { Npm } from './types';

async function getVersion(npm: Npm) {
  try {
    const { stdout } = await execa(npm, ['--version']);
    return stdout.trim();
  } catch (e) {
    if (npm !== Npm.npm) {
      console.log(chalk.green(`Install ${npm}...`));
      await execa('npm', [
        'install',
        '-g',
        npm === 'pnpm' ? 'pnpm@9.3.0' : 'yarn@1.22.21',
      ]);
      const { stdout } = await execa(npm, ['--version']);
      return stdout.trim();
    } else {
      throw new Error(`Please install ${npm} first`, { cause: e });
    }
  }
}
async function installDeps(target: string, npm: Npm, useLCP: boolean) {
  const install = npm === Npm.pnpm || npm === Npm.yarn ? 'add' : 'install';
  const devTag = npm === Npm.pnpm || npm === Npm.yarn ? '--D' : '--save-dev';
  console.log(chalk.green(`${npm} start install dependencies packages...`));
  await execa(npm, ['install'], {
    cwd: target,
    stdio: 'inherit',
    buffer: true,
    maxBuffer: 1024 * 1024 * 10,
  });
  await execaCommand(
    [npm, install, devTag]
      .concat([
        '@xnebula/build@^1',
        '@xnebula/frame@^1',
        ...(useLCP ? ['@lcp/xrenderer@^1', '@lcp/xwidgets@^1'] : []),
      ])
      .join(' '),
    {
      cwd: target,
      stdio: 'inherit',
      buffer: true,
      maxBuffer: 1024 * 1024 * 10,
    },
  );
  console.log(chalk.green(`${npm} install dependencies success`));
}
export default async (target: string, npm: Npm, useLCP: boolean) => {
  const lowMajor = npm === Npm.pnpm ? 8 : npm === Npm.yarn ? 1 : 8;
  const lowMinor = npm === Npm.pnpm ? 0 : npm === Npm.yarn ? 22 : 0;
  const version = await getVersion(npm);
  console.log(chalk.green(`${npm} version: ${version}`));
  const major = parseInt(version.split('.')[0], 10);
  const minor = parseInt(version.split('.')[1], 10);
  if (major < lowMajor || (major === lowMajor && minor < lowMinor)) {
    throw new Error(`Please install ${npm} >=${lowMajor}.${lowMinor}`);
  }
  await installDeps(target, npm, useLCP);
};
