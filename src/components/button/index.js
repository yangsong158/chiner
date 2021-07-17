import React, { useState } from 'react';

import './style/index.less';
import ButtonGroup from './Group';
import Icon from '../icon';
import { getPrefix } from '../../lib/prefixUtil';

const Button = React.memo(({ key, prefix, type, active, children, onClick, disable, style }) => {
  const [status, updateStatus] = useState(disable ? 'disable' : 'normal');
  const _onClick = (e) => {
    if (status === 'normal') {
      onClick && onClick(e, {
        updateStatus,
      });
    }
  };
  const currentPrefix = getPrefix(prefix);
  return (
    <span
      style={style}
      key={key || Math.uuid()}
      className={`${currentPrefix}-button ${currentPrefix}-button-${type} ${currentPrefix}-button-${status} ${active ? `${currentPrefix}-button-${type}-active` : ''}`}
      onClick={_onClick}
    >
      {status === 'loading' ? <Icon type='fa-spinner'/> : children}
    </span>
  );
});

Button.ButtonGroup = ButtonGroup;
Button.defaultProps = {
  type: 'default',
};

export default Button;
