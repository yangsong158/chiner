import React from 'react';
import {getPrefix} from '../../lib/prefixUtil';

const TabItem = React.memo(({prefix, activeKey, children, currentKey, style}) => {
  const currentPrefix = getPrefix(prefix);
  return (
    <div style={style} className={`${currentPrefix}-tab-content-item-${activeKey === currentKey ? 'show' : 'hidden'}`}>
      {children}
    </div>
  );
});

export default TabItem;
