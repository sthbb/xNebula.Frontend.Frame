import Index from './views/index.vue';

// 可直接导出该页面的组件
export default Index;

// 如果需要先做一些初始化操作, 则使用以下导出
/* export default () => {
  // 这里做一些初始化逻辑
  // init something...
  return Index;
}; */

// 如果需要先做一些异步操作, 则使用以下导出
// 若不使用 async/await 函数, 也可以使用 Promise
/* export default async () => {
  // 这里做一些异步逻辑
  // await fetch something...
  // 这里做一些初始化逻辑
  // init something...
  return Index;
}; */
