import React from 'react';

import './style/index.less';
import {getPrefix} from '../../lib/prefixUtil';

export default React.memo(({prefix, percent = 0, className, showPercent, title}) => {
  const currentPrefix = getPrefix(prefix);
  return <div className={`${currentPrefix}-progressbar ${className}`}>
    {
      showPercent ? <span className={`${currentPrefix}-progressbar-title`}>
        <span style={{marginRight: 5}}>{title}</span>
        <span>{`${percent}%`}</span>
      </span> : ''
    }
    <div className={`${currentPrefix}-progressbar-content`} style={{width: `${percent}%`}}>{}</div>
  </div>;
});
