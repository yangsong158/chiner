import React from 'react';

import {Input, MultipleSelect, FormatMessage} from 'components';
import {getPrefix} from '../../../lib/prefixUtil';

export default React.memo(({prefix, dataSource, dataChange, data}) => {
  const currentPrefix = getPrefix(prefix);
  const Option = MultipleSelect.Option;
  return <div>
    <div className={`${currentPrefix}-form`}>
      <div className={`${currentPrefix}-form-item`}>
        <span
          className={`${currentPrefix}-form-item-label`}
          title={FormatMessage.string({id: 'dict.defKey'})}
        >
          <span className={`${currentPrefix}-form-item-label-require`}>{}</span>
          <span>
            <FormatMessage id='dict.defKey'/>
          </span>
        </span>
        <span className={`${currentPrefix}-form-item-component`}>
          <Input onChange={e => dataChange(e.target.value, 'defKey')}/>
        </span>
      </div>
      <div className={`${currentPrefix}-form-item`}>
        <span
          className={`${currentPrefix}-form-item-label`}
          title={FormatMessage.string({id: 'dict.defName'})}
        >
          <FormatMessage id='dict.defName'/>
        </span>
        <span className={`${currentPrefix}-form-item-component`}>
          <Input onChange={e => dataChange(e.target.value, 'defName')}/>
        </span>
      </div>
      <div className={`${currentPrefix}-form-item`}>
        <span
          className={`${currentPrefix}-form-item-label`}
          title={FormatMessage.string({id: 'tableBase.group'})}
        >
          <FormatMessage id='tableBase.group'/>
        </span>
        <span className={`${currentPrefix}-form-item-component`}>
          <MultipleSelect
            onChange={keys => dataChange(keys, 'group')}
            defaultCheckValues={data?.group}
          >
            {
              dataSource?.viewGroups?.map(v => (
                <Option key={v.defKey} value={v.defKey}>{`${v.defKey}(${v.defName || v.defKey})`}</Option>))
            }
          </MultipleSelect>
        </span>
      </div>
    </div>
  </div>;
});

