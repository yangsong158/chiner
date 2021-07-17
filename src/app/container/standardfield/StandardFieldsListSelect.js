import React, {forwardRef, useImperativeHandle, useRef} from 'react';

import {FormatMessage, ListGroupSelect} from 'components';

import './style/index.less';

export default React.memo(forwardRef(({data, groups, prefix}, ref) => {
  const listGroupSelectRef = useRef(null);
  useImperativeHandle(ref, () => {
    return {
      getStandardFields: () => {
        return listGroupSelectRef.current.getData();
      },
    };
  }, []);
  const formatResult = (importData, repeatData) => {
    return <FormatMessage
      id='components.listSelect.result'
      data={{size: importData.length, repeat: repeatData.length}}
    />;
  };
  return <div className={`${prefix}-list-select`}>
    <ListGroupSelect
      formatResult={formatResult}
      data={data}
      groups={groups}
      ref={listGroupSelectRef}
    />
  </div>;
}));
