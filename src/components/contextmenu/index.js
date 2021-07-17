import React, { useRef, useEffect } from 'react';

import { Icon } from 'components';
import './style/index.less';
import {getPrefix} from '../../lib/prefixUtil';

const ContextMenu = React.memo(({prefix, menuClick, menus = [], position = {left: 0, top: 0}}) => {
  const defaultShow = !!(position.left || position.top) && menus.length > 0;
  const contextRef = useRef(null);
  const currentPrefix = getPrefix(prefix);
  const _onBlur = () => {
    const contextDom = contextRef?.current;
    contextDom.setAttribute('class', `${currentPrefix}-contextmenu-hidden`);
  };
  const _menuClick = (e, m) => {
    _onBlur();
    menuClick && menuClick(e, m);
  };
  useEffect(() => {
    const contextDom = contextRef?.current;
    if (defaultShow) {
      contextDom.setAttribute('class', `${currentPrefix}-contextmenu-show`);
      const rect = contextDom.getBoundingClientRect();
      if (window.document.body.clientHeight - rect.top < rect.height) {
       // 菜单内容向下溢出 重新调整坐标
        contextDom.style.top = `${window.document.body.clientHeight - rect.height}px`;
      }
    }
    contextDom.focus();
  }, [position]);
  return <div
    className={`${currentPrefix}-contextmenu-hidden`}
    onBlur={_onBlur}
    style={{...position}}
    ref={contextRef}
    tabIndex='0'
  >
    <ul>
      {menus.map(m => (<li onClick={e => _menuClick(e, m)} key={m.key}>
        <span className={`${currentPrefix}-contextmenu-item`}><Icon type={m.icon}/><span>{m.name}</span></span>
      </li>))}
    </ul>
  </div>;
});

export default ContextMenu;
