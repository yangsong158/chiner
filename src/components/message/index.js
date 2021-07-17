import React from 'react';
import ReactDom from 'react-dom';
import Icon from 'components/icon';

import './style/index.less';
import {getPrefix} from '../../lib/prefixUtil';

const Message = React.memo(({title, status, prefix, icon}) => {
  const currentPrefix = getPrefix(prefix);
  return <div
    className={`${currentPrefix}-message`}
  >
    <span className={`${currentPrefix}-message-${status}`}><Icon type={icon}/></span>
    <span>{title}</span>
  </div>;
});

const renderMessage = ({time = 2000, ...restProps}) => {
  const currentPrefix = getPrefix();
  let dom = document.querySelector(`.${currentPrefix}-message-container`);
  if (!dom) {
    dom = document.createElement('div');
    dom.setAttribute('class', `${currentPrefix}-message-container`);
    document.body.appendChild(dom);
  }
  const tempDom = document.createElement('div');
  tempDom.setAttribute('class', `${currentPrefix}-message-context`);
  dom.appendChild(tempDom);
  ReactDom.render(<Message {...restProps}/>, tempDom, () => {
    setTimeout(() => {
      tempDom.parentElement.removeChild(tempDom);
    }, time);
  });
};

Message.success = ({title, time}) => {
  // 操作成功提示
  renderMessage({title, time, status: 'success', icon: 'fa-check'});
};

Message.error = ({title, time}) => {
  // 操作失败提示
  renderMessage({title, time, status: 'error', icon: 'fa-times'});
};

Message.warring = ({title, time}) => {
  // 操作提示
  renderMessage({title, time, status: 'warring', icon: 'fa-info'});
};

export default Message;
