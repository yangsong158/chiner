import React, { useState } from 'react';

import {Input, Checkbox, openModal, Icon, Button, FormatMessage} from 'components';

import './style/index.less';
import {getPrefix} from '../../lib/prefixUtil';

export default React.memo(({prefix, dataSource, onChange, defaultSelected}) => {
  const currentPrefix = getPrefix(prefix);
  const [value, updateValue] = useState(() => {
    return dataSource.filter(d => (defaultSelected || []).includes(d.key));
  });
  const openSelected = () => {
    let modal = null;
    let checked = value.map(v => v.key);
    const checkChange = (e, key) => {
      const checkedValue = e.target.checked;
      if (checkedValue) {
        checked = [...new Set(checked.concat(key))];
      } else {
        checked = checked.filter(c => c !== key);
      }
      onChange && onChange(checked);
    };
    const onCancel = () => {
      modal && modal.close();
    };
    const onOK = () => {
      updateValue(dataSource.filter(d => checked.includes(d.key)));
      modal && modal.close();
    };
    modal = openModal(<div>
      {
        dataSource.map(f => (
          <div
            key={f.key}
          >
            <Checkbox
              defaultChecked={checked.includes(f.key)}
              onChange={e => checkChange(e, f.key)}
            />
            {`${f.key}[${f.value}]`}
          </div>
          ))
      }
    </div>, {
      title: <FormatMessage id='components.modalInput.select'/>,
      buttons: [
        <Button key='onOK' onClick={onOK}>
          <FormatMessage id='button.ok'/>
        </Button>,
        <Button key='onCancel' onClick={onCancel}>
          <FormatMessage id='button.cancel'/>
        </Button>],
    });
  };
  return <div className={`${currentPrefix}-modal-input`}>
    <Input
      value={value.map(v => v.value || v.key).join(',')}
      onClick={openSelected}
      readOnly
      suffix={<Icon type='fa-ellipsis-h' onClick={openSelected}/>}
      placeholder={<FormatMessage id='components.modalInput.placeholder'/>}
    />
  </div>;
});
