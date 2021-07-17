import React, { useState, useEffect } from 'react';
import numeral from 'numeral';

import './style/index.less';
import {getPrefix} from '../../lib/prefixUtil';

const NumberInput = React.memo(({ defaultValue, formatter, parser,
                                  onBlur, readOnly, disable, prefix,
                                  maxLength = 14,
                                  min = Number.MIN_SAFE_INTEGER,
                                  max = Number.MAX_SAFE_INTEGER,
                                  ...restProps }) => {
  const calcValue = (v) => {
    const value = numeral(v).value();
    if (typeof value === 'number') {
      const str = `${value}`;
      return formatter ? formatter(str) : str;
    }
    return '';
  };
  const assembleValue = (e, value) => {
    return {
      ...e,
      target: {
        ...e.target,
        value,
      },
    };
  };
  const [stateValue, setStateValue]  = useState('');
  useEffect(() => {
    setStateValue(calcValue('value' in restProps ? restProps.value : defaultValue));
  }, [restProps.value]);
  const _onChange = (e) => {
    const value = e.target.value;
    // 只能输入数字
    const { onChange } = restProps;
    const str = value.replace(/[^0-9]/g, '').substring(0, maxLength);
    const realValue = numeral(str).value();
    let finalValue = '';
    if (typeof realValue === 'number') {
      if (realValue < min) {
        finalValue = min;
        setStateValue(`${min}`);
      } else if (realValue > max){
        finalValue = max;
        setStateValue(`${max}`);
      } else {
        finalValue = realValue;
        setStateValue(`${realValue}`);
      }
    } else {
      setStateValue(finalValue);
    }
    onChange && onChange(assembleValue(e, finalValue));
  };
  const onDragStart = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const getParse = (value) => {
    return parser ? parser(value) : value;
  };
  const _onFocus = () => {
    if (!readOnly) {
      setStateValue(getParse(stateValue));
    }
  };
  const _onBlur = (e) => {
    if (!readOnly) {
      setStateValue(formatter ? formatter(stateValue) : stateValue);
      const finalValue = numeral(getParse(stateValue)).value();
      onBlur && onBlur(assembleValue(e, typeof finalValue === 'number' ? finalValue : ''));
    }
  };
  const currentPrefix = getPrefix(prefix);
  return (<input
    className={`${currentPrefix}-numberinput`}
    disabled={disable}
    readOnly={readOnly}
    draggable
    onDragStart={onDragStart}
    type='text'
    value={stateValue}
    onChange={_onChange}
    onFocus={_onFocus}
    onBlur={_onBlur}
  />);
});
export default NumberInput;
