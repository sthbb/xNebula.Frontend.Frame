import SparkMD5 from 'spark-md5';
export class MinoUitl {
  // 分片大小
  static CHUNKSIZE = 1024 * 1024 * 5; // 5MB
  constructor() {}

  // 生成文件MD5
  static async getFileMd5(file) {
    // 总chunk个数
    const totalChunks = Math.ceil(file.size / MinoUitl.CHUNKSIZE);
    const blobSlice =
      File.prototype.slice ||
      File.prototype.mozSlice ||
      File.prototype.webkitSlice;
    const fileReader = new FileReader();

    // 读取文件指定范围的ArrayBuffer
    const loadChunk = (start, end) => {
      return new Promise((resolve, reject) => {
        fileReader.onload = function (e) {
          try {
            resolve(e.target.result);
          } catch (error) {
            reject(error);
          }
        };
        fileReader.onerror = function () {
          reject(new Error('读取Md5失败，文件读取错误'));
        };
        fileReader.readAsArrayBuffer(blobSlice.call(file, start, end));
      });
    };

    const calculateHash = async () => {
      const spark = new SparkMD5.ArrayBuffer();

      // 取第一个切片ArrayBuffer
      const firstChunk = await loadChunk(
        0,
        Math.min(MinoUitl.CHUNKSIZE, file.size),
      );
      spark.append(firstChunk);

      // 取最后一个切片ArrayBuffer
      const lastChunkStart = Math.max(0, file.size - MinoUitl.CHUNKSIZE);
      const lastChunk = await loadChunk(lastChunkStart, file.size);
      spark.append(lastChunk);

      // 取中间的ArrayBuffer
      if (totalChunks % 2 === 0) {
        // 偶数个分片，取中间的两个分片
        const middleChunkIndex = totalChunks / 2;
        const middleChunk1Start = (middleChunkIndex - 1) * MinoUitl.CHUNKSIZE;
        const middleChunk1 = await loadChunk(
          middleChunk1Start,
          middleChunk1Start + MinoUitl.CHUNKSIZE,
        );
        spark.append(middleChunk1);

        const middleChunk2Start = middleChunkIndex * MinoUitl.CHUNKSIZE;
        const middleChunk2 = await loadChunk(
          middleChunk2Start,
          middleChunk2Start + MinoUitl.CHUNKSIZE,
        );
        spark.append(middleChunk2);
      } else {
        // 奇数个分片，取中间的一个分片
        const middleChunkIndex = Math.floor(totalChunks / 2);
        const middleChunkStart = middleChunkIndex * MinoUitl.CHUNKSIZE;
        const middleChunk = await loadChunk(
          middleChunkStart,
          middleChunkStart + MinoUitl.CHUNKSIZE,
        );
        spark.append(middleChunk);
      }

      return spark.end();
    };

    // // 计算Hash
    return calculateHash()
      .then((hash) => {
        // 返回Hash值与总chunk个数
        return Promise.resolve({ hash, totalChunks });
      })
      .catch((error) => {
        console.error('获取Md5错误：', error);
        return Promise.reject(error);
      });
  }

  // 创建分片
  static createFileChunk(file, size = MinoUitl.CHUNKSIZE) {
    const chunks = Array.from(
      { length: Math.ceil(file.size / size) },
      (_, i) => {
        const start = i * size;
        const end = Math.min(start + size, file.size);
        return {
          file: file.slice(start, end),
          contentRange: 'bytes ' + start + '-' + end + '/' + file.size,
        };
      },
    );
    return chunks;
  }

  // 字节转标准单位
  static transformByte(size) {
    const units = ['B', 'K', 'M', 'G', 'T'];
    if (!size) return '0B';
    let index = 0;
    while (size >= 1024 && index < units.length - 1) {
      size /= 1024;
      index++;
    }
    return `${size.toFixed(2)}${units[index]}`;
  }

  // 下载文件
  static downloadFile(content, fileName) {
    const blob = new Blob([content], { type: 'blob' });
    const elink = document.createElement('a');
    elink.download = fileName;
    elink.style.display = 'none';
    elink.href = URL.createObjectURL(blob);
    document.body.appendChild(elink);
    elink.click();
    URL.revokeObjectURL(elink.href); // 释放URL 对象
    document.body.removeChild(elink);
  }
}
