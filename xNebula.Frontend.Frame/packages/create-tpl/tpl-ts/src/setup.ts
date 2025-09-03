import type { App } from 'vue';
// 该文件打包后会提前加载并在壳里初始化的时候进行加载并执行相关初始化工作, 非必要, 请删掉
// 如果没有初始化的逻辑要做, 请删掉此文件, 否则该文件会打包, 并在壳运行的时候提前加载, 浪费资源

// 如果需要先做一些异步操作, 则使用以下导出
// 若不使用 async/await 函数, 也可以使用 Promise
export default async () => {
  // 这里做一些异步逻辑
  // await fetch something...
  return (app: App) => {
    // 这里加入一些必须在 vue 挂载前初始化或安装的逻辑
    // init something...
    // app.use(something);
  };
};
