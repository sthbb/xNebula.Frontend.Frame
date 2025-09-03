/*
 * @Author: Huangjs
 * @Date: 2024-03-06 13:45:32
 * @LastEditors: Huangjs
 * @LastEditTime: 2024-03-08 16:31:45
 * @Description: ******
 */
import { createRequestFactory } from './shared';
import { type AjaxInstance } from './ajax';
import { AxiosRequest, type AxiosInstance } from './axios';
import type {
  IRequest,
  IRequestConstructor,
  RequestOptions,
  RequestConfig,
} from './types';

let _request: (<D, T>(config: RequestConfig<D>) => Promise<T | null>) | null =
  null;

let _instance: IRequest<AxiosInstance | AjaxInstance> | null = null;

export function isInitialized() {
  return !!_request;
}

export function initRequest(
  ctor?: IRequestConstructor<AxiosInstance | AjaxInstance> | RequestOptions,
  options?: RequestOptions,
) {
  if (!_request) {
    const isConstructor = typeof ctor === 'function';
    _instance = createRequestFactory<AxiosInstance | AjaxInstance>(
      isConstructor
        ? (ctor as IRequestConstructor<AxiosInstance | AjaxInstance>)
        : AxiosRequest,
      isConstructor ? options : (ctor as RequestOptions),
    );
    _request = _instance.request.bind(_instance);
  } else {
    console.warn('Request already initialized.');
  }
  return _request;
}

export function request<D = any, T = any>(config: RequestConfig<D>) {
  if (!_request) {
    throw Error('Please initRequest first.');
  }
  return _request<D, T>(config);
}

export function getRequestInstance() {
  if (!_instance) {
    throw Error('Please initRequest first.');
  }
  return _instance;
}
