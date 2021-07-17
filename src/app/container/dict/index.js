import React, { useEffect } from 'react';
import { emptyDict } from '../../../lib/datasource_util';
import DictBase from './DictBase';
import { removeDataByTabId } from '../../../lib/cache';
import './style/index.less';

export default React.memo(({dataSource, dictKey, tabDataChange, tabKey,
                             hasRender, hasDestory, param}) => {
  const dictData = (dataSource?.dicts || [])
    .filter(d => d.defKey === dictKey)[0] || emptyDict;
  useEffect(() => () => {
    removeDataByTabId(tabKey);
  }, []);
  const newData = {...dictData};
  const onChange = (data, name) => {
    if (name === 'fields') {
      newData.items = data;
    } else {
      newData[name] = data;
    }
    tabDataChange && tabDataChange({
      type: 'dict',
      key: dictKey,
      data: newData,
    });
  };
  return <DictBase
    param={param}
    hasRender={hasRender}
    hasDestory={hasDestory}
    dataSource={dataSource}
    dictData={dictData}
    dictChange={onChange}
  />;
});
