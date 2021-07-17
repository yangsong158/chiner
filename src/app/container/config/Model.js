import React from 'react';
import _ from 'lodash/object';
import {getPrefix} from '../../../lib/prefixUtil';
import {FormatMessage, Radio} from 'components';

const RadioGroup = Radio.RadioGroup;

export default React.memo(({prefix, dataChange, dataSource}) => {
  const currentPrefix = getPrefix(prefix);
  const onChange = (e) => {
    dataChange && dataChange(e.target.value, 'profile.modelType');
  };
  const modelType = _.get(dataSource, 'profile.modelType', 'modalAll');
  return <div className={`${currentPrefix}-setting-model`}>
    <div className={`${currentPrefix}-form-item`}>
      <span
          className={`${currentPrefix}-form-item-label`}
          title={FormatMessage.string({id: 'config.ModelLabel'})}
      >
        <FormatMessage id='config.ModelLabel'/>
      </span>
      <span className={`${currentPrefix}-form-item-component`}>
        <span>
          <RadioGroup name='modelType' onChange={onChange} defaultValue={modelType}>
          <Radio value='modalGroup'>
            <FormatMessage id='showGroup'/>
          </Radio>
          <Radio value='modalAll'>
            <FormatMessage id='hiddenGroup'/>
          </Radio>
        </RadioGroup>
        <span
            className={`${currentPrefix}-setting-model-message`}
        >
          <FormatMessage id='config.ModelLabelMessage'/>
        </span>
        </span>
      </span>
    </div>
  </div>
});
