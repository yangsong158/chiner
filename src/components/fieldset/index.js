import React, { useState, useRef } from 'react';

import Icon from '../icon';
import FormatMessage from '../formatmessage';

import './style/index.less';
import {getPrefix} from '../../lib/prefixUtil';

export default React.memo(({title, children, prefix, style,
                             defaultExpand = true, expandEnable = true, extra}) => {
  const [expand, setExpand] = useState(defaultExpand);
  const contentRef = useRef(null);
  const expandStr = expand ? 'expand' : 'un-expand';
  const onClick = () => {
    expandEnable && setExpand(pre => !pre);
  };
  const currentPrefix = getPrefix(prefix);
  return <div
    style={style}
    className={`${currentPrefix}-fieldset ${currentPrefix}-fieldset-${expandEnable ? 'enable' : 'disable'}`}
  >
    <div onClick={onClick}>
      {title}
      {
        expandEnable && <span
          className={`${currentPrefix}-fieldset-icon ${currentPrefix}-fieldset-icon-${expandStr}`}
        >
          <Icon type='fa-angle-double-down'/>
          <span>{FormatMessage.string({id: !expand ? 'tableEdit.expand' : 'tableEdit.unExpand'})}</span>
        </span>
      }
      <span
        className={`${currentPrefix}-fieldset-extra`}
      >
        {extra}
      </span>
    </div>
    <div ref={contentRef} className={`${currentPrefix}-fieldset-content ${currentPrefix}-fieldset-content-${expandStr}`}>
      {children}
    </div>
  </div>;
});
