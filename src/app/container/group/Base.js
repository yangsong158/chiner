import React from 'react';
import { Input, FormatMessage } from 'components';
import {getPrefix} from '../../../lib/prefixUtil';

export default React.memo(({prefix, data, dataChange}) => {
  const currentPrefix = getPrefix(prefix);
  return <div className={`${currentPrefix}-form`}>
    <div className={`${currentPrefix}-form-item`}>
      <span
        className={`${currentPrefix}-form-item-label`}
        title={FormatMessage.string({id: 'group.defKey'})}
      >
        <span className={`${currentPrefix}-form-item-label-require`}>{}</span>
        <span>
          <FormatMessage id='group.defKey'/>
        </span>
      </span>
      <span className={`${currentPrefix}-form-item-component`}>
        <Input defaultValue={data.defKey} onChange={e => dataChange(e.target.value, 'defKey')}/>
      </span>
    </div>
    <div className={`${currentPrefix}-form-item`}>
      <span
        className={`${currentPrefix}-form-item-label`}
        title={FormatMessage.string({id: 'group.defName'})}
      >
        <FormatMessage id='group.defName'/>
      </span>
      <span className={`${currentPrefix}-form-item-component`}>
        <Input defaultValue={data.defName} onChange={e => dataChange(e.target.value, 'defName')}/>
      </span>
    </div>
  </div>;
});
