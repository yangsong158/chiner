import React from 'react';

import './style/index.less';
import Entity from '../entity';
import EntitySelect from './EntitySelect';
import ImportFields from './ImportFields';
import {getViewColumn} from '../../../lib/datasource_util';

export default React.memo(({tabDataChange, ...restProps}) => {
  const _tabDataChange = (data) => {
    tabDataChange && tabDataChange({
      ...data,
      type: 'view',
      key: restProps.entity,
    });
  };
  return <Entity
    {...restProps}
    customerHeaders={getViewColumn()}
    tabDataChange={_tabDataChange}
    FieldsExtraOpt={ImportFields}
    BaseExtraCom={EntitySelect}
  />;
});
