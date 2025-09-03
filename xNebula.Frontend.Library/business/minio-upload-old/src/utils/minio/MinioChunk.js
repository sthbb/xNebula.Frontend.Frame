// import axios from "axios";
import { axios } from '@xnebula/common';
const source = axios.CancelToken.source();
export class MinioChunk {
  static WAIT = 'waiting'; // 等待上传
  static UPLOADING = 'uploading'; // 上传中
  static SUCCESS = 'success'; // 上传成功
  static ERROR = 'error'; // 上传失败

  constructor(options) {
    this.index = options.index;
    this.chunk = options.chunk;
    this.chunkNumber = options.chunkNumber;
    this.uploadUrl = options.uploadUrl;
    this.progress = options.progress;
    this.status = options.status;
    // 以下是整个过程中产生的数据
    this.uploadDuration = 0; // 记录上传的毫秒
  }

  // 上传分片
  async do() {
    if (!this.parent.parent.isPaused() && this.status === MinioChunk.WAIT) {
      const ins = axios.create();
      const startTime = Date.now();
      return await ins({
        method: 'put',
        url: this.uploadUrl,
        data: this.chunk.file,
        onUploadProgress: this.checkChunkUploadProgress(this),
        headers: {
          Accept: '*/*',
          'Content-Type': '',
        },
        cancelToken: source.token,
      })
        .then(() => {
          // console.log("上传分片成功");
          this.progress = 100;
          this.status = MinioChunk.SUCCESS;

          // 统计上传分片消耗的时间
          this.uploadDuration = Date.now() - startTime;
          // console.log(`${this.uploadDuration}ms`);
          // 修改文件上传为成功
          this.parent.checkFileUploadSuccess();
          // return Promise.resolve();
        })
        .catch(() => {
          // console.log("上传分片失败");
          this.progress = 0;
          this.status = MinioChunk.ERROR;

          // 修改文件上传为失败
          this.parent.checkFileUploadError();
          // return Promise.reject();
        });
    }
  }

  // 检查分片上传进度
  checkChunkUploadProgress(that) {
    return () => {
      // that.progress = parseInt(Math.floor((event.loaded / event.total) * 100));
      if (that.progress !== 100) {
        that.status = MinioChunk.UPLOADING;
      }
      // 检查文件上传进度
      that.parent.checkFileUploadProgress();
    };
  }
}
