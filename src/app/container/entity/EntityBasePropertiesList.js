import React, {useState, useRef, useMemo} from 'react';
import {Input, FormatMessage, DropButton, IconTitle} from 'components';
import { moveArrayPosition } from '../../../lib/array_util';
import {getPrefix} from '../../../lib/prefixUtil';


export default React.memo(({prefix, properties, propertiesChange}) => {
  const [data, updateData] = useState(() => {
    return Object.keys(properties)
      .reduce((a, b) => a.concat({data: [b || '' , properties[b] || ''], __key: Math.uuid()}) , []);
  });
  const [selected, updateSelected] = useState('');
  const dataRef = useRef(data);
  dataRef.current = data;
  const selectedRef = useRef(selected);
  selectedRef.current = selected;
  const rowSelected = (p) => {
    if (selected === p) {
      updateSelected('');
    } else {
      updateSelected(p);
    }
  };
  const propsChange = (newData) => {
    propertiesChange && propertiesChange(newData.reduce((a, b) => {
      const tempA = {...a};
      const name = b?.data[0] || '';
      if (name) {
        tempA[b?.data[0]] = b?.data[1] || '';
      }
      return tempA;
    }, {}));
  };
  const optProperty = (type) => {
    const optIndex = data.findIndex(d => d.__key === selected);
    if (type === 'delete' && selected) {
      if (optIndex === (data.length - 1)) {
        updateSelected(data[optIndex - 1]?.__key);
      } else {
        updateSelected(data[optIndex + 1]?.__key);
      }
      const tempData = data.filter(d => d.__key !== selected);
      updateData(tempData);
      propsChange(tempData);
    } else if (type === 'add') {
      let tempData = [...data];
      const newData = {data: ['' , ''], __key: Math.uuid()};
      if (selected) {
        tempData.splice(optIndex, 0, newData);
      } else {
        tempData = data.concat(newData);
      }
      updateData(tempData);
      propsChange(tempData);
    } else if (type === 'up' || type === 'down') {
      const tempData = moveArrayPosition(data, optIndex, type === 'up' ? optIndex - 1 : optIndex + 1);
      updateData(tempData);
      propsChange(tempData);
    }
  };
  const onChange = (e, key, index) => {
    const value = e.target.value;
    const tempData = data.map((d) => {
      if (d.__key === key) {
        return {
          ...d,
          data: (d.data || []).map((a, i) => {
            if (i === index) {
              return value;
            }
            return a;
          }),
        };
      }
      return d;
    });
    updateData(tempData);
    propsChange(tempData);
  };
  const currentPrefix = getPrefix(prefix);
  const dropDownMenus = useMemo(() => ([
    {key: 5, name: FormatMessage.string({id: 'tableBase.addPropertyCount', data: {count: 5}})},
    {key: 10, name: FormatMessage.string({id: 'tableBase.addPropertyCount', data: {count: 10}})},
    {key: 15, name: FormatMessage.string({id: 'tableBase.addPropertyCount', data: {count: 15}})},
  ]),[]);
  const menuClick = (m) => {
    const count = m.key;
    let tempData = [...dataRef.current];
    const newData = [];
    for (let i = 0; i < count; i += 1) {
      newData.push({data: ['' , ''], __key: Math.uuid()});
    }
    if (selectedRef.current) {
      const optIndex = dataRef.current.findIndex(d => d.__key === selectedRef.current);
      tempData.splice(optIndex + 1, 0, ...newData);
    } else {
      tempData = dataRef.current.concat(newData);
    }
    updateData(tempData);
    propsChange(tempData);
  };
  return <div className={`${currentPrefix}-entity-base-properties`}>
    <div className={`${currentPrefix}-entity-base-properties-list-opt`}>
      <DropButton menuClick={menuClick} dropDownMenus={dropDownMenus} position='top'>
        <IconTitle title={FormatMessage.string({id: 'tableEdit.addField'})} onClick={() => optProperty('add')} type='fa-plus'/>
      </DropButton>
      <IconTitle style={{opacity: !selected ? 0.48 : 1}} disable={!selected} title={FormatMessage.string({id: 'tableEdit.deleteField'})} onClick={() => optProperty('delete')} type='fa-minus'/>
      <IconTitle disable={!selected} title={FormatMessage.string({id: 'tableEdit.moveUp'})} onClick={() => optProperty('up')} type='fa-arrow-up'/>
      <IconTitle disable={!selected} title={FormatMessage.string({id: 'tableEdit.moveDown'})} onClick={() => optProperty('down')} type='fa-arrow-down'/>
    </div>
    <div className={`${currentPrefix}-entity-base-properties-list-container`}>
      {data.map((p, index) => {
        return (
          <div key={p.__key}>
            <div
              onClick={() => rowSelected(p.__key)}
              className={`${currentPrefix}-entity-base-properties-list ${selected === p.__key ? `${currentPrefix}-entity-base-properties-list-selected` : ''}`}
              >
              <span>{index + 1}</span>
              <span
                className={`${currentPrefix}-entity-base-properties-list-item`}
                >
                <span>
                  <FormatMessage id='tableBase.propertyName'/>
                </span>
                <Input value={p.data[0]} onChange={e => onChange(e, p.__key, 0)}/>
              </span>
              <span
                className={`${currentPrefix}-entity-base-properties-list-item`}
                >
                <span>
                  <FormatMessage id='tableBase.propertyValue'/>
                </span>
                <Input value={p.data[1]} onChange={e => onChange(e, p.__key, 1)}/>
              </span>
            </div>
            <div className={`${currentPrefix}-entity-base-properties-list-border`}>{}</div>
          </div>
          );
      })}
    </div>
  </div>;
});
