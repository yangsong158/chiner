import React from 'react';
import { NumberInput, FormatMessage } from 'components';
import {getPrefix} from '../../../lib/prefixUtil';

export default React.memo(({prefix, dataChange, dataSource}) => {
  const { relationFieldSize = 15 } = (dataSource.profile || {});
  const onChange = (e) => {
    dataChange && dataChange(e.target.value, 'profile.relationFieldSize');
  };
  const currentPrefix = getPrefix(prefix);
  return <div className={`${currentPrefix}-setting-relationsize`}>
    <div className={`${currentPrefix}-form-item`}>
      <span
        className={`${currentPrefix}-form-item-label`}
        title={FormatMessage.string({id: 'config.relationFieldSize'})}
      >
        <FormatMessage id='config.relationFieldSize'/>
      </span>
      <span className={`${currentPrefix}-form-item-component`}>
        <NumberInput onChange={onChange} defaultValue={relationFieldSize}/>
      </span>
    </div>
  </div>
});
