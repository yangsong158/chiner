import React, { useRef, useEffect, useState, useMemo } from 'react';
import ReactDOM from 'react-dom';

import { Icon, FormatMessage } from 'components';
import Option from './Option';
import { addBodyClick, removeBodyClick } from '../../lib/listener';
import './style/index.less';
import {getPrefix} from '../../lib/prefixUtil';

const MultipleSelect = React.memo(({prefix, children, dropdownRender, allowClear = true,
                                     defaultCheckValues, onChange, simple = false,
                                     ...restProps}) => {
  const inputRef = useRef(null);
  const optionsRef = useRef(null);
  const selectRef = useRef(null);
  const inputOffsetRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const id = useMemo(() => Math.uuid(), []);
  const [searchValue, updateSearch] = useState('');
  const [checkValues, updateCheckValues] = useState(() => {
    if ('checkValue' in restProps) {
      return restProps.checkValue;
    }
    return defaultCheckValues || [];
  });
  const currentPrefix = getPrefix(prefix);
  useEffect(() => {
    const { current } = selectRef;
    addBodyClick(id, (e) => {
      const target = e.target;
      if (!current.contains(target) && !optionsRef?.current?.contains(target)) {
        // 点击不在多选框的节点内
        setVisible(false);
        if (!simple) {
          inputRef.current.style.width = '4px';
        }
        updateSearch('');
      }
    });
    return () => {
      removeBodyClick(id);
    };
  }, []);
  const inputChange = (e) => {
    const { target } = e;
    if (!simple) {
      const { current } = inputOffsetRef;
      current.innerText = target.value;
      let width = current.clientWidth;
      inputRef.current.style.width = `${width + 2}px`;
    }
    updateSearch(target.value);
  };
  const valueChange = (value, e) => {
    let tempValues = [];
    if (simple) {
      tempValues = [value];
      setVisible(false);
      e.stopPropagation();
    } else if (checkValues.includes(value)) {
      tempValues = checkValues.filter(v => v !== value);
    } else {
      tempValues = checkValues.concat(value);
    }
    updateCheckValues(tempValues);
    onChange && onChange(tempValues);
    updateSearch('');
  };
  const closeClick = (value) => {
    const tempValues = checkValues.filter(v => v !== value);
    updateCheckValues(tempValues);
    onChange && onChange(tempValues);
  };
  let finalCheckValues = checkValues;
  if ('checkValue' in restProps) {
    finalCheckValues = restProps.checkValue;
  }
  const upSearchValue = searchValue.toLocaleUpperCase();
  const options = [].concat(children)
      .filter(c => c.props.value?.toLocaleUpperCase()?.includes(upSearchValue)
          || c.props.children?.toLocaleUpperCase()?.includes(upSearchValue));
  const getChildren = () => {
    const menus = options.length > 0 ? options.map(c => React.cloneElement(c, {
      checkValues: finalCheckValues,
      onChange: valueChange,
    })) : <div className={`${currentPrefix}-multiple-select-empty`}>
      <FormatMessage id='components.multipleselect.empty'/>
    </div>;
    return <div
      className={`${currentPrefix}-multiple-select-children`}
      ref={optionsRef}
    >
      {dropdownRender ? dropdownRender(menus) : menus}
    </div>;
  };
  const selectClick = (e) => {
    const { current } = inputRef;
    current && current.focus();
    setVisible(true);
    if (!simple && (e.target !== current)) {
      inputRef.current.style.width = '4px';
      updateSearch('');
    }
  };
  const selected = [].concat(children).filter(c => finalCheckValues.includes(c.props.value));
  const calcPosition = (dom) => {
    const rectSelect = selectRef.current.getBoundingClientRect();
    optionsRef.current.style.opacity = 1;
    optionsRef.current.style.width = `${rectSelect.width}px`;
    optionsRef.current.style.left = `${rectSelect.x}px`;
    const rect = dom.getBoundingClientRect();
    if ((window.innerHeight - rectSelect.bottom) > rect.height) {
      optionsRef.current.style.height = 'auto';
      optionsRef.current.style.top = `${rectSelect.bottom + 1}px`;
      optionsRef.current.style.bottom = 'unset';
    } else if (((window.innerHeight - rectSelect.bottom) < rect.height)
        && (rectSelect.y > rect.height)) {
      optionsRef.current.style.height = 'auto';
      optionsRef.current.style.top = 'unset';
      optionsRef.current.style.bottom = `${window.innerHeight - rectSelect.top + 1}px`;
    } else {
      optionsRef.current.style.top = `${rectSelect.bottom + 1}px`;
      optionsRef.current.style.bottom = 'unset';
      optionsRef.current.style.height = `${window.innerHeight - rectSelect.bottom - 2}px`;
    }
  };
  useEffect(() => {
    if (visible) {
      calcPosition(optionsRef.current);
    }
  }, [visible, selected, checkValues]);
  const onClear = (e) => {
    e.stopPropagation();
    updateCheckValues([]);
    onChange && onChange([]);
  };
  return <div className={`${currentPrefix}-multiple-select`} onClick={selectClick} ref={selectRef}>
    <div className={`${currentPrefix}-multiple-select-data ${currentPrefix}-multiple-select-data-${visible ? 'focus' : 'normal'}`}>
      {simple ? <span
        title={selected[0]?.props?.children || ''}
        className={`${currentPrefix}-multiple-select-data-item-simple`}
          >{
            searchValue ? '' : (selected[0]?.props?.children || finalCheckValues[0])
          }{allowClear && selected[0]
          && <span
            onClick={onClear}
            className={`${currentPrefix}-multiple-select-data-item-simple-clear`}
          >
            <Icon type='fa-times-circle'/>
          </span>}
      </span> :
          selected.map((c) => {
            return <span key={c.key || c.props.value} className={`${currentPrefix}-multiple-select-data-item`}>
              <span>{c?.props?.children}</span>
              <Icon type='fa-close' onClick={() => closeClick(c.props.value)}/>
            </span>;
          })}
      <span
        className={`${currentPrefix}-multiple-select-data-input-placeholder`}
        style={{display: searchValue || finalCheckValues.length > 0 ? 'none' : ''}}
      >
        {restProps.placeholder || ''}
      </span>
      <input
        ref={inputRef}
        onChange={inputChange}
        value={searchValue}
        className={`${currentPrefix}-multiple-select-data-${simple ? 'simple' : 'normal'}-input`}
      />
      <span
        ref={inputOffsetRef}
        className={`${currentPrefix}-multiple-select-data-hidden-input`}
      />
      {
        visible ? ReactDOM.createPortal(getChildren(), document.body) : null
      }
    </div>
  </div>;
});

MultipleSelect.Option = Option;

export default MultipleSelect;
