/*
 * @Author: Huangjs
 * @Date: 2024-03-08 10:39:05
 * @LastEditors: Huangjs
 * @LastEditTime: 2024-03-08 13:42:57
 * @Description: ******
 */

import { type AxiosRequestConfig } from 'axios';

export type ErrorHandler = <T, D>(
  error: { response?: ResponseData<T, D> } & Record<string, any>,
  defMessage: string,
) => any | Promise<any>;
export type ParseResponse = <T, D>(
  response: ResponseData<T, D>,
) => T | Promise<T>;

export type RequestMethod =
  | 'post'
  | 'POST'
  | 'get'
  | 'GET'
  | 'put'
  | 'PUT'
  | 'delete'
  | 'DELETE'
  | 'option'
  | 'OPTION'
  | 'patch'
  | 'PATCH';

export type ResponseData<T, D> = {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  request?: any;
  config: RequestConfig<D>;
};

export type RequestConfig<D> = {
  url: string;
  method: RequestMethod;
  params?: Record<string, string>;
  data?: D;
  headers?: Record<string, string>;
  responseType?: 'blob' | 'json';
  meta?: any;
} & Omit<
  AxiosRequestConfig,
  'url' | 'method' | 'params' | 'data' | 'headers' | 'responseType'
>;

export type RequestOptions = {
  baseURL?: string;
  timeout?: number;
  contentType?: string;
  getToken?: () => [string, string] | Promise<[string, string]>;
  errorHandler?: ErrorHandler;
  parseResponse?: ParseResponse;
};

export interface IRequestConstructor<I> {
  new (options?: RequestOptions): IRequest<I>;
}

export interface IRequest<I> {
  options: RequestOptions;
  instance: I;
  request: <D, T>(config: RequestConfig<D>) => Promise<T | null>;
}
