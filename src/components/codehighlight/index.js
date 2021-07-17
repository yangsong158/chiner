import React, { useRef, useEffect } from 'react';

import hljs from 'highlight.js';
import { Copy } from '../../lib/event_tool';
import 'highlight.js/styles/atelier-estuary-dark.css';
import FormatMessage from '../formatmessage';
import DropDown from '../dropdown';

import './style/index.less';
import {getPrefix} from '../../lib/prefixUtil';

export default React.memo(({data, style, prefix, title}) => {
  const ref = useRef(null);
  const valueRef = useRef('');
  const titleRef = useRef(null);
  useEffect(() => {
    hljs.highlightBlock(ref.current);
    titleRef.current.style.opacity = 0;
    ref.current.style.opacity = 1;
  }, [data]);
  const currentPrefix = getPrefix(prefix);
  const dropMenu = [
    { key: 'copy', name: FormatMessage.string({id: 'menus.opt.copy'})},
    { key: 'copyAll', name: FormatMessage.string({id: 'menus.opt.copyAll'})},
  ];
  const menuClick = (m) => {
    let copyData;
    if (m.key === 'copy') {
      copyData = valueRef.current || '';
    } else {
      copyData = ref.current.innerText || '';
    }
    Copy(copyData, FormatMessage.string({id: 'copySuccess'}));
  };
  const onMouseUp = () => {
    valueRef.current = window.getSelection().toString();
  };
  const filterMenus = (m) => {
    if (valueRef.current) {
      return m;
    }
    return m.key === 'copyAll';
  };
  return (<div style={style} className={`${currentPrefix}-code-highlight`}>
    <span ref={titleRef} className={`${currentPrefix}-code-highlight-title`}>
      {title || <FormatMessage id='components.codehighlight.loading'/>}
    </span>
    <DropDown
      filterMenus={filterMenus}
      trigger='contextMenu'
      menus={dropMenu}
      menuClick={menuClick}
    >
      <pre ref={ref} style={{...style, opacity: 0}} onMouseUp={onMouseUp}>
        {typeof data === 'function' ? data() : data}
      </pre>
    </DropDown>
  </div>);
});
