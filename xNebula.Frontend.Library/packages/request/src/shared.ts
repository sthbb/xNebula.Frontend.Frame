import type {
  IRequest,
  IRequestConstructor,
  RequestOptions,
  ErrorHandler,
  ResponseData,
} from './types';

export const catchError = <T, D>(
  error: { response?: ResponseData<T, D> } & Record<string, any>,
  errorHandler: ErrorHandler = (a, b) => console.error(a, b),
) => {
  const defMessage =
    error.message ||
    error.response?.statusText ||
    (error.response?.data ? String(error.response?.data) : '') ||
    '您的网络发生异常，无法连接服务器';
  return errorHandler<T, D>(error, defMessage);
};

export function createRequestFactory<I>(
  ctor: IRequestConstructor<I>,
  options?: RequestOptions,
): IRequest<I> {
  return new ctor(options || {});
}
