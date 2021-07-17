import React, { useState, forwardRef } from 'react';

import './style/index.less';
import Input from 'components/input';
import Icon from 'components/icon';
import {getPrefix} from '../../lib/prefixUtil';

export default React.memo(forwardRef(({prefix, placeholder, onChange, onBlur,
                                        defaultValue, ...restProps}, ref) => {
  const currentPrefix = getPrefix(prefix);
  const [value, setValue] = useState(defaultValue);
  const finalValue = 'value' in restProps ? restProps.value : value;
  const _onChange = (e) => {
    setValue(e.target.value);
    onChange && onChange(e);
  };
  return <div className={`${currentPrefix}-search-input`} ref={ref}>
    <Icon className={`${currentPrefix}-search-input-icon`} type='icon-sousuo'/>
    <Input value={finalValue} placeholder={placeholder} onChange={_onChange} onBlur={onBlur}/>
  </div>;
}));
