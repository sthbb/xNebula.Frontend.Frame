let axiosInstance = null;

let axios = null;
/**
 * @deprecated
 * 该组件自 @xnebula/components@1.0.0 版本后被废弃
 */
export const setAxiosInstance = (i) => {
  axiosInstance = i;
};
/**
 * @deprecated
 * 该组件自 @xnebula/components@1.0.0 版本后被废弃
 */
export const setAxios = (a) => {
  axios = a;
};

export const getAxiosInstance = () => {
  return axiosInstance;
};

export const getAxios = () => {
  return axios;
};
