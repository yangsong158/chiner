import React from 'react';

import { Select, FormatMessage } from 'components';
import {getPrefix} from '../../../../lib/prefixUtil';

export default React.memo(({prefix, dataSource, dbChange}) => {
  const Option = Select.Option;
  const dbConn = dataSource?.dbConn || [];
  const defaultConn = dataSource?.profile?.default?.dbConn || dbConn[0].defKey;
  const currentPrefix = getPrefix(prefix);
  return <div className={`${currentPrefix}-dbreverseparse-db-select`}>
    <div className={`${currentPrefix}-dbreverseparse-db-select-item`}>
      <span
        className={`${currentPrefix}-dbreverseparse-db-select-item-label`}
        title={FormatMessage.string({id: 'dbReverseParse.dbSelect'})}
      >
        <FormatMessage id='dbReverseParse.dbSelect'/>
      </span>
      <span
        className={`${currentPrefix}-dbreverseparse-db-select-item-component`}
      >
        <Select defaultValue={defaultConn} notAllowEmpty allowClear={false} onChange={e => dbChange(e, 'defKey')}>
          {dbConn.map(d => (<Option key={d.defKey} value={d.defKey}>{d.defName}</Option>))}
        </Select>
      </span>
    </div>
    <div className={`${currentPrefix}-dbreverseparse-db-select-item`}>
      <span
        className={`${currentPrefix}-dbreverseparse-db-select-item-label`}
        title={FormatMessage.string({id: 'dbReverseParse.nameFormat'})}
      >
        <FormatMessage id='dbReverseParse.nameFormat'/>
      </span>
      <span
        className={`${currentPrefix}-dbreverseparse-db-select-item-component`}
      >
        <Select
          defaultValue='DEFAULT'
          notAllowEmpty
          allowClear={false}
          onChange={e => dbChange(e, 'flag')}
        >
          <Option value='UPPERCASE' key='UPPERCASE'>
            <FormatMessage id='dbReverseParse.nameFormatType.UPPERCASE'/>
          </Option>
          <Option value='LOWCASE' key='LOWCASE'>
            <FormatMessage id='dbReverseParse.nameFormatType.LOWCASE'/>
          </Option>
          <Option value='DEFAULT' key='DEFAULT'>
            <FormatMessage id='dbReverseParse.nameFormatType.DEFAULT'/>
          </Option>
        </Select>
      </span>
    </div>
  </div>;
});
