import React, {useMemo, useEffect, useState, useRef} from 'react';
import {Input, Text, FormatMessage, Table, MultipleSelect, FieldSet} from 'components';
import {getPrefix} from '../../../lib/prefixUtil';
import {emptyDictItem, validate} from '../../../lib/datasource_util';
import {addDomResize, removeDomResize} from '../../../lib/listener';

export default React.memo(({prefix, dictData, dictChange, dataSource,
                             hasRender, hasDestory, param, defaultGroups}) => {
  const Option = MultipleSelect.Option;
  const [size, setSize] = useState({width: 0, height: 0});
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
  const getGroups = () => {
    return (dataSource?.viewGroups || [])
        .filter(g => (g?.refDicts || []).includes(dictData.defKey))
        .map(g => g.defKey);
  };
  const [checkValues, setCheckValues] = useState(() => {
    return defaultGroups || getGroups();
  });
  useEffect(() => {
    defaultGroups || setCheckValues(getGroups());
  }, [dataSource?.viewGroups, dictData]);
  const resizeDomRef = useRef(null);
  const id = useMemo(() => Math.uuid(), []);
  const onChange = (e, name) => {
    if (e.target) {
      dictChange && dictChange(e.target.value || '', name);
    } else {
      if (name === 'group') {
        setCheckValues([...e]);
      }
      dictChange && dictChange(e, name);
    }
  };
  const itemValidate = (items) => {
    return validate(items, emptyDictItem, 'DictItems');
  };
  const isEmpty = (str) => {
    return str === '' || str === null || str === undefined;
  };
  const memoizedData = useMemo(() => ({
    headers: Object.keys(emptyDictItem).map(i => ({
      refKey: i,
      value: FormatMessage.string({id: `dict.item.${i}`}),
    })),
    fields: (dictData?.items || []).sort((a, b) => {
      if (isEmpty(a.sort)) {
        return 1;
      } else if (isEmpty(b.sort)) {
        return -1;
      }
      return a.sort - b.sort;
    }),
  }), [dictData]);
  const commonProps = {
    // 禁用表头拖动排序
    // 禁用表头图标（后续可支持自定义表头图标）
    // 使用自定义的表头，无需从数据获取
    disableHeaderSort: true,
    disableHeaderIcon: true,
    customerHeaders: true,
    fixHeader: false,
  };
  const currentPrefix = getPrefix(prefix);
  useEffect(() => {
    addDomResize(resizeDomRef.current, id, () => {
      setSize({
        width: resizeDomRef.current.clientWidth - 30,
        height: resizeDomRef.current.clientHeight + 5,
      });
    });
    return () => {
      removeDomResize(resizeDomRef.current, id);
    };
  }, []);
  return <div
    className={`${currentPrefix}-form ${currentPrefix}-dict`}
  >
    <div ref={resizeDomRef} style={{marginBottom: 5}}>
      <FieldSet expandEnable={false} title={FormatMessage.string({id: 'dict.base'})}>
        <div className={`${currentPrefix}-form-item`}>
          <span
            className={`${currentPrefix}-form-item-label`}
            title={FormatMessage.string({id: 'dict.defKey'})}
        >
            <FormatMessage id='dict.defKey'/>
          </span>
          <span className={`${currentPrefix}-form-item-component`}>
            <Input onChange={e => onChange(e, 'defKey')} defaultValue={dictData.defKey || ''}/>
          </span>
        </div>
        <div className={`${currentPrefix}-form-item`}>
          <span
            className={`${currentPrefix}-form-item-label`}
            title={FormatMessage.string({id: 'dict.defName'})}
        >
            <FormatMessage id='dict.defName'/>
          </span>
          <span className={`${currentPrefix}-form-item-component`}>
            <Input onChange={e => onChange(e, 'defName')} defaultValue={dictData.defName || ''}/>
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
              onChange={keys => onChange(keys, 'group')}
              checkValue={checkValues}
          >
              {
              dataSource?.viewGroups?.map(v => (
                <Option key={v.defKey} value={v.defKey}>{`${v.defKey}(${v.defName || v.defKey})`}</Option>))
            }
            </MultipleSelect>
          </span>
        </div>
        <div className={`${currentPrefix}-form-item`}>
          <span
            className={`${currentPrefix}-form-item-label`}
            title={FormatMessage.string({id: 'dict.intro'})}
        >
            <FormatMessage id='dict.intro'/>
          </span>
          <span className={`${currentPrefix}-form-item-component`}>
            <Text onChange={e => onChange(e, 'intro')} defaultValue={dictData.intro || ''}/>
          </span>
        </div>
      </FieldSet>
    </div>
    <FieldSet
      expandEnable={false}
      title={FormatMessage.string({id: 'dict.items'})}
      style={{height: `calc(100% - ${size.height}px`}}
    >
      <div style={{width: size.width, height: '100%'}}>
        <Table
          {...commonProps}
          twinkle={param?.defKey}
          ref={tableRef}
          otherOpt={false}
          tableDataChange={onChange}
          validate={itemValidate}
          defaultEmptyField={emptyDictItem}
          data={memoizedData}
        />
      </div>
    </FieldSet>
  </div>;
});
