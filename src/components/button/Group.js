import React, { useState } from 'react';
import { getPrefix } from '../../lib/prefixUtil';

const ButtonGroup = React.memo(({prefix, children, onClick, defaultActive,
                                  disableChangeActive, ...restProps}) => {
  const [active, changeActive] = useState(defaultActive);
  const _onClick = (e, key) => {
    onClick && onClick(e, key);
    !disableChangeActive && changeActive(key);
  };
  const currentPrefix = getPrefix(prefix);
  const finalActiveKey = 'active' in restProps ? restProps.active : active;
  return (
    <div className={`${currentPrefix}-button-group`}>
      {
        children
          .map((c, index) => {
            const buttonKey = c.key || index;
            return React.cloneElement(c, {
              key: buttonKey,
              onClick: e => _onClick(e, buttonKey),
              active: finalActiveKey === buttonKey,
            });
          })
      }
    </div>
  );
});

export default ButtonGroup;
