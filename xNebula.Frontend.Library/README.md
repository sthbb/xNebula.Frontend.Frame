# 说明

## xNebula.Frontend.Library

### 工具库：packages/utils

### 基本组件库：packages/components

### 公共库：packages/commons（包含下面四个库，同时下面四个也可独立安装）

#### 请求库：packages/request

#### Socket：packages/signalr

#### 国际化：packages/i18n

#### 路由：packages/router

### 封装第三方重量级组件库

#### heavies/vtable

#### heavies/vchart

### 封装第三方库的LCP组件库

#### heavies/vtable-lcp

#### heavies/vchart-lcp

### 业务组件库：business/\*\*

### Node 工具库：tools/\*\*

### 开发和发包

#### 1, 修改和开发对应包的文件

#### 2, 修改对应包里 package.json 的版本号

#### 3, pnpm run build:对应包

#### 4, pnpm --filter 对应包 publish 或 进入 cd .\packages\对应包 再 pnpm publish

[参考](https://github.com/scfido/pnpm-monorepo)

### 打包说明

#### 1，打包成 es 和 cjs 时，external 可排除 peerDependencies 和 dependencies 中的依赖（包括对依赖中的 css 引用）

#### 2，打包成 umd 时，external 可排除 peerDependencies 依赖，globals 要提供 peerDependencies 依赖的全局变量

#### 3，在用户使用 es 或 cjs 的时候，peerDependencies 和 dependencies 都会自动安装（peerDependencies 在 npm 3-6 版本不会自动安装，npm 7 之后默认安装），所以可以直接排除，但是 peerDependencies 需要用户自己再去安装，不然会有安装提示警告（如果设置了 peerDependenciesMeta optional 为 true，如果用户不自己安装，虽然不提示警告，但是也不会自动安装）

#### 4，在用户使用 umd 的时候，只需要提供 peerDependencies 内的 umd 包（全局变量）

#### 5，几种不同的打包结果最好分开放到文件夹内，如果不分开，名字最好不要一样，否则会覆盖，尤其 css 不要忽略了，umd 打出来的 css 和 es/cjs 打包出来的css因为排包不一致，结果也不一样的，不能直接覆盖
