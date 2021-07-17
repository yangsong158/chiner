import React from 'react';
import { Input, FormatMessage } from 'components';
import {getPrefix} from '../../../lib/prefixUtil';

export default React.memo(({ prefix, dataSource, dataChange }) => {
  const value = dataSource?.profile?.sql?.delimiter || ';';
  const onChange = (e) => {
    dataChange && dataChange(e.target.value, 'profile.sql.delimiter');
  };
  const currentPrefix = getPrefix(prefix);
  return <div  className={`${currentPrefix}-setting-sql-delimiter`}>
    <div className={`${currentPrefix}-form-item`}>
      <span
        className={`${currentPrefix}-form-item-label`}
        title={FormatMessage.string({id: 'config.SqlDelimiterLabel'})}
      >
        <FormatMessage id='config.SqlDelimiterLabel'/>
      </span>
      <span className={`${currentPrefix}-form-item-component`}>
        <Input
          onChange={onChange}
          defaultValue={value}
        />
      </span>
    </div>
  </div>;
});
