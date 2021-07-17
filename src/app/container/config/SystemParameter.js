import React from 'react';
import {getPrefix} from '../../../lib/prefixUtil';
import JavaHome from './JavaHome';
import SqlDelimiter from './SqlDelimiter';
import DocTemplate from './DocTemplate';
import Language from './Language';
import Model from './Model';
import RelationFieldSize from './RelationFieldSize';
import { platform } from '../../../lib/middle';

export default React.memo(({prefix, ...restProps}) => {
  const currentPrefix = getPrefix(prefix);
  return <div className={`${currentPrefix}-setting-system-parameter`}>
    {platform === 'json' && <JavaHome {...restProps}/>}
    <SqlDelimiter {...restProps}/>
    <DocTemplate {...restProps}/>
    <Language {...restProps}/>
    <Model {...restProps}/>
    <RelationFieldSize {...restProps}/>
  </div>;
});
