import React, { useState } from 'react';

import SimpleTabContent from './SimpleTabContent';

import './style/index.less';
import {getPrefix} from '../../lib/prefixUtil';
// 结构简单的TAB组件
export default React.memo(({ prefix, options = [], tabActiveChange, type = 'top' }) => {
  const [active, updateActive] = useState(() => {
    tabActiveChange && tabActiveChange(0);
    return 0;
  });
  const _updateActive = (i) => {
    updateActive(i);
    tabActiveChange && tabActiveChange(i);
  };
  const currentPrefix = getPrefix(prefix);
  return <div className={`${currentPrefix}-simple-tab ${currentPrefix}-simple-tab-${type}`}>
    <div className={`${currentPrefix}-simple-tab-titles ${currentPrefix}-simple-tab-titles-${type}`}>
      {
        options.map((o, i) => (
          <span
            key={o.key || o.title}
            onClick={() => _updateActive(i)}
            className={`${currentPrefix}-simple-tab-titles-title-${active === i ? 'active' : 'default'}`}
          >
            {o.title}
          </span>
          ),
        )
      }
    </div>
    <div className={`${currentPrefix}-simple-tab-contents ${currentPrefix}-simple-tab-contents-${type}`}>
      {
        options.map((o, i) => (
          <div
            key={o.key || o.title}
            className={`${currentPrefix}-simple-tab-contents-content-${active === i ? 'active' : 'default'}`}
          >
            <SimpleTabContent
              content={o.content}
              tabId={i}
              activeId={active}
              forceUpdate={o.forceUpdate}
            />
          </div>
          ),
        )
      }
    </div>
  </div>;
});
