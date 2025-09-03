<template>
  <div>
    <div>单个文件上传</div>
    <div>
      <UploadFile
        :minio-data="minioData"
        :minio-api="minioApi"
        @uploading="uploadingHandle"
        @success="successHandle"
        @pause="pauseHandle"
        @resume="resumeHandle"
        @delete="deleteHandle"
        @download="downloadHandle" />
    </div>
    <div>单个图片上传</div>
    <div>
      <UploadImage
        :minio-data="minioData"
        :minio-api="minioApi"
        :minio-src="minioSrc"
        @uploading="uploadingHandle"
        @success="successHandle"
        @pause="pauseHandle"
        @resume="resumeHandle"
        @delete="deleteHandle"
        @download="downloadHandle" />
    </div>
    <div>多个文件上传</div>
    <div>
      <el-button type="success" @click="dialogToggleHandle">
        <el-icon color="#fff" size="16px"><Upload /></el-icon>
        MinIO上传
      </el-button>
      <UploadMultipleFile
        ref="uploadMultipleFile"
        :minio-data="minioData"
        :minio-api="minioApi"
        @beforeClose="beforeCloseHandle" />
    </div>
  </div>
</template>

<script setup name="Debug">
import { ref } from 'vue';
import { Upload } from '@element-plus/icons-vue';
import { UploadFile, UploadImage, UploadMultipleFile } from '@/components';
const uploadMultipleFile = ref(null);
const minioSrc = ref('http://192.168.1.169:9000/pugin-doc/favicon.ico');
const minioData = ref({
  // id: "3a10704a-4abe-f26f-ee94-b4356f22657d",
  // bucket: "dcc",
  // bucket: "pugin-doc",
  bucket: 'xbigscreen',
  path: '',
});
const minioApi = ref({
  // // 获取分片接口
  // preUploadUrl: "/Minio/Client/GetPreUploadUrl",
  // // 合并分片接口
  // completeUploadUrl: "/Minio/Client/CompleteUploadFile",
  // // 删除文件接口
  // deleteUrl: "/Minio/Client/DeleteObject",
  // // 下载接口
  // downloadUrl: "/Minio/Client/GetObject",
  // // 获取文件地址接口
  // getFileUrl: "/Minio/Client/getFileUrl",
  // 获取分片接口
  preUploadUrl: '/XBigScreen/ImageMangement/GetPreUploadUrl',
  // 合并分片接口
  completeUploadUrl: '/XBigScreen/ImageMangement/CompleteUploadFile',
  // 删除文件接口
  deleteUrl: '/XBigScreen/ImageMangement/DeleteObject',
  // 下载接口
  downloadUrl: '/XBigScreen/ImageMangement/GetObject',
  // 获取文件地址接口
  getFileUrl: '/XBigScreen/ImageMangement/getFileUrl',
});

// 关闭弹层触发的回调事件
const beforeCloseHandle = () => {
  console.log('before-close');
};

// 上传中回调
const uploadingHandle = () => {
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
let i = 0;
const dialogToggleHandle = () => {
  if (i % 2 === 0) {
    minioData.value.path = '';
  } else {
    minioData.value.path = 'ISOFile';
  }
  ++i;
  uploadMultipleFile.value.dialogToggleHandle();
};
</script>
