import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';

import {Progressbar, Modal, UpdateMessage, FormatMessage} from 'components';
import { fail, success, pageType, CONFIG } from '../../lib/variable';
import './style/index.less';
import { changeLanguage, getUserConfigData, removeHistory } from '../../actions/config';
import Home from '../home';
import {setMemoryCache} from '../../lib/cache';
import {
  openProject,
  updateProject,
  closeProject,
  createProject,
  renameProject,
  removeProject,
  saveProject,
  openDemoProject,
} from '../../actions/core';
import { openLoading, closeLoading } from '../../actions/common';
import {ConfigContent} from '../../lib/context';
import {getPrefix} from '../../lib/prefixUtil';
import {getVersion, compareVersion} from '../../lib/update';
// eslint-disable-next-line import/named
import { platform } from '../../lib/middle';

const Welcome = React.memo(({ prefix, getUserData, config, ...restProps }) => {
  const [percent, updatePercent] = useState(50);
  // 由于显示该标题时还无法获取到用户数据，无法支持国际化
  const [title, updateTitle] = useState('获取配置数据...');
  const [loadingTitle] = useState('加载中');
  useEffect(() => {
    // 第一个页面打开 读取各个配置文件
    getUserData();
  }, []);
  useEffect(() => {
    if (config.result === success) {
      // 读取配置信息成功
      updatePercent(90);
      setMemoryCache(CONFIG, config);
      if (platform === 'json') {
        updateTitle(FormatMessage.string({id: 'welcomeVersionTitle'}));
        getVersion().then((res) => {
          if (compareVersion(res.version)) {
            Modal.info({
              title: FormatMessage.string({id: 'newVersion'}),
              message: <UpdateMessage data={res}/>,
              closeable: !res.forceUpdate,
              bodyStyle: {width: 'auto'},
            });
          }
        }).finally(() => {
         updatePercent(100);
        });
      } else {
        setTimeout(() => {
         updatePercent(100);
        }, 1000);
      }
    } else if (config.result === fail) {
      // 读取配置信息失败
      Modal.error({title: config?.data.toString()});
    }
  }, [config.result]);
  const currentPrefix = getPrefix(prefix);
  if (percent === 100) {
    return <ConfigContent.Provider value={config}>
      <Home config={config} {...restProps}/>
    </ConfigContent.Provider>;
  }
  return <div className={`${currentPrefix}-welcome`}
  >
    <div className={`${currentPrefix}-welcome-header`}>
      <div className={`${currentPrefix}-welcome-header-logo`}>{}</div>
      <div className={`${currentPrefix}-welcome-header-name`}>
        <div>元数建模</div>
        <div>CHINER</div>
      </div>
    </div>
    <div className={`${currentPrefix}-welcome-body`}>
      <div className={`${currentPrefix}-welcome-body-left`}>
        <div className={`${currentPrefix}-welcome-body-left-bg`}>
          {}
        </div>
      </div>
      <div className={`${currentPrefix}-welcome-body-right`}>
        <div className={`${currentPrefix}-welcome-body-right-circle`}>
          {}
        </div>
        <div className={`${currentPrefix}-welcome-body-right-icon`}>
          {}
        </div>
        <div className={`${currentPrefix}-welcome-body-right-loading`}>
          <span>{loadingTitle}</span>
          <span className={`${currentPrefix}-welcome-body-right-loading-block`}>{}</span>
          <span className={`${currentPrefix}-welcome-body-right-loading-block`}>{}</span>
          <span className={`${currentPrefix}-welcome-body-right-loading-block`}>{}</span>
        </div>
        <div className={`${currentPrefix}-welcome-body-right-progress`}>
          <Progressbar title={title} percent={percent} className={`${currentPrefix}-welcome-progressbar`} showPercent/>
        </div>
        <div className={`${currentPrefix}-welcome-body-right-copy`}>
          Sino(Chinese)Pupular&nbsp;entity&nbsp;relation&nbsp;graph&nbsp;soft
        </div>
      </div>
    </div>
    {/* eslint-disable-next-line max-len */}
    {/*<Progressbar title={title} percent={percent} className={`${currentPrefix}-welcome-progressbar`} showPercent/>*/}
  </div>;
});

const mapStateToProps = (state) => {
  return {
    projectInfo: state.core.info,
    dataSource: state.core.data,
    versionsData: state.core.versionsData,
    config: state.config,
    common: state.common,
  };
};
const mapDispatchToProps = (dispatch, { store }) => {
  return {
    getUserData: (title) => {
      dispatch(getUserConfigData(title));
    },
    openTemplate: (h, title) => {
      dispatch(openDemoProject(h, title, pageType[2]));
    },
    open: (title, path, suffix, ignoreConfig) => {
      dispatch(openProject(title, pageType[2], path, suffix, ignoreConfig));
    },
    close: () => {
      dispatch(closeProject(pageType[1]));
    },
    update: (data) => {
      dispatch(updateProject(data));
    },
    rename: (newData, oldData, title) => {
      dispatch(renameProject(newData, oldData, title));
    },
    delete: (data, title) => {
      dispatch(removeProject(data, title));
    },
    save: (data, title, saveAs) => {
      dispatch(saveProject(data, saveAs));
    },
    changeLang: (type, title) => {
      dispatch(changeLanguage(store.getState()?.config?.data, type, title));
    },
    create: (data, path, title) => {
      dispatch(createProject(data, path, title, pageType[2]));
    },
    openLoading: (title) => {
      dispatch(openLoading(title));
    },
    closeLoading: () => {
      dispatch(closeLoading());
    },
    updateHistory: (opt, ...data) => {
      switch (opt) {
        case 'remove': dispatch(removeHistory(...data));break;
        default: break;
      }
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Welcome);
