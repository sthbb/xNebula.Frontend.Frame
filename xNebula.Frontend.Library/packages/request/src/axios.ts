/*
 * @Author: Huangjs
 * @Date: 2024-03-06 13:45:32
 * @LastEditors: Huangjs
 * @LastEditTime: 2024-03-08 16:26:04
 * @Description: ******
 */
import axios, { type AxiosInstance } from 'axios';
import { catchError } from './shared';
import type { IRequest, RequestConfig, RequestOptions } from './types';

export type { AxiosInstance };

export class AxiosRequest implements IRequest<AxiosInstance> {
  options: RequestOptions;
  instance: AxiosInstance;
  constructor(options?: RequestOptions) {
    const errorHandler = options?.errorHandler;
    const parseResponse = options?.parseResponse || ((a) => a.data);
    // 创建 axios 实例
    const instance = axios.create({
      // API 请求的默认前缀
      baseURL: options?.baseURL || '/',
      timeout: options?.timeout || 60000, // 请求超时时间
      headers: {
        'Content-Type':
          options?.contentType || 'application/json;charset=UTF-8',
      },
    });
    // 请求拦截器
    instance.interceptors.request.use(
      async (config) => {
        const token = await options?.getToken?.();
        if (token) {
          config.headers[token[0]] = token[1];
        }
        return config;
      },
      (e) => catchError<any, any>(e, errorHandler),
    );
    // 响应拦截器
    instance.interceptors.response.use(
      async (response) => {
        const _response = {
          config: response.config as RequestConfig<any>,
          data: response.data,
          status: response.status,
          statusText: response.statusText,
          headers: response.headers as Record<string, string>,
          request: response.request,
        };
        try {
          return await parseResponse<any, any>(_response);
        } catch (e) {
          return catchError<any, any>(
            { request: response.request, response: _response, cause: e },
            errorHandler,
          );
        }
      },
      (e) => catchError<any, any>(e, errorHandler),
    );
    this.options = options || {};
    this.instance = instance;
  }
  request = function request<D, T>(
    this: AxiosRequest,
    config: RequestConfig<D>,
  ) {
    return this.instance.request<any, T, D>(config);
  };
}
