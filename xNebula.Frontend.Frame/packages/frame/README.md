# 说明

## Frame 框架

### 开发模式

#### 1, 启动的代理服务器直接访问 index.html，index.html 内直接调用 main.ts

#### 2, main.ts 里直接引入 src/index 里的 start 启动框架，内部所有公共资源全部直接由 node_modules 里取用

#### 3, node_modules 里的公共资源在 core 里导出，core 赋给全局变量供插件使用

#### 4, 接口访问和插件资源访问使用代理 proxy 配置

### 生产模式

#### 1, 先以 core 为入口打包 umd，然后输出到 lib 下，作为公共资源引入

#### 2, 再对 index 进行打包为 iife，直接由 index.html (由 html-plugin 输出) 引入

#### 3, 将 node_modules 里的公共资源的 umd 格式复制到 lib 下

#### 4, 根据 publicPath（cdn）在初始化的时候以 script 方式加载进来，core 内的资源自动进入全局变量

### 发布模式

#### 1, 以 index 为入口打包三种格式发包

#### 2, node_modules 里的公共资源在 core 里导出，core 赋给全局变量供插件使用

#### 3, core 里的公共资源在导给 index ，让index也可导出公共资源，在插件开发时使用

#### 4, 接口访问和插件资源访问使用代理 proxy 配置（在插件开发里使用）
