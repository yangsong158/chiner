import React from 'react';

import { Loading, Modal, FormatMessage } from 'components';
import './style/index.less';
import {fail, pageType} from '../../lib/variable';
import Main from '../main';
import Home from './Home';
import {getPrefix} from '../../lib/prefixUtil';

export default React.memo(({prefix, open, create, rename, updateHistory, openTemplate,
                             ...restProps}) => {
  const { lang = 'zh' } = restProps?.config;
  const status = restProps?.common?.status;
  const type = restProps?.common?.type;
  const currentPrefix = getPrefix(prefix);
  const _open = (path) => {
    open(FormatMessage.string({id: 'readProject'}), path);
  };
  const _openTemplate = (data) => {
    openTemplate(data, FormatMessage.string({id: 'readProject'}));
  };
  const _create = (data, path) => {
    create(data, path, FormatMessage.string({id: 'createProject'}));
  };
  const _rename = (newData, oldData) => {
    rename(newData, oldData, FormatMessage.string({id: 'renameProject'}));
  };
  const _deleteProject = (h) => {
    restProps?.delete(h, FormatMessage.string({id: 'deleteProject'}));
  };
  if (status === fail) {
    Modal.error({title: FormatMessage.string({id: 'optFail'}), message: restProps?.common?.result.toString()});
  }
  return <Loading visible={restProps?.common.loading} title={restProps?.common.title}>
    {!(type === pageType[2]) ? <Home
      updateHistory={updateHistory}
      importProject={_open}
      createProject={_create}
      renameProject={_rename}
      deleteProject={_deleteProject}
      openTemplate={_openTemplate}
      lang={lang}
      config={restProps?.config}
    /> : <Main
      {...restProps}
      prefix={currentPrefix}
      open={open}
    />}
  </Loading>;
});
