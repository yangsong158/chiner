import React from 'react';

import { MultipleSelect, FormatMessage } from 'components';
import {getPrefix} from '../../../lib/prefixUtil';

export default React.memo(({prefix, dataSource, dataChange, data}) => {
  const currentPrefix = getPrefix(prefix);
  const Option = MultipleSelect.Option;
  return <div>
    <div className={`${currentPrefix}-form`}>
      <div className={`${currentPrefix}-form-item`}>
        <span
          className={`${currentPrefix}-form-item-label`}
          title={FormatMessage.string({id: 'group.defKey'})}
        >
          <FormatMessage id='group.defKey'/>
        </span>
        <span className={`${currentPrefix}-form-item-component`}>
          <MultipleSelect
            onChange={keys => dataChange(keys, 'group')}
            defaultCheckValues={data || []}
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
