<template>
  <div class="minio-upload-multiple-file-container">
    <!-- <el-button type="success" @click="dialogToggleHandle">
      <el-icon color="#fff" size="16px"><Upload /></el-icon>
      MinIO上传
    </el-button> -->
    <el-dialog
      v-model="dialogVisible"
      append-to-body
      :align-center="true"
      :close-on-click-modal="false"
      :draggable="true"
      :show-close="minioTaskQueue.live === 0"
      :before-close="beforeCloseHandle"
      width="80%">
      <div class="minio-upload-multiple-file">
        <!-- 选择文件 -->
        <!-- {{ minioTaskQueue.live }}
      {{ minioTaskQueue.queue.length }} -->
        <div class="minio-choose-container">
          <div :class="['minio-choose']">
            <label :for="id">
              <el-icon size="20" color="#8c939d"><Plus /></el-icon>
            </label>
            <input
              type="file"
              :id="id"
              multiple
              @change="fileChangeHandle"
              style="display: none" />
          </div>
          <el-button
            type="primary"
            v-if="
              minioTaskQueue.finished === false &&
              minioTaskQueue.live === 0 &&
              !minioTaskQueue.isPaused()
            "
            @click="uploadHandle"
            >上传</el-button
          >
          <el-button
            type="warning"
            v-if="
              minioTaskQueue.live !== 0 &&
              minioTaskQueue.finished === false &&
              !minioTaskQueue.isPaused()
            "
            @click="pauseHandle"
            >暂停</el-button
          >
          <el-button
            type="success"
            v-if="minioTaskQueue.isPaused()"
            @click="resumeHandle"
            >继续</el-button
          >
          <el-button
            type="danger"
            v-if="minioTaskQueue.queue.length !== 0 && minioTaskQueue.finished"
            @click="cleanQueueHandle"
            >清空</el-button
          >
        </div>
        <div class="minio-process">
          <div
            class="minio-process-task"
            v-for="(minioFile, index) in minioTaskQueue.queue"
            :key="index">
            <el-progress
              :text-inside="true"
              :stroke-width="30"
              :percentage="minioFile.uploadProgress"
              :status="
                minioFile.status === 'uploading'
                  ? 'warning'
                  : minioFile.status === 'success'
                    ? 'success'
                    : minioFile.status === 'error'
                      ? 'exception'
                      : ''
              ">
              <div class="minio-process-file">
                <div class="minio-process-file-name">
                  {{ minioFile.file.name }} ({{ minioFile.uploadProgress }}%)
                </div>
              </div>
            </el-progress>
            <div class="minio-process-action">
              <div
                v-if="minioFile.status !== 'success'"
                class="minio-process-info">
                {{ minioFile.uploadSpeed }}M/s
              </div>
              <div
                v-if="minioFile.status === 'success'"
                class="minio-process-button">
                <div
                  class="minio-process-button--download"
                  @click="downloadHandle(minioFile)">
                  <el-icon size="20" color="#333">
                    <Download />
                  </el-icon>
                </div>
                <div
                  class="minio-process-button--delete"
                  @click="deleteHandle(minioFile)">
                  <el-icon size="20" color="#333">
                    <Delete />
                  </el-icon>
                </div>
              </div>
            </div>
            <div class="minio-process-chunk-container">
              <div class="minio-process-chunk-info">
                总共{{ minioFile.uploadChunks.length }}个分片
              </div>
              <div class="minio-process-chunk">
                <div
                  :title="`分片编号${chunk.chunkNumber} - 耗时${chunk.uploadDuration}ms`"
                  :class="[
                    'minio-process-chunk-item',
                    {
                      'minio-process-chunk-item--uploading':
                        chunk.status === 'uploading',
                    },
                    {
                      'minio-process-chunk-item--success':
                        chunk.status === 'success',
                    },
                    {
                      'minio-process-chunk-item--error':
                        chunk.status === 'error',
                    },
                  ]"
                  v-for="(chunk, index) in minioFile.uploadChunks"
                  :key="index"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup name="UploadMultipleFile">
import { MinioTaskQueue } from '@/utils/minio';
import { ElButton, ElIcon, ElDialog } from 'element-plus';
import { Plus, Download, Delete } from '@element-plus/icons-vue';
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
const emit = defineEmits(['before-close']);
const id = ref(`uploadMultipleFile_${Math.random().toString().slice(-6)}`);
const minioTaskQueue = ref(new MinioTaskQueue());
const dialogVisible = ref(false);

// 文件选择
const fileChangeHandle = (e) => {
  const files = e.target.files.length !== 0 ? e.target.files : null;

  if (files) {
    let _files = [];
    for (let file of files) {
      file.raw = file;
      _files.push(file);
    }
    minioTaskQueue.value.pushMinioFile(_files);
  }
  e.target.value = '';
};

// 上传
const uploadHandle = () => {
  minioTaskQueue.value.do();
};

// 暂停
const pauseHandle = () => {
  minioTaskQueue.value.pause();
};

// 继续
const resumeHandle = () => {
  minioTaskQueue.value.resume();
};

// 清空
const cleanQueueHandle = () => {
  minioTaskQueue.value.cleanQueue();
};

// 下载
const downloadHandle = (minioFile) => {
  minioFile.download();
};

// minio删除
const deleteHandle = (minioFile) => {
  minioFile.delete().then((message) => {
    console.log(message);
  });
};

// 弹窗状态修改
const dialogToggleHandle = () => {
  dialogVisible.value = !dialogVisible.value;
};

// 弹窗关闭
const beforeCloseHandle = (done) => {
  if (minioTaskQueue.value.live === 0) {
    emit('before-close');
    cleanQueueHandle();
    dialogToggleHandle();
    done();
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
    const { preUploadUrl, completeUploadUrl, deleteUrl, downloadUrl } =
      newValue;
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
    setMinioApi(newValue);
  },
  {
    immediate: true,
  },
);

// ================================================对外暴露的方法======暴露的越少越好

defineExpose({
  dialogToggleHandle,
});
</script>

<style lang="scss" scoped>
$dialogPadding: 90px; // 无内容弹窗默认高度
$dialogVerticalMargin: 50px; // dialog上下距离视窗的间距
$minioChooseHeight: 32px; // 操作区域高度
$minioProcessMarTop: 10px;

.minio-upload-multiple-file-container {
  display: inline-flex;
  vertical-align: middle;
}

.minio-upload-multiple-file {
  height: calc(100vh - $dialogPadding - 2 * $dialogVerticalMargin);
  padding-top: 20px;
  box-sizing: border-box;

  .minio-choose-container {
    display: flex;
    height: $minioChooseHeight;
  }

  .minio-choose {
    position: relative;
    display: flex;
    height: $minioChooseHeight;
    margin-right: 12px;
    overflow: hidden;
    cursor: pointer;
    border: 1px dashed #dcdfe6;
    border-radius: 6px;
    flex: 1;
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

  .minio-process {
    height: calc(
      100vh - $dialogPadding - 2 * $dialogVerticalMargin - $minioChooseHeight -
        $minioProcessMarTop
    );
    margin-top: $minioProcessMarTop;
    overflow-y: auto;
  }

  .minio-process-task {
    position: relative;
    margin-bottom: 10px;

    :deep(.el-progress-bar__inner) {
      text-align: left;
    }

    .minio-process-file {
      display: flex;
      align-items: center;

      &-name {
        color: #333;
        text-align: left;
        flex: 1;
      }
    }

    .minio-process-action {
      position: absolute;
      top: 0;
      right: 10px;
      display: flex;
      height: 30px;
      cursor: pointer;
      align-items: center;

      // .minio-process-info {
      // }

      .minio-process-button {
        display: flex;
        align-items: center;
      }
    }

    .minio-process-chunk-container {
      margin-top: 5px;

      .minio-process-chunk-info {
        font-size: 14px;
      }

      .minio-process-chunk {
        display: flex;
        flex-wrap: wrap;

        .minio-process-chunk-item {
          width: 10px;
          height: 10px;
          margin-right: 1px;
          cursor: pointer;
          background: #ebeef5;
        }

        .minio-process-chunk-item--uploading {
          background: #e6a23c;
        }

        .minio-process-chunk-item--success {
          background: #67c23a;
        }

        .minio-process-chunk-item--error {
          background: #f56c6c;
        }
      }
    }
  }
}
</style>
