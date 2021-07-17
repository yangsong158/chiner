import React, { useEffect, useRef } from 'react';
import ReactDom from 'react-dom';
import { Button, FormatMessage } from 'components';

import { CONFIG } from '../../lib/variable';
import { ConfigContent } from '../../lib/context';
import Icon from '../icon';
import DragCom from '../dragcom';
import {getMemoryCache} from '../../lib/cache';
import './style/index.less';
import {getPrefix} from '../../lib/prefixUtil';

export const Modal = DragCom(React.memo(React.forwardRef(({prefix, title, onClose, focusFirst,
                    children, small, status, buttons = [], closeable = true,
                    fullScreen, bodyStyle = {}, modalStyle = {}, contentStyle = {},
                                                          }, forwardRef) => {
  const currentPrefix = getPrefix(prefix);
  const _iconClose = () => {
    onClose && onClose();
  };
  const ref = useRef(null);
  const fullScreenStyle = fullScreen ? { width: '100%', borderRadius: 0 } : {};
  const fullScreenModalStyle = fullScreen ? { borderRadius: 0, overflow: 'hidden' } : {};
  useEffect(() => {
    const { current } = ref;
    if (focusFirst) {
      const firstInput = current.querySelector('input');
      firstInput && firstInput.focus();
    } else {
      current && current.focus();
    }
  });
  const onKeyDown = (e) => {
    if (e.key === 'Escape' && closeable) {
      // 按了键盘的返回键
      onClose && onClose();
    }
  };
  return (
    <div
      className={`${currentPrefix}-modal`}
      style={{...fullScreenModalStyle, ...modalStyle}}
      tabIndex='1'
      onKeyDown={onKeyDown}
      ref={ref}
      >
      <div
        className={`${currentPrefix}-modal-container ${small ? `${currentPrefix}-modal-header-small` : ''}`}
        ref={forwardRef}
        style={{...fullScreenStyle, ...bodyStyle}}
        >
        <div
          className={`${currentPrefix}-modal-header`}
          >
          <div className={`${currentPrefix}-modal-header-title ${small ? `${currentPrefix}-modal-content-small-${status}` : ''}`}>{title}</div>
          {closeable && <Icon className={`${currentPrefix}-modal-header-icon`} type='fa-times' onClick={_iconClose}/>}
        </div>
        <div
          className={`${currentPrefix}-modal-content ${small ? `${currentPrefix}-modal-content-small` : ''}`}
          style={contentStyle}
          >
          {children}
          <div
            className={`${currentPrefix}-modal-footer`}
            style={{display: buttons.length > 0 ? '' : 'none'}}
            >
            {buttons}
          </div>
        </div>
      </div>
    </div>
  );
})));

export const openModal = (com, params) => {
  const dom = document.createElement('div');
  document.body.appendChild(dom);
  const close = () => {
    const result = ReactDom.unmountComponentAtNode(dom);
    if (result) {
      dom.parentElement.removeChild(dom);
    }
  };
  const ModalCompose = () => {
    const { title, small, buttons, status, fullScreen, bodyStyle,
      modalStyle, contentStyle, closeable, focusFirst } = params;
    const _iconClose = () => {
      const { onClose } = params;
      onClose && onClose();
      close();
    };
    return (
      <ConfigContent.Provider value={getMemoryCache(CONFIG)}>
        <Modal
          closeable={closeable}
          modalStyle={modalStyle}
          bodyStyle={bodyStyle}
          contentStyle={contentStyle}
          fullScreen={fullScreen}
          status={status}
          small={small}
          title={title}
          onClose={_iconClose}
          buttons={buttons}
          focusFirst={focusFirst}
          >
          {com}
        </Modal>
      </ConfigContent.Provider>
    );
  };
  ReactDom.render(<ModalCompose/>, dom);
  return {
    close,
  };
};

Modal.error = ({title, message, bodyStyle = {}, contentStyle = {}}) => {
  return openModal(<React.Fragment>
    <span style={{overflow: 'auto', padding: '5px 0px 15px 0px'}}>{message}</span>
  </React.Fragment>, {
    bodyStyle,
    contentStyle,
    title: <span><Icon type='fa-times'/>{title}</span>,
    small: true,
    status: 'error',
  });
};

Modal.success = ({title, message}) => {
  return openModal(<React.Fragment>
    <span style={{overflow: 'auto', padding: '5px 0px 15px 0px'}}>{message}</span>
  </React.Fragment>, {
    title: <span><Icon type='fa-check'/>{title}</span>,
    small: true,
    status: 'success',
  });
};

Modal.warring = ({title}) => {
  return openModal(title, {small: true, status: 'error'});
};

Modal.info = ({title, message, bodyStyle, contentStyle, closeable}) => {
  return openModal(<React.Fragment>
    <div style={{overflow: 'auto', padding: '5px 0px 15px 0px'}}>{message}</div>
  </React.Fragment>, {
    title: <span><Icon type='fa-info'/>{title}</span>,
    small: true,
    status: 'info',
    bodyStyle,
    contentStyle,
    closeable,
  });
};

Modal.confirm = ({title, message, onOk}) => {
  let modal = null;
  const onCancel = () => {
    modal && modal.close();
  };
  const onOK = () => {
    modal && modal.close();
    onOk && onOk();
  };
  modal = openModal(<React.Fragment>
    <span style={{overflow: 'auto', padding: '5px 0px 15px 0px'}}>{message}</span>
  </React.Fragment>, {
    small: true,
    title: <span><Icon type='fa-question'/>{title}</span>,
    status: 'warring',
    buttons: [
      <Button key='onOK' onClick={onOK}>
        <FormatMessage id='button.ok'/>
      </Button>,
      <Button key='onCancel' onClick={onCancel}>
        <FormatMessage id='button.cancel'/>
      </Button>],
  });
};
