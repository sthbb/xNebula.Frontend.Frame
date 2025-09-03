export default async () => {
  // 这里做一些异步逻辑
  // await fetch something...
  console.log('setup');
  return (app: any) => {
    // 这里加入一些必须在 vue 挂载前初始化或安装的逻辑
    // init something...
    // app.use(something);
    console.log(app);
  };
};
