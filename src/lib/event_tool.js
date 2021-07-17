import * as Component from 'components';

const creatTempInput = () => {
  const input = document.createElement('input');
  document.body.appendChild(input);
  input.style.opacity = '0';
  return input;
};

const removeTempInput = (input) => {
  input.parentElement.removeChild(input);
};

// 复制方法
export const Copy = (data, successMessage) => {
  const input = creatTempInput();
  input.value = typeof data !== 'string' ? JSON.stringify(data) : data;
  input.select();
  if (document.execCommand('copy')) {
    Component.Message.success({title: successMessage});
  }
  removeTempInput(input);
};

// 粘贴方法
export const Paste = (cb) => {
  const input = creatTempInput();
  input.focus();
  if (document.execCommand('paste')) {
    cb && cb(input.value);
  }
  removeTempInput(input);
};

// 全局保存方法ctrl+s
export const Save = (cb) => {
  window.onkeypress = (e) => {
    if ((e.ctrlKey || e.metaKey) && (e.keyCode === 19)) {
      cb && cb();
    }
  };
};
