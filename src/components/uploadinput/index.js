import React, { useState, useRef } from 'react';

import { Icon, Input } from 'components/index';
import './style/index.less';
import {getPrefix} from '../../lib/prefixUtil';

export default React.memo(({prefix, defaultValue, title,
                             placeholder, onChange, base64, accept, uploadBefore,
                             ...restProps}) => {
  const [value, updateValue] = useState(defaultValue || '');
  const fileInput = useRef(null);
  const _upload = (file) => {
    if (base64) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const result = event.target.result;
        updateValue(result);
        onChange && onChange(result);
      };
    } else {
      updateValue(file.path);
      onChange && onChange(file.path);
    }
  };
  const _onChange = (e) => {
    const { files = [] } = e.target;
    if (files[0]) {
      if (uploadBefore) {
        uploadBefore(files[0]).then(() => {
          _upload(files[0]);
        }).catch(() => {
          console.log('invalid img');
        }).finally(() => {
          const { current } = fileInput;
          current.value = ''; // 重置上传的值
        });
      } else {
        _upload(files[0]);
        const { current } = fileInput;
        current.value = ''; // 重置上传的值
      }
    }
  };
  const valueOnChange = (e) => {
    updateValue(e.target.value);
    onChange && onChange(e.target.value);
  };
  const selectFile = () => {
    const { current } = fileInput;
    current && current.click();
  };
  let newValue = value;
  if ('value' in restProps) {
    newValue = restProps.value;
  }
  const currentPrefix = getPrefix(prefix);
  return <Input
    placeholder={placeholder}
    value={newValue}
    onChange={valueOnChange}
    suffix={
      <span className={`${currentPrefix}-upload-input`}>
        <input type='file' onChange={_onChange} ref={fileInput} readOnly accept={accept}/>
        <Icon type='fa-ellipsis-h' onClick={selectFile} title={title}/>
      </span>}
  />;
});
