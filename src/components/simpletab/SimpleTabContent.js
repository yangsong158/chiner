import React, { useMemo } from 'react';

export default React.memo(({content, tabId, activeId}) => {
  const actives = useMemo(() => [], []);
  if (!actives.includes(activeId)) {
    // 记录所有已经渲染的tab
    actives.push(activeId);
  }
  if (actives.includes(tabId)) {
    return content;
  }
  return null;
}, (pre, next) => next.activeId !== next.tabId);
