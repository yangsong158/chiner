import { fail, success, reset } from '../../lib/variable';

export const OPEN_LOADING = 'OPEN_LOADING'; // 开启全局的loading
export const CLOSE_LOADING = 'CLOSE_LOADING'; // 关闭全局的loading

export const OPT_RESET = 'OPT_RESET'; // 重置全局的操作状态

export const STATUS = [reset, success, fail]; // 三种状态

export const openLoading = (title) => {
  return {
    type: OPEN_LOADING,
    data: {
      title,
    },
  };
};

export const closeLoading = (status, result, title, type) => {
  return {
    type: CLOSE_LOADING,
    data: {
      status,
      result,
      title,
      pageType: type,
    },
  };
};

export const optReset = (type) => {
  return {
    type: OPT_RESET,
    pageType: type,
  };
};


