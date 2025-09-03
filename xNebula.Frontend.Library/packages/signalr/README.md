# @xnebula/signalr

##### signalr消息推送服务的ts/js客户端

## 安装

```
pnpm install @xnebula/signalr
```

## 配置

```
import { createApp } from "vue";
import App from "./App.vue";
import {SignalR} from "@xnebula/signalr";

const app = createApp(App);
app.use(SignalR, {
    //默认为"/signalr/hubs"服务暴露出的地址
    url: "http://192.168.1.163:5032/signalr/hubs"
});
app.mount("#app");
```

## 使用

```
<script setup lang="ts">
import { onUnmounted, ref } from "vue";
import {SignalR} from "@xnebula/signalr";

//group
const groupName = ref("abc");
//methodName
const methodName = ref("def");

//channel信道
const channel = SignalR.useSignalRChannel();

//开始监听
const startListener = () => {
  channel.startServiceMonitorListener(groupName.value, methodName.value);
};

//停止监听
const stopListener = () => {
  channel.stopServiceMonitorListener(groupName.value, methodName.value);
};

//发送消息
const sendMessage = () => {
  try {
    //特别注意
    channel.sendMessage(groupName.value, methodName.value, "消息体1212321");
    //或
    channel.sendMessageEntity({groupName:groupName.value,methodName:methodName.value,body: "消息体1212321"})
  } catch (err) {
    console.error(err, "推送失败,请检查失败原因并重新推送");
  }
};

//设置回调
const doSomeThings = (message: string) => {
  console.log(message);
  //消息实体转换
  //这里可以使用消息实体转换函数
  const msg = channel.parse2MessageEntity(message);
  //或
  //插件消息实体转换
  const pMsg = channel.parse2PluginMessageEntity(message);
  ...
};

const onMethodCallBack = () => {
  //中止上次的订阅避免重复订阅
  //channel.off(methodName.value, doSomeThings);
  channel.off(methodName.value);
  channel.on(methodName.value, doSomeThings, false);
};


//特别注意此处要关闭监听,(否则会引发性能问题)
onUnmounted(()=>{
  stopListener();
  channel.off(methodName.value);
})

</script>

<template>
  <div class="test2">
    <button @click="startListener">开始监听</button>
    <button @click="stopListener">停止监听</button>
    <button @click="sendMessage">发送消息</button>
    <button @click="onMethodCallBack">设置回调</button>
  </div>
</template>
```

## 插件模式监听和使用

```
//插件模式监听和使用
//开始监听
const startListener = () => {
  channel.startPluginServiceMonitorListener("pName","gName","methodName");
};

//停止监听
const stopListener = () => {
  channel.stopPluginServiceMonitorListener("pName","gName","methodName");
};

//发送消息
const sendMessage = () => {
  try {
    channel.sendPluginMessage("pName", "gName", "methodName", "消息体1212321");
    //或
    channel.sendPluginMessageEntity({
      pName: "pName",
      gName: "gName",
      methodName: "methodName",
      body: "body",
    });
  } catch (err) {
    console.error(err, "推送失败,请检查失败原因并重新推送");
  }
};
```

## 消息实体转换

```
  //消息实体转换
  const msg = channel.parse2MessageEntity(message);
  console.log(msg.groupName, "groupName");
  console.log(msg.methodName, "methodName");
  console.log(msg.body, "body");
  //或
  //插件消息实体转换
  const pMsg = channel.parse2PluginMessageEntity(message);
  console.log(pMsg.pName, "pName");
  console.log(pMsg.gName, "gName");
  console.log(pMsg.methodName, "methodName");
  console.log(pMsg.body, "body");
```

## 注意

页面销毁时,除非有意如此,否则建议应尽量使用以下代码关闭消息监听以避免引发性能问题

```
//特别注意此处要关闭监听,(否则会引发性能问题)
onUnmounted(()=>{
  channel.stopServiceMonitorListener(groupName.value, methodName.value);
  channel.off(methodName.value);
})
//或
//插件模式
onUnmounted(()=>{
  channel.stopPluginServiceMonitorListener("pName","gName","methodName");
  channel.off("methodName");
})
```

## umd方式引入

```
//若需将项目编译为umd格式的dist则需要进行以下配置

vite.config.js
    //打包配置
    build: {
    sourcemap: true, // 输出.map文件
    ...
    rollupOptions: {
      ...
      // 确保外部化处理那些你不想打包进库的依赖
      external: ["vue", "@xnebula/signalr"],
      output: [
        {
          // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
          format: "umd",
          ...
          globals: {
            vue: "Vue",
            "@xnebula/signalr":"signalrclient"
          },
        },
      ],
    },
  }
```

```
<!--引入vue-->
<script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
<!--引入signalr-->
<script src="unpkg/@xnebula/signalr/index_umd.js"/></script>
<!--打包出的js文件-->
<script src="xxx.bundle.js"></script>
或直接
<script>
   const {SignalR}  = window.xNebula.signalrclient;
   ......
</script>
```

## es6 bundle 排除

```
html

    <script type="importmap">
      {
        "imports": {
          "vue": "https://unpkg.com/vue@3/dist/vue.esm-browser.js",
          "@xnebula/signalr": "./@xnebula/signalr/index.mjs"
        }
      }
    </script>
 ...
```

```
vite.config.js
  // 打包配置
  build: {
    sourcemap: true, // 输出.map文件
    rollupOptions: {
      // 确保外部化处理那些你不想打包进库的依赖
      external: ["vue", "@xnebula/signalr"]
    },
  },
```
