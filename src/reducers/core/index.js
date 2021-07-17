import {
  SAVE_PROJECT_SUCCESS,
  SAVE_PROJECT_FAIL,
  READ_PROJECT_FAIL,
  READ_PROJECT_SUCCESS,
  SAVE_VERSION_SUCCESS,
  REMOVE_VERSION_SUCCESS,
  REMOVE_ALL_VERSION_SUCCESS,
  UPDATE_PROJECT,
  CLOSE_PROJECT,
  CREATE_PROJECT_ERROR,
  CREATE_PROJECT_SUCCESS,
  UPDATE_PROJECT_INFO,
} from '../../actions/core';

// 核心的项目编辑或保存
const core = (state = {}, action) => {
  switch (action.type) {
    case SAVE_PROJECT_SUCCESS:
    case UPDATE_PROJECT:
      // 保存或者更新项目
      return {
        ...state,
        data: action.data,
      };
    case SAVE_PROJECT_FAIL:
    case READ_PROJECT_FAIL:
    case CREATE_PROJECT_ERROR:
      return {
        ...state,
        data: action.data,
      };
    case SAVE_VERSION_SUCCESS:
      return {
        ...state,
        versionsData: state?.versionsData?.concat(action.data),
      };
    case REMOVE_VERSION_SUCCESS:
      return {
        ...state,
        versionsData: state?.versionsData?.filter(v => v.version !== action?.data?.version),
      };
    case REMOVE_ALL_VERSION_SUCCESS:
      return {
        ...state,
        versionsData: [],
      };
    case CLOSE_PROJECT:
      return {};
    case UPDATE_PROJECT_INFO:
      return {
        ...state,
        info: action.data,
      };
    case CREATE_PROJECT_SUCCESS:
    case READ_PROJECT_SUCCESS:
      if (action.data.ignoreConfig) {
        return {
          ...action.data,
          info: state.info,
        };
      }
      return {
        ...action.data,
      };
    default:
      return state;
  }
};

export default core;
