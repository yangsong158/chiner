import React, { useEffect, useRef } from 'react';
import ReactDom from 'react-dom';
import {getPrefix} from '../../lib/prefixUtil';
import Icon from '../icon';

import './style/index.less';
import {ConfigContent} from '../../lib/context';
import {getMemoryCache} from '../../lib/cache';
import {CONFIG} from '../../lib/variable';

export const Drawer = React.memo(({prefix, title, onClose, children, width,
                                    bodyStyle, buttons}) => {
  const currentPrefix = getPrefix(prefix);
  const ref = useRef(null);
  const containerRef = useRef(null);
  const updateStyle = () => {
    containerRef.current.style.transform = 'translateX(-100%)';
    setTimeout(() => {
      onClose && onClose();
    }, 300);
  };
  const _iconClose = () => {
    updateStyle();
  };
  useEffect(() => {
    containerRef.current.style.transform = 'translateX(0)';
  }, []);
  useEffect(() => {
    const { current } = ref;
    current && current.focus();
  });
  const onKeyDown = (e) => {
    if (e.key === 'Escape') {
      // 按了键盘的返回键
      updateStyle();
    }
  };
  const onClick = (e) => {
    if (containerRef.current && e.target.compareDocumentPosition(containerRef.current) === 20) {
      updateStyle();
    }
  };
  return (
    <div
      className={`${currentPrefix}-drawer`}
      tabIndex='1'
      onKeyDown={onKeyDown}
      ref={ref}
      onClick={onClick}
      >
      <div
        style={{width}}
        ref={containerRef}
        className={`${currentPrefix}-drawer-container`}
        >
        <div
          className={`${currentPrefix}-drawer-header`}
          >
          <div className={`${currentPrefix}-drawer-header-title`}>{title}</div>
          <Icon className={`${currentPrefix}-drawer-header-icon`} type='fa-times' onClick={_iconClose}/>
        </div>
        <div
          style={{height: `calc(100% - ${buttons ? 64 : 32}px)`, ...bodyStyle}}
          className={`${currentPrefix}-drawer-content`}
          >
          {children}
        </div>
        {
          buttons && <div className={`${currentPrefix}-drawer-button`}>{buttons}</div>
        }
      </div>
    </div>
  );
});

export const openDrawer = (com, params) => {
  const dom = document.createElement('div');
  document.body.appendChild(dom);
  const close = () => {
    const result = ReactDom.unmountComponentAtNode(dom);
    if (result) {
      dom.parentElement.removeChild(dom);
    }
  };
  const DrawerCompose = () => {
    const { title, width,bodyStyle, buttons } = params;
    const _iconClose = () => {
      const { onClose } = params;
      onClose && onClose();
      close();
    };
    return (
      <ConfigContent.Provider value={getMemoryCache(CONFIG)}>
        <Drawer
          buttons={buttons}
          title={title}
          width={width}
          bodyStyle={bodyStyle}
          onClose={_iconClose}
          >
          {com}
        </Drawer>
      </ConfigContent.Provider>
    );
  };
  ReactDom.render(<DrawerCompose/>, dom);
  return {
    close,
  };
};
