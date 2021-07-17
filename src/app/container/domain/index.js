import React, { useState } from 'react';

import { Input, Select, NumberInput, FormatMessage, Checkbox } from 'components';
import {getPrefix} from '../../../lib/prefixUtil';

const Option = Select.Option;
// 数据域详情组件
export default React.memo(({prefix, dataSource, data, dataChange}) => {
  const [status, setStatus] = useState({len: data.len || data.len === 0,
    scale: data.scale || data.scale === 0});
  const [dataValue, setDataValue] = useState({len: data.len, scale: data.scale});
  const mapping = dataSource?.dataTypeMapping?.mappings || [];
  const onChange = (e, name) => {
    const value = e.target.value || '';
    if (name === 'len' || name === 'scale') {
      setDataValue((pre) => {
        return {
          ...pre,
          [name]: value,
        };
      });
    }
    dataChange && dataChange(value, name);
  };
  const _checkBoxChange = (e, type) => {
    const checked = e.target.checked;
    if (!checked) {
      setDataValue((pre) => {
        return {
          ...pre,
          [type]: '',
        };
      });
      dataChange && dataChange('', type);
    }
    setStatus((pre) => {
      return {
        ...pre,
        [type]: checked,
      };
    });
  };
  const currentPrefix = getPrefix(prefix);
  return <div className={`${currentPrefix}-form`}>
    <div className={`${currentPrefix}-form-item`}>
      <span
        className={`${currentPrefix}-form-item-label`}
        title={FormatMessage.string({id: 'domain.defKey'})}
      >
        <span className={`${currentPrefix}-form-item-label-require`}>{}</span>
        <span>
          <FormatMessage id='domain.defKey'/>
        </span>
      </span>
      <span className={`${currentPrefix}-form-item-component`}>
        <Input onChange={e => onChange(e, 'defKey')} defaultValue={data.defKey || ''}/>
      </span>
    </div>
    <div className={`${currentPrefix}-form-item`}>
      <span
        className={`${currentPrefix}-form-item-label`}
        title={FormatMessage.string({id: 'domain.defName'})}
      >
        <FormatMessage id='domain.defName'/>
      </span>
      <span className={`${currentPrefix}-form-item-component`}>
        <Input onChange={e => onChange(e, 'defName')} defaultValue={data.defName || ''}/>
      </span>
    </div>
    <div className={`${currentPrefix}-form-item`}>
      <span
        className={`${currentPrefix}-form-item-label`}
        title={FormatMessage.string({id: 'domain.applyFor'})}
      >
        <FormatMessage id='domain.applyFor'/>
      </span>
      <span className={`${currentPrefix}-form-item-component`}>
        <Select onChange={e => onChange(e, 'applyFor')} defaultValue={data.applyFor || ''}>
          {
            mapping.map(m => (<Option key={m.defKey} value={m.defKey}>{m.defName}</Option>))
          }
        </Select>
      </span>
    </div>
    <div className={`${currentPrefix}-form-item`}>
      <span
        className={`${currentPrefix}-form-item-label`}
        title={FormatMessage.string({id: 'domain.len'})}
      >
        <Checkbox
          checked={status.len}
          onChange={e => _checkBoxChange(e, 'len')}
        />
        <FormatMessage id='domain.len'/>
      </span>
      <span className={`${currentPrefix}-form-item-component`}>
        <NumberInput
          disable={!status.len}
          onChange={e => onChange(e, 'len')}
          value={dataValue.len === undefined ? '' : dataValue.len}
        />
      </span>
    </div>
    <div className={`${currentPrefix}-form-item`}>
      <span
        className={`${currentPrefix}-form-item-label`}
        title={FormatMessage.string({id: 'domain.scale'})}
      >
        <Checkbox
          checked={status.scale}
          onChange={e => _checkBoxChange(e, 'scale')}
         />
        <FormatMessage id='domain.scale'/>
      </span>
      <span className={`${currentPrefix}-form-item-component`}>
        <NumberInput
          disable={!status.scale}
          onChange={e => onChange(e, 'scale')}
          value={dataValue.scale === undefined ? '' : dataValue.scale}
        />
      </span>
    </div>
  </div>;
});

