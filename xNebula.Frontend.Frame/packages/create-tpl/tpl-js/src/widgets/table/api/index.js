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
getSomething().then((data) => {})
中得到的 data 直接就是上述结构里的 data */
export function getSomething(data) {
  // 如果 post, put 等请求, 请求参数放入 data 而不是 params
  // params 会解析放到 url 的 ? 后面, data 会解析放入请求的 body 里
  return request({
    url: '/widget/getSomething',
    params: data,
    // data: data,
    method: 'get',
    // timeout: 600000, // 请求超时时间
    // responseType: 'blob', // 请求返回类型
    // baseURL: '/api', // 请求基准地址
    // headers: {}, // 请求头
    // 更多配置请参考 axois 官方文档: http://www.axios-js.com/zh-cn/docs/#%E8%AF%B7%E6%B1%82%E9%85%8D%E7%BD%AE
  });
}

// 请求可以使用 lcp 提供的方法, 但是为了保持统一, 强烈建议使用上面的
/* import { Utils } from '@lcp/xrenderer';
const { CommonHttp } = Utils;
export function getSomething2(data) {
  // 这里无论什么请求, 请求参数都放入 reqData 里
  return CommonHttp.request({
    url: '/widget/getSomething2',
    method: 'get',
    reqData: data,
    // 更多配置, 请参考 LCP 文档
  });
} */
