<template>
  <div class="minio-upload-file">
    <!-- 选择文件 -->
    <!-- {{ minioTaskQueue.live }}
    {{ minioTaskQueue.queue.length }} -->
    <div
      class="minio-choose"
      v-if="minioTaskQueue.live === 0 && minioTaskQueue.queue.length === 0">
      <label :for="id">
        <el-icon size="24" color="#e6a23c"><Upload /></el-icon>
      </label>
      <input
        type="file"
        :id="id"
        @change="fileChangeHandle"
        style="display: none" />
    </div>
    <!-- 上传中 -->
    <div
      class="minio-process"
      v-if="
        (minioTaskQueue.live === 0 &&
          minioTaskQueue.isPaused() &&
          minioTaskQueue.queue.length === 1) ||
        (minioTaskQueue.live === 1 && minioTaskQueue.queue.length === 1)
      ">
      <div class="minio-process-content">
        <el-icon
          v-if="!minioTaskQueue.isPaused()"
          size="24"
          color="#e6a23c"
          @click="pauseHandle">
          <VideoPause />
        </el-icon>
        <el-icon
          v-if="minioTaskQueue.isPaused()"
          size="24"
          color="#67c23a"
          @click="resumeHandle">
          <VideoPlay />
        </el-icon>
        <el-icon size="24" color="#f56c6c" @click="deleteLocalHandle">
          <Delete />
        </el-icon>
      </div>
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
    </div>
    <!-- 上传完毕 -->
    <div
      class="minio-finish"
      v-if="
        minioTaskQueue.live === 0 &&
        minioTaskQueue.queue.length === 1 &&
        !minioTaskQueue.isPaused()
      ">
      <el-icon size="24" color="#409eff" @click="downloadHandle"
        ><Download
      /></el-icon>
      <el-icon size="24" color="#f56c6c" @click="deleteHandle"
        ><Delete
      /></el-icon>
    </div>
  </div>
</template>

<script setup name="UploadFile">
import { MinioTaskQueue } from '@/utils/minio';
import { ElIcon } from 'element-plus';
import { getFileUrl } from '@/utils/minio/api';
import {
  Upload,
  VideoPause,
  VideoPlay,
  Delete,
  Download,
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
const id = ref(`uploadFile_${Math.random().toString().slice(-6)}`);
const minioTaskQueue = ref(new MinioTaskQueue());

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
const fileChangeHandle = (e) => {
  const count = minioTaskQueue.value.getTaskCount();
  // 保证每次只处理一个文件
  if (count !== 0) {
    minioTaskQueue.value.cleanQueue();
  }
  const file = e.target.files.length === 1 ? e.target.files[0] : null;
  if (file) {
    file.raw = file;
    minioTaskQueue.value.pushMinioFile([file]);
    minioTaskQueue.value.do();
    emit('uploading', {
      file,
    });
  }
  e.target.value = '';
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

// 上传时的删除
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

// minio删除
const deleteHandle = () => {
  const task = minioTaskQueue.value.getFirstTask();
  if (task) {
    task.delete().then((message) => {
      console.log(message);
      minioTaskQueue.value.cleanQueue();
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

// ================================================对外暴露的方法======暴露的越少越好]

const chooseFile = () => {
  const fileInput = document.getElementById(id.value);
  fileInput.click();
};

defineExpose({
  chooseFile,
});
</script>

<style lang="scss" scoped>
.minio-upload-file {
  display: flex;
  min-width: 48px;
  flex-direction: column;
  align-items: center;

  .el-icon {
    cursor: pointer;
  }

  .minio-choose,
  .minio-process,
  .minio-finish {
    display: flex;
    height: 24px;
    padding: 0 10px;
    justify-content: center;
  }

  .minio-process {
    position: relative;
    overflow: hidden;
  }

  .minio-process-content {
    position: relative;
    z-index: 10;
  }

  .minio-process-bar {
    position: absolute;
    top: 23px;
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
}
</style>
