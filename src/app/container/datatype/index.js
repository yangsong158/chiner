import React from 'react';
import { Input, FormatMessage } from 'components';
import _ from 'lodash/object';

import './style/index.less';
import {getPrefix} from '../../../lib/prefixUtil';

export default React.memo(({prefix, dataSource, data, dataChange}) => {
  const dataTypeSupport = dataSource?.profile?.dataTypeSupports || [];
  const db = _.get(dataSource, 'profile.default.db', dataTypeSupport[0]);
  const onChange = (e, name) => {
    dataChange && dataChange(e.target.value, name);
  };
  const currentPrefix = getPrefix(prefix);
  return <div className={`${currentPrefix}-datatype ${currentPrefix}-form`}>
    <div className={`${currentPrefix}-form-item`}>
      <span
        className={`${currentPrefix}-form-item-label`}
        title={FormatMessage.string({id: 'dataType.defKey'})}
      >
        <span className={`${currentPrefix}-form-item-label-require`}>{}</span>
        <span>
          <FormatMessage id='dataType.defKey'/>
        </span>
      </span>
      <span className={`${currentPrefix}-form-item-component`}>
        <Input onChange={e => onChange(e, 'defKey')} defaultValue={data.defKey || ''}/>
      </span>
    </div>
    <div className={`${currentPrefix}-form-item`}>
      <span
        className={`${currentPrefix}-form-item-label`}
        title={FormatMessage.string({id: 'dataType.defName'})}
      >
        <FormatMessage id='dataType.defName'/>
      </span>
      <span className={`${currentPrefix}-form-item-component`}>
        <Input onChange={e => onChange(e, 'defName')} defaultValue={data.defName || ''}/>
      </span>
    </div>
    {
      dataTypeSupport.map(d => (
        <div className={`${currentPrefix}-form-item`} key={d}>
          <span
            className={`${currentPrefix}-form-item-label`}
            title={d}
          >
            {`${d}${db === d ? FormatMessage.string({id: 'dataType.defaultDb'}) : ''}`}
          </span>
          <span className={`${currentPrefix}-form-item-component`}>
            <Input onChange={e => onChange(e, d)} defaultValue={data[d] || ''}/>
          </span>
        </div>
      ))
    }
  </div>;
});
