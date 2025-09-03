<template>
  <div class="minio-upload-image">
    <!-- 选择文件 -->
    <!-- {{ minioTaskQueue.live }}
    {{ minioTaskQueue.queue.length }} -->
    <div class="minio-upload-area" v-if="!minioSrc">
      <div
        :class="[
          'minio-choose',
          {
            'minio-choose--error': fileTypeError,
          },
        ]"
        v-if="minioTaskQueue.live === 0 && minioTaskQueue.queue.length === 0">
        <label :for="id">
          <el-icon size="20" color="#8c939d"><Plus /></el-icon>
        </label>
        <input
          type="file"
          :id="id"
          :accept="accept.join(',')"
          @change="chooseFileHandle"
          style="display: none" />
      </div>
      <div
        class="minio-process"
        v-if="
          (minioTaskQueue.live === 0 &&
            minioTaskQueue.isPaused() &&
            minioTaskQueue.queue.length === 1) ||
          (minioTaskQueue.live === 1 && minioTaskQueue.queue.length === 1)
        ">
        <div
          :title="`${minioFile.uploadSpeed}M/s`"
          :class="[
            'minio-process-bar',
            {
              'minio-process-bar--paused': minioTaskQueue.isPaused(),
            },
          ]"
          v-for="(minioFile, index) in minioTaskQueue.queue"
          :key="index"
          :style="`width:${minioFile.uploadProgress}%`"></div>
        <div class="minio-process-button">
          <div
            v-if="!minioTaskQueue.isPaused()"
            class="minio-process-button--pause">
            <el-icon size="24" color="#333" @click="pauseHandle">
              <VideoPause />
            </el-icon>
          </div>
          <div
            v-if="minioTaskQueue.isPaused()"
            class="minio-process-button--resume">
            <el-icon size="24" color="#333" @click="resumeHandle">
              <VideoPlay />
            </el-icon>
          </div>
          <div class="minio-process-button--delete">
            <el-icon size="24" color="#f56c6c" @click="deleteLocalHandle">
              <Delete />
            </el-icon>
          </div>
        </div>
      </div>
      <div
        class="minio-finish"
        v-if="
          minioTaskQueue.live === 0 &&
          minioTaskQueue.queue.length === 1 &&
          !minioTaskQueue.isPaused()
        ">
        <div class="minio-image-container">
          <div class="minio-image-box">
            <img :src="imageBase64" />
          </div>
          <div class="minio-image-action">
            <div>
              <el-icon size="24" color="#fff" @click="downloadHandle"
                ><Download
              /></el-icon>
            </div>
            <div>
              <el-icon size="24" color="#fff" @click="viewToggleHandle"
                ><View
              /></el-icon>
            </div>
            <div>
              <el-icon size="24" color="#fff" @click="deleteHandle"
                ><Delete
              /></el-icon>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="minio-image-container">
      <div class="minio-image-box">
        <img :src="minioSrc" />
      </div>
      <div class="minio-image-action">
        <div>
          <el-icon size="24" color="#fff" @click="downloadLocalHandle"
            ><Download
          /></el-icon>
        </div>
        <div>
          <el-icon size="24" color="#fff" @click="viewToggleHandle"
            ><View
          /></el-icon>
        </div>
        <div>
          <el-icon size="24" color="#fff" @click="switchImageHandle"
            ><Delete
          /></el-icon>
        </div>
        <div>
          <el-icon size="24" color="#fff" @click="fileChangeHandle"
            ><Upload
          /></el-icon>
        </div>
      </div>
    </div>
    <div
      :class="[
        'minio-upload-image-mask',
        {
          'minio-upload-image-mask--show': show,
        },
      ]">
      <div class="minio-upload-image-view">
        <img :src="imageBase64 || minioSrc" />
      </div>
      <div class="minio-upload-image-view-close">
        <el-icon size="24" color="#fff" @click="viewToggleHandle">
          <Close />
        </el-icon>
      </div>
    </div>
  </div>
</template>

<script setup name="UploadImage">
import { MinioTaskQueue } from '@/utils/minio';
import { ElIcon } from 'element-plus';
import { getFileUrl } from '@/utils/minio/api';
import {
  Plus,
  VideoPause,
  VideoPlay,
  View,
  Download,
  Delete,
  Close,
  Upload,
} from '@element-plus/icons-vue';
import { ref, watch } from 'vue';
const props = defineProps({
  minioData: {
    type: Object,
    default: () => {
      return null;
    },
  },
  minioApi: {
    type: Object,
    default: () => {
      return {};
    },
  },
  minioSrc: {
    type: String,
    default: () => {
      return '';
    },
  },
});
// 支持事件
const emit = defineEmits([
  'success',
  'pause',
  'resume',
  'delete',
  'download',
  'error',
]);
const id = ref(`uploadImage_${Math.random().toString().slice(-6)}`);
const minioTaskQueue = ref(new MinioTaskQueue());
const show = ref(false);
const accept = ref(['.jpeg', '.jpg', '.png', '.gif', '.ico']);
const fileTypeError = ref(false);
const imageBase64 = ref(null);
const minioSrc = ref(props.minioSrc);
const chooseFile = ref(null);

// 成功以后的回调
const finishHandle = () => {
  const { getFileUrl: url } = minioTaskQueue.value.minioApi;
  const { bucket, path = '' } = minioTaskQueue.value.minioData;
  const file =
    minioTaskQueue.value.queue.length === 1
      ? minioTaskQueue.value.queue[0]
      : null;

  if (file) {
    const fileName = file.file.name;
    const ObjectNameArr = [];
    if (path) {
      ObjectNameArr.push(path);
    }
    ObjectNameArr.push(fileName);
    console.log({
      bucket,
      path:
        ObjectNameArr.length === 1
          ? ObjectNameArr.join('')
          : ObjectNameArr.join('/'),
    });
    if (url) {
      getFileUrl(url, {
        bucket,
        path:
          ObjectNameArr.length === 1
            ? ObjectNameArr.join('')
            : ObjectNameArr.join('/'),
      })
        .then((_url) => {
          emit('success', _url);
        })
        .catch((err) => {
          console.log('成功以后获取文件url失败', err);
        });
    }
  }
};

const minioErrorHandle = (err) => {
  emit('error', err);
};

minioTaskQueue.value.finishHandle = finishHandle;

minioTaskQueue.value.minioErrorHandle = minioErrorHandle;

// 文件选择
const chooseFileHandle = (e) => {
  chooseFile.value = e;
  const file = e.target.files.length === 1 ? e.target.files[0] : null;

  // 校验文件是否合法
  const acp = accept.value.map((a) => a.replace('.', '')).join('|');
  const fileName = file.name;
  const reg = new RegExp(`.(${acp})`, 'ig');
  const m = fileName.match(reg);
  if (!m) {
    fileTypeError.value = true;
    console.log('请选择图片类型的文件');
    e.target.value = '';
    return false;
  }

  if (file) {
    const reader = new FileReader();
    fileTypeError.value = false;
    reader.readAsDataURL(file);
    reader.onload = (_e) => {
      console.log(_e.target.result);
      minioSrc.value = _e.target.result;
    };
    reader.onerror = (_e) => {
      console.error(_e);
    };
  }
  // e.target.value = "";
};

// 文件选择
const fileChangeHandle = () => {
  minioSrc.value = null;
  const e = chooseFile.value;
  const count = minioTaskQueue.value.getTaskCount();
  // 保证每次只处理一个文件
  if (count !== 0) {
    minioTaskQueue.value.cleanQueue();
  }
  const file = e.target.files.length === 1 ? e.target.files[0] : null;

  // 校验文件是否合法
  const acp = accept.value.map((a) => a.replace('.', '')).join('|');
  const fileName = file.name;
  const reg = new RegExp(`.(${acp})`, 'ig');
  const m = fileName.match(reg);
  if (!m) {
    fileTypeError.value = true;
    console.log('请选择图片类型的文件');
    e.target.value = '';
    return false;
  }

  if (file) {
    const reader = new FileReader();
    fileTypeError.value = false;
    reader.readAsDataURL(file);
    reader.onload = (_e) => {
      console.log(_e.target.result);
      imageBase64.value = _e.target.result;
    };
    reader.onerror = (_e) => {
      console.error(_e);
    };
    file.raw = file;
    minioTaskQueue.value.pushMinioFile([file]);
    minioTaskQueue.value.do();
    emit('uploading', {
      file,
    });
  }
  e.target.value = '';
  chooseFile.value = null;
};

// 暂停
const pauseHandle = () => {
  minioTaskQueue.value.pause();
  emit('pause');
};

// 继续
const resumeHandle = () => {
  minioTaskQueue.value.resume();
  emit('resume');
};

// 切换成上传模式
const deleteLocalHandle = () => {
  minioTaskQueue.value.pause();
  minioTaskQueue.value.cleanQueue();
  emit('delete');
};

// 下载
const downloadHandle = () => {
  const task = minioTaskQueue.value.getFirstTask();
  if (task) {
    task.download();
    emit('download');
  }
};

// 本地下载
const downloadLocalHandle = () => {
  const e = chooseFile.value;
  const file = e.target.files.length === 1 ? e.target.files[0] : null;
  if (minioSrc.value) {
    const img = new Image();
    const fileName = file
      ? file.name
      : minioSrc.value.substring(minioSrc.value.lastIndexOf('/') + 1);
    img.src = minioSrc.value;
    img.setAttribute('crossOrigin', 'Anonymous');
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((b) => {
        const blobUrl = window.URL.createObjectURL(b);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = fileName; // 设置图片名称
        a.click();
      });
    };
  }
};

// 本地删除
const switchImageHandle = () => {
  minioSrc.value = '';
  emit('delete');
};

// 查看图片
const viewToggleHandle = () => {
  show.value = !show.value;
};

// minio删除
const deleteHandle = () => {
  const task = minioTaskQueue.value.getFirstTask();
  if (task) {
    task.delete().then((message) => {
      console.log(message);
      minioTaskQueue.value.cleanQueue();
      imageBase64.value = '';
      emit('delete');
    });
  }
};

// 设置minio数据
const setMinioData = (data) => {
  minioTaskQueue.value.setMinioData(data);
};

// 设置minio api数据
const setMinioApi = (api) => {
  minioTaskQueue.value.setMinioApi(api);
};

watch(
  () => props.minioData,
  (newValue) => {
    setMinioData(newValue);
  },
  {
    immediate: true,
  },
);

watch(
  () => props.minioApi,
  (newValue) => {
    const {
      preUploadUrl,
      completeUploadUrl,
      deleteUrl,
      downloadUrl,
      getFileUrl: _getFileUrl,
    } = newValue;
    if (!preUploadUrl) {
      console.log(`请设置获取分片接口 preUploadUrl`);
    }
    if (!completeUploadUrl) {
      console.log(`请设置合并分片接口 completeUploadUrl`);
    }
    if (!deleteUrl) {
      console.log(`请设置删除文件接口 deleteUrl`);
    }
    if (!downloadUrl) {
      console.log(`请设置删除文件接口 downloadUrl`);
    }
    if (!_getFileUrl) {
      console.log(`请设置获取文件地址接口 getFileUrl`);
    }
    setMinioApi(newValue);
  },
  {
    immediate: true,
  },
);

watch(
  () => props.minioSrc,
  (newValue) => {
    const img = document.createElement('img');
    img.onload = () => {
      minioSrc.value = newValue;
    };
    img.onerror = () => {
      minioSrc.value = '';
    };
    img.src = newValue;
  },
  {
    immediate: true,
  },
);

// ================================================对外暴露的方法======暴露的越少越好

// defineExpose({});
</script>

<style lang="scss" scoped>
.minio-upload-image {
  // .minio-upload-area {
  // }
  .minio-choose {
    position: relative;
    display: flex;
    height: 30px;
    overflow: hidden;
    cursor: pointer;
    border: 1px dashed #dcdfe6;
    border-radius: 6px;
    transition: 0.2s;

    &:hover {
      border: 1px dashed #409eff;
    }

    label {
      display: flex;
      width: 100%;
      cursor: pointer;
      justify-content: center;
      align-items: center;
    }
  }

  .minio-choose--error {
    border: 1px dashed #f56c6c;

    &:hover {
      border: 1px dashed #f56c6c;
    }
  }

  .minio-process {
    position: relative;
    width: 100%;
    height: 30px;
    overflow: hidden;
    line-height: 30px;
    background: #dcdfe6;
  }

  .minio-process-button {
    position: relative;
    z-index: 30;
    display: flex;
    height: 100%;
    font-size: 14px;

    & > div {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }

    &--pause {
      flex: 1;
      cursor: pointer;

      &:hover {
        background: rgb(255 255 255 / 20%);
      }
    }

    &--resume {
      flex: 1;
      cursor: pointer;

      &:hover {
        background: rgb(255 255 255 / 20%);
      }
    }

    &--delete {
      flex: 1;
      cursor: pointer;

      &:hover {
        background: rgb(255 255 255 / 20%);
      }
    }

    .el-icon {
      overflow: hidden;
      border-radius: 5px;
      box-sizing: border-box;
    }
  }

  .minio-process-bar {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 20;
    width: 0%;
    height: 100%;
    background: #67c23a;
    transition: all 0.5s;

    &--paused {
      background: #f56c6c;
    }
  }

  .minio-finish {
    position: relative;
  }

  .minio-image-container {
    position: relative;
    width: 100%;
    height: 100px;
    overflow: hidden;
    text-align: center;
    cursor: pointer;

    .minio-image-box {
      // width: 100%;
      position: absolute;
      top: 50%;
      left: 50%;
      z-index: 10;
      height: 100px;
      transform: translate(-50%, -50%);

      img {
        height: 100%;
      }
    }

    .minio-image-action {
      display: none;
    }

    &:hover {
      .minio-image-action {
        position: relative;
        position: absolute;
        top: 0;
        left: 0;
        z-index: 20;
        display: flex;
        width: 100%;
        height: 100px;
        background: rgb(255 255 255 / 20%);

        & > div {
          flex: 1;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .el-icon {
          width: 34px;
          height: 34px;
          padding: 5px;
          overflow: hidden;
          background: rgb(0 0 0 / 60%);
          border-radius: 5px;
          box-sizing: border-box;
        }
      }
    }
  }
}

.minio-upload-image-mask {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 999;
  display: none;
  width: 100%;
  height: 100%;
  padding: 40px;
  background: rgb(0 0 0 / 60%);
  box-sizing: border-box;

  &--show {
    display: block;
  }

  .minio-upload-image-view {
    position: relative;
    display: flex;
    width: 100%;
    height: 100%;
    justify-content: center;
    align-items: center;

    img {
      max-width: 100%;
      max-height: 100%;
    }
  }

  .minio-upload-image-view-close {
    position: absolute;
    top: 10px;
    right: 10px;
    width: 24px;
    height: 24px;
    cursor: pointer;
  }
}
</style>
