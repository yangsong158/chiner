import React, {useState, useMemo, forwardRef, useImperativeHandle, useRef, useEffect} from 'react';
import _ from 'lodash/object';
import {FormatMessage, IconTitle} from 'components';

import './style/index.less';
import {getPrefix} from '../../lib/prefixUtil';
import Left from './Left';
import Right from './Right';

export default React.memo(forwardRef(({allowClear = false, notAllowEmpty = true,
                                        data, groups, prefix, formatResult, arrayData,
                                        defaultSelected = []}, ref) => {
  const currentPrefix = getPrefix(prefix);
  const currentGroup = useMemo(() => {
    return groups
        .concat(data
            .filter(d => groups.findIndex(g => g.defKey === d.defKey) < 0)
            .map(g => ({...g, fields: []})));
  },[groups]);
  const newData = useMemo(() => data.reduce((a, b) => {
    return a.concat(b.fields.map(f => ({...f, group: b.defKey})));
  }, []), [data]);
  const currentData = arrayData || groups.reduce((a, b) => a.concat(b.fields), [groups]);
  const newDataKeys = useMemo(() => newData.map(n => n.defKey), [newData]);
  const repeatData = useMemo(() => currentData.map(f => f.defKey)
      .filter(f => newDataKeys.includes(f)), [data, groups]);
  const [checked, setChecked] = useState([...defaultSelected]);
  useEffect(() => {
    setChecked([...defaultSelected]);
  }, [newDataKeys]);
  const checkedRef = useRef(null);
  checkedRef.current = checked;
  const importDataRef = useRef([...newData]);
  useImperativeHandle(ref, () => {
    return {
      getData: () => {
        const current = importDataRef.current.filter(f => checkedRef.current.includes(f.defKey));
        return currentGroup.map((g) => {
          const currentFields = current
              .filter(c => c.group === g.defKey)
              .map(c => _.omit(c, ['group']));
          return {
            ...g,
            fields: g.fields
                .filter(f => currentFields.findIndex(c => c.defKey === f.defKey) < 0)
                .concat(currentFields),
          };
        });
      },
    };
  }, []);
  const _iconClick = (type) => {
    if (type === 'all') {
      setChecked(importDataRef.current.map(d => d.defKey));
    } else if (type === 'reversed') {
      setChecked((pre) => {
        return [...new Set(importDataRef.current
            .filter(d => !pre.includes(d.defKey))
            .map(d => d.defKey)
            .concat([...defaultSelected || []]))];
      });
    } else {
      setChecked([...defaultSelected || []]);
    }
  };
  const _onGroupChange = (e, defKey) => {
    importDataRef.current = importDataRef.current.map((f) => {
      if (f.defKey === defKey) {
        return {
          ...f,
          group: e.target.value,
        };
      }
      return f;
    });
  };
  const onRemove = (key) => {
    setChecked((pre) => {
      return pre.filter(p => p !== key);
    });
  };
  const _checkBoxChange = (e, defKey) => {
    setChecked((pre) => {
      if (!e.target.checked) {
        return pre.filter(p => p !== defKey);
      }
      return pre.concat(defKey);
    });
  };
  return <div className={`${currentPrefix}-listselect`}>
    <div className={`${currentPrefix}-listselect-opt`}>
      <IconTitle type='fa-check-square-o' title={FormatMessage.string({id: 'components.listSelect.all'})} onClick={() => _iconClick('all')}/>
      <IconTitle type='fa-minus-square-o' title={FormatMessage.string({id: 'components.listSelect.reversed'})} onClick={() => _iconClick('reversed')}/>
      <IconTitle type='fa-circle-o' title={FormatMessage.string({id: 'components.listSelect.clear'})} onClick={() => _iconClick('clear')}/>
      <span>{formatResult && formatResult(newData, repeatData)}</span>
    </div>
    <div className={`${currentPrefix}-listselect-container`}>
      <Left
        defaultSelected={defaultSelected}
        prefix={currentPrefix}
        checked={checked}
        newData={newData}
        checkBoxChange={_checkBoxChange}
        repeatData={repeatData}
      />
      <Right
        defaultSelected={defaultSelected}
        currentGroup={currentGroup}
        newData={checked.reverse().map((c) => {
          return newData.filter(d => d.defKey === c)[0];
        }).filter(d => !!d)}
        prefix={currentPrefix}
        onGroupChange={_onGroupChange}
        onRemove={onRemove}
        allowClear={allowClear}
        notAllowEmpty={notAllowEmpty}
      />
    </div>
  </div>;
}));
