import React from 'react';
import {getPrefix} from '../../lib/prefixUtil';

const GroupIconGroup = React.memo(({prefix, children, style}) => {
  const currentPrefix = getPrefix(prefix);
  return (
    <div className={`${currentPrefix}-group-icon-group`} style={style}>
      {children}
    </div>
  );
});

export default GroupIconGroup;
