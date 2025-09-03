/*
 * @Author: Huangjs
 * @Date: 2024-03-08 11:40:34
 * @LastEditors: Huangjs
 * @LastEditTime: 2024-03-08 16:27:11
 * @Description: ******
 */
import { catchError } from './shared';
import type {
  IRequest,
  RequestConfig,
  RequestOptions,
  ResponseData,
} from './types';

export type AjaxInstance = XMLHttpRequest;

export class AjaxRequest implements IRequest<AjaxInstance> {
  options: RequestOptions;
  instance: AjaxInstance;
  constructor(options?: RequestOptions) {
    this.options = options || {};
    this.instance = new XMLHttpRequest();
  }
  request = function request<D, T>(
    this: AjaxRequest,
    config: RequestConfig<D>,
  ) {
    const timeout = this.options.timeout || 6000;
    const baseURL = this.options.baseURL || '/';
    const contentType =
      this.options.contentType || 'application/json;charset=UTF-8';
    const {
      getToken,
      errorHandler,
      parseResponse = (a) => a.data,
    } = this.options;
    const req = (token?: [string, string]) => {
      return new Promise<T | null>((resolve) => {
        const instance = new XMLHttpRequest();
        this.instance = instance;
        instance.timeout = timeout;
        instance.onloadend = function () {
          if (this.status >= 200 && this.status < 300) {
            let response: ResponseData<T, D> | undefined = undefined;
            try {
              const headers: Record<string, any> = {};
              const headerStr = this.getAllResponseHeaders();
              headerStr.split('\n').forEach((line) => {
                const [key, value] = line.split(':');
                headers[key] = value;
              });
              response = {
                config,
                data:
                  this.response instanceof Blob
                    ? this.response
                    : JSON.parse(this.responseText),
                status: this.status,
                statusText: this.statusText,
                headers,
                request: this,
              };
              resolve(parseResponse<T, D>(response));
            } catch (_e) {
              resolve(
                catchError<T, D>({ response, request: this }, errorHandler),
              );
            }
          } else {
            resolve(catchError<T, D>(this, errorHandler));
          }
        };
        instance.onerror = (e) => resolve(catchError<T, D>(e, errorHandler));
        const { url, method, data, params } = config;
        const search: string[] = [];
        params &&
          Object.keys(params).forEach((key) =>
            search.push(`${key}=${encodeURIComponent(params[key])}`),
          );
        instance.open(
          method,
          `${baseURL}${url}${search.length === 0 ? '' : `?${search.join('&')}`}`,
          true,
        );
        instance.setRequestHeader('Content-Type', contentType);
        token && instance.setRequestHeader(token[0], token[1]);
        if (config.headers) {
          Object.keys(config.headers).forEach((key) => {
            instance.setRequestHeader(key, config.headers?.[key] || '');
          });
        }
        if (config.responseType) {
          instance.responseType = config.responseType;
        }
        instance.send(!data ? '' : JSON.stringify(data));
      });
    };
    const _token = getToken?.();
    if (_token && !Array.isArray(_token)) {
      return _token.then((token) => req(token));
    }
    return req(_token);
  };
}
