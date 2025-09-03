import { getAxiosInstance } from './axios';

// 获取分片上传数据
export function getPreUploadUrl(url = `/Minio/Client/GetPreUploadUrl`, data) {
  const axios = getAxiosInstance();
  return axios({
    url,
    method: 'post',
    data,
  });
}

// 合并分片
export function completeUploadFile(
  url = `/Minio/Client/CompleteUploadFile`,
  data,
) {
  const axios = getAxiosInstance();
  return axios({
    url,
    method: 'post',
    data,
  });
}

// 删除文件
export function deleteObject(url = `/Minio/Client/DeleteObject`, params) {
  const axios = getAxiosInstance();
  return axios({
    url,
    method: 'get',
    params,
  });
}

// 下载文件
export function downloadObjectByUrl(url = `/Minio/Client/GetObject`, params) {
  const axios = getAxiosInstance();
  return axios({
    url,
    method: 'get',
    params,
    responseType: 'blob',
    meta: {
      response: true,
    },
  });
}

// 获取文件地址
export function getFileUrl(url = `/Minio/Client/getFileUrl`, params) {
  const axios = getAxiosInstance();
  return axios({
    url,
    method: 'post',
    params,
  });
}
