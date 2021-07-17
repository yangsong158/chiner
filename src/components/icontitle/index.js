import React from 'react';

import Icon from '../icon';
import {getPrefix} from '../../lib/prefixUtil';
import './style/index.less';

export default React.memo(({prefix, title, type, onClick, disable, ...restPotps}) => {
  const currentPrefix = getPrefix(prefix);
  const _onClick = (e) => {
    !disable && onClick && onClick(e);
  };
  return <span className={`${currentPrefix}-icon-title ${currentPrefix}-icon-title-${disable ? 'disable' : 'normal'}`} title={title} onClick={_onClick}>
    <Icon disable={disable} type={type} {...restPotps}/>
    {title && <span>{title}</span>}
  </span>;
});
