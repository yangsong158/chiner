import React, {useEffect, useRef} from 'react';
import numeral from 'numeral';

import './style/index.less';
import {getPrefix} from '../../lib/prefixUtil';
import {addBodyEvent, removeBodyEvent} from '../../lib/listener';

export default React.memo(({prefix, onChange, disable, ...restProps}) => {
  const currentPrefix = getPrefix(prefix);
  const status = useRef(false);
  const handle = useRef(null);
  const track = useRef(null);
  const onMouseDown = () => {
    status.current = true;
  };
  const onMouseMove = (e) => {
    if (status.current) {
      const { left, width } = track.current.getBoundingClientRect();
      const offset = e.clientX - left;
      let result = numeral(offset).divide(width).multiply(100).value();
      if (offset < 0) {
        result = 0;
        onChange && onChange(0);
      } else if (offset > width) {
        result = 100;
        onChange && onChange(100);
      } else {
        onChange && onChange(Math.ceil(result));
      }
      if (!('value' in restProps)) {
        handle.current.style.left = `${result}%`;
      }
    }
  };
  const onMouseUp = () => {
    status.current = false;
  };
  useEffect(() => {
    const id = Math.uuid();
    addBodyEvent('onmousemove', id, onMouseMove);
    addBodyEvent('onmouseup', id, () => onMouseUp('up'));
    addBodyEvent('onmouseleave', id, () => onMouseUp('leave'));
    return () => {
      removeBodyEvent('onmousemove', id);
      removeBodyEvent('onmouseup', id);
      removeBodyEvent('onmouseleave', id);
    };
  }, []);
  const onClick = (e) => {
    const { left, width } = track.current.getBoundingClientRect();
    const offset = e.clientX - left;
    const result = numeral(offset).divide(width).multiply(100).value();
    if (!('value' in restProps)) {
      handle.current.style.left = `${result}%`;
    }
    onChange && onChange(Math.ceil(result));
  };
  const value = 'value' in restProps ? restProps.value : (restProps.defaultValue || 0);
  return <div className={`${currentPrefix}-slider ${currentPrefix}-slider-${disable ? 'disable' : 'normal'}`}>
    <div onClick={onClick} className={`${currentPrefix}-slider-track`} ref={track}>{}</div>
    <div
      ref={handle}
      onMouseDown={onMouseDown}
      className={`${currentPrefix}-slider-handle`}
      style={{left: `${value}%`}}
    >
      {}
    </div>
  </div>;
});
