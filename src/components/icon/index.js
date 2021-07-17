import React from 'react';

import './style/index.less';
import {getPrefix} from '../../lib/prefixUtil';

export default React.forwardRef((props, ref) => {
  const { type, prefix, className = '', style, onClick, title, onMouseOver, onMouseLeave, disable } = props;
  const currentPrefix = getPrefix(prefix);
  const finalClassName = className + (disable ? ` ${currentPrefix}-icon-disable` : '');
  const _onClick = (e) => {
    if (!disable) {
      onClick && onClick(e);
    }
  };
  if (type && type.endsWith('.svg')) {
    return <span
      ref={ref}
      onClick={_onClick}
      onMouseOver={onMouseOver}
      onMouseLeave={onMouseLeave}
      className={`${currentPrefix}-icon ${currentPrefix}-svg-icon ${finalClassName}`}
      style={{background: `url(./asset/svgicon/${type}) no-repeat`, backgroundSize: '100% 100%'}}
    >
      {}
    </span>;
  }
  return (
    <i
      ref={ref}
      onClick={_onClick}
      onMouseOver={onMouseOver}
      onMouseLeave={onMouseLeave}
      style={style}
      className={`${currentPrefix}-icon ${type.startsWith('fa') ? 'fa' : 'iconfont'} ${type} ${finalClassName}`}
      aria-hidden="true"
      title={title}
    >{}</i>
  );
});
