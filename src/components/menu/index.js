import React, { useState, useRef, useImperativeHandle, forwardRef } from 'react';
import _ from 'lodash/object';

import ContextMenu from 'components/contextmenu';
import Icon from '../icon';
import './style/index.less';
import {getPrefix} from '../../lib/prefixUtil';
import { moveArrayPosition } from '../../lib/array_util';
import { allType } from '../../lib/datasource_util';
import {separator} from '../../../profile';
import {firstUp} from '../../lib/string';

const Menu = React.memo(forwardRef(({contextMenus = [], onContextMenu, fieldNames,
                           contextMenuClick, prefix, menus = [], doubleMenuClick, getName,
                           emptyData, defaultExpands, dragTable, groupType,
                           update, dataSource, sortEnable = true, draggable}, ref) => {
  const currentPrefix = getPrefix(prefix);
  const itemBase = `${currentPrefix}-menu-container-fold-item-child-`;
  const { icon, defName, defKey, children } = fieldNames;
  const [expandMenu, updateExpandMenu] = useState(defaultExpands || []);
  const [menusData, updateMenusData] = useState(menus);
  const [insert, updateInsert] = useState(menus);
  const menusDataRef = useRef([]);
  menusDataRef.current = menusData;
  const [position, updatePosition] = useState({top: 0, left: 0});
  const [selectedMenu, updateSelectedMenu] = useState([]);
  const startRef = useRef({index: -1});
  if ((menusData !== menus) && (menusData.length !== 0 && menus.length !== 0)){
    updateMenusData(menus);
  }
  const calcShiftSelected = (item, menu) => {
    let selected = [...selectedMenu];
    if (selected.length === 0) {
      return [item];
    }
    const minIndex = Math.min(...selectedMenu.map(m => menu.children.findIndex((c) => {
      return c.defKey === m.key;
    })));
    const currentIndex = menu.children.findIndex((c) => {
      return item.key === c.defKey;
    });
    if (minIndex >= 0) {
     selected = menu.children.map((m, i) => {
       if ((i >= currentIndex && i <= minIndex) || (i >= minIndex && i <= currentIndex)) {
         return {
           ...item,
           key: m.defKey,
         };
       }
       return null;
     }).filter(m => !!m);
    }
    return selected;
  };
  const onMenuClick = (e, key, type, parentKey, cb, menu) => {
    let tempSelectedMenu = [...selectedMenu];
    if (e.ctrlKey || e.metaKey) {
      if (tempSelectedMenu.some(s => s.key === key)) {
        tempSelectedMenu = tempSelectedMenu.filter(s => s.key !== key);
      } else {
        tempSelectedMenu.push({key, type, parentKey});
      }
    } else if(e.shiftKey) {
      // 自动选择连续
      tempSelectedMenu = calcShiftSelected({key, type, parentKey}, menu);
    } else {
      tempSelectedMenu = tempSelectedMenu.some(s => s.key === key) ? [] : [{key, type, parentKey}];
    }
    cb && cb(tempSelectedMenu);
    updateSelectedMenu(tempSelectedMenu);
  };
  const onDoubleMenuClick = (e, key, type, parentKey, menuIcon) => {
    onMenuClick(e, key, type, parentKey);
    doubleMenuClick && doubleMenuClick(key, type, parentKey, menuIcon);
  };
  const _expandMenuClick = (e, id, type, parentKey) => {
    if (expandMenu.includes(id)) {
      updateExpandMenu(expandMenu.filter(i => i !== id));
    } else {
      updateExpandMenu(expandMenu.concat(id));
    }
    onMenuClick(e, id, type, parentKey);
  };
  const _onContextMenu = (e, key, type, parentKey) => {
    e.stopPropagation();
    if (!selectedMenu.some(s => s.key === key)){
      onMenuClick(e, key, type, parentKey,(data) => {
        onContextMenu && onContextMenu(key, type, data, parentKey);
      });
    } else {
      onContextMenu && onContextMenu(key, type, selectedMenu, parentKey);
    }
    updatePosition({left: e.clientX, top: e.clientY});
  };
  const getClassName = (baseClass, key, childKey, type) => {
    let tempClass = '';
    if (expandMenu.includes(key)) {
      tempClass = `${baseClass}show`;
    } else {
      tempClass = `${baseClass}hidden`;
    }
    if (selectedMenu.some(s => (s.key === childKey) && (s.type === type))) {
      tempClass += ` ${baseClass}selected`;
    }
    if (insert === childKey) {
      tempClass += ` ${baseClass}insert`;
    }
    return tempClass;
  };
  const tempDragTable = (e, child, key, i) => {
    if (e.currentTarget.nodeName === 'SPAN') {
      startRef.current = {
        index: i,
        type: child.type,
      };
      e.stopPropagation();
    } else {
      e.preventDefault();
      dragTable && dragTable(e, key);
    }
  };
  const rowOnDragOver = (e, key) => {
    updateInsert(key);
    e.preventDefault();
  };
  const rowOnDrop = (i, child, parentKey, menu) => {
    if ((child.type === startRef.current.type) &&
        (startRef.current.index > -1) && (startRef.current.index !== i)) {
      const name = allType.filter(t => t.type === child.type)[0];
      if (name) {
        if (parentKey) {
          update && update({
            ...dataSource,
            viewGroups: (dataSource.viewGroups || []).map((g) => {
              if (g.defKey === parentKey) {
                const refName = `ref${firstUp(name.name)}`;
                return {
                  ...g,
                  [refName]: moveArrayPosition(g[refName]
                          .filter(c => menu.children.findIndex(m => m.defKey === c) > -1),
                      startRef.current.index, i > startRef.current.index ? i : i + 1),
                };
              }
              return g;
            }),
          });
        } else {
          update && update({
            ..._.set(
                dataSource,
                name.name,
                moveArrayPosition(_.get(dataSource, name.name)
                        .filter(c => menu.children.findIndex(m => m.defKey === c.defKey) > -1),
                    startRef.current.index, i > startRef.current.index ? i : i + 1),
            ),
          });
        }
      }
    }
    startRef.current = { index: -1 };
    updateInsert('');
  };
  const onContextMenuClick = (...args) => {
    contextMenuClick && contextMenuClick(...args, (type) => {
      updateExpandMenu((pre) => {
        return [...new Set(pre.concat(type))];
      });
    });
  };
  const getDraggable = (m) => {
    if (sortEnable) {
      return m.type === 'entity' ||
          m.type === 'view' ||
          m.type === 'dict' ||
          m.type === 'mapping' ||
          m.type === 'domain' ||
          m.type === 'diagram';
    } else if (draggable){
      return m.type === 'entity';
    }
    return false;
  };
  const getMenuItem = (parentMenu, menu = parentMenu, offsetNumber = 0) => {
    const parentKey = menu === parentMenu ? null : parentMenu[defKey];
    return (
      <ul
        className={`${currentPrefix}-menu-container-fold-item-child-${(expandMenu.includes(parentMenu[defKey]) || offsetNumber === 0) ? 'show' : 'hidden'}`}
        key={menu[defKey]}
        onContextMenu={e => _onContextMenu(e, menu[defKey], menu.type, parentKey)}
      >
        <span
          style={{paddingLeft: 8 * offsetNumber}}
          className={`${currentPrefix}-menu-container-fold-item
          ${selectedMenu.some(s => s.key === menu[defKey] && s.type === menu.type) ? ` ${currentPrefix}-menu-container-fold-item-selected` : ''}`}
          onClick={e => _expandMenuClick(e, menu[defKey], menu.type, parentKey)}
        >
          <Icon type={menu[icon]} className={`${currentPrefix}-menu-container-fold-item-left`}/>
          <span
            className={`${currentPrefix}-menu-container-fold-item-name ${currentPrefix}-menu-container-fold-item-name-parent`}
          >
            {getName && getName(menu) || menu[defName]}({menu[children].length})
          </span>

          <Icon
            style={{
              transform: `${expandMenu.includes(menu[defKey]) ? 'rotate(0deg)' : 'rotate(90deg)'}`,
            }}
            type='fa-angle-down'
            className={`${currentPrefix}-menu-container-fold-item-right`}
          />
        </span>
        {
          (menu[children] || []).filter(child => !!child).map((child, i) => {
            const key = `${child[defKey]}`;
            if (child.children) {
              return getMenuItem(menu, child, offsetNumber + 1);
            }
            const draggableStatus = getDraggable(child);
            return (<li
              key={`${child[defKey]}`}
              onContextMenu={e => _onContextMenu(e, key, child.type, parentKey)}
              onDoubleClick={e => onDoubleMenuClick(e, key, child.type, parentKey, menu.icon)}
              onClick={e => onMenuClick(e ,key, child.type, parentKey, null, menu)}
              className={getClassName(itemBase, menu[defKey], key, child.type)}
              onDragStart={e => tempDragTable(e, child, key, i)}
              draggable={draggableStatus}
              onDragOver={e => rowOnDragOver(e, key)}
              onDrop={() => rowOnDrop(i, child, parentKey, menu)}
            >
              <span
                style={{paddingLeft: 8 * (offsetNumber + 1)}}
                className={`${currentPrefix}-menu-container-fold-item-name-child`}
              >
                {getName && getName(child) || child[defName]}
              </span>
              {
                draggableStatus && <span
                  className={`${currentPrefix}-menu-container-fold-item-drag`}
                  draggable
                  onDragStart={e => tempDragTable(e, child, key, i)}
                >
                  <span>{}</span>
                  <span>{}</span>
                  <span>{}</span>
                  <span>{}</span>
                  <span>{}</span>
                  <span>{}</span>
                </span>
              }
            </li>);
          })
        }
      </ul>
    );
  };
  const jumpPosition = (d, key) => {
    // 计算所有需要展开的父节点
    const group = d.groups[0]; // 多个分组存在的话取第一个分组
    let parent, parents;
    switch (key){
      case 'entities':
        parent = d.type === 'refViews' ? 'views' : 'entities';
        parents = group ? [group, `${group}${separator}${parent}`] : [parent];
        updateSelectedMenu([{
          key: d.defKey,
          parentKey: group,
          type: d.type === 'refViews' ? 'view' : 'entity',
        }]);
        updateExpandMenu(parents);break;
      case 'dicts':
        parent = 'dicts';
        parents = group ? [group, `${group}${separator}${parent}`] : [parent];
        updateSelectedMenu([{
          key: d.defKey,
          parentKey: group,
          type: 'dict',
        }]);
        updateExpandMenu(parents);break;
      default: break;
    }
  };
  const jumpDetail = (d, key) => {
    const positionData = {
      type: d.type,
      groups: d.groups,
    };
    switch (key){
      case 'entities':
        positionData.defKey = d.defKey;
        jumpPosition(positionData, key);break;
      case 'dicts':
        positionData.defKey = d.defKey;
        jumpPosition(positionData, key);break;
      case 'fields':
        positionData.defKey = d.entity;
        jumpPosition(positionData, 'entities');break;
      case 'dictItems':
        positionData.defKey = d.dict;
        jumpPosition(positionData, 'dicts');break;
      default: break;
    }
    const typeMap = {
      refEntities: {
        type: 'entity',
        icon: 'entity.svg',
      },
      refViews: {
        type: 'view',
        icon: 'view.svg',
      },
      refDicts: {
        type: 'dict',
        icon: 'dict.svg',
      },
    };
    const param = (key === 'fields' || key === 'dictItems') ? {defKey: d.defKey} : null;
    doubleMenuClick && doubleMenuClick(positionData.defKey,
        typeMap[d.type].type, d.groups[0], typeMap[d.type].icon, param);
  };
  useImperativeHandle(ref, () => {
    return {
      jumpPosition,
      jumpDetail,
    };
  }, []);
  const _createGroup = (e) => {
    if (groupType === 'modalGroup') {
      onContextMenu && onContextMenu(null,
          'groups',
          { key: null, parentKey: null, type: 'groups' },
          null);
      updatePosition({left: e.clientX, top: e.clientY});
    }
  };
  return (
    <div
      className={`${currentPrefix}-menu-container-fold`}
      onContextMenu={_createGroup}
    >
      {
        menus.length === 0 ? emptyData : <ul>{menus.map(menu => getMenuItem(menu))}</ul>
      }
      <ContextMenu menuClick={onContextMenuClick} menus={contextMenus} position={position}/>
    </div>
  );
}));

Menu.defaultProps = {
  fieldNames: {
    icon: 'icon',
    defKey: 'defKey',
    defName: 'defName',
    children: 'children',
  },
};

export default Menu;
