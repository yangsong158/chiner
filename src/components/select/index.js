import React, { useState } from 'react';

import MultipleSelect from '../multipleselect';
import FormatMessage from '../formatmessage';
import './style/index.less';


const Select = React.memo(({prefix, children = [], style,
                             defaultValue, onChange, notAllowEmpty, ...restProps}) => {
  const [state, updateState] = useState([defaultValue]);
  const emptyChild = notAllowEmpty ? '' :
  <MultipleSelect.Option key='__empty' value=''>
    {FormatMessage.string({id: 'components.select.empty'})}
  </MultipleSelect.Option>;
  const _onChange = (values) => {
    updateState([values[0]]);
    onChange && onChange({
      target: {
        value: values[0] || '',
      },
    });
  };
  let tempValue = state;
  if ('value' in restProps) {
    tempValue = [restProps?.value];
  }
  let allowClear = !!notAllowEmpty;
  if ('allowClear' in restProps) {
    allowClear = restProps.allowClear;
  }
  return <MultipleSelect
    allowClear={allowClear}
    onChange={values => _onChange(values)}
    checkValue={tempValue}
    simple
  >
    {
      emptyChild ? [emptyChild].concat(children) : children
    }
  </MultipleSelect>;
});
Select.Option = MultipleSelect.Option;

export default Select;
