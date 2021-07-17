import React from 'react';
import Connect from '../dbconnect';

export default React.memo(({prefix, ...rest}) => {
  return <div className={`${prefix}-setting-system-dbconnect`}>
    <Connect {...rest} prefix={prefix}/>
  </div>
});
