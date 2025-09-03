<!--
 * @Author: Huangjs
 * @Date: 2024-07-15 10:06:41
 * @LastEditors: Huangjs
 * @LastEditTime: 2024-07-17 13:37:02
 * @Description: ******
-->

# 插件开发模板使用说明

- [插件开发模板使用说明](#插件开发模板使用说明)
  - [模板使用](#模板使用)
  - [目录结构](#目录结构)
  - [./package.json 配置说明](#packagejson-配置说明)
  - [./build.config.ts 配置说明](#buildconfigts-配置说明)
  - [@xnebula/frame 使用说明](#xnebulaframe-使用说明)
  - [@xnebula/build](#xnebulabuild)
  - [@lcp/xxx 使用说明](#lcpxxx-使用说明)
  - [注意事项](#注意事项)

## 模板使用

1. pnpm \ npm \ yarn 仍选其一
2. 安装: pnpm install \ npm install \ yarn install
3. 开发: pnpm run dev \ npm run dev \ yarn run dev
4. 构建: pnpm run build \ npm run build \ yarn run build

## 目录结构

```javascript
xNebula.Plugins.XXX.UI
    |   .editorconfig // 编辑器配置文件（主要是为了开发插件代码风格保持一致）, 开发时无需关注
    |   .eslintignore // eslint 验证忽略配置文件, 开发时无需关注
    |   .eslintrc.json // eslint 配置文件（校验代码用的）, 开发时无需关注, 如果需要校验, 运行: pnpm run lint / npm run lint / yarn run lint
    |   .npmrc // npm 代理地址配置, 主要是把 @xnebula 或 @lcp 开头的包代理到内部 npm 地址, 开发时无需关注
    |   .prettierignore // 代码美化忽略配置文件, 开发时无需关注
    |   .prettierrc.json // 代码美化配置文件（代码美化用的）, 开发时无需关注, 如果需要美化代码, 运行: pnpm run beautify / npm run beautify / yarn run beautify
    |   build.config.ts // 打包配置文件, 与 vite 打包配置文件类似, 下面会再详细解释
    |   build.bat // 插件 一键打包 命令执行文件, 后端一键打包的时候会读取该文件进行打包, 不用动它
    |   env.d.ts // ts 声明文件（js 不需要）
    |   index.html // 开发环境启动时的页面
    |   package.json  // 项目包配置
    |   README.md // 插件模板说明文件
    |   tsconfig.app.json // ts app 配置文件（js 不需要）
    |   tsconfig.json // ts 配置入口文件（js 不需要）
    |   tsconfig.node.json // ts node 代码配置文件（js 不需要）
    |
    \---src // 代码源文件目录
        |   main.ts // 开发环境的启动文件, 就是 index.html 内的入口 ts 文件
        |   setup.ts // 插件在 Vue 挂载之前必须初始化的逻辑部分（该文件会被单独打包成 __setup__, 并且壳运行的时候提前加载, 如不需要请删除该文件）
        |
        +---common // 插件开发时多个页面的公共组件, 方法, 逻辑等, 当然你也可以使用其它名称, 其他文件夹, 只要引入正确即可, 但是值得注意的是: 只有真正每个页面都用到的方法才建议提取出出来放在这里如果是某个页面独有的东西请放到对应的 pages/页面/  下不要放在这里, 否则, 只要你在页面里引入了, 你的页面就会把它打包进去, 徒增打包后页面文件大小
        |       index.ts // common 导出的出口
        |       message.ts // 弹出层的一些导出
        |       plgName.ts // 插件名称的导出
        |       translate.ts // i18n 翻译的导出（LCP 模板不需要）
        |
        +---locales // 插件自己管理自己的本地化语言
        |       index.ts // locales 导出的出口
        |       en-US.ts // 英文翻译
        |       ko-KR.ts // 韩文翻译
        |       zh-CN.ts // 中文翻译
        |
        +---pages // 插件的每个页面（模块）的目录（页面可以建立分类目录）
        |   |   index.ts  // 页面（模块）加载之前有一些需要初始化的逻辑运行的放在该这里（比如LCP的一些自定义部件的注册）, 有点类似 setup.ts, 不同之处在于, 只有当该插件任意一个页面（模块）加载时, 才会提前加载这个, 这个文件会被单独打包成 __common__, 目前这个用于多语言文件加载和自定义组件加载
        |   |
        |   +---table // 插件的 table 页面（lcp 模块）文件夹
        |   |   |   index.ts // 该文件会成为该页面（模块）的打包入口文件, 在这里导出你的组件或者返回一个组件的函数（异步函数）
        |   |   |
        |   |   \---views  // table 页面（模块）的 lcp 开发文件
        |   |
        |   \---text // 插件的 text 页面（模块）文件夹
        |       |   index.ts // 该文件会成为该页面（模块）的打包入口文件, 在这里导出你的组件或者返回一个组件的函数（异步函数）
        |       |
        |       +---api // text 页面（模块）开发时的接口调用, 具体可参考模版内的文件, 当然你也可以使用其它名称, 其他文件夹, 只要引入正确即可
        |       |
        |       \---views // text 页面（模块）的 vue 开发文件
        |
        \---widgets // 如果插件页面（模块）是 LCP 开发, 这里就是你开发的 LCP 自定义部件库
            |   index.ts // 这里导出你自定义部件库的注册安装逻辑, 注意, 注册的自定义部件名称最好使用 插件名称-部件名称 , 防止不同种插件之间注册的名称相同导致覆盖, 具体可参考模版内的文件
            |
            +---form // form 自定义部件库, 详细参考 LCP 自定义部件开发
            |   |   Definition.ts // form 部件库的定义信息
            |   |   index.ts // form 部件库的入口文件
            |   |
            |   \---src  // form 部件库的源码文件夹
            |
            \---table // table 自定义部件库
                |   Definition.ts // table 部件库的定义信息
                |   index.ts // table 部件库的入口文件
                |
                +---api // table 部件库的接口调用
                |
                \---src // table 部件库的源码文件夹

```

## ./package.json 配置说明

```json
{
  // 插件的名称（如果你不知道自己开发的插件名称是啥, 请看你的目录名称: xNebula.Plugins.XXX.UI, 这个 XXX 就是插件名称）, 如果有大写字母, 请用 "-"（因为 package.json 的 name 不建议用大写字母）, 比如, 插件名称叫 HelloWorld, 此处请填写: hellow-world, 插件名称叫做 EQP, 此处填写: e-q-p
  "name": "plugin-tpl",
  // 开发模式下, 代理到本地服务, 同时本地既没有配置 Portal插件, 也没有配置 Sso 插件, 此时此处设置一个正确的 token 可实现自动登录
  "token": "please set a valid token...",
  "private": true,
  "type": "module",
  "scripts": {
    // 开发命令
    "dev": "xbuild dev",
    // 打包命令
    "build": "xbuild build",
    // 校验 ts 文件
    "type": "vue-tsc --build --force",
    // 代码校验命令（可在开发的时候执行该命令检查自己的代码是否有问题, 报 error 的最好修改一下）
    "lint": "eslint ./**/*.{js,jsx,ts,tsx,vue} --fix",
    // 代码美化命令
    "beautify": "prettier ./**/*.{js,jsx,ts,tsx,vue,css,scss,json,html} --write"
  },
  "dependencies": {
    // 这里安装你插件的依赖包
    // 可先在 下面的 @xnebula/frame 使用说明 里查一查是否存在, 如存在, 可直接使用, 比如 echarts, 就不需要安装如果不存在, 再去安装对应 注意 7
  },
  "devDependencies": {
    // lcp 的渲染器（如果你的插件不是LCP开发, 则可删除, 无需安装）
    "@lcp/xrenderer": "^1",
    // lcp 的部件库（如果你的插件不是LCP开发, 则可删除, 无需安装）
    "@lcp/xwidgets": "^1",
    "@types/node": "~20.14.5",
    "@vue/eslint-config-typescript": "~13.0.0",
    // 插件打包工具
    "@xnebula/build": "^1",
    // 插件的 Frame
    "@xnebula/frame": "^1",
    "eslint": "~8.57.0",
    "eslint-config-prettier": "~9.1.0",
    "eslint-plugin-prettier": "~5.2.1",
    "eslint-plugin-vue": "~9.27.0",
    "prettier": "~3.3.3",
    "sass": "~1.77.8",
    "typescript": "~5.5.4",
    "vue": "~3.4.32",
    "vue-tsc": "~2.0.29"
  }
}
```

## ./build.config.ts 配置说明

```javascript
// build.config.ts 的配置和 vite（https://cn.vitejs.dev/guide/） 打包的配置几乎一样, 只是加了一些配置
{
  // 顶层加了一个 entry 配置, 这个配置非必要不需要加进去, 直接用默认的就可以, 模板就是用的默认的
  entry: {
    pluginName:
      '插件的名称（如果你不知道自己开发的插件名称是啥, 请看你的目录名称: xNebula.Plugins.XXX.UI, 这个 XXX 就是插件名称）, 比如, 插件名称叫 HelloWorld, 此处请填写: hellow-world, 插件名称叫做 EQP, 此处填写: e-q-p插件名称, 同 package.json 里的 name, 两个配一个即可, 不同之处在于这里可以直接写大写, 比如 HelloWorld, EQP, 直接设置即可',
    customToken: '有效的token, 同 package.json 里的 token, 两个配一个即可',
    pagesDir: '插件页面的路径, 默认是 ./src/pages/',
    // eg:['abc','def/*','ijk/**/*']
    // pages/abc不参与打包, pages/def/ 下的子页面不参与打包, pages/ijk/ 下的子孙页面不参与打包
    exclude:'传入匹配模式字符串, 或者正则, 或者正则和匹配模式字符串的数组, pages下的文件被此处匹配到的文件夹, 则不参与打包和开发',
    // eg:['abc','def/*','ijk/**/*']
    // 只有 pages/abc 参与打包, 只有 pages/def/ 下的子页面参与打包, 只有 pages/ijk/ 下的子孙页面参与打包
    include:'传入匹配模式字符串, 或者正则, 或者正则和匹配模式字符串的数组, pages下的文件被此处匹配到的文件夹, 参与打包和开发',
    setupFile: 'setup 的路径, 默认是 ./src/setup.ts',
    localeFile: '本地化语言文件路径入口, 主要是为了生成 json 给后端使用, 默认是 ./src/locales/',
  },
  // 同 vite 配置的 resolve
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // 同 vite 配置的 server, 但是加了 proxyServer 和 proxyData 两项
  server: {
    // 这里提供一个代理服务器, 可以是已经部署好的服务, 也可以是本地服务
    // 关于代理 proxyServer, 配置的几个情况:
    /* 一: 代理指向本地服务:
    1, 本地配置了 portal（装了该插件, 必须安装 sys 和 ouath 插件, 这三个是相互依赖的插件）:
      插件会使用 portal 登录页面登录, 登录时会自动把 pages 下的页面, 作为菜单插入登录结果里
    2, 本地配置了 sso :
      sso 配置文件里, 必须配置 loginUrl 指向一个有 portal 插件的系统（可能在线上）, 同时, 有 portal 插件的系统要在其 门户 - 客户端管理 里配置本地系统
      插件会使用 sso 登录, 登录时会自动把 pages 下的页面, 作为菜单插入登录结果里
    3, 本地两种都未配置:
      插件会自动登录, 并登录时会自动把 pages 下的页面, 作为菜单插入登录结果里, 但需要配置有效的 token
    二, 代理指向线上服务:
    1, 线上服务配置了 portal 插件:
      插件会使用线上 portal 登录页面登录, 登录时会自动把 pages 下的页面, 作为菜单插入登录结果里
    2, 线上服务配置了 sso 插件:
      线上必然会有个装有 portal 插件的系统与该系统进行了关联配置
      插件会使用线上 sso 登录, 登录时会自动把 pages 下的页面, 作为菜单插入登录结果里 */
    // proxyServer 配置好后, 实际是对 /api 开头的接口做了一个代理, 如无特殊情况, 无需再在 proxy 里配置 '/api': {}
    proxyServer: 'http://10.1.20.82:8001',
    proxy: {
      // 这里可以书写自己开发的特定接口（以 /api/xxx 开头的）代理到特定的服务, xxx 就是你的接口插件部分, 对应 注意 5
      '/api/xxx': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
    // 这里可以针对一些接口配置返回数据, 比如下面的接口, 可以返回自己的数据
    proxyData: {
      // 直接设置一个数据结构, 那么该接口直接被拦截, 返回你设置的数据结构（不会访问服务器了）
      '/api/xxx': {
        // headers: {}, // 可设置响应头, 比如返回一个字符串数据而不是 json, 可配置 Content-Type 为 'application/text'
        // proxy: '', // 设置一个独立的 url, 没有的话就默认用 proxyServer
        // hack: false, // 是否劫持数据
        data: { // 代理后实际返回的数据, 可以是一个对象或函数
          msg: 'success',
          code: 2000,
          data: { 'xxx': 'something' },
        },
      },
      // 此种设置会先访问代理服务器数据, 然后自定义篡改, 再返回给你
      '/api/xxx': () => {
        return {
          // headers: {}, // 同上
          // proxy: '', // 同上
          hack: true, // 明确指明要劫持数据
          data: (source) => {
            // 这里做一些不需要篡改数据的判断直接返回
            if (!source) {
              return source;
            }
            // 这里可以对返回的数据进行篡改, 然后返回给你
            const _source = source;
            // 返回修改后的数据
            return { ..._source };
          },
        };
      },
    },
  },
  // 同 vite 配置
  build: {
    // minify: false,
  },
  // 其它配置同 vite 配置
};
```

## @xnebula/frame 使用说明

```javascript
import { start } from '@xnebula/frame';
// 开发环境下, 启动 Frame 并传入根元素, 第二个参数是传入开发的插件页面（模块）
// 这个直接按模板的来就行了, 不需要做什么修改
start('#app', getPages());
```

```javascript
import { Exposed } from '@xnebula/frame';

const {
  accessKeys,
  getFixedPath,
  getConfig, // 获取配置信息
  getDependencies, // 获取 Frame 里 可以懒加载的资源
  loadDependencies, // 加载 Frame 里引入的依赖
  loadPlugin, // 加载插件
  getModules, // 获取全部插件列表及对应的 js 和 css 地址
  getVueApp, // 获取 vue 的 app 对象
  getUser, // 获用户信息
  i18n,
  route,
  router,
  version, // @xnebula/frame 的版本号
} = Exposed;
const {
  ACCESS_TOKEN, // localStorage 里 token 的 Key
  ACCESS_USER, // localStorage 里 user 的 Key
} = accessKeys;
const {
  portal, // Portal 门户页面的路由
  login, // Login 页面的路由
  main, // Home 页面路由
  plugin, // 插件管理路由
  theme, // 主题配置路由
  param, // 参数配置路由
} = getFixedPath();
const {
  title, // 网页 title
  favUrl, // 系统 icon 的 url
  mtitle, // 系统标题
  version, // Frame.dll 的版本号
  logoUrl, // 系统 logo 的 url
  docUrl, // 系统说明文档的 url
  isSso, // 系统是否是 Sso 登录（安装 Sso 插件的）
  isPortal, // 系统是否是 Portal 登录（安装 Portal 插件的）
  useLCP, // 系统是否加载了 LCP
  portalUrl, // 如果是 Sso 登录, Sso 配置的 Portal Url
  cdnUrl, // cdn 地址
  minioUrl, // minio 地址
  signalrUrl, // signalr 地址
  appKey, // appKey
} = getConfig();
// 加载插件（一般需要在一个插件中加载另一个插件的时候使用）
// 由于 monaco-editor 懒加载 amd 问题, 多次调用最好使用串行, 不要并行
const plugin = await loadPlugin('PluginTpl_table');
// 懒加载 echarts, 可以是数组, 加载多个, 数组顺序是依赖之间的依赖顺序
// 如果 Frame 里没有, 可以加载自定义地址
// 加载 Frame 里的开发环境不需要安装依赖, 直接从 Frame 里取出（ monaco-editor 除外）
await loadDependencies('echarts');
const {
  userId, // 用户 ID
  userName, // 用户名
  origin, // 登录后写在 localStorage 里的 user 的原始信息, 请查看登录后的 localStorage
} = getUser();
const {
  t, // 翻译函数
  locale, // 当前语言
  switchLocale, // 切换语言
  localeList, // 当前可切换的语言列表
  mergeLocaleMessage, // 合并语言字典
} = i18n(); // 获取 i18n
console.log(t('PluginTpl.customKey')); // 比如, 此处输出: 自定义
const currentRoute = route(); // 当前路由的对象
const currentRouter = router(); // 获取当前路由对象, 用作跳转
currentRouter.push('/'); // 比如, 此处跳转到首页
```

```javascript
import { Echarts, XCommons, XComponents, XUtils } from '@xnebula/frame';
// Echarts echarts（参考: https://echarts.apache.org/handbook/zh/get-started/）, 无需安装 echarts, 直接 frame 里取
// XCommons 下面是可能会用到的几个, 详细见 @xnebula/commons
const {
  request, // 发起请求的方法, 具体可查看模板 api 文件夹下的示例
  axios, // axios@1.7.2, 如果需要定制化请求, 可使用这个重新创建请求实例（参考: http://www.axios-js.com/）, 无需安装 axios, 直接这里取
  signalr, // @xnebula/signalr, 无需安装 @xnebula/signalr 或 @xnebula/signalrclient, 直接这里取
  SignalR, // 就是 signalr.SignalR
  vueI18n, // vue-i18n@9.13.1（参考: https://vue-i18n.intlify.dev/）, 无需安装 vue-i18n, 直接这里取
  vueRouter, // vue-router@4.3.3（参考: https://router.vuejs.org/zh/）, 无需安装 vue-router, 直接这里取
} = XCommons;
// XComponents 下面是可能会用到的几个,  详细见 @xnebula/components
const {
  ElementPlus, // element-plus@2.7.5 （参考: https://s-test.belle.cn/zh-CN/）, 无需安装 element-plus, 直接这里取
  ElementPlusIcons, // @element-plus/icons-vue@2.3.1（参考: https://unpkg.com/browse/@element-plus/icons-vue@latest/dist/es/）, 无需安装 @element-plus/icons-vue, 直接这里取
  VXETable, // vxe-table@4.6.17（参考: https://vxetable.cn/v4.6/#/table/start/install）, 无需安装 vxe-table, 直接这里取
  XEUtils, // xe-utils@3.5.24（参考: https://vxetable.cn/xe-utils/）, 无需安装 xe-utils, 直接这里取
} = XComponents;
const { ElButton, ElTable, ElMessage, ElNotification, Loading } = ElementPlus;
const { Bell, Close, Search, Delete } = ElementPlusIcons;
const { Button, Table, Tooltip } = VXETable;
const { isString, isArray } = XEUtils;
VXETable.modal({});
// XUtils 详细见 @xnebula/utils
const {
  loadScript, // 动态加载 umd 的 js
  loadStyle, // 动态加载 css
  storage, // 处理 localStorage
  uuid, // uuid, 无需安装 uuid, 直接这里取
  withInstal, //  给开发的 vue 组件加上安装方法（注册到全局）
} = XUtils;
```

## @xnebula/build

该包是开发构建工具, 只在 build.config.ts 中使用, 无需关注

## @lcp/xxx 使用说明

LCP 的相关包使用说明, 请参考 LCP 的相关文档, 具体咨询 LCP 开发者

## 注意事项

1. 插件必须使用 Vue3 开发, 建议使用 Vue3 组合式开发
2. 如果长期无法连接公司内部 npm 服务器, 建议使用 npm 或 yarn 开发, 主要为了方便拷贝 node_modules
3. ./setup.ts 和 ./src/pages/index.ts 真正用到的时候才去创建开发, 没用到请一定删除
4. 自定义部件库注册的时候名称最好带上插件名, 防止不同种插件之间注册的名称相同导致覆盖（参考模板示例文件）
5. 后端开发的接口, 比如: /api/xxx/yyy/zzz 紧跟着 /api 的 /xxx 最好用插名称, 方便你的定向代理（只是建议）
6. 开发之前请阅读下开发模板里的文件及其注释, 需要注意的都写在里面, 有助于开发
7. 开发中使用到的依赖包, 大家可先在上述的 @xnebula/frame 说明 查一查是否存在, 若存在, 直接按照上述方式取用, 无需安装, 若不存再, 酌情考虑去安装: 比如, 如果使用到的依赖包在多个插件都用到了, 可提上来, @xnebula/frame 会考虑加进去, 并统一版本
8. 建议大家不要使用 @lcp/common , @lcp/components 包, 尽量在 @xnebula/frame 里取用, 如果 @xnebula/frame 没有, 可根据情况使用另外, 建议大家尽量使用 element-plus 组件库, 非必要, 不使用 vxe-table, xe-utils
9. build.config.ts 按照默认配置即可, 非必要, 不需要配置太多东西, @xnebula/frame 和 @lcp/xxx 的包也都默认排掉了, 也不需要重复去配置排包
10. pages 下面的文件夹分为两种, 第一种, 直接是页面目录, 该目录内部必须包含一个 index.ts 作为打包入口, 该目录名称就是你页面的名称, 比如你的视图地址（就是菜单管理中配置的 视图地址） 是 Sys/menu/Index, 那么 Sys 就是你的插件名（配置在 package.json 里的 name: sys(需要小写, 会自动首字母大写)）, menu 就是你的页面名称, 所以 pages 下面的文件夹的名称就是 menu（区分大小写）, 同时打包的文件就是: dist/menu/index.umd.js, 同时会自动设置页面路由是 Sys_menu, 多语言 key 是 Sys.Sys_menu第二种, 是多个页面的分类目录, 该目录下只有子目录, 不应该有 index.ts , 其目录内可以根据功能把一些页面集中放在这个目录里, 便于开发管理, 当然可以继续嵌套分类, 当有分类时, 目录的名称和内部实际页面目录的名称会按照驼峰式连接在一起成为最终打包出来的页面名称比如, 上面的页面的路径是: /pages/abc/menu, 那么, abcMenu 就是你的实际页面名称, 你的视图地址（就是菜单管理中配置的 视图地址） 是 Sys/abcMenu/Index, 打包的文件就是: dist/abcMenu/index.umd.js, 同时会自动设置页面路由是 Sys_abcMenu, 多语言 key 是 Sys.Sys_abcMenu
11. pages 下面的文件夹下有变动, 请先清空 localStorage 再运行, 否则拿不到最新菜单信息
12. LCP 插件开发者, 开发完在线上使用的时候, 注意要加载 LCP.Extend 资源, 否则无法运行 LCP
