/*
 * @Author: Huangjs
 * @Date: 2024-03-11 13:21:17
 * @LastEditors: Huangjs
 * @LastEditTime: 2024-03-20 17:56:03
 * @Description: ******
 */
// API 基本类型
type API = Record<string, any>;

// 将 API 上 K(方法或属性)类型名称全部取出作为联合类型
type APIName<T extends API, K extends 'method' | 'property'> = {
  [P in keyof T]: T[P] extends Function
    ? K extends 'method'
      ? P
      : never
    : K extends 'property'
      ? P
      : never;
}[keyof T];

// 去除 key 带 _ 的内部方法或属性
type APIOutName<T> = T extends `_${string}` ? never : T;

// 1, 传入对应的 T 即 API
// 2, Required 将 API 内部的属性和方法全部变成必选
// 3, APIName 取出 API 内所有属性的 key
// 4, APIOutName 去除 eAPI 属性 key 开头为 _ 的
type AttributeKey<T extends API> = APIOutName<APIName<Required<T>, 'property'>>;

// 同上，只是把属性换成了方法
type MethodKey<T extends API> = APIOutName<APIName<Required<T>, 'method'>>;

// 执行 API 方法的函数定义
export type Method<T extends API> = <M extends MethodKey<T>>(
  method: M,
  args: Parameters<T[M]>,
) => ReturnType<T[M]> | undefined;

// 读取 API 属性的函数定义
export type Attribute<T extends API> = <A extends AttributeKey<T>>(
  attribute: A,
) => T[A] | undefined;

export type JSONPlain = string | number | boolean | null;
export type JSONObject = {
  [key in string | number]?: JSONType;
};
export type JSONType = JSONPlain | JSONPlain[] | JSONObject | JSONObject[];
