import React from 'react';
import * as Component from 'components';
import Cell from 'components/table/Cell';

export default React.memo(({f, i, expand, onMouseOver, tempHeaders, calcPosition,
                             getClass, tableRowClick, disableDragRow, checkboxComponents,
                             onMouseDown, currentPrefix, onExpand, expands, dataSource,
                             updateTableDataByName, comBlur, cellRef, onKeyDown, freeze,
                             reading, getDataSource, updateDataSource, cellClick,
                             hiddenFields, selectedColumns, openDict, defaultGroups}) => {
  const otherStyle = freeze ? { position: 'sticky', left: 0, zIndex: 2 } : {};
  const needHideInGraph = tempHeaders.findIndex(h => h.refKey === 'hideInGraph') > -1;
  let type = 'fa-eye';
  if (f.hideInGraph) {
    type = 'fa-eye-slash';
  }
  const onChange = (event, e) => {
    event.stopPropagation();
    updateTableDataByName && updateTableDataByName(f, 'hideInGraph', e);
  };
  return [<tr
    data-key={f.__key}
    onMouseOver={onMouseOver}
    key={f.__key}
    className={getClass}
  >
    <td
      style={{userSelect: 'none', cursor: disableDragRow ? 'pointer' : 'move', ...otherStyle}}
      onClick={e => tableRowClick(e, f.__key)}
      onMouseDown={onMouseDown}
    >
      <span>
        <span>
          {i + 1}
        </span>
        {
          needHideInGraph && <span style={{float: 'right',marginRight: 2}}>
            <Component.Icon
              type={type}
              onClick={e => onChange(e, {target: { value: !f.hideInGraph}})}
            />
          </span>
        }
      </span>
    </td>
    {expand && <td className={`${currentPrefix}-table-expand`} onClick={() => onExpand(f.__key)}>
      <span>{Component.FormatMessage.string({id: !expands.includes(f.__key) ? 'tableEdit.expand' : 'tableEdit.unExpand'})}</span>
      <Component.Icon
        type='fa-angle-right '
        style={{transform: expands.includes(f.__key) ? 'rotate(90deg)' : 'rotate(0deg)'}}
      />
    </td>}
    {
      tempHeaders
          .filter(h => !hiddenFields.includes(h.refKey))
          .map((h, cI) => {
            const zIndex = tempHeaders.length - cI + 2;
            const style = (h?.freeze && freeze) ? {position: 'sticky', zIndex, ...calcPosition(h, cI)} : {};
            const className = selectedColumns.includes(h?.refKey) ? `${currentPrefix}-table-selected` : '';
            if (h?.com && typeof h?.com === 'function') {
              return <td key={h?.refKey} style={style}>
                {h?.com(f)}
              </td>;
            }
            return <td
              className={className}
              key={h?.refKey}
              style={style}
              onClick={() => cellClick(h?.refKey, f)}
            >
              <Cell
                openDict={openDict}
                updateDataSource={updateDataSource}
                getDataSource={getDataSource}
                currentPrefix={currentPrefix}
                onKeyDown={e => onKeyDown(e, f.__key, h?.refKey)}
                cellRef={c => cellRef(c, f.__key, h?.refKey)}
                reading={(h?.com === 'label') || reading} // 是否是只读
                checkboxComponents={checkboxComponents}
                f={f}
                name={h?.refKey}
                dataSource={dataSource}
                onChange={e => updateTableDataByName(f, h?.refKey, e)}
                onBlur={e => comBlur(f, h?.refKey, e)}
                remarkChange={(name, e) => updateTableDataByName(f, name, e)}
                defaultGroups={defaultGroups}
              />
            </td>;
          })
    }
  </tr>,
  expand && f.children && <tr
    style={{display: expands.includes(f.__key) ? '' : 'none'}}
    key={`${f.__key}_1`}
  >
    <td style={{cursor: 'auto'}} colSpan={tempHeaders.length + 2}>
      {f.children}
    </td>
  </tr>,
];
}, (pre, next) => {
  const simpleProps = ['f', 'i', 'expand', 'tempHeaders', 'getClass', 'selectedColumns', 'defaultGroups'];
  const calcArray = (oldData, newData) => {
    return (oldData === newData)
        || (oldData.includes(pre.f.__key) && newData.includes(next.f.__key))
        || (!oldData.includes(pre.f.__key) && !newData.includes(next.f.__key));
  };
  return simpleProps.every(p => pre[p] === next[p])
      && calcArray(pre.expands, next.expands)
      && pre?.dataSource?.domains === next?.dataSource?.domains
      && pre?.dataSource?.dicts === next?.dataSource?.dicts;
});

