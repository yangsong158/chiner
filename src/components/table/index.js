import React, {useState, useRef, useEffect, useMemo, forwardRef, useImperativeHandle} from 'react';
import * as _ from 'lodash/object';
import * as Component from 'components';

import { getFullColumns, validateFields, emptyField, getColumnWidth } from '../../lib/datasource_util';
import { moveArrayPositionByArray } from '../../lib/array_util';
import { addBodyEvent, removeBodyEvent } from '../../lib/listener';
import { Copy, Paste } from '../../lib/event_tool';
import Tr from './Tr';
import './style/index.less';
import {getPrefix} from '../../lib/prefixUtil';
import {separator} from '../../../profile';
import FormatMessage from '../formatmessage';
import StandardGroupSelect from '../../app/container/standardfield/StandardGroupSelect';

const Table = React.memo(forwardRef(({ prefix, data = {}, disableHeaderSort,
                               dataSource, customerHeaders, disableHeaderIcon, tableDataChange,
                               defaultEmptyField, validate, disableCopyAndCut, onTableRowClick,
                               onAdd, ExtraOpt, style, uniqueKey = 'defKey', hiddenHeader,
                               className, expand, otherOpt = true, disableHeaderReset,
                               updateDataSource, disableAddStandard, ready, twinkle, getDataSource,
                               disableDragRow = true, freeze = false, reading = false,
                               fixHeader = true, openDict, defaultGroups}, refInstance) => {
  const inputRef = useRef({});
  const currentPrefix = getPrefix(prefix);
  const [expands, setExpands] = useState([]);
  const checkboxComponents = ['primaryKey', 'notNull', 'autoIncrement', 'unique', 'enabled', 'defaultDb'];
  const domains = _.get(dataSource, 'domains', []);
  const mapping = _.get(dataSource, 'dataTypeMapping.mappings', []);
  const db = _.get(dataSource, 'profile.default.db', '');
  const tableRef = useRef(null);
  const dragRef = useRef(null);
  const optRef = useRef(null);
  const dragStatus = useRef({status: false, x: 0, y: 0});
  const allColumns = useMemo(() => {
    if (customerHeaders) {
      if (Array.isArray(customerHeaders)) {
        return customerHeaders;
      }
      return [];
    }
    return getFullColumns();
  }, []);
  const getInitState = (preData = []) => {
    return {
      ...data,
      fields: _.get(data, 'fields', []).map((f) => {
        const oldField = preData.filter(preF => preF.defKey === f.defKey);
        return {
          ...f,
          __key: f.__key || oldField.__key || Math.uuid(), // 复用key 减少无意义渲染
        };
      }),
      headers: data.headers || allColumns,
    };
  };
  const [{ headers = [], fields = [], ...restData }, updateTableData] = useState(getInitState);
  const [preData, updatePreData] = useState(data);
  const fieldsRef = useRef([]);
  fieldsRef.current = fields;
  if (preData !== data) {
    // 如果上一次的数据源和当前的数据源不相同 则需要更新
    updatePreData(data);
    updateTableData(getInitState(fields));
  }
  const [selectedFields, updateSelectedFields] = useState([]);
  const [selectedColumns, updateSelectedColumns] = useState([]);
  const [insertField, setInsertField] = useState('');
  const selectedFieldsRef = useRef([]);
  selectedFieldsRef.current = selectedFields;
  const insertFieldRef = useRef('');
  insertFieldRef.current = insertField;
  const standardGroupRef = useRef(null);
  const tempHeaders = useMemo(() => {
    return headers.map((h) => {
      const column = allColumns.filter(c => c.newCode === (h.refKey || h.newCode))[0] || {};
      return {
        ...h,
        ...column,
        refKey: h.refKey || h.newCode,
      };
    });
  }, [headers, allColumns]);
  const comBlur = (f, name, e) => {
    const value = e.target.value;
    if (value && (name === uniqueKey) &&
        (data?.fields?.filter(d => d[name] === value).length > 1)) {
      Component.Modal.error({
        title: Component.FormatMessage.string({id: 'optFail'}),
        message: Component.FormatMessage.string({id: 'uniqueKeyError'}),
      });
    }
  };
  const cellClick = (h, f) => {
    if (h !== 'domain' || (h === 'domain' && !selectedFieldsRef.current.includes(f.__key))) {
      updateSelectedFields((pre) => {
        if (pre.includes(f.__key)) {
          return [f.__key];
        }
        return [];
      });
    }
  };
  const onBodyClick = () => {
    updateSelectedColumns([]);
  };
  const updateTableDataByName = (f, name, e) => {
    let value = e.target.value;
    if (checkboxComponents.includes(name)) {
      value = e.target.checked;
    }
    updateTableData((pre) => {
      const newData = {
        ...pre,
        fields: pre.fields.map((field) => {
          if (name === 'domain') {
            if (selectedFieldsRef.current.includes(field.__key) || f.__key === field.__key) {
              // 需要联动修改 字段长度和小数位数
              const others = {};
              const domain = domains.filter(d => d.defKey === value)[0] || { len: '', scale: '' };
              const dataType = mapping.filter(m => m.defKey === domain.applyFor)[0]?.[db] || '';
              others.len = domain.len === undefined ? '' : domain.len;
              others.scale = domain.scale === undefined ? '' : domain.scale;
              others.type = dataType;
              return {
                ...field,
                [name]: value,
                ...others,
              };
            }
            return field;
          } else if (f.__key === field.__key) {
            const others = {};
            if (name === 'primaryKey' && value) {
              others.notNull = true;
            } else if((name === 'type' || name === 'len' || name === 'scale') && !!field.domain){
              others.domain = '';
            }
            return {
              ...field,
              [name]: value,
              ...others,
            };
          }
          return field;
        }),
      };
      tableDataChange && tableDataChange(newData.fields, 'fields');
      return newData;
    });
  };
  const freezeCount = {
    left: 4,
    right: 3,
  };
  const hiddenFields = ['hideInGraph', 'isStandard'];
  const updateTableDataByHeader = (key, type, value, i) => {
    let newHeaders = [...headers];
    if (type === 'move') {
      newHeaders = value;
    } else if (type === 'freeze'){
      const tempIndex = headers.findIndex(h => h?.refKey === key);
      newHeaders = newHeaders.map((h, index) => {
        if ((i > freezeCount.left - 1) ? index >= tempIndex : index <= tempIndex) {
          return {
            ...h,
            [type]: value,
          };
        }
        return h;
      });
    } else if (type === 'hideInGraph') {
      newHeaders = newHeaders.map((h) => {
        if (h?.refKey === key) {
          return {
            ...h,
            [type]: value,
          };
        }
        return h;
      });
    }
    const newData = {
      ...restData,
      headers: newHeaders,
      fields,
    };
    updateTableData(newData);
    tableDataChange && tableDataChange(newData.headers, 'headers');
  };
  const resetTableHeaders = () => {
    updateTableDataByHeader(null, 'move', allColumns.map((c) => {
      return {
        freeze: !!(c.newCode === 'defKey' ||  c.newCode === 'defName'),
        refKey: c.newCode,
        hideInGraph: c.relationNoShow,
      };
    }));
  };
  const calcShiftSelected = (fieldKey) => {
    let selected = [...selectedFieldsRef.current];
    if (selected.length === 0) {
      return [fieldKey];
    }
    const minIndex = Math.min(...selected.map(key => fields.findIndex((c) => {
      return c.__key === key;
    })));
    const currentIndex = fields.findIndex((c) => {
      return fieldKey === c.__key;
    });
    if (minIndex >= 0) {
      selected = fields.map((m, i) => {
        if ((i >= currentIndex && i <= minIndex) || (i >= minIndex && i <= currentIndex)) {
          return m.__key;
        }
        return null;
      }).filter(m => !!m);
    }
    return selected;
  };
  const tableRowClick = (e, key) => {
    // 此处需要判断时候按住了shift键 如果按住则是多选
    let tempKeys = [...selectedFieldsRef.current];
    if (e.ctrlKey || e.metaKey) {
      if (tempKeys.includes(key)) {
        tempKeys = tempKeys.filter(k => k !== key);
      } else {
        tempKeys.push(key);
      }
    } else if (e.shiftKey) {
      tempKeys = calcShiftSelected(key);
    } else {
      tempKeys = tempKeys.includes(key) ? [] : [key];
    }
    onTableRowClick && onTableRowClick(tempKeys, fields);
    updateSelectedFields(tempKeys);
  };
  const onMouseUp = (type) => {
    if (dragStatus.current) {
      if(type === 'up') {
        if (insertFieldRef.current) {
          const dragKeys = Array.from(dragRef.current.querySelectorAll('tr'))
              .map((t) => {
                return t.getAttribute('data-key');
              });
          const toIndex = fieldsRef.current.findIndex(f => f.__key === insertFieldRef.current);
          let tempFields = fieldsRef.current.map((f) => {
            if (dragKeys.includes(f.__key)) {
              return {
                ...f,
                needRemove: true,
              };
            }
            return f;
          });
          const dragFields = fieldsRef.current.filter(f => dragKeys.includes(f.__key));
          tempFields.splice(toIndex + 1, 0, ...dragFields);
          tempFields = tempFields.filter(f => !f.needRemove);
          updateTableData(preD => ({
            ...preD,
            fields: tempFields,
          }));
          tableDataChange && tableDataChange(tempFields, 'fields');
        }
      }
      dragRef.current && document.body.removeChild(dragRef.current);
      dragRef.current = null;
      setInsertField('');
      dragStatus.current = {
        status: false,
      };
    }
  };
  const createTempDom = () => {
    const tbody = tableRef.current.querySelector('tbody');
    const allTr = Array.from(tbody.children);
    let selectedTr = [];
    if (selectedFieldsRef.current.length === 0) {
      selectedTr = [dragStatus.current.downDom.parentElement];
    } else {
      selectedTr = allTr.filter(t => selectedFieldsRef.current.includes(t.getAttribute('data-key')));
    }
    const container = document.createElement('div');
    container.setAttribute('class', `${currentPrefix}-drag-container`);
    const tempTable = tableRef.current.cloneNode(false);
    selectedTr.forEach((tr) => {
      const newTr = tr.cloneNode(true);
      newTr.style.width = `${tr.scrollWidth}px`;
      tempTable.appendChild(newTr);
    });
    container.appendChild(tempTable);
    container.onmouseup = onMouseUp;
    document.body.appendChild(container);
    return container;
  };
  const calcTrInTableView = (e, container) => {
    const containerRect = container.getBoundingClientRect();
    if ((e.clientY - 20) < containerRect.y) {
      // eslint-disable-next-line no-param-reassign
      container.scrollTop -= 30;
    } else if ((e.clientY + 20) > (containerRect.y + containerRect.height)) {
      // eslint-disable-next-line no-param-reassign
      container.scrollTop += 30;
    }
  };
  const onMouseMove = (e) => {
    if (dragStatus.current.status) {
      if (!dragRef.current) {
        dragRef.current = createTempDom();
      }
      dragRef.current.style.left = `${e.clientX - 20}px`;
      dragRef.current.style.top = `${e.clientY - 20}px`;
      calcTrInTableView(e, tableRef.current.parentElement);
    }
  };
  const onMouseOver = (e) => {
    if (dragStatus.current.status && dragRef.current) {
      const tempTr = Array.from(dragRef.current.querySelectorAll('tr'));
      const tr = e.currentTarget;
      const trKey = tr.getAttribute('data-key');
      if (!tempTr.some(t => t.getAttribute('data-key') === trKey)) {
        setInsertField(trKey);
      } else {
        setInsertField('');
      }
    }
  };
  const onMouseDown = (e) => {
    if (!disableDragRow && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
      dragStatus.current = {
        status: true,
        downDom: e.currentTarget,
      };
    }
  };
  useEffect(() => {
    const id = Math.uuid();
    addBodyEvent('onmousemove', id, onMouseMove);
    addBodyEvent('onmouseup', id, () => onMouseUp('up'));
    addBodyEvent('onmouseleave', id, () => onMouseUp('leave'));
    return () => {
      removeBodyEvent('onmousemove', id);
      removeBodyEvent('onmouseup', id);
      removeBodyEvent('onmouseleave', id);
    };
  }, []);
  const getSelectedFieldsIndex = () => {
    let tempFields = [...(fieldsRef.current || [])];
    return tempFields.map((field, index) => {
      if (selectedFieldsRef.current.includes(field.__key)) {
        return index;
      }
      return null;
    }).filter(field => field !== null);
  };
  const moveFields = (type, status) => {
    // 将所有选中的属性进行移动
    const tempFields = moveArrayPositionByArray(fieldsRef.current,
        selectedFieldsRef.current,
        type === 'up' ? -1 : 1, '__key', status);
    updateTableData((pre) => {
      return {
        ...pre,
        fields: tempFields,
      };
    });
    tableDataChange && tableDataChange(tempFields, 'fields');
  };
  const createEmptyField = (count) => {
    const emptyFields = [];
    const domain = domains[0] || {};
    const type = mapping.filter(m => m.defKey === domain.applyFor)[0]?.[db] || '';
    for (let i = 0; i < count; i += 1){
      let newField = {};
      if (defaultEmptyField) {
        newField = defaultEmptyField; // 从父组件获取
      } else {
        newField = {
          ...emptyField,
          type,
          domain: domain.defKey,
          len: domain.len === undefined ? '' : domain.len,
          scale: domain.scale === undefined ? '' : domain.scale,
        };
      }
      emptyFields.push({
        ...newField,
        __key: Math.uuid(), // 创建唯一ID
      });
    }
    return emptyFields;
  };
  const addField = (e, pasteFields) => {
    const selectedTrsIndex = getSelectedFieldsIndex();
    let tempFields = [...(fieldsRef.current || [])];
    let newFields = pasteFields;
    if (!pasteFields){
      newFields = createEmptyField(1);
    }
    if (selectedTrsIndex.length > 0) {
      tempFields.splice(Math.min(...selectedTrsIndex), 0, ...newFields);
    } else {
      tempFields = tempFields.concat(newFields);
    }
    if (expand) {
      setExpands((pre) => {
        return pre.concat(newFields.map(f => f.__key));
      });
    }
    updateTableData((pre) => {
      return {
        ...pre,
        fields: tempFields,
      };
    });
    tableDataChange && tableDataChange(tempFields, 'fields');
  };
  const addFieldOpt = (e) => {
    if (onAdd) {
      onAdd().then((res) => {
        addField(e, res);
      });
    } else {
      addField(e);
    }
  };
  const deleteField = () => {
    const allIndex = getSelectedFieldsIndex();
    const minIndex = Math.min(...allIndex);
    const newFields = (fields || []).filter(f => !selectedFields.includes(f.__key));
    updateTableData((pre) => {
      return {
        ...pre,
        fields: newFields,
      };
    });
    tableDataChange && tableDataChange(newFields, 'fields');
    const selectField = newFields[(minIndex - 1) < 0 ? 0 : minIndex - 1];
    updateSelectedFields((selectField && [selectField.__key]) || []);
  };
  const tableKeyDown = (e) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.target.nodeName === 'TABLE' && !disableCopyAndCut) {
        const { current } = tableRef;
        // 如果选中的是表格
        if (e.keyCode === 67 && selectedFields.length > 0) {
          Copy(fields.filter(f => selectedFields.includes(f.__key)).map(f => _.omit(f, '__key', 'children')),
              Component.FormatMessage.string({id: 'copySuccess'}));
          current && current.focus({
            preventScroll: true,
          });
        } else if(e.keyCode === 86) {
          Paste((value) => {
            try {
              let pasteFields = JSON.parse(value);
              if (validate) {
                // 获取父组件的校验
                pasteFields = validate(pasteFields);
              } else {
                // 使用默认的校验
                pasteFields = validateFields(pasteFields);
              }
              // 过滤重复字段
              const fieldKeys = fields.map(f => f.defKey);
              const pasteFieldKeys = pasteFields.map(f => f.defKey);
              const realFieldKeys = [...new Set(pasteFieldKeys
                  .filter(key => !fieldKeys.includes(key)))];
              const finalFields = realFieldKeys.map((k) => {
                return {
                  ...pasteFields.filter(f => f.defKey === k)[0],
                  __key: Math.uuid(),
                };
              });
              if (finalFields.length !== pasteFields.length) {
                Component.Message.success({
                  title: Component.FormatMessage.string({
                    id: 'pasteResult',
                    data: {
                      success: finalFields.length,
                      fail: pasteFields.length - finalFields.length,
                    }}),
                });
              } else {
                Component.Message.success({
                  title: Component.FormatMessage.string({id: 'pasteSuccess'}),
                });
              }
              addField(null, finalFields);
            } catch (error) {
              Component.Message.error({
                title: Component.FormatMessage.string({id: `tableValidate.${error?.message}`})
                    || Component.FormatMessage.string({id: 'tableValidate.invalidJsonData'}),
              });
            }
          });
          current && current.focus({
            preventScroll: true,
          });
        }
      }
    }
  };
  const importFields = (importData) => {
    const newFields = fields.filter(f => !f.refEntity).concat(importData); // 替换所有的导入数据
    updateTableData(pre => ({
      ...pre,
      fields: newFields,
    }));
    tableDataChange && tableDataChange(newFields, 'fields');
  };
  const updateFieldsHideInGraph = (type) => {
    const newFields = fields.map((f) => {
      if (selectedFields.includes(f.__key)) {
        return {
          ...f,
          hideInGraph: type,
        };
      }
      return f;
    });
    updateTableData(pre => ({
      ...pre,
      fields: newFields,
    }));
    tableDataChange && tableDataChange(newFields, 'fields');
  };
  const addStandardFields = () => {
    if (selectedFieldsRef.current.length === 0) {
      Component.Modal.error({
        title: Component.FormatMessage.string({id: 'optFail'}),
        message: Component.FormatMessage.string({id: 'tableValidate.selectedFieldsEmpty'}),
      });
    } else {
      let modal;
      const current = dataSource.standardFields || [];
      const onOk = () => {
        const group = standardGroupRef.current.getGroup() || {};
        if (group.defKey) {
          const newFields = fieldsRef.current
              .filter(f => selectedFieldsRef.current.includes(f.__key))
              .filter(f => current
                  .reduce((a, b) => a.concat(b.fields || []), [])
                  .findIndex(c => c.defKey === f.defKey) < 0)
              .map(f => ({
                ...f,
                primaryKey: false,
                notNull: false,
                autoIncrement: false,
              }));
          let newCurrent = [...current];
          let result = false;
          if (group.group) {
            newCurrent = newCurrent.map((c) => {
              if (c.defKey === group.group) {
                return {
                  ...c,
                  defKey: group.defKey,
                  defName: group.defName,
                  fields: (c.fields || []).concat(newFields),
                };
              }
              return c;
            });
            result = true;
          } else if (current.findIndex(c => c.defKey === group.defKey) < 0) {
            newCurrent = newCurrent.concat({
              defKey: group.defKey,
              defName: group.defName,
              fields: [...newFields],
            });
            result = true;
          } else {
            Component.Message.error({
              title: Component.FormatMessage.string({id: 'standardFields.groupAndFieldNotAllowRepeatAndEmpty'})});
          }
          if (result) {
            updateDataSource && updateDataSource({
              ...dataSource,
              standardFields: newCurrent,
            });
            Component.Message.success({
              title: Component.FormatMessage.string({
                id: 'tableEdit.addStandardFieldsMessage',
                data: {
                  count: selectedFieldsRef.current.length,
                  fail: selectedFieldsRef.current.length - newFields.length,
                },
              }),
            });
            modal && modal.close();
          }
        } else {
          Component.Message.error({
            title: Component.FormatMessage.string({id: 'standardFields.groupNotAllowEmpty'})});
        }
      };
      const onCancel = () => {
        modal && modal.close();
      };
      modal = Component.openModal(<StandardGroupSelect
        ref={standardGroupRef}
        current={current}
      />, {
        title: Component.FormatMessage.string({id: 'standardFields.selectGroup'}),
        buttons: [<Component.Button key='ok' onClick={onOk}>
          <Component.FormatMessage id='button.ok'/>
        </Component.Button>,
          <Component.Button key='cancel' onClick={onCancel}>
            <Component.FormatMessage id='button.cancel'/>
          </Component.Button>],
      });
    }
  };
  const onExpand = (key) => {
    setExpands((pre) => {
      if (pre.includes(key)) {
        return pre.filter(p => p !== key);
      }
      return pre.concat(key);
    });
  };
  const columnWidth = getColumnWidth();
  const getClass = (f) => {
    let classData = '';
    const base = `${currentPrefix}-table-`;
    if (selectedFields.includes(f.__key)) {
      classData += `${base}selected`;
    } else {
      classData += `${base}default`;
    }
    if (f.__key === insertField) {
      classData += ` ${base}insert`;
    }
    return classData;
  };
  useEffect(() => {
    ready && ready({
      updateTableData,
    });
  }, []);
  const finalTempHeaders = tempHeaders.filter(h => !hiddenFields.includes(h.refKey));
  const cellRef = (ref, row, cell) => {
    if(!inputRef.current[row]) {
      inputRef.current[row] = {};
    }
    inputRef.current[row][cell] = ref;
  };
  const getRowAndCellIndex = (row, cell, type) => {
    let currentRowIndex, currentCellIndex;
    if (type === 'up') {
      currentRowIndex = fieldsRef.current.findIndex(f => f.__key === row);
      return {
        rowKey: fieldsRef.current[currentRowIndex - 1]?.__key,
        cellKey: cell,
      };
    } else if (type === 'down') {
      currentRowIndex = fieldsRef.current.findIndex(f => f.__key === row);
      return {
        rowKey: fieldsRef.current[currentRowIndex + 1]?.__key,
        cellKey: cell,
      };
    } else if (type === 'left') {
      currentCellIndex = finalTempHeaders.findIndex(f => f.refKey === cell);
      return {
        rowKey: row,
        cellKey: finalTempHeaders[currentCellIndex - 1],
      };
    }
    currentCellIndex = finalTempHeaders.findIndex(f => f.refKey === cell);
    return {
      rowKey: row,
      cellKey: finalTempHeaders[currentCellIndex + 1],
    };
  };
  const onKeyDown = (e, row, cell) => {
    if (e.keyCode === 38) {
      // up
      const { rowKey, cellKey } = getRowAndCellIndex(row, cell, 'up');
      const cellDom = inputRef.current?.[rowKey]?.[cellKey]?.current;
      if (cellDom) {
        cellDom.focus();
        cellDom.setSelectionRange(0, 0);
        e.preventDefault();
      }
    } else if (e.keyCode === 40) {
      // down
      const { rowKey, cellKey } = getRowAndCellIndex(row, cell, 'down');
      const cellDom = inputRef.current?.[rowKey]?.[cellKey]?.current;
      if (cellDom) {
        cellDom.focus();
        cellDom.setSelectionRange(0, 0);
        e.preventDefault();
      }
    } else if(e.keyCode === 37) {
      const selectionStart = e.currentTarget.selectionStart;
      if (selectionStart === 0) {
        const { rowKey, cellKey } = getRowAndCellIndex(row, cell, 'left');
        const cellDom = inputRef.current?.[rowKey]?.[cellKey]?.current;
        if (cellDom) {
          const length = cellDom.value.length;
          cellDom.focus();
          cellDom.setSelectionRange(length, length);
          e.preventDefault();
        }
      }
      // left
    } else if (e.keyCode === 39) {
      // right
      const valueLength = e.currentTarget.value.length;
      const selectionStart = e.currentTarget.selectionStart;
      if (selectionStart === valueLength) {
        const { rowKey, cellKey } = getRowAndCellIndex(row, cell, 'right');
        const cellDom = inputRef.current?.[rowKey]?.[cellKey]?.current;
        if (cellDom) {
          cellDom.focus();
          cellDom.setSelectionRange(0, 0);
          e.preventDefault();
        }
      }
    }
  };
  const calcLeft = (h) => {
    const index = finalTempHeaders.findIndex(t => t.refKey === h.refKey);
    return finalTempHeaders
        .slice(0, index)
        .reduce((a, b) => a + (columnWidth[b?.refKey] || 0), 50);
  };
  const calcRight = (h) => {
    const index = finalTempHeaders.findIndex(t => t.refKey === h.refKey);
    return finalTempHeaders
        .slice(index + 1, finalTempHeaders.length)
        .reduce((a, b) => a + (columnWidth[b?.refKey] || 0), 0);
  };
  const calcPosition = (h, i) => {
    if (i > 4) {
      return {
        right: calcRight(h),
      };
    }
    return {
      left: calcLeft(h),
    };
  };
  const otherStyle = freeze ? { position: 'sticky', left: 0, zIndex: 100, top: fixHeader ? 0 : 'unset' } : {};
  const twinkleTr = (defKey) => {
    const keyArray = defKey.split(separator);
    const key = keyArray[0];
    let current = fieldsRef.current.filter(f => f.defKey === key)[0];
    if (current) {
      if (keyArray.length > 1) {
        setExpands([current.__key]);
        current = (current.fields || []).filter(f => f.defKey === keyArray[1])[0];
      }
      const container = tableRef.current.parentElement;
      const currentTr = Array.from(container.querySelectorAll('tr'))
          .filter(t => t.getAttribute('data-key') === current?.__key)[0];
      if (currentTr) {
        setTimeout(() => {
          const trRect = currentTr.getBoundingClientRect();
          const optRect = optRef.current.getBoundingClientRect();
          const offset = trRect.bottom - optRect.bottom - trRect.height - (fixHeader ? 25 : 0);
          container.scrollTop += offset;
          const tempClass = currentTr.getAttribute('class');
          currentTr.setAttribute('class', `${tempClass} ${currentPrefix}-table-twinkle`);
          setTimeout(() => {
            currentTr.setAttribute('class', tempClass);
          }, 1000);
        }, 100);
      }
    }
  };
  useEffect(() => {
    if (twinkle) {
      twinkleTr(twinkle);
    }
  }, [twinkle]);
  useImperativeHandle(refInstance, () => {
    return {
      twinkleTr: (key) => {
        twinkleTr(key);
      },
    };
  }, []);
  const menuClick = (m) => {
    addField(m, createEmptyField(m.key));
  };
  const dropDownMenus = useMemo(() => ([
    {key: 5, name: FormatMessage.string({id: 'tableBase.addFieldCount', data: {count: 5}})},
    {key: 10, name: FormatMessage.string({id: 'tableBase.addFieldCount', data: {count: 10}})},
    {key: 15, name: FormatMessage.string({id: 'tableBase.addFieldCount', data: {count: 15}})},
  ]),[]);
  const onHeaderClick = (key) => {
    if (!disableHeaderSort) {
      updateSelectedColumns((pre) => {
        if (pre.includes(key)) {
          return pre.filter(k => k !== key);
        }
        return pre.concat(key);
      });
    }
  };
  const moveHeader = (type) => {
    const freezeIndex = headers.map((h, i) => {
      if (h.freeze) {
        return i;
      }
      return null;
    }).filter(h => h !== null);
    const newHeaders = moveArrayPositionByArray(
        finalTempHeaders,
        selectedColumns,
        type === 'left' ? -1 : 1,
        'refKey')
        .concat(headers.filter(h => hiddenFields.includes(h.refKey))).map((h, i) => {
          return {
            ...h,
            freeze: freezeIndex.includes(i),
          };
        });
    updateTableDataByHeader(null,
        'move',
        newHeaders,
    );
  };
  const headerIconClick = (e, ...args) => {
    e.stopPropagation();
    updateTableDataByHeader(...args);
  };
  const exchangeHeader = () => {
    let tempFields = [...(fieldsRef.current || [])].map((f) => {
      return {
        ...f,
        ...selectedColumns.reduce((a, b) => {
          return {
            ...a,
            // eslint-disable-next-line no-nested-ternary
            [b]: typeof f[b] === 'string' ? (f[b].toLocaleUpperCase() === f[b]
                ? f[b].toLocaleLowerCase() : f[b].toLocaleUpperCase()) : f[b],
          };
        }, {}),
      };
    });
    updateTableData((pre) => {
      return {
        ...pre,
        fields: tempFields,
      };
    });
    tableDataChange && tableDataChange(tempFields, 'fields');
  };
  const OptHelp = () => {
    return <div className={`${currentPrefix}-table-opt-help`}>
      <span>{Component.FormatMessage.string({id: 'tableEdit.opt[0]'})}</span>
      <span>{Component.FormatMessage.string({id: 'tableEdit.opt[1]'})}</span>
      <span>{Component.FormatMessage.string({id: 'tableEdit.opt[2]'})}</span>
      <span>{Component.FormatMessage.string({id: 'tableEdit.opt[3]'})}</span>
      <span>{Component.FormatMessage.string({id: 'tableEdit.opt[4]'})}</span>
      <span>{Component.FormatMessage.string({id: 'tableEdit.opt[5]'})}</span>
      <span>{Component.FormatMessage.string({id: 'tableEdit.opt[6]'})}</span>
    </div>;
  };
  return (
    <div className={`${currentPrefix}-table-container ${className || ''}`}>
      {
          !reading && <span className={`${currentPrefix}-table-opt`} ref={optRef}>
            <span className={`${currentPrefix}-table-opt-normal`}>
              <Component.IconTitle disable={selectedFields.length === 0} title={Component.FormatMessage.string({id: 'tableEdit.moveStart'})} type='icon-zhiding' onClick={() => moveFields('up', 'start')}/>
              <Component.IconTitle disable={selectedFields.length === 0} title={Component.FormatMessage.string({id: 'tableEdit.moveUp'})} type='icon-shangyi' onClick={() => moveFields('up')}/>
              <Component.IconTitle disable={selectedFields.length === 0} title={Component.FormatMessage.string({id: 'tableEdit.moveDown'})} type='icon-xiayi' onClick={() => moveFields('down')}/>
              <Component.IconTitle disable={selectedFields.length === 0} title={Component.FormatMessage.string({id: 'tableEdit.moveEnd'})} type='icon-zhidi' onClick={() => moveFields('down', 'end')}/>
              <Component.DropButton menuClick={menuClick} dropDownMenus={dropDownMenus} position='top'>
                <Component.IconTitle title={Component.FormatMessage.string({id: 'tableEdit.addField'})} type='fa-plus' onClick={addFieldOpt}/>
              </Component.DropButton>
              <Component.IconTitle style={{opacity: selectedFields.length === 0 ? 0.48 : 1}} disable={selectedFields.length === 0} title={Component.FormatMessage.string({id: 'tableEdit.deleteField'})} type='fa-minus' onClick={deleteField}/>
            </span>
            {
              !disableHeaderSort && <span className={`${currentPrefix}-table-opt-header`}>
                <Component.IconTitle disable={selectedColumns.length === 0} title={Component.FormatMessage.string({id: 'tableEdit.moveFieldLeft'})} type='fa-arrow-left' onClick={() => moveHeader('left')}/>
                <Component.IconTitle disable={selectedColumns.length === 0} title={Component.FormatMessage.string({id: 'tableEdit.moveFieldRight'})} type='fa-arrow-right' onClick={() => moveHeader('right')}/>
                <Component.IconTitle disable={selectedColumns.length === 0} title={Component.FormatMessage.string({id: 'tableEdit.exchangeCode'})} type='fa-exchange' onClick={exchangeHeader}/>
              </span>
            }
            {
              otherOpt && <span className={`${currentPrefix}-table-opt-other`}>
                <Component.IconTitle disable={selectedFields.length === 0} title={Component.FormatMessage.string({id: 'tableEdit.showSelectedFields'})} type='fa-eye' onClick={() => updateFieldsHideInGraph(false)}/>
                <Component.IconTitle disable={selectedFields.length === 0} title={Component.FormatMessage.string({id: 'tableEdit.hiddenSelectedFields'})} type='fa-eye-slash' onClick={() => updateFieldsHideInGraph(true)}/>
                {!disableAddStandard && <Component.IconTitle disable={selectedFields.length === 0} title={Component.FormatMessage.string({id: 'tableEdit.addStandardFields'})} type='icon-ruku' onClick={addStandardFields}/>}
                {!disableHeaderReset && <Component.IconTitle title={Component.FormatMessage.string({id: 'tableEdit.resetHeaders'})} type='fa-sort-amount-desc' onClick={resetTableHeaders}/>}
              </span>
            }
            {ExtraOpt && <span className={`${currentPrefix}-table-opt-extra`}><ExtraOpt
              prefix={currentPrefix}
              dataSource={dataSource}
              data={{fields, headers, ...restData}}
              onChange={importFields}
            />
            </span>}
            <span className={`${currentPrefix}-table-opt-info`}>
              <Component.Tooltip title={<OptHelp/>} force placement='topLeft'>
                <Component.Icon type='icon-xinxi'/>
              </Component.Tooltip>
            </span>
          </span>
        }
      <div className={`${currentPrefix}-table-content`}>
        <table
          ref={tableRef}
          className={`${currentPrefix}-table`}
          tabIndex='0'
          onKeyDown={tableKeyDown}
          style={style}
          >
          {!hiddenHeader && <thead>
            <tr>
              <th style={{...otherStyle}}>{}</th>
              {expand && <th>{}</th>}
              {finalTempHeaders.map((h, i) => {
                const freezeStyle = (h?.freeze && freeze) ?
                    { position: 'sticky', ...calcPosition(h, i) } : {};
                let type = 'fa-eye';
                if (h.hideInGraph) {
                  type = 'fa-eye-slash';
                }
                const thClass = selectedColumns.includes(h?.refKey)
                    ? `${currentPrefix}-table-selected` : '';
                return <th
                  className={thClass}
                  onClick={() => onHeaderClick(h?.refKey)}
                  key={h?.refKey}
                  style={{
                      cursor: disableHeaderSort ? 'default' : 'pointer',
                      width: columnWidth[h?.refKey],
                      zIndex: h?.freeze ? 100 : 99,
                      top: fixHeader ? 0 : 'unset',
                      ...freezeStyle,
                    }}
                >
                  <span style={{width: columnWidth[h?.refKey] ? columnWidth[h?.refKey] - 3 : 'auto'}}>
                    {h?.value}
                    {!disableHeaderIcon && <Component.Icon
                      onClick={e => headerIconClick(e, h?.refKey, 'hideInGraph', !h.hideInGraph)}
                      type={type}
                      style={{ marginLeft: 5,cursor: 'pointer' }}
                    />}
                    {freeze &&
                    ((i < freezeCount.left) ||
                        (i > (finalTempHeaders.length - freezeCount.right - 1)))
                    && <Component.Icon
                      onClick={e => headerIconClick(e, h?.refKey, 'freeze', !h.freeze, i)}
                      type={h?.freeze ? 'fa-lock' : 'fa-unlock'}
                      style={{marginLeft: 5, cursor: 'pointer'}}
                    />}
                  </span>
                </th>;
              })}
            </tr>
            </thead>}
          <tbody onClick={onBodyClick}>
            {
              fields.map((f, i) => (
                <Tr
                  openDict={openDict}
                  selectedColumns={selectedColumns}
                  hiddenFields={hiddenFields}
                  updateDataSource={updateDataSource}
                  getDataSource={getDataSource}
                  reading={reading}
                  onKeyDown={onKeyDown}
                  cellRef={cellRef}
                  key={f.__key}
                  f={f}
                  i={i}
                  expand={expand}
                  onMouseOver={onMouseOver}
                  tempHeaders={tempHeaders}
                  calcPosition={calcPosition}
                  getClass={getClass(f)}
                  tableRowClick={tableRowClick}
                  disableDragRow={disableDragRow}
                  checkboxComponents={checkboxComponents}
                  onMouseDown={onMouseDown}
                  currentPrefix={currentPrefix}
                  onExpand={onExpand}
                  selectedFields={selectedFields}
                  expands={expands}
                  dataSource={dataSource}
                  updateTableDataByName={updateTableDataByName}
                  comBlur={comBlur}
                  freeze={freeze}
                  cellClick={cellClick}
                  defaultGroups={defaultGroups}
                  />
              ))
            }
          </tbody>
        </table>
      </div>
    </div>
  );
}));

export default Table;
