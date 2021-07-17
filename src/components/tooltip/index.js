import React, {useState, useEffect, useRef, forwardRef, useImperativeHandle} from 'react';
import ReactDom from 'react-dom';

import './style/index.less';
import {getPrefix} from '../../lib/prefixUtil';

const Tooltip = React.memo(forwardRef(({prefix, children, offsetLeft = 0, offsetTop = 0,
                                         title, visible = true, className = '', mouseEnterDelay = 0,
                                         force, placement = 'bottom'}, ref) => {
  const currentPrefix = getPrefix(prefix);
  const containerRef = useRef(null);
  const parentRef = useRef(null);
  const statusRef = useRef(null);
  const overStatusRef = useRef(null);
  const titleRef = useRef(null);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  useImperativeHandle(ref, () => {
    return {
      setTooltipVisible,
    };
  }, []);
  const _onMouseOver = (e) => {
    const currentTarget = e.currentTarget;
    overStatusRef.current = setTimeout(() => {
      if ((currentTarget.clientWidth < currentTarget.scrollWidth || force)
          && visible && title) {
        if (statusRef.current) {
          clearTimeout(statusRef.current);
        }
        parentRef.current = currentTarget;
        setTooltipVisible(true);
      }
    }, mouseEnterDelay * 1000);
    e.stopPropagation();
  };
  const _onMouseLeave = (e) => {
    if (statusRef.current) {
      clearTimeout(statusRef.current);
    }
    if (overStatusRef.current) {
      clearTimeout(overStatusRef.current);
    }
    statusRef.current = setTimeout(() => {
     containerRef.current && setTooltipVisible(false);
    }, 100);
    e.stopPropagation();
  };
  const onContainerMouseOver = () => {
    if (statusRef.current) {
      clearTimeout(statusRef.current);
    }
    setTooltipVisible(true);
  };
  useEffect(() => {
    if (tooltipVisible) {
      const rect = parentRef.current.getBoundingClientRect();
      containerRef.current.style.display = 'block';
      if (placement === 'bottom') {
        containerRef.current.style.top = `${rect.bottom + 10 + offsetTop}px`;
        containerRef.current.style.left = `${rect.left + (rect.width / 2) - containerRef.current.clientWidth / 2 + offsetLeft}px`;
      } else if (placement === 'top') {
        containerRef.current.style.bottom = `${window.innerHeight - rect.top + 10 + offsetTop}px`;
        containerRef.current.style.left = `${rect.left + (rect.width / 2) - containerRef.current.clientWidth / 2 + offsetLeft}px`;
      } else if (placement === 'topLeft') {
        titleRef.current.style.maxHeight = `${rect.top - 20}px`;
        containerRef.current.style.bottom = `${window.innerHeight - rect.top + 10 + offsetTop}px`;
        containerRef.current.style.right = `${window.innerWidth - rect.x - (rect.width / 2)}px`;
      } else if (placement === 'left') {
        containerRef.current.style.top = `${rect.y + rect.height / 2 - containerRef.current.clientHeight / 2}px`;
        containerRef.current.style.right = `${window.innerWidth - rect.x + 8}px`;
      }
    }
  }, [tooltipVisible]);
  return [React.cloneElement(children, {
    key: 'parent',
    onMouseOver: _onMouseOver,
    onMouseLeave: _onMouseLeave,
  }),
  tooltipVisible && visible && ReactDom.createPortal(<div
    className={`${currentPrefix}-tooltip-container`}
    onMouseOver={onContainerMouseOver}
    onMouseLeave={_onMouseLeave}
  >
    <div className={`${currentPrefix}-tooltip-content ${className}`} ref={containerRef}>
      <div ref={titleRef}>{title}</div>
      <div className={`${currentPrefix}-tooltip-content-arrow-${placement}`}>{}</div>
    </div>
  </div>, document.body),
  ];
}));

export default Tooltip;
