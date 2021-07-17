import React, {useRef, useImperativeHandle, forwardRef} from 'react';
import _ from 'lodash/object';

import { ListGroupSelect, FormatMessage } from 'components';
import {getPrefix} from '../../../../lib/prefixUtil';
import './style/index.less';

export default React.memo(forwardRef(({data, dataSource, customerData,
                                        prefix, defaultSelected}, ref) => {
  const listGroupSelectRef = useRef(null);
  const currentPrefix = getPrefix(prefix);
  const entities = dataSource.entities || [];
  const pickName = ['defKey', 'defName'];
  const viewGroups = (dataSource.viewGroups || []).map((g) => {
    return {
      ..._.pick(g, pickName),
      fields: [],
    };
  });
  const formatResult = (d, exist) => {
    return FormatMessage.string({
      id: 'importDb.dealResult',
      data: {
        data: d.length,
        exists: exist.length,
      },
    });
  };
  const calcData = () => {
    return [{
      defKey: '',
      defName: FormatMessage.string({id: 'components.select.empty'}),
      fields: data,
    }];
  };
  useImperativeHandle(ref, () => {
    return {
      getData: listGroupSelectRef.current.getData,
    };
  }, []);
  return <div className={`${currentPrefix}-importpd-data`}>
    <ListGroupSelect
      defaultSelected={defaultSelected}
      ref={listGroupSelectRef}
      formatResult={formatResult}
      data={customerData || calcData()}
      arrayData={entities}
      groups={viewGroups}
    />
  </div>;
}));
