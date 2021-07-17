import React, { useState } from 'react';

import Group from './Group';
import './style/index.less';
import {getPrefix} from '../../lib/prefixUtil';
import Icon from '../icon';

const Checkbox = React.memo(({prefix, onChange, name, value, disable,
                               children, indeterminate = false, defaultChecked, ...restProps}) => {
  const currentPrefix = getPrefix(prefix);
  const [state, setState] = useState(!!defaultChecked);
  const finalChecked = 'checked' in restProps ? restProps.checked : state;
  const _onClick = (e) => {
    if (!disable) {
      const event = {
        target: {
          checked: !finalChecked,
        },
      };
      if (!('checked' in restProps)) {
        setState(event.target.checked);
      }
      onChange && onChange(event, value);
      e.stopPropagation();
    }
  };
  const onClick = (e) => {
    e.stopPropagation();
  };
  return (
    <span
      onClick={_onClick}
      className={`${currentPrefix}-checkbox ${currentPrefix}-checkbox-${disable ? 'disable' : 'normal'}`}
    >
      {
        finalChecked ? <span className={`${currentPrefix}-checkbox-checked`}>
          <Icon type={indeterminate ? 'fa-minus-square' : 'fa-check-square'}/>
        </span> :
        <span className={`${currentPrefix}-checkbox-unchecked`}><Icon type='fa-square-o'/></span>
      }
      <input
        onClick={onClick}
        onChange={_onClick}
        value={value}
        type='checkbox'
        name={name}
        checked={finalChecked}
      />
      {children}
    </span>
  );
});

Checkbox.CheckboxGroup = Group;
Checkbox.defaultProps = {
  type: 'default',
};
export default Checkbox;
