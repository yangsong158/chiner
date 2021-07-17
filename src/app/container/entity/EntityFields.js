import React, { useEffect, useRef } from 'react';

import { Table } from 'components';

export default React.memo(({data, dataSource, update, FieldsExtraOpt,customerHeaders,
                             dataChange, offsetHeight, updateDataSource, ready, freeze, param,
                             hasRender, hasDestory, getDataSource, openDict, defaultGroups}) => {
  const tableRef = useRef(null);
  useEffect(() => {
    hasRender && hasRender({
      twinkle: (key) => {
        tableRef.current?.twinkleTr(key);
      },
    });
    return () => {
      hasDestory && hasDestory();
    };
  }, []);
  return <Table
    ref={tableRef}
    twinkle={param?.defKey}
    customerHeaders={customerHeaders}
    freeze={freeze}
    offsetHeight={offsetHeight}
    data={data}
    dataSource={dataSource}
    update={update}
    ExtraOpt={FieldsExtraOpt}
    tableDataChange={dataChange}
    updateDataSource={updateDataSource}
    ready={ready}
    getDataSource={getDataSource}
    openDict={openDict}
    defaultGroups={defaultGroups}
  />;
});
