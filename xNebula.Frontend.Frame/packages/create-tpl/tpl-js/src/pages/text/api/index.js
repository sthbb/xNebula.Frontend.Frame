import { XCommons } from '@xnebula/frame';
const { request } = XCommons;
// 注意:  request 发起请求, 会自动处理以下两点
// 1: 请求接口的开始部分不需要加 /api, 会自动加上
// 2: 请求响应的结果剥离了第一层 data
/* 就是说, 服务器返回数据一般是以下结构:
{
  code: 2000,
  msg: '',
  data: {},
};
但是
getText().then((data) => {})
中得到的 data 直接就是上述结构里的 data */
export function getText(data) {
  return request({
    url: '/text/getText',
    params: data,
    method: 'get',
    // timeout: 600000, // 请求超时时间
    // responseType: 'blob', // 请求返回类型
    // baseURL: '/api', // 请求基准地址
    // headers: {}, // 请求头
    // 更多配置请参考 axois 官方文档: http://www.axios-js.com/zh-cn/docs/#%E8%AF%B7%E6%B1%82%E9%85%8D%E7%BD%AE
  });
}
