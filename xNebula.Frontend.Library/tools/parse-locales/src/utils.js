import http from 'node:http';
import path from 'node:path';
import fs from 'node:fs';
// const http = require('http');
// const path = require('path');
// const fs = require('fs');
let directory = [];
let files = [];

// 收集对应目录下的具体信息
const _getDirectoryAndFiles = (_path) => {
  const filesAndDirectories = fs.readdirSync(_path);
  filesAndDirectories.forEach((file) => {
    const filePath = path.resolve(_path, file);
    // 检查文件是否为目录
    if (fs.lstatSync(filePath).isDirectory()) {
      directory.push(filePath);
      _getDirectoryAndFiles(filePath);
    } else {
      files.push(filePath);
    }
  });
};

// 统计某个目录下面文件与目录的数目
export const getDirectoryAndFilesInfo = (_path) => {
  directory = [];
  files = [];
  _getDirectoryAndFiles(_path);
  directory = directory.map((p) => p.replace(`${_path}/`, ''));
  files = files.map((p) => p.replace(`${_path}/`, ''));
  const info = {
    directory: {
      items: directory,
      num: directory.length,
    },
    files: {
      items: files,
      num: files.length,
    },
  };
  // console.log(info);
  return info;
};

// ajax封装
export const ajax = (options) => {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      // 接收数据
      res.on('data', (chunk) => {
        data += chunk;
      });

      // 数据接收完毕
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.code === 2000) {
            resolve(response.data);
          } else {
            reject(response.msg);
          }
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('error', (e) => {
      reject(e);
    });
    req.end();
  });
};
export const getURLQuery = (url) => {
  const query = {};
  url
    .substring(url.indexOf('?') + 1)
    .split('&')
    .forEach((kv) => {
      const [key, value] = kv.split('=');
      query[decodeURIComponent(key)] = decodeURIComponent(value);
    });
  return query;
};
