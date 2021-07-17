import React, { useRef, useEffect, useState } from 'react';
import Icon from '../icon';

import { addOnResize, removeOnResize } from '../../lib/listener';
import hoistNonReactStatics from '../../lib/statics';
import {getPrefix} from '../../lib/prefixUtil'; // 将组件的静态属性转移到新组件上

export const AutoCompose = (Com) => {
  // 对tab自动适应显示箭头的拓展方法
  const Tab = React.memo(({prefix, position = 'left', ...restProps}) => {
    const currentPrefix = getPrefix(prefix);
    const tabHeaderWidth = 100;
    const [tabId] = useState(() => {
      return Math.uuid();
    });
    const domRef = useRef(null);
    const leftIcon = useRef(null);
    const rightIcon = useRef(null);
    const _validateScroll = () => {
      // 判断tab标题内容是否溢出
      let offset = 0;
      if (domRef.current) {
        const headerDom = domRef.current.querySelector(`.${currentPrefix}-tab-header`);
        offset = headerDom.offsetWidth - headerDom.scrollWidth;
      }
      return offset;
    };
    const _setArrowStatus = () => {
      // 根据内容调整箭头是否显示
      const leftDom = leftIcon.current;
      const rightDom = rightIcon.current;
      if (_validateScroll() < 0) {
        const headerDom = domRef.current.querySelector(`.${currentPrefix}-tab-header`);
        if (headerDom.scrollLeft <= 0) {
          // 左侧内容已经到底 无法继续向左滚动 隐藏左侧图标
          leftDom.style.display = 'none';
        } else {
          leftDom.style.display = 'inline';
        }
        if (headerDom.scrollLeft + headerDom.clientWidth >= headerDom.scrollWidth) {
          // 右侧内容已经到底 无法继续向右滚动 隐藏右侧图标
          rightDom.style.display = 'none';
        } else {
          rightDom.style.display = 'inline';
        }
      } else {
        leftDom.style.display = 'none';
        rightDom.style.display = 'none';
      }
    };
    const _validateTabInView = () => {
      const headerDom = domRef.current.querySelector(`.${currentPrefix}-tab-header`);
      const activeDom = domRef.current.querySelector(`.${currentPrefix}-tab-header-item-show`);
      if (headerDom && activeDom) {
        const activeRect = activeDom.getBoundingClientRect();
        const headerReact = headerDom.getBoundingClientRect();
        if (activeRect.right < headerReact.x) {
          headerDom.scrollLeft = 0;
        } else if (activeRect.right < headerReact.right){
          // 在可视内容内 无需任何操作
        } else {
          headerDom.scrollLeft = activeRect.right - headerReact.right + headerDom.scrollLeft;
        }
      }
    };
    useEffect(() => {
      if (position === 'top') {
        _validateTabInView();
        _setArrowStatus();
      }
    });
    useEffect(() => {
      if (position === 'top') {
        _setArrowStatus();
        addOnResize(tabId, () => {
          _setArrowStatus();
        });
        return () => {
          removeOnResize(tabId);
        };
      }
      return () => {};
    }, [tabId]);
    const _move = (type) => {
      const headerDom = domRef.current.querySelector(`.${currentPrefix}-tab-header`);
      if (type === 'left') {
        headerDom.scrollLeft -= tabHeaderWidth;
      } else {
        headerDom.scrollLeft += tabHeaderWidth;
      }
      _setArrowStatus();
    };
    const _iconClick = (type) => {
      _move(type);
    };
    return <div className={`${currentPrefix}-auto-compose-tab-${position}`}>
      <Icon
        onClick={() => _iconClick('left')}
        style={{display: 'none'}}
        ref={leftIcon}
        type='fa-angle-left'
        className={`${currentPrefix}-auto-compose-tab-${position}-left-${position === 'top' ? 'show' : 'hidden'}`}
      />
      <Com prefix={currentPrefix} position={position} {...restProps} forwardRef={domRef}/>
      <Icon
        onClick={() => _iconClick('right')}
        style={{display: 'none'}}
        ref={rightIcon}
        type='fa-angle-right'
        className={`${currentPrefix}-auto-compose-tab-${position}-right-${position === 'top' ? 'show' : 'hidden'}`}
      />
    </div>;
  });
  hoistNonReactStatics(Tab, Com);
  return Tab;
};
