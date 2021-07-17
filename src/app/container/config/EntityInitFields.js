import React from 'react';
import { Table } from 'components';
import {getPrefix} from '../../../lib/prefixUtil';

export default React.memo(({ prefix, dataSource, dataChange }) => {
  const data = dataSource?.profile?.default?.entityInitFields || [];
  const currentPrefix = getPrefix(prefix);
  return <div className={`${currentPrefix}-setting-entity-init-fields`}>
    <Table
      disableHeaderSort
      disableHeaderReset
      data={{fields: data}}
      dataSource={dataSource}
      tableDataChange={value => dataChange(value, 'profile.default.entityInitFields')}
    />
  </div>;
});
