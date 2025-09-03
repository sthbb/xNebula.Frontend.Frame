# xnebula公共组件

`./src/components`目录中存放的是公共组件，原则上一个目录对应一个组件

| 目录                                | 组件名称            |
| ----------------------------------- | ------------------- |
| ./src/components/UploadFile         | minio单文件上传组件 |
| ./src/components/UploadImage        | minio单图片上传组件 |
| ./src/components/UploadMultipleFile | minio多文件上传组件 |

Minio系列上传组件的使用方式可以参照`./src/pages/debug.vue`页面中的代码，简而言之，只需要给组件提供minioData数据就可以使用相关插件，代码如下：

```
<template>
  <!-- 单个文件上传 -->
  <UploadFile :minio-data="minioData" :minio-api="minioApi" @uploading="uploadingHandle" @success="successHandle" @pause="pauseHandle" @resume="resumeHandle" @delete="deleteHandle" @download="downloadHandle"/>
  <!-- 单个图片上传 -->
  <UploadImage :minio-data="minioData" :minio-api="minioApi" :minio-src="minioSrc" @uploading="uploadingHandle" @success="successHandle" @pause="pauseHandle" @resume="resumeHandle" @delete="deleteHandle" @download="downloadHandle" />
  <!-- 多个文件上传 -->
  <el-button type="success" @click="dialogToggleHandle">
    <el-icon color="#fff" size="16px"><Upload /></el-icon>
    MinIO上传
  </el-button>
  <UploadMultipleFile ref="uploadMultipleFile" :minio-data="minioData" :minio-api="minioApi" @beforeClose="beforeCloseHandle"/>
</template>

<script setup>
import { ref } from "vue";
import { Upload } from "@element-plus/icons-vue";
import "@xnebula/components/index.css";
import { UploadFile, UploadImage, UploadMultipleFile } from "@xnebula/components";
const minioSrc = ref("http://192.168.1.169:9000/pugin-doc/favicon.ico");
const uploadMultipleFile = ref(null);
// 注意对象中key的大小写不要弄错
const minioData = ref({
  id: "3a10704a-4abe-f26f-ee94-b4356f22657d",
  bucket: "xulutest1",
  path: "",
});

// 【可选】配置minio相关接口地址，不配置使用默认接口地址
const minioApi = ref({
  // 获取分片接口
  preUploadUrl: "/Minio/Client/GetPreUploadUrl",
  // 合并分片接口
  completeUploadUrl: "/Minio/Client/CompleteUploadFile",
  // 删除文件接口
  deleteUrl: "/Minio/Client/DeleteObject",
  // 下载接口
  downloadUrl: "/Minio/Client/GetObject",
});

// 关闭弹层触发的回调事件
const beforeCloseHandle = () => {
  console.log("before-close");
};

// 上传中回调
const uploadingHandle = ({ file }) => {
  console.log('uploading');
};

// 上传成功以后返回minio文件地址
const successHandle = (url) => {
  console.log(url);
};

// 暂停回调
const pauseHandle = () => {};

// 继续回调
const resumeHandle = () => {};

// 删除回调
const deleteHandle = () => {};

// 下载回调
const downloadHandle = () => {};

// 多个文件上传
const dialogToggleHandle = () => {
  uploadMultipleFile.value.dialogToggleHandle();
};
</script>
```
