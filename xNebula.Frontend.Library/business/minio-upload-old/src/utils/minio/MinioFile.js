import {
  getPreUploadUrl,
  completeUploadFile,
  deleteObject,
  downloadObjectByUrl,
} from '@/utils/minio/api';
import { MinioChunk } from './MinioChunk.js';
import { MinoUitl } from './MinoUitl.js';
export class MinioFile {
  static WAIT = 'waiting';
  static WAIT_TEXT = '等待上传';
  static GETMD5 = 'getMD5';
  static GETMD5_TEXT = '校验MD5';
  static CHIP = 'chip';
  static CHIP_TEXT = '正在创建序列';
  static UPLOADING = 'uploading';
  static UPLOADING_TEXT = '正在上传';
  static SUCCESS = 'success';
  static SUCCESS_TEXT = '上传成功';
  static ERROR = 'error';
  static ERROR_TEXT = '上传错误';
  // 定义MinioFile类的属性和方法
  constructor(file) {
    // 初始化file对象
    this.file = file;
    // 文件大小
    this.sizeText = MinoUitl.transformByte(file.raw.size);
    // 以下属性在重置的时候都需要再次被设置=================================
    // 设置初始化状态
    this.status = MinioFile.WAIT;
    this.statusText = MinioFile.WAIT_TEXT;
    // 保存本地文件分片
    this.fileChunks = [];
    // 当前文件上传进度
    this.uploadProgress = 0;
    // 文件上传速度
    this.uploadSpeed = 0;
    // 以下是整个过程中产生的数据
    this.md5 = null; // md5
    this.totalChunks = 0; // 总分片数
    this.totalSuccessChunks = 0; // 成功分片数
    this.fragApplyInfo = null; // 分片申请信息
    this.uploadChunks = []; // 上传的分片列表
  }

  // 执行当前文件处理任务
  async do() {
    // 只要执行了do，即便立马暂停也一定会走完下面三个方法
    if (this.status === MinioFile.WAIT) {
      // 获取MD5
      await this.getFileMd5();

      // 创建分片
      this.createFileChunk();

      // 发起分片申请
      await this.sendFragmentApply();
    }

    if (this.status !== MinioFile.SUCCESS && this.status !== MinioFile.ERROR) {
      // 上传分片
      await this.uploadFragment();

      // 合并分片
      await this.mergeFragment();
    }
  }

  // 获取MD5
  async getFileMd5() {
    if (this.fileChunks.length === 0) {
      // 校验MD5
      this.status = MinioFile.GETMD5;
      this.statusText = MinioFile.GETMD5_TEXT;

      const { hash: md5, totalChunks } = await MinoUitl.getFileMd5(
        this.file.raw,
      );

      if (md5) {
        this.md5 = md5;
        this.totalChunks = totalChunks;
        // console.log(
        //   `文件 ${this.file.name} 一共有${totalChunks}个分片, md5: ${md5}`
        // );
      }
    }
  }

  // 创建分片
  createFileChunk() {
    if (this.fileChunks.length === 0) {
      this.status = MinioFile.CHIP;
      this.statusText = MinioFile.CHIP_TEXT;

      this.fileChunks = MinoUitl.createFileChunk(this.file.raw);

      // console.log("分片如下");
      // console.log(this.fileChunks);
    }
  }

  // 发起分片申请
  async sendFragmentApply() {
    const minioData = this.parent.getMinioData();
    const minioApi = this.parent.getMinioApi();
    const { preUploadUrl: url } = minioApi;
    if (this.fileChunks.length !== 0 && this.md5 && minioData) {
      const { id, bucket: Bucket, path = '' } = minioData;
      const Objects = [];
      const ObjectNameArr = [];
      if (path) {
        ObjectNameArr.push(path);
      }
      ObjectNameArr.push(this.file.name);
      Objects.push({
        ObjectName:
          ObjectNameArr.length === 1
            ? ObjectNameArr.join('')
            : ObjectNameArr.join('/'),
        Chunks: this.fileChunks.length,
        UploadId: '',
        ContentMD5: this.md5,
        FileSize: this.file.size,
      });
      const data = {
        id,
        Bucket,
        Objects,
      };
      return getPreUploadUrl(url, data)
        .then((response) => {
          // console.log("分片申请成功");
          this.fragApplyInfo =
            response && response.length === 1 ? response[0] : null;
          Promise.resolve();
        })
        .catch((error) => {
          console.log(error);
          // console.log("分片申请失败");
          Promise.reject();
        });
    } else {
      console.log(`请检查分片是否创建、md5是否成功生成、minioData数据是否配置`);
      Promise.reject();
    }
  }

  // 上传分片
  async uploadFragment() {
    if (this.fragApplyInfo) {
      const uploadChunks = [];
      // 构建上传分片
      if (this.uploadChunks.length === 0) {
        const partInfo = this.fragApplyInfo.PartInfo;

        // 根据partInfo构建MinioChunk对象
        this.fileChunks.forEach((chunk, index) => {
          const info = partInfo.find((item) => item['PartNum'] === index + 1);
          let minioChunk = null;
          // 构建MinioChunk对象
          if (info) {
            minioChunk = new MinioChunk({
              chunkNumber: info['PartNum'],
              index: index + 1,
              chunk,
              uploadUrl: info['Url'],
              progress: 0,
              status: MinioChunk.WAIT,
            });
          } else {
            minioChunk = new MinioChunk({
              chunkNumber: index + 1,
              index: index + 1,
              chunk,
              uploadUrl: '',
              progress: 100,
              status: MinioChunk.SUCCESS,
            });
          }
          minioChunk.parent = this;
          uploadChunks.push(minioChunk);
        });
        this.uploadChunks = uploadChunks;

        // 说明此文件之前已经上传过了,直接修改状态为成功
        if (partInfo.length === 0) {
          this.checkFileUploadProgress();
        } else {
          // 获取还没有上传成功的分片
          const unFinishChunks = uploadChunks.filter(
            (chunk) => chunk.progress < 100,
          );
          // console.log(
          //   `总共: ${uploadChunks.length}个，未上传: ${
          //     unFinishChunks.length
          //   }个，已上传：${uploadChunks.length - unFinishChunks.length}个`
          // );

          for (let chunk of unFinishChunks) {
            await chunk.do();
          }
        }
        return Promise.resolve();
      } else {
        // 获取还没有上传成功的分片
        const unFinishChunks = this.uploadChunks.filter(
          (chunk) => chunk.progress < 100,
        );
        // console.log(
        //   `总共: ${uploadChunks.length}个，未上传: ${
        //     unFinishChunks.length
        //   }个，已上传：${uploadChunks.length - unFinishChunks.length}个`
        // );

        for (let chunk of unFinishChunks) {
          await chunk.do();
        }
        return Promise.resolve();
      }
    } else {
      // console.log(`请检查分片申请`);
      return Promise.reject();
    }
  }

  // 合并分片
  async mergeFragment() {
    // 尚未上传的分片个数
    const unFinishChunks = this.uploadChunks.filter(
      (chunk) =>
        chunk.progress < 100 &&
        chunk.status !== MinioChunk.SUCCESS &&
        chunk.status !== MinioChunk.ERROR,
    );
    // 上传错误的分片个数
    const errorChunks = this.uploadChunks.filter(
      (chunk) => chunk.progress === 0 && chunk.status === MinioChunk.ERROR,
    );
    const minioData = this.parent.getMinioData();
    const minioApi = this.parent.getMinioApi();
    const { completeUploadUrl: url } = minioApi;
    if (this.parent.isPaused()) {
      // console.log("已暂停不合并分片");
    } else {
      if (
        this.fragApplyInfo &&
        minioData &&
        this.status === MinioFile.SUCCESS &&
        unFinishChunks.length === 0 &&
        errorChunks.length === 0
      ) {
        const { id, bucket: Bucket, path = '' } = minioData;
        const { UploadId } = this.fragApplyInfo;
        const Objects = [];
        const ObjectNameArr = [];
        if (path) {
          ObjectNameArr.push(path);
        }
        ObjectNameArr.push(this.file.name);
        Objects.push({
          ObjectName:
            ObjectNameArr.length === 1
              ? ObjectNameArr.join('')
              : ObjectNameArr.join('/'),
          UploadId,
        });
        const data = {
          id,
          Bucket,
          Objects,
        };
        return await completeUploadFile(url, data)
          .then((response) => {
            if (!response[0].IsSuccess) {
              console.log(`合并文件失败 ${this.file.name}`);
              this.status = MinioFile.ERROR;
              this.statusText = MinioFile.ERROR_TEXT;
              // 执行完毕以后调度下一个任务
              --this.parent.live;
              this.parent.do();
              return Promise.resolve();
            } else {
              // console.log(`合并文件成功 ${this.file.name}`);
              this.status = MinioFile.SUCCESS;
              this.statusText = MinioFile.SUCCESS_TEXT;
              // 执行完毕以后调度下一个任务
              --this.parent.live;
              this.parent.do();
              return Promise.resolve();
            }
          })
          .catch((error) => {
            console.log(error);
            return Promise.reject();
          });
      }
    }
  }

  // 检查文件上传进度
  checkFileUploadProgress() {
    // 尚未上传的分片个数
    const unFinishChunks = this.uploadChunks.filter(
      (chunk) =>
        chunk.progress < 100 &&
        chunk.status !== MinioChunk.SUCCESS &&
        chunk.status !== MinioChunk.ERROR,
    );

    if (unFinishChunks.length !== 0) {
      // 正在上传
      this.status = MinioFile.UPLOADING;
      this.statusText = MinioFile.UPLOADING_TEXT;
    } else {
      this.status = MinioFile.SUCCESS;
      this.statusText = MinioFile.SUCCESS_TEXT;
    }

    // 数据统计
    this.countChunks();
  }

  // 修改文件上传为成功
  checkFileUploadSuccess() {
    this.uploadProgress = 100;
    // 尚未上传的分片个数
    const successChunks = this.uploadChunks.filter(
      (chunk) => chunk.progress === 100 && chunk.status === MinioChunk.SUCCESS,
    );

    if (successChunks.length === this.uploadChunks.length) {
      this.status = MinioFile.SUCCESS;
      this.statusText = MinioFile.SUCCESS_TEXT;
    }
    // 数据统计
    this.countChunks();
  }

  // 修改文件上传为失败
  checkFileUploadError() {
    // 上传错误的分片个数
    const errorChunks = this.uploadChunks.filter(
      (chunk) => chunk.progress === 0 && chunk.status === MinioChunk.ERROR,
    );
    if (errorChunks.length > 0) {
      this.status = MinioFile.ERROR;
      this.statusText = MinioFile.ERROR_TEXT;
    }
    // 数据统计
    this.countChunks();
  }

  // 数据统计
  countChunks() {
    // 尚未上传的分片个数
    const unFinishChunks = this.uploadChunks.filter(
      (chunk) =>
        chunk.progress < 100 &&
        chunk.status !== MinioChunk.SUCCESS &&
        chunk.status !== MinioChunk.ERROR,
    );

    // 计算上传进度
    this.uploadProgress = Math.floor(
      ((this.totalChunks - unFinishChunks.length) / this.totalChunks) * 100,
    );

    // 文件上传速度
    let duration = 0;
    let size = 0;
    this.uploadChunks.forEach((chunk) => {
      if (chunk['uploadDuration'] !== 0) {
        duration += chunk['uploadDuration'];
        size += MinoUitl.CHUNKSIZE;
      }
    });
    if (duration !== 0) {
      this.uploadSpeed = (size / 1024 / 1024 / (duration / 1000)).toFixed(1);
      // console.log(`${this.uploadSpeed}M/s`);
    }

    const successChunks = this.uploadChunks.filter(
      (chunk) => chunk.progress === 100 && chunk.status === MinioChunk.SUCCESS,
    );
    this.totalSuccessChunks = successChunks.length;
  }

  // 删除文件
  delete() {
    const minioData = this.parent.getMinioData();
    const minioApi = this.parent.getMinioApi();
    const { deleteUrl: url } = minioApi;
    // 如果是上传成功的可以删除
    if (this.uploadProgress === 100 && minioData) {
      const { id, bucket, path = '' } = minioData;
      const ObjectNameArr = [];
      if (path) {
        ObjectNameArr.push(path);
      }
      ObjectNameArr.push(this.file.name);
      const objectName =
        ObjectNameArr.length === 1
          ? ObjectNameArr.join('')
          : ObjectNameArr.join('/');

      return deleteObject(url, { id, bucket, objectName })
        .then(() => {
          console.log('删除成功');
          // 重置当前对象
          this.parent.deleteTask(this);
          return Promise.resolve('删除成功');
        })
        .catch(() => {
          console.log('删除失败');
          return Promise.reject('删除失败');
        });
    }
  }

  // 下载文件
  download() {
    const minioData = this.parent.getMinioData();
    const minioApi = this.parent.getMinioApi();
    const { downloadUrl: url } = minioApi;

    // 如果是上传成功的可以删除
    if (this.uploadProgress === 100 && minioData) {
      const { id, bucket, path = '' } = minioData;
      const ObjectNameArr = [];
      if (path) {
        ObjectNameArr.push(path);
      }
      ObjectNameArr.push(this.file.name);
      const objectName =
        ObjectNameArr.length === 1
          ? ObjectNameArr.join('')
          : ObjectNameArr.join('/');
      downloadObjectByUrl(url, { id, bucket, objectName })
        .then((response) => {
          const headerFilename = response.headers['content-disposition']
            ?.split(';')[2]
            .split("'")[2];
          // 文件名
          const fileName = decodeURIComponent(headerFilename);
          // 内容
          const content = response.data;
          MinoUitl.downloadFile(content, fileName);
        })
        .catch((err) => {
          console.log('err', err);
        });
    }
  }

  // 重置状态
  reset() {
    // 设置初始化状态
    this.status = MinioFile.WAIT;
    this.statusText = MinioFile.WAIT_TEXT;
    // 保存本地文件分片
    this.fileChunks = [];
    // 当前文件上传进度
    this.uploadProgress = 0;
    // 文件上传速度
    this.uploadSpeed = 0;
    // 以下是整个过程中产生的数据
    this.md5 = null; // md5
    this.totalChunks = 0; // 总分片数
    this.totalSuccessChunks = 0; // 成功分片数
    this.fragApplyInfo = null; // 分片申请信息
    this.uploadChunks = []; // 上传的分片列表
  }

  // 判断是否是当前文件
  isThisFile(file) {
    return (
      this.file.name === file.name &&
      this.file.size === file.size &&
      this.file.raw.lastModified === file.raw.lastModified
    );
  }
}
