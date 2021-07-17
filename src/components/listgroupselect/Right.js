import React from 'react';
import {Select, FormatMessage, IconTitle, Icon} from 'components';

const Option = Select.Option;

const Item = React.memo(({prefix, onRemove, d, onGroupChange, defaultSelected,
                           allowClear, notAllowEmpty, currentGroup, i}) => {
  const disable = (defaultSelected || []).includes(d.defKey);
  return <tr
    className={`${prefix}-listselect-right-item`}
    key={d.defKey}
  >
    <td>{i + 1}</td>
    <td>
      {
        disable ?
          <Icon className={`${prefix}-listselect-right-item-disable`} title={FormatMessage.string({id: 'components.listSelect.disable'})} type='icon-xinxi'/> :
          <IconTitle
            disable={disable}
            type='fa-minus'
            title={FormatMessage.string({id: 'components.listSelect.remove'})}
            onClick={() => onRemove(d.defKey)}
            />
      }
    </td>
    <td>
      {`${d.defKey}[${d.defName || d.defKey}]`}
    </td>
    <td>
      <Select
        allowClear={allowClear}
        defaultValue={d.group}
        notAllowEmpty={notAllowEmpty}
        onChange={e => onGroupChange(e, d.defKey)}
      >
        {
          currentGroup.map((g) => {
            return <Option value={g.defKey} key={g.defKey}>
              {`${g.defName}${g.defKey ? `(${g.defKey})` : ''}`}
            </Option>;
          })
        }
      </Select>
    </td>
  </tr>;
});

export default React.memo(({prefix, newData, onRemove, allowClear,
                             onGroupChange, notAllowEmpty, currentGroup, defaultSelected}) => {
  return <div className={`${prefix}-listselect-right`}>
    <div className={`${prefix}-listselect-right-container`}>
      {
          newData.length === 0 ? <div className={`${prefix}-listselect-right-empty`}>
            <span>
              {FormatMessage.string({id: 'components.listSelect.empty'})}
            </span>
          </div>
              : <table><tbody>
                {newData.filter(d => !!d.defKey).map((d, i) => {
                return <Item
                  defaultSelected={defaultSelected}
                  i={i}
                  allowClear={allowClear}
                  notAllowEmpty={notAllowEmpty}
                  onGroupChange={onGroupChange}
                  prefix={prefix}
                  key={d.defKey}
                  d={d}
                  currentGroup={currentGroup}
                  onRemove={onRemove}
                />;
              })}
              </tbody></table>
        }
    </div>
  </div>;
});
