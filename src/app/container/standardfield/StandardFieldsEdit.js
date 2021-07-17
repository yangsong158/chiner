import React, {useMemo, useEffect, useRef, useState} from 'react';
import {
  Table,
} from 'components';
import {addDomResize, removeDomResize} from '../../../lib/listener';
import {getPrefix} from '../../../lib/prefixUtil';
import {
  emptyStandardGroup,
  getStandardGroupColumns,
  getFullColumns,
} from '../../../lib/datasource_util';


export default React.memo(({prefix, dataChange, dataSource, twinkle}) => {
  const id = useMemo(() => Math.uuid(), []);
  const standardFieldsRef = useRef((dataSource.standardFields || []).map((g) => {
    return {
      ...g,
      __key: Math.uuid(),
      fields: (g.fields || []).map(f => ({...f, __key: Math.uuid()})),
    };
  }));
  const newDataRef = useRef(standardFieldsRef.current);
  const [width, setWidth] = useState(0);
  const resizeDomRef = useRef(null);
  useEffect(() => {
    addDomResize(resizeDomRef.current, id, () => {
      setWidth(resizeDomRef.current.clientWidth - 40);
    });
    return () => {
      removeDomResize(resizeDomRef.current, id);
    };
  }, []);
  const currentPrefix = getPrefix(prefix);
  const tableDataChange = (groupData, tableData) => {
    newDataRef.current = newDataRef.current.map((g) => {
      if (g.__key === groupData.__key) {
        return {
          ...g,
          fields: tableData,
        };
      }
      return g;
    });
    dataChange && dataChange(newDataRef.current);
  };
  const tableDataGroupChange = (groupData) => {
    newDataRef.current = groupData.map((g) => {
      return {
        defKey: g.defKey,
        defName: g.defName,
        fields: newDataRef.current.filter(f => f.__key === g.__key)[0]?.fields || [],
        __key: g.__key,
      };
    });
    dataChange && dataChange(newDataRef.current);
  };
  const commonProps = {
    disableHeaderIcon: true,
    customerHeaders: true,
    disableHeaderSort: true,
    disableHeaderReset: true,
    disableAddStandard: true,
    fixHeader: false,
  };
  const getDataSource = () => {
    return dataSource;
  };
  const getChildren = (g) => {
    return {
      ...g,
      children: <div style={{width}}>
        <Table
          {...commonProps}
          getDataSource={getDataSource}
          data={{
              headers: getFullColumns(),
              fields: g.fields,
            }}
          dataSource={dataSource}
          tableDataChange={tableData => tableDataChange(g, tableData)}
        />
      </div>,
    };
  };
  const onAdd = () => {
    return new Promise((res) => {
      res([getChildren({...emptyStandardGroup, __key: Math.uuid()})]);
    });
  };
  const data = {
    headers: getStandardGroupColumns(),
    fields: standardFieldsRef.current.map(g => getChildren(g)),
  };
  return <div className={`${currentPrefix}-standard-fields`} ref={resizeDomRef}>
    <Table
      {...commonProps}
      getDataSource={getDataSource}
      twinkle={twinkle}
      otherOpt={false}
      onAdd={onAdd}
      style={{width: '100%'}}
      tableDataChange={tableDataGroupChange}
      expand
      data={data}
    />
  </div>;
});
