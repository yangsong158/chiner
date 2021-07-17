import React, { useState } from 'react';

import Group from './Group';
import Icon from '../icon';
import './style/index.less';
import {getPrefix} from '../../lib/prefixUtil';

const Radio = React.memo(({prefix, name, value, children, onChange, defaultChecked,
                            ...restProps}) => {
  const currentPrefix = getPrefix(prefix);
  const [state, setState] = useState(!!defaultChecked);
  const finalChecked = 'checked' in restProps ? restProps.checked : state;
  const _onClick = (e) => {
    const event = {
      target: {
        checked: !finalChecked,
        value,
      },
    };
    if (!('checked' in restProps)) {
      setState(event);
    }
    onChange && onChange(event, value);
    e.stopPropagation();
  };
  return (
    <span className={`${currentPrefix}-radio`} onClick={_onClick}>
      {
        finalChecked ? <span className={`${currentPrefix}-radio-checked`}>
          <Icon type='fa-dot-circle-o '/>
        </span> :
        <span className={`${currentPrefix}-radio-unchecked`}><Icon type='fa-circle-o'/></span>
      }
      <input
        onChange={_onClick}
        type='radio'
        name={name}
        value={value}
        checked={finalChecked}
      />
      <span className={`${currentPrefix}-radio-children`}>{children}</span>
    </span>
  );
});
Radio.RadioGroup = Group;
export default Radio;
