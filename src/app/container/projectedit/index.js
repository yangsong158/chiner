import React, { useState, useEffect } from 'react';
import { Loading, Modal, Input, UploadInput, PathSelectInput, FormatMessage } from 'components';

import './style/index.less';
// eslint-disable-next-line import/named
import { readJsonPromise, platform, dirname } from '../../../lib/middle';
import {getPrefix} from '../../../lib/prefixUtil';

export default React.memo(({prefix, data = {}, reading, onChange, dataFinish}) => {
  const { path } = data;
  const [dataSource, updateDataSource] = useState({});
  const [loading, updateLoading] = useState(!!path);
  useEffect(() => {
    if (path) {
      setTimeout(() => {
        readJsonPromise(path).then((result) => {
          const newData = {
            ...result,
            path: dirname(path),
          };
          updateDataSource(newData);
          dataFinish && dataFinish(newData);
          updateLoading(false);
        }).catch(() => {
          Modal.error({
            title: FormatMessage.string({id: 'optFail'}),
            message: FormatMessage.string({id: 'project.getProjectDataError'})});
          updateLoading(false);
          dataFinish && dataFinish();
        });
      }, 100);
    }
  }, []);
  const uploadBefore = (file) => {
    // 图标大小56*56 不超过10KB
    return new Promise((res, rej) => {
      if (file.size / 1024 > 10) {
        Modal.error({
          title: FormatMessage.string({id: 'optFail'}),
          message: FormatMessage.string({id: 'project.avatarValidate.validate'}),
        });
        rej();
      }
      // 创建临时的img标签
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const baseData = event.target.result;
        const image = new Image();
        image.src = baseData;
        image.onload = () => {
          if (image.width !== 56 || image.height !== 56){
            Modal.error({
              title: FormatMessage.string({id: 'optFail'}),
              message: FormatMessage.string({id: 'project.avatarValidate.validate'}),
            });
            rej();
          } else {
            res();
          }
        };
      };
    });
  };
  const _onChange = (value, name) => {
    const newDataSource = {
      ...dataSource,
      [name]: value,
    };
    updateDataSource(newDataSource);
    onChange && onChange(newDataSource);
  };
  const currentPrefix = getPrefix(prefix);
  return <Loading visible={loading} title={FormatMessage.string({id: 'project.getProjectData'})}>
    <div className={`${currentPrefix}-form ${currentPrefix}-pro-edit`}>
      <div className={`${currentPrefix}-form-item`}>
        <span
          className={`${currentPrefix}-form-item-label`}
          title={FormatMessage.string({id: 'project.name'})}
        >
          <span className={`${currentPrefix}-form-item-label-require`} style={{display: reading ? 'none' : 'inline'}}>{}</span>
          <span>{FormatMessage.string({id: 'project.name'})}</span>
        </span>
        <span className={`${currentPrefix}-form-item-component`}>
          {
            reading ? dataSource.name : <Input onChange={e => _onChange(e.target.value, 'name')} value={dataSource.name}/>
          }
        </span>
      </div>
      {
        platform === 'json' ? <div className={`${currentPrefix}-form-item`}>
          <span
            className={`${currentPrefix}-form-item-label`}
            title={FormatMessage.string({id: 'project.path'})}
          >
            <span className={`${currentPrefix}-form-item-label-require`} style={{display: reading ? 'none' : 'inline'}}>{}</span>
            <span>
              <FormatMessage id='project.path'/>
            </span>
          </span>
          <span className={`${currentPrefix}-form-item-component`}>
            {
              reading ? dataSource.path : <PathSelectInput onChange={value => _onChange(value, 'path')} value={dataSource.path}/>
            }
          </span>
        </div> : null
      }
      <div className={`${currentPrefix}-form-item`}>
        <span
          className={`${currentPrefix}-form-item-label`}
          title={FormatMessage.string({id: 'project.describe'})}
        >
          <FormatMessage id='project.describe'/>
        </span>
        <span className={`${currentPrefix}-form-item-component`}>
          {
            reading ? dataSource.describe : <Input onChange={e => _onChange(e.target.value, 'describe')} value={dataSource.describe}/>
          }
        </span>
      </div>
      <div className={`${currentPrefix}-form-item`}>
        <span
          className={`${currentPrefix}-form-item-label`}
          title={FormatMessage.string({id: 'project.avatar'})}
        >
          <FormatMessage id='project.avatar'/>
        </span>
        <span className={`${currentPrefix}-form-item-component`}>
          {
            reading ? (dataSource.avatar && <img
              src={dataSource.avatar}
              alt={FormatMessage.string({id: 'project.noAvatar'})}
            />) : <UploadInput
              onChange={value => _onChange(value, 'avatar')}
              value={dataSource.avatar}
              accept='image/png'
              base64
              uploadBefore={uploadBefore}
              placeholder={FormatMessage.string({id: 'project.avatarValidate.placeholder'})}
            />
          }
        </span>
      </div>
      <div className={`${currentPrefix}-form-item`} style={{display: reading ? '' : 'none'}}>
        <span
          className={`${currentPrefix}-form-item-label`}
          title={FormatMessage.string({id: 'project.createDate'})}
        >
          <FormatMessage id='project.createDate'/>
        </span>
        <span className={`${currentPrefix}-form-item-component`}>
          {dataSource.createdTime}
        </span>
      </div>
      <div className={`${currentPrefix}-form-item`} style={{display: reading ? '' : 'none'}}>
        <span
          className={`${currentPrefix}-form-item-label`}
          title={FormatMessage.string({id: 'project.updateDate'})}
        >
          <FormatMessage id='project.updateDate'/>
        </span>
        <span className={`${currentPrefix}-form-item-component`}>
          {dataSource.updatedTime}
        </span>
      </div>
    </div>
  </Loading>;
});
