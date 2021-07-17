import React, { useState, useImperativeHandle, forwardRef } from 'react';
import {FormatMessage, Input, Select} from 'components';
import {getPrefix} from '../../../lib/prefixUtil';

export default React.memo(forwardRef(({current, prefix}, ref) => {
  const currentPrefix = getPrefix(prefix);
  const [group, setGroup] = useState({});
  const Option = Select.Option;
  const onChange = (e, type) => {
    if (type === 'group') {
      setGroup({
        ...current.filter(c => c.defKey === e.target.value)[0] || {},
        group: e.target.value,
      });
    } else {
      const value = e.target.value;
      setGroup((pre) => {
        return {
          ...pre,
          [type]: value,
        };
      });
    }
  };
  useImperativeHandle(ref,() => {
    return {
      getGroup: () => group,
    };
  }, [group]);
  return <div className={`${currentPrefix}-standard-fields-select`}>
    <div className={`${currentPrefix}-form-item`}>
      <span
        className={`${currentPrefix}-form-item-label`}
        title={FormatMessage.string({id: 'standardFields.selectGroup'})}
      >
        <FormatMessage id='standardFields.selectGroup'/>
      </span>
      <span className={`${currentPrefix}-form-item-component`}>
        <Select onChange={e => onChange(e, 'group')}>
          {
        current.map(c =>
          <Option key={c.defKey} value={c.defKey}>{c.defName}({c.defKey})</Option>)
      }
        </Select>
      </span>
    </div>
    <div className={`${currentPrefix}-form-item`}>
      <span
        className={`${currentPrefix}-form-item-label`}
        title={FormatMessage.string({id: 'standardFields.groupCode'})}
      >
        <FormatMessage id='standardFields.groupCode'/>
      </span>
      <span className={`${currentPrefix}-form-item-component`}>
        <Input onChange={e => onChange(e, 'defKey')} value={group.defKey}/>
      </span>
    </div>
    <div className={`${currentPrefix}-form-item`}>
      <span
        className={`${currentPrefix}-form-item-label`}
        title={FormatMessage.string({id: 'standardFields.groupName'})}
      >
        <FormatMessage id='standardFields.groupName'/>
      </span>
      <span className={`${currentPrefix}-form-item-component`}>
        <Input onChange={e => onChange(e, 'defName')} value={group.defName}/>
      </span>
    </div>
  </div>;
}));
