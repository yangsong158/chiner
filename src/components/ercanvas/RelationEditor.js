import React  from 'react';
import { Select, FormatMessage } from 'components';

import './style/index.less';
import {getPrefix} from '../../lib/prefixUtil';

const Option = Select.Option;
export default React.memo(({ prefix, label, relationChange }) => {
  const relationData = label.split(':');
  const onChange = (e, type) => {
    relationChange && relationChange(e.target.value, type);
  };
  const currentPrefix = getPrefix(prefix);
  return <div className={`${currentPrefix}-relation-editor`}>
    <span className={`${currentPrefix}-relation-editor-left`}>
      <span><FormatMessage id='canvas.edge.form'/></span>
      <Select defaultValue={relationData[0]} onChange={e => onChange(e, 'form')} notAllowEmpty>
        <Option value='1' key='1'>1</Option>
        <Option value='n' key='n'>n</Option>
        {/*<Option value='0,1' key='0,1'>0,1</Option>
        <Option value='0,n' key='0,n'>0,n</Option>
        <Option value='1,n' key='1,n'>1,n</Option>*/}
      </Select>
    </span>:
    <span className={`${currentPrefix}-relation-editor-right`}>
      <span><FormatMessage id='canvas.edge.to'/></span>
      <Select defaultValue={relationData[1]} onChange={e => onChange(e, 'to')} notAllowEmpty>
        <Option value='1' key='1'>1</Option>
        <Option value='n' key='n'>n</Option>
        {/*<Option value='0' key='0'>0</Option>
        <Option value='1' key='1'>1</Option>
        <Option value='0,1' key='0,1'>0,1</Option>
        <Option value='0,n' key='0,n'>0,n</Option>
        <Option value='1,n' key='1,n'>1,n</Option>*/}
      </Select>
    </span>
  </div>;
});
