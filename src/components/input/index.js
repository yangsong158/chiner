import React, { useState, forwardRef, useRef } from 'react';

import './style/index.less';
import {getPrefix} from '../../lib/prefixUtil';

const Input = React.memo(forwardRef(({ prefix ,defaultValue, suffix, placeholder, readOnly,
                                       onClick, type = 'text', accept, onKeyDown, maxLength,
                                       ...restProps }, ref) => {
  const [stateValue, setDefaultValue]  = useState(defaultValue);
  const composition = useRef(false);
  const _onChange = (e) => {
    const { onChange } = restProps;
    if (composition.current) {
      setDefaultValue(e.target.value);
      onChange && onChange(e);
    } else {
      e.target.value = e.target.value.trim().substr(0, maxLength);
      setDefaultValue(e.target.value);
      onChange && onChange(e);
    }

  };
  const _onBlur = (e) => {
    const { onBlur } = restProps;
    onBlur && onBlur(e);
  };
  let tempValue = stateValue;
  if ('value' in restProps) {
    tempValue = restProps.value;
  }
  const onDragStart = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const onCompositionEnd = (e) => {
    const { onChange } = restProps;
    e.target.value = e.target.value.trim().substr(0, maxLength);
    setDefaultValue(e.target.value);
    onChange && onChange(e);
    composition.current = false;
  };
  const onCompositionStart = () => {
    composition.current = true;
  };
  const currentPrefix = getPrefix(prefix);
  const _onKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.keyCode === 85) {
      const { onChange } = restProps;
      const value = e.target.value === undefined ? '' : e.target.value;
      const newValue = value.toLocaleUpperCase() === value
          ? value.toLocaleLowerCase() : value.toLocaleUpperCase();
      setDefaultValue(newValue);
      e.target.value = newValue;
      onChange && onChange(e);
    }
    onKeyDown && onKeyDown(e);
  };
  return (<span className={`${currentPrefix}-input ${suffix ? `${currentPrefix}-input-suffix-container` : ''}`}>
    <input
      onCompositionStart={onCompositionStart}
      onCompositionEnd={onCompositionEnd}
      onKeyDown={_onKeyDown}
      ref={ref}
      onClick={onClick}
      readOnly={readOnly}
      placeholder={placeholder}
      draggable
      accept={accept}
      onDragStart={onDragStart}
      type={type}
      value={tempValue === 0 ? 0 : (tempValue || '')}
      onChange={_onChange}
      onBlur={_onBlur}
    />
    {suffix && <span className={`${currentPrefix}-input-suffix`}>{suffix}</span>}
  </span>);
}));
export default Input;
