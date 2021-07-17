import { getUserConfig, saveUserConfig } from '../../lib/middle';
import { openLoading, closeLoading, STATUS } from '../common';
import allLangData from '../../lang';
import { setMemoryCache } from '../../lib/cache';
import { CONFIG } from '../../lib/variable';

export const SAVE_USER_CONFIG_SUCCESS = 'SAVE_USER_CONFIG_SUCCESS'; // 保存成功
export const SAVE_USER_CONFIG_FAIL = 'SAVE_USER_CONFIG_FAIL'; // 保存失败
export const GET_USER_CONFIG_SUCCESS = 'GET_USER_CONFIG_SUCCESS'; // 保存成功
export const GET_USER_CONFIG_FAIL = 'GET_USER_CONFIG_FAIL'; // 保存失败


export const changeLanguage = (data = [], type, title) => {
  return (dispatch, getState) => {
    dispatch(openLoading(title));
    const configData = getState()?.config?.data || [];
    const config = configData[0];
    saveUserConfigData(configData.map((d, index) => {
      if (index === 0) {
        return {
          ...d,
          lang: type,
        }
      }
      return d;
    }), allLangData[config.lang].updateConfig)(dispatch);
  };
};

const saveUserConfigSuccess = (data) => {
  return {
    type: SAVE_USER_CONFIG_SUCCESS,
    data,
  };
};

const saveUserConfigFail = (err) => {
  return {
    type: SAVE_USER_CONFIG_FAIL,
    data: err,
  };
};

const getUserConfigSuccess = (data) => {
  return {
    type: GET_USER_CONFIG_SUCCESS,
    data,
  };
};

const getUserConfigFail = (err) => {
  return {
    type: GET_USER_CONFIG_FAIL,
    data: err,
  };
};

export const getUserConfigData = (title) => {
  return (dispatch) => {
    getUserConfig()
      .then((data) => {
        dispatch(getUserConfigSuccess(data));
      })
      .catch((err) => {
        dispatch(getUserConfigFail(err));
      });
  };
};

export const saveUserConfigData = (data, title, cb) => {
  return (dispatch) => {
    dispatch(openLoading(title));
    saveUserConfig(data)
      .then(() => {
        setMemoryCache(CONFIG, {
          ...data,
          lang: data[0]?.lang
        });
        cb && cb();
        dispatch(saveUserConfigSuccess(data));
        dispatch(closeLoading(STATUS[1], null));
      })
      .catch((err) => {
        cb && cb(err);
        dispatch(saveUserConfigFail(err));
        dispatch(closeLoading(STATUS[2], err));
      });
  };
};

export const removeHistory = (h) => {
  return (dispatch, getState) => {
    const configData = getState()?.config?.data || [];
    const config = configData[0];
    saveUserConfigData(configData.map((d, index) => {
      if (index === 0) {
        return {
          ...d,
          projectHistories: (d.projectHistories || []).filter(p => (p.path !== h.path)),
        }
      }
      return d;
    }), allLangData[config.lang].updateConfig)(dispatch);
  }
};

export const addHistory = (data, cb) => {
  return (dispatch, getState) => {
    const configData = getState()?.config?.data || [];
    const config = configData[0];
    saveUserConfigData(configData.map((d, index) => {
      if (index === 0) {
        const tempProjectHistories = [...(d.projectHistories || [])]
          .filter(h => h.path !== data.path); // 移除当前的项目信息
        tempProjectHistories.unshift(data);
        return {
          ...d,
          projectHistories: tempProjectHistories,
        };
      }
      return d;
    }), allLangData[config.lang].updateConfig, cb)(dispatch);
  }
};

export const updateHistory = (oldData, newData) => {
  return (dispatch, getState) => {
    const configData = getState()?.config?.data || [];
    const config = configData[0];
    saveUserConfigData(configData.map((d, index) => {
      if (index === 0) {
        return {
          ...d,
          projectHistories: (d.projectHistories || []).map((h) => {
            if (h.path === oldData.path) {
              return {
                describe: newData.describe || '',
                name: newData.name || '',
                avatar: newData.avatar || '',
                path: newData.path,
              };
            }
            return h;
          }),
        };
      }
      return d;
    }), allLangData[config.lang].updateConfig)(dispatch);
  }
};
