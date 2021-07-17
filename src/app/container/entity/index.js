import React, {useEffect, useState} from 'react';

import { SimpleTab, FormatMessage } from 'components';
import { getEntityOrViewByName } from '../../../lib/datasource_util';
import EntityBase from './EntityBase';
import EntityCode from './EntityCode';
import EntityIndexes from './EntityIndexes';

import './style/index.less';
import { removeDataByTabId } from '../../../lib/cache';
import {getPrefix} from '../../../lib/prefixUtil';

const Entity = React.memo(({prefix, dataSource, entity, tabDataChange, tabKey,
                             group, BaseExtraCom, customerHeaders,
                             FieldsExtraOpt, updateDataSource, param, hasRender, hasDestory,
                             getDataSource, openDict}) => {
  const iniData = getEntityOrViewByName(dataSource, entity) || {};
  const [data, updateData] = useState(iniData);
  useEffect(() => () => {
    removeDataByTabId(tabKey);
  }, []);
  const dataChange = (value, name) => {
    const tempData = {
      ...data,
      [name]: value,
    };
    updateData(tempData);
    tabDataChange && tabDataChange({
      type: 'entity',
      key: entity,
      data: tempData,
    });
  };
  const currentPrefix = getPrefix(prefix);
  return <div className={`${currentPrefix}-entity`}>
    {/*<div className={`${currentPrefix}-entity-title`}>{entity}</div>*/}
    <div className={`${currentPrefix}-entity-content`}>
      <SimpleTab
        options={[
          {
            key: 'base',
            title:  FormatMessage.string({id: 'tableEdit.data'}),
            content: <EntityBase
              getDataSource={getDataSource}
              hasRender={hasRender}
              hasDestory={hasDestory}
              param={param}
              customerHeaders={customerHeaders}
              FieldsExtraOpt={FieldsExtraOpt}
              data={iniData}
              dataSource={dataSource}
              BaseExtraCom={BaseExtraCom}
              dataChange={dataChange}
              updateDataSource={updateDataSource}
              openDict={openDict}
            />,
          },
          {
            key: 'indexes',
            title: FormatMessage.string({id: 'tableEdit.indexes'}),
            content: <EntityIndexes
              data={data} // 数据发生变化时需要更新
              prefix={prefix}
              dataChange={dataChange}
            />,
          },
          {
            key: 'code',
            title: FormatMessage.string({id: 'tableEdit.codes'}),
            content: <EntityCode
              group={group}
              data={data} // 数据发生变化时需要更新
              dataSource={dataSource}
            />,
          },
          ]}
      />
    </div>
  </div>;
});

export default Entity;
