import { axiosInstance as axios } from '@xnebula/common';

// 获取分片上传数据
export function getPreUploadUrl(url = `/Minio/Client/GetPreUploadUrl`, data) {
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
  return axios({
    url,
    method: 'post',
    data,
  });
}

// 删除文件
export function deleteObject(url = `/Minio/Client/DeleteObject`, params) {
  return axios({
    url,
    method: 'get',
    params,
  });
}

// 下载文件
export function downloadObjectByUrl(url = `/Minio/Client/GetObject`, params) {
  return axios({
    url,
    method: 'get',
    params,
    responseType: 'blob',
  });
}

// 获取文件地址
export function getFileUrl(url = `/Minio/Client/getFileUrl`, params) {
  return axios({
    url,
    method: 'post',
    params,
  });
}
