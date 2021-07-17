import React, {useRef, useState, useEffect, useMemo } from 'react';

import GroupIconGroup from './GroupIconGroup';
import DropDown from '../dropdown';
import Icon from '../icon';
import './style/index.less';
import {getPrefix} from '../../lib/prefixUtil';
import {addBodyClick, removeBodyClick} from '../../lib/listener';

const GroupIcon = React.memo(({prefix, title, onClick, icon, dropMenu, dropType = 'all',
                                disable, hoverTitle, style, draggable, onMouseDown, groupKey,
                                dropMenuStyle, className = ''}) => {
  const id = useMemo(() => Math.uuid(), []);
  const menuContainerRef = useRef(null);
  const [status, setStatus] = useState(false);
  const currentPrefix = getPrefix(prefix);
  const _onClick = (e) => {
    if (!dropMenu || dropType === 'icon') {
      onClick && onClick(e, groupKey);
    } else {
      setStatus(true);
    }
  };
  const dropClick = (m, e) => {
    onClick && onClick(e, m.key);
    e.stopPropagation();
  };
  const onIconClick = (e) => {
    e.stopPropagation();
  };
  useEffect(() => {
    if (dropType === 'all' && dropMenu && !Array.isArray(dropMenu)) {
      addBodyClick(id, (e) => {
        const position = e.target.compareDocumentPosition(menuContainerRef.current);
        if (position !== 0 && position !== 10) {
          setStatus(false);
        }
      });
      return () => {
        removeBodyClick(id);
      };
    }
    return () => {};
  }, []);
  return (
    <DropDown
      dropStyle={dropMenuStyle}
      disable={disable}
      onClick={onIconClick}
      trigger='click'
      menus={(dropType === 'all' && Array.isArray(dropMenu)) ? dropMenu : []}
      menuClick={dropClick}
      >
      <div
        onMouseDown={onMouseDown}
        draggable={draggable}
        title={hoverTitle}
        className={`${className} ${currentPrefix}-group-icon ${currentPrefix}-group-icon-${disable ? 'disable' : 'normal'} ${currentPrefix}-group-icon-container-${dropMenu ? 'drop' : 'nodrop'}`}
        onClick={disable ? () => {} : _onClick}
        ref={menuContainerRef}
        style={style}
        >
        <span>
          {
          typeof icon === 'string' ? <span className={`${currentPrefix}-group-icon-top`}>
            <Icon type={icon}/>
            {(dropMenu && dropType === 'icon') ?
              <DropDown
                dropStyle={dropMenuStyle}
                disable={disable}
                onClick={onIconClick}
                trigger='click'
                menus={dropMenu}
                menuClick={dropClick}
               >
                <Icon className={`${currentPrefix}-group-icon-drop`} type='fa-caret-down'/>
              </DropDown> : ''}
          </span>
              : icon
        }
        </span>
        <span className={`${currentPrefix}-group-icon-title`}>{title}</span>
        {
          status && <div style={{position: 'absolute', zIndex: '1', top: 56, left: -52}}>
            {dropType === 'all' && !disable && !Array.isArray(dropMenu) && dropMenu}
          </div>
        }
      </div>
    </DropDown>
  );
});

GroupIcon.GroupIconGroup = GroupIconGroup;
export default GroupIcon;
