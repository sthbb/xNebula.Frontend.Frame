# @xnebula/secs-viewer Secs标准组件

### 消息头组件

##### 使用方法

```
<template>
   <SecsViewerHeader ref="secsViewerHeader" :theme="theme" :code="headerCode" :edit="edit" @change="secsViewerHeaderChangeHandle"></SecsViewerHeader>
</template>

<script setup>
import { ref } from 'vue';
import “@xnebula/secs-viewer/dist/index.css”
import { SecsViewerHeader } from “@xnebula/secs-viewer”
const secsViewerHeader = ref(null)
const theme = ref('light');
const headerCode = ref('SEND D0 SSR_PPID_Scenario:S1F3 W [4026531841]');
const edit = ref(true);

// 获取修改以后的内容
const getCode = () => {
	return secsViewerHeader.value.getCode();
}

// 修改成功回调事件
const secsViewerHeaderChangeHandle = ({ type }) => {
  console.log(`secsViewerHeader ${type} 成功`);
};

</script>
```

##### API

###### Attributes

| 属性名 | 说明                    | 类型    | 默认值  |
| ------ | ----------------------- | ------- | ------- |
| theme  | 皮肤。('light'\|'dark') | string  | 'light' |
| code   | 消息头内容。            | string  | ''      |
| edit   | 是否开启编辑模式。      | boolean | false   |

###### Events

| 属性名 | 说明                     |
| ------ | ------------------------ |
| change | 内容修改成功的回调事件。 |

###### Exposes

| 属性名  | 说明             |
| ------- | ---------------- |
| getCode | 获取消息头内容。 |

### 消息体组件

##### 使用方法

```
<template>
   <SecsViewerBody ref="secsViewerBody" :theme="theme" :code="bodyCode" :edit="edit" :default-expand="false" @change="secsViewerBodyChangeHandle"></SecsViewerBody>
</template>

<script setup>
import { ref } from 'vue';
import “@xnebula/secs-viewer/dist/index.css”
import { SecsViewerBody } from “@xnebula/secs-viewer”
const secsViewerBody = ref(null)
const theme = ref('light');
const bodyCode = ref(`
<L 3 SVCOUNT
  <U2 [1] ProcessState '3007'>
  <U2 [1] PPExecName '3004'>
  <U2 [1] EquipmentMode '3030'>
`);
const edit = ref(true);

// 获取修改以后的内容
const getCode = () => {
	return secsViewerBody.value.getCode();
}

// 修改成功回调事件
const secsViewerBodyChangeHandle = ({ type }) => {
  console.log(`secsViewerBody ${type} 成功`);
};

</script>
```

##### API

###### Attributes

| 属性名         | 说明                    | 类型    | 默认值  |
| -------------- | ----------------------- | ------- | ------- |
| theme          | 皮肤。('light'\|'dark') | string  | 'light' |
| code           | 消息体内容。            | string  | ''      |
| edit           | 是否开启编辑模式。      | boolean | false   |
| default-expand | 默认折叠第一行代码。    | boolean | false   |

###### Events

| 属性名 | 说明                     |
| ------ | ------------------------ |
| change | 内容修改成功的回调事件。 |

###### Exposes

| 属性名  | 说明             |
| ------- | ---------------- |
| getCode | 获取消息体内容。 |
