import { MinioFile } from './MinioFile.js';
export class MinioTaskQueue {
  constructor(options) {
    // 同时执行的任务数量
    this.concurrency = options && options.concurrency ? options.concurrency : 3;
    // 当前被激活执行的任务数量
    this.live = 0;
    // 任务队列
    this.queue = [];
    // 暂停开关
    this.paused = false;
    // 用于申请分配上传传递的数据
    this.minioData = null;
    // 用于请求的各类接口
    this.minioApi = null;
    // 是否所有任务都完成
    this.finished = true;
  }

  pushMinioFile(files) {
    let checkFileType = true;
    // 检查传入的数组是否是文件
    for (let i = 0; i < files.length; ++i) {
      const file = files[i];
      const result = file.raw instanceof File;
      // 检查数组合法性
      if (!result) {
        checkFileType = result;
        break;
      }
    }

    //  只有传入的数组都是文件类型才能加入到队列
    if (checkFileType) {
      files.forEach((file) => {
        // 判断文件是否已经在队列中
        if (
          this.queue.findIndex((minioFile) => minioFile.isThisFile(file)) === -1
        ) {
          // 添加文件到队列
          this.finished = false;
          this.push(new MinioFile(file));
        } else {
          // console.log(`文件 ${file.name} 已存在`);
        }
      });
    }
  }

  push(task) {
    task.parent = this;
    this.queue.push(task); // 将任务加入队列
  }

  // 执行
  do() {
    // console.log(`MinioTaskQueue do`);
    if (this.paused) {
      // console.log("任务暂停,无法开始");
      return false;
    }
    const waitTask = this.queue.filter(
      (task) => task.status === MinioFile.WAIT,
    );
    const uploadingTask = this.queue.filter(
      (task) =>
        task.status !== MinioFile.WAIT &&
        task.status !== MinioFile.SUCCESS &&
        task.status !== MinioFile.ERROR,
    );

    // 判断是否还有任务
    if (uploadingTask.length === 0 && waitTask.length === 0) {
      console.log('所有任务执行完毕');
      this.finished = true;
      this.finishHandle();
      return false;
    }

    // 初始化调用，即实例创建以后的第一次do
    if (
      waitTask.length === this.queue.length &&
      this.live === 0 &&
      waitTask.length > 0
    ) {
      while (this.live < this.concurrency && waitTask.length > 0) {
        ++this.live;
        const t = waitTask.shift();
        t && t.do();
      }
      return false;
    }

    // 上传成功一个以后继续下一个
    if (waitTask.length > 0) {
      while (this.live < this.concurrency) {
        ++this.live;
        const t = waitTask.shift();
        t && t.do();
      }
      return false;
    }
  }

  // 继续
  resume() {
    // console.log("继续执行");
    this.paused = false; // 继续任务执行

    const waitTask = this.queue.filter(
      (task) => task.status === MinioFile.WAIT,
    );
    const uploadingTask = this.queue.filter(
      (task) =>
        task.status !== MinioFile.WAIT &&
        task.status !== MinioFile.SUCCESS &&
        task.status !== MinioFile.ERROR,
    );

    if (uploadingTask.length === 0 && waitTask.length === 0) {
      console.log('所有任务执行完毕');
      this.finished = true;
      this.finishHandle();
      return false;
    }

    if (uploadingTask.length > 0 && waitTask.length >= 0) {
      while (this.live < this.concurrency && uploadingTask.length > 0) {
        ++this.live;
        const t =
          uploadingTask.length > 0 ? uploadingTask.shift() : waitTask.shift();
        t && t.do();
      }
      return false;
    }
  }

  // 暂停
  // 暂停的主体控制逻辑只对每次触发分片上传钱和触发合并前进行判断，暂停触发时，不会对正在执行的分片上传和合并请求进行终止，这样保证每个请求的完整性并降低复杂度
  pause() {
    const waitTask = this.queue.filter(
      (task) => task.status === MinioFile.WAIT,
    );
    const uploadingTask = this.queue.filter(
      (task) =>
        task.status !== MinioFile.WAIT &&
        task.status !== MinioFile.SUCCESS &&
        task.status !== MinioFile.ERROR,
    );

    if (uploadingTask.length !== 0 || waitTask.length !== 0) {
      this.finished = false;
    }

    this.live = 0;
    this.paused = true; // 暂停任务执行
    // console.log("暂停执行");
  }

  // 设置同时执行的任务数量限制
  setConcurrency(concurrency) {
    this.concurrency = concurrency;
  }

  // 返回是否已暂停任务执行
  isPaused() {
    return this.paused;
  }

  // 设置 MinIO 数据
  setMinioData(minioData) {
    this.minioData = minioData;
  }

  // 设置 MinIO 接口
  setMinioApi(minioApi) {
    this.minioApi = minioApi;
  }

  // 获取 MinIO 数据
  getMinioData() {
    return this.minioData;
  }

  // 获取 MinIO Api接口配置
  getMinioApi() {
    return this.minioApi;
  }

  // 获取任务个数
  getTaskCount() {
    return this.queue.length;
  }

  // 获取第一个任务
  getFirstTask() {
    return this.getTaskCount() > 0 ? this.queue[0] : null;
  }

  // 删除一个任务
  deleteTask(task) {
    const idx = this.queue.findIndex((minioFile) =>
      minioFile.isThisFile(task.file),
    );
    if (idx !== -1) {
      this.queue.splice(idx, 1);
      console.log('删除一个任务成功');
    }
  }

  // 清理队列
  cleanQueue() {
    // 当前被激活执行的任务数量
    this.live = 0;
    // 任务队列
    this.queue = [];
    // 暂停开关
    this.paused = false;
    // 是否所有任务都完成
    this.finished = true;
  }

  // 上传成功以后触发 UploadFile组件与UploadImage组件特有
  finishHandle() {}

  // 合并或者分片上传错误以后触发
  minioErrorHandle() {}
}
