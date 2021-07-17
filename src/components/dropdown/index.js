import React, {useEffect, useRef, useState} from 'react';
import ReactDOM from 'react-dom';

import { firstUp } from '../../lib/string';
import './style/index.less';
import {getPrefix} from '../../lib/prefixUtil';

export default React.memo(({children, trigger, prefix, menus,
                             menuClick, position = 'bottom', filterMenus}) => {
  const currentPrefix = getPrefix(prefix);
  const [visible, setVisible] = useState(false);
  const menuDom = useRef(null);
  const eventPosition = useRef(null);
  const showMenu = (e) => {
    eventPosition.current = {
      clientY: e.clientY,
      clientX: e.clientX,
    };
    setVisible(true);
    e.stopPropagation();
  };
  useEffect(() => {
    if (visible) {
      menuDom.current.style.left = `${eventPosition.current.clientX}px`;
      if (position === 'top') {
        menuDom.current.style.bottom = `${window.innerHeight - eventPosition.current.clientY}px`;
      } else {
        menuDom.current.style.top = `${eventPosition.current.clientY}px`;
      }
      menuDom.current.focus();
    }
  }, [visible]);
  const onBlur = () => {
    setVisible(false);
  };
  const onMenuClick = (m, e) => {
    if (!m.disable) {
      menuClick && menuClick(m, e);
      setVisible(false);
    }
  };
  if (!menus || menus.length === 0) {
    return children;
  }
  return <>
    {React.cloneElement(children, {
      [`on${firstUp(trigger)}`]: showMenu,
    })}
    {
      visible ? ReactDOM.createPortal(<div
        onBlur={onBlur}
        ref={menuDom}
        tabIndex='-1'
        className={`${currentPrefix}-dropdown-container`}
      >
        {
          (menus || []).filter((m) => {
            if (filterMenus) {
              return filterMenus(m);
            }
            return m;
          }).map((m) => {
            return <div
              key={m.name}
              className={`${currentPrefix}-dropdown-item ${currentPrefix}-dropdown-item-${m.disable ? 'disable' : 'normal'}`}
              onClick={e => onMenuClick(m, e)}
            >
              {m.name}
            </div>;
          })
        }
      </div>, document.body) : null
    }
  </>;
});
