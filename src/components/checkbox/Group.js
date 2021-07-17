import React, { Fragment, useState } from 'react';

const CheckboxGroup = React.memo((
  { defaultValue = [], onChange, children, name, ...restProps }) => {
  const [state, stateUpdate] = useState(defaultValue);
  let tempValue = state;
  if ('value' in restProps) {
    tempValue = restProps?.value || [];
  }
  const _onChange = (e, value) => {
    let newValue = [...tempValue];
    if (e.target.checked) {
      newValue = newValue.concat(value);
    } else {
      newValue = newValue.filter(v => v !== value);
    }
    onChange && onChange({
      ...e,
      target: {
        ...e.target,
        value: newValue,
      },
    });
    stateUpdate(newValue);
  };
  return (
    <Fragment>
      {children.map(c => (React.cloneElement(c, {
        key: c.props?.value,
        name: name,
        checked: tempValue.includes(c.props?.value),
        onChange: _onChange,
      })))}
    </Fragment>
  );
});

export default CheckboxGroup;
