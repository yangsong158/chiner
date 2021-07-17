import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Input,
  FormatMessage,
  FieldSet,
  MultipleSelect,
  Text, Message, Modal,Icon,
} from 'components';

import { addDomResize, removeDomResize } from '../../../lib/listener';

import EntityBasePropertiesList from './EntityBasePropertiesList';
import EntityFields from './EntityFields';
import {getPrefix} from '../../../lib/prefixUtil';


export default React.memo(({prefix, data, dataSource, BaseExtraCom, customerHeaders,
                             dataChange, FieldsExtraOpt, updateDataSource, param,
                             hasRender, hasDestory, getDataSource, openDict}) => {
  const Option = MultipleSelect.Option;
  const id = useMemo(() => Math.uuid(), []);
  const [size, setSize] = useState({width: 0});
  const resizeDomRef = useRef(null);
  const tableRef = useRef(null);
  useEffect(() => {
    addDomResize(resizeDomRef.current, id, () => {
      setSize({
        width: resizeDomRef.current.clientWidth - 10,
      });
    });
    return () => {
      removeDomResize(resizeDomRef.current, id);
    };
  }, []);
  const onChange = (e, name) => {
    dataChange && dataChange(e.target && e.target.value || e, name);
  };
  const getGroups = () => {
    return (dataSource?.viewGroups || [])
        .filter(g => (g?.refEntities || []).includes(data.defKey))
        .map(g => g.defKey);
  };
  const [checkValues, setCheckValues] = useState(() => {
    return getGroups();
  });
  useEffect(() => {
    setCheckValues(getGroups());
  }, [dataSource?.viewGroups, data]);
  const currentPrefix = getPrefix(prefix);
  const onDragOver = (e) => {
    e.preventDefault();
  };
  const onDrop = (e) => {
    const dragData = e.dataTransfer.getData('fields');
    if (dragData) {
      const newFields = JSON.parse(dragData);
      const result = {};
      tableRef.current.updateTableData((pre) => {
        const success = newFields
            .filter(f => (pre.fields || []).findIndex(eFiled => eFiled.defKey === f.defKey) < 0);
        result.success = success.length;
        result.hidden = 0;
        const finalFields = (pre.fields || [])
            .concat(success.map(s => ({
              ...s,
              isStandard: true,
              __key: Math.uuid(),
            })));
        dataChange && dataChange(finalFields, 'fields');
        return {
          ...pre,
          fields: finalFields,
        };
      });
      if (result.success === newFields.length) {
        Message.success({title: FormatMessage.string({id: 'optSuccess'})});
      } else {
        Modal.info({
          title: <FormatMessage id='optEnd'/>,
          message: <div>
            {result.success > 0 && <div>
              <FormatMessage
                id='standardFields.dropFieldsSuccessResult'
                data={{success: result.success}}
              />
              (
              <FormatMessage
                id='standardFields.dropFieldsShowResult'
                data={{show: result.success - result.hidden}}
              />{result.hidden > 0 && <FormatMessage
                id='standardFields.dropFieldsHiddenResult'
                data={{hidden: result.hidden}}
            />})</div>}
            <div>
              <FormatMessage
                id='standardFields.dropFieldsFailResult'
                data={{fail: newFields.length - result.success}}
              />
            </div>
          </div>,
        });
      }
    }
  };
  const ready = (table) => {
    tableRef.current = table;
  };
  const groupChange = (keys) => {
    setCheckValues(keys);
    dataChange(keys, 'group');
  };
  return <div
    className={`${currentPrefix}-entity-base`}
    onDragOver={onDragOver}
    onDrop={onDrop}
  >
    <div className={`${currentPrefix}-form ${currentPrefix}-entity-base-form`}>
      <div ref={resizeDomRef} style={{marginBottom: 8}}>
        <div className={`${currentPrefix}-entity-base-fieldset`}>
          <div className={`${currentPrefix}-form-item`}>
            <span
              className={`${currentPrefix}-form-item-label`}
              title={FormatMessage.string({id: 'tableBase.defKey'})}
              >
              <FormatMessage id='tableBase.defKey'/>
            </span>
            <span className={`${currentPrefix}-form-item-component`}>
              <Input maxLength={32} defaultValue={data.defKey} onChange={e => onChange(e, 'defKey')}/>
            </span>
          </div>
          <div className={`${currentPrefix}-form-item`}>
            <span
              className={`${currentPrefix}-form-item-label`}
              title={FormatMessage.string({id: 'tableBase.defName'})}
              >
              <FormatMessage id='tableBase.defName'/>
            </span>
            <span className={`${currentPrefix}-form-item-component`}>
              <Input maxLength={32} defaultValue={data.defName} onChange={e => onChange(e, 'defName')}/>
            </span>
          </div>
        </div>
        <FieldSet
          title={
            <span>
              <Icon type='icon-xiangximiaoshu'/>
              <span>{FormatMessage.string({id: 'tableBase.other'})}</span>
            </span>
          }
          defaultExpand={false}>
          <div className={`${currentPrefix}-entity-base-other-fieldset`}>
            <div className={`${currentPrefix}-entity-base-other-fieldset-group`}>
              <div className={`${currentPrefix}-form-item`}>
                <span
                  className={`${currentPrefix}-form-item-label`}
                  title={FormatMessage.string({id: 'tableBase.nameTemplate'})}
              >
                  <FormatMessage id='tableBase.nameTemplate'/>
                </span>
                <span className={`${currentPrefix}-form-item-component`}>
                  <Input defaultValue={data.nameTemplate || '{code}[{name}]'} onChange={e => onChange(e, 'nameTemplate')}/>
                </span>
              </div>
              <div className={`${currentPrefix}-form-item`}>
                <span
                  className={`${currentPrefix}-form-item-label`}
                  title={FormatMessage.string({id: 'tableBase.group'})}
              >
                  <FormatMessage id='tableBase.group'/>
                </span>
                <span className={`${currentPrefix}-form-item-component`}>
                  <MultipleSelect
                    onChange={groupChange}
                    checkValue={checkValues}
                >
                    {
                    dataSource?.viewGroups?.map(v => (
                      <Option key={v.defKey} value={v.defKey}>{`${v.defKey}(${v.defName || v.defKey})`}</Option>))
                  }
                  </MultipleSelect>
                </span>
              </div>
            </div>
            <div className={`${currentPrefix}-form-item`}>
              <span
                className={`${currentPrefix}-form-item-label`}
                title={FormatMessage.string({id: 'tableBase.comment'})}
            >
                <FormatMessage id='tableBase.comment'/>
              </span>
              <span className={`${currentPrefix}-form-item-component`}>
                <Text rows={3} defaultValue={data.comment} onChange={e => onChange(e, 'comment')}/>
              </span>
            </div>
            <div className={`${currentPrefix}-form-item`}>
              <span
                className={`${currentPrefix}-form-item-label`}
                title={FormatMessage.string({id: 'tableBase.properties'})}
            >
                <FormatMessage id='tableBase.properties'/>
              </span>
              <span className={`${currentPrefix}-form-item-component`}>
                <EntityBasePropertiesList
                  properties={data.properties || {}}
                  propertiesChange={properties => dataChange(properties, 'properties')}
                />
              </span>
            </div>
            {BaseExtraCom && <BaseExtraCom
              prefix={currentPrefix}
              data={data}
              dataSource={dataSource}
              onChange={e => onChange(e, 'refEntities')}
            />}
          </div>
        </FieldSet>
      </div>
      <FieldSet
        style={{overflow: 'auto'}}
        expandEnable={false}
        title={
          <span>
            <Icon type='icon-ziduanmingxi'/>
            <span>{FormatMessage.string({id: 'tableBase.fields'})}</span>
          </span>
          }
      >
        <div
          style={{width: size.width, height: '100%'}}
        >
          <EntityFields
            openDict={openDict}
            hasRender={hasRender}
            hasDestory={hasDestory}
            param={param}
            freeze
            customerHeaders={customerHeaders}
            ready={ready}
            updateDataSource={updateDataSource}
            FieldsExtraOpt={FieldsExtraOpt}
            data={data}
            dataSource={dataSource}
            dataChange={dataChange}
            getDataSource={getDataSource}
            defaultGroups={checkValues}
          />
        </div>
      </FieldSet>
    </div>
  </div>;
});
