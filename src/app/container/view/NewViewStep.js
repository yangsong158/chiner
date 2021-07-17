// 分步创建视图
import React, { useState, useMemo, useRef } from 'react';

import { Step, MultipleSelect, Button, FormatMessage } from 'components';
import NewEntity from '../entity/NewEntity';
import NewViewStep2 from './NewViewStep2';

import { importFields } from '../../../lib/datasource_util';
import {getPrefix} from '../../../lib/prefixUtil';

export default React.memo(({prefix, dataSource, dataChange, data, onOK, onCancel}) => {
  const Option = MultipleSelect.Option;
  const [currentKey, updateCurrentKey] = useState(1);
  const cacheData = useMemo(() => ({...data}), []);
  const step2Ref = useRef(null);
  const getData = () => {
    return dataSource?.entities?.filter(e =>
        cacheData?.refEntities?.includes(e.defKey)) || [];
  };
  const _onChange = (value, name, otherName) => {
    let tempValue = value;
    if (name === 'base' && otherName !== 'fields') {
      dataChange && dataChange(tempValue, otherName);
    } else {
      cacheData[name] = tempValue;
      const entityRefsData = getData();
      if (name === 'fields') {
        // 需要组装一下字段信息
        tempValue = importFields(entityRefsData, value, data, false);
      } else if (name === 'refEntities') {
        step2Ref.current?.setTreeData(entityRefsData);
      }
      dataChange && dataChange(tempValue, name);
    }
  };
  const pre = () => {
    updateCurrentKey(currentKey - 1);
  };
  const next = () => {
    updateCurrentKey(currentKey + 1);
  };
  const currentPrefix = getPrefix(prefix);
  return <div className={`${currentPrefix}-view-new`}>
    <div className={`${currentPrefix}-view-new-step`}>
      <Step
        //forceUpdate
        currentKey={currentKey}
        options={[
          {
            title: FormatMessage.string({id: 'menus.add.newViewStep1'}),
            content: (<div>
              <MultipleSelect
                placeholder={FormatMessage.string({id: 'menus.add.newViewMultipleSelect'})}
                onChange={value => _onChange(value, 'refEntities')}
              >
                {
                  dataSource?.entities?.map(v => (
                    <Option key={v.defKey} value={v.defKey}>{`${v.defKey}(${v.defName || v.defKey})`}</Option>))
                }
              </MultipleSelect>
            </div>),
            key: 1,
          },
          {
            title: FormatMessage.string({id: 'menus.add.newViewStep2'}),
            content: <NewViewStep2 ref={step2Ref} onChange={_onChange} getData={getData}/>,
            key: 2,
          },
          {
            title: FormatMessage.string({id: 'menus.add.newViewStep3'}),
            content: <NewEntity
              isNewView
              disableExtend
              dataSource={dataSource}
              dataChange={(value, name) => _onChange(value, 'base', name)}
              data={data}
            />,
            key: 3,
          },
        ]}
      />
    </div>
    <div className={`${currentPrefix}-view-new-opt`}>
      <Button onClick={onCancel}>
        <FormatMessage id='button.cancel'/>
      </Button>
      <Button onClick={pre} style={{display: currentKey === 1 ? 'none' : ''}}>
        <FormatMessage id='menus.add.newViewStepPre'/>
      </Button>
      <Button onClick={next} style={{display: currentKey === 3 ? 'none' : ''}}>
        <FormatMessage id='menus.add.newViewStepNext'/>
      </Button>
      <Button onClick={onOK} style={{display: currentKey === 3 ? '' : 'none'}}>
        <FormatMessage id='button.ok'/>
      </Button>
    </div>
  </div>;
});
