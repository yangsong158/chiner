import React from 'react';
import Icon from '../icon';
import DropDown from '../dropdown';

import './style/index.less';
import {getPrefix} from '../../lib/prefixUtil';

export default React.memo(({prefix, children, menuClick, dropDownMenus, position}) => {
  const currentPrefix = getPrefix(prefix);
  const _menuClick = (m) => {
    menuClick && menuClick(m);
  };
  return <span className={`${currentPrefix}-dropbutton`}>
    <span>{children}</span>
    <DropDown trigger='click' menus={dropDownMenus} menuClick={_menuClick} position={position}>
      <span><Icon type='fa-caret-down'/></span>
    </DropDown>
  </span>;
});
