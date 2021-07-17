import React, { useState } from 'react';
import * as _ from 'lodash/object';
import { Table, openModal, Button, Checkbox, FormatMessage } from 'components';

import { validateIndexes, emptyIndex } from '../../../lib/datasource_util';
import {getPrefix} from '../../../lib/prefixUtil';

export default React.memo(({ prefix, data, dataChange }) => {
  const commonProps = {
    // 禁用表头拖动排序
    // 禁用表头图标（后续可支持自定义表头图标）
    // 使用自定义的表头，无需从数据获取
    disableHeaderSort: true,
    disableHeaderIcon: true,
    customerHeaders: true,
    // 关闭表头显示
    hiddenHeader: true,
    otherOpt: false,
    fixHeader: false,
  };
  const currentPrefix = getPrefix(prefix);
  const headers = [
    { refKey: 'defKey', value: FormatMessage.string({id: 'tableHeaders.indexesName'})},
    { refKey: 'unique', value: FormatMessage.string({id: 'tableHeaders.indexIsUnique'})},
    { refKey: 'comment', value: FormatMessage.string({id: 'tableHeaders.indexComment'})}];
  const [stateData, updateData] = useState((data?.indexes || [])
    .map(i => ({...i, __key: Math.uuid()})));
  const removeChildren = (changeData) => {
    return changeData.map(d => _.omit(d, ['children']));
  };
  const tableDataChange = (changeData) => {
    const newData = removeChildren(changeData);
    dataChange && dataChange(newData, 'indexes');
    updateData(newData);
  };
  const _dataChange = (fields, index) => {
    const changeData = stateData.map((f) => {
      if (f.__key === index.__key) {
        return {
          ...f,
          fields: fields.map(d => _.omit(d, 'defName')),
        };
      }
      return f;
    });
    const newData = removeChildren(changeData);
    updateData(newData);
    dataChange && dataChange(newData, 'indexes');
  };
  const onAdd = (d) => {
    return new Promise((res) => {
      let modal = null;
      let checkedFields = [];
      const checkChange = (e, defKey) => {
        if (e.target.checked && !checkedFields.includes(defKey)) {
          checkedFields.push(defKey);
        } else if (!e.target.checked && checkedFields.includes(defKey)) {
          checkedFields = checkedFields.filter(f => f !== defKey);
        }
      };
      const onOK = () => {
        res(data?.fields?.filter(f => checkedFields.includes(f.defKey))
            .map(field => ({
              fieldDefKey: field.defKey,
              ascOrDesc: 'A',
              __key: Math.uuid(),
            })));
        modal && modal.close();
      };
      const onCancel = () => {
        modal && modal.close();
      };
      modal = openModal(<div className={`${currentPrefix}-entity-indexes-right-import`}>{
        data?.fields?.filter(f => !(d?.fields || []).map(dF => dF.fieldDefKey).includes(f.defKey))
          .map(f => (
            <div
              key={f.defKey}
            >
              <Checkbox onChange={e => checkChange(e, f.defKey)}/>
              {`${f.defKey}[${f.defName}]`}
            </div>
          ))
      }</div>, {
        title: FormatMessage.string({id: 'tableEdit.importFields'}),
        buttons: [
          <Button key='onOK' onClick={onOK}>
            <FormatMessage id='button.ok'/>
          </Button>,
          <Button key='onCancel' onClick={onCancel}>
            <FormatMessage id='button.cancel'/>
          </Button>,
        ],
      });
    });
  };
  return <div className={`${currentPrefix}-entity-indexes`}>
    <Table
      {...commonProps}
      tableDataChange={tableDataChange}
      validate={validateIndexes}
      defaultEmptyField={emptyIndex}
      hiddenHeader={false}
      expand
      data={{
          headers,
          fields: stateData.map((d) => {
            return {
              ...d,
              children: <Table
                {...commonProps}
                className={`${currentPrefix}-entity-indexes-children-table`}
                tableDataChange={newData => _dataChange(newData, d)}
                disableCopyAndCut
                onAdd={() => onAdd(d)}
                data={{
                    headers: [
                      { refKey: 'fieldDefKey', value: FormatMessage.string({id: 'tableHeaders.indexesFieldKey'}), com: 'label' },
                      { refKey: 'defName', value: FormatMessage.string({id: 'tableHeaders.indexesFieldsName'}), com: 'label' },
                      { refKey: 'ascOrDesc', value: FormatMessage.string({id: 'tableHeaders.indexesFieldsName'}), com: 'select' },
                    ],
                    fields: (d.fields || [])
                        .map((k) => {
                          const entityField = data?.fields?.
                          filter(f => f.defKey === k.fieldDefKey)[0];
                          if (entityField) {
                            return {
                              ...k,
                              defName: entityField.defName,
                            };
                          }
                          return null;
                        })
                        .filter(f => !!f),
                  }}
              />,
            };
          }),
        }}
    />
  </div>;
});
