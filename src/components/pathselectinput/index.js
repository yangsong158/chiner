// 该组件只在electron版本下可用
import React, { useState } from 'react';

import {Icon, Input} from 'components/index';
import './style/index.less';
import { openFileOrDirPath } from '../../lib/middle';
import {getPrefix} from '../../lib/prefixUtil';

export default React.memo(({prefix, defaultValue, title, placeholder, onChange, ...restProps}) => {
  const [value, updateValue] = useState(defaultValue || '');
  const valueOnChange = (e) => {
    const newValue = e.target.value;
    updateValue(newValue);
    onChange && onChange(newValue);
  };
  const selectPath = () => {
    openFileOrDirPath([], ['openDirectory']).then((res) => {
      updateValue(res);
      onChange && onChange(res);
    }).catch((err) => {
      console.log(err);
    });
  };
  let newValue = value;
  if ('value' in restProps) {
    newValue = restProps.value;
  }
  const currentPrefix = getPrefix(prefix);
  return <Input
    placeholder={placeholder}
    value={newValue}
    onChange={valueOnChange}
    suffix={
      <span className={`${currentPrefix}-path-select-input`}>
        <Icon type='fa-ellipsis-h' onClick={selectPath} title={title}/>
      </span>}
  />;
});
