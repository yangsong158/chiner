import React  from 'react';
import { Icon } from 'components';

import StepContent from './StepContent';
import './style/index.less';
import {getPrefix} from '../../lib/prefixUtil';

export default React.memo(({prefix, options, currentKey, forceUpdate}) => {
  const activeIndex = options.findIndex(o => o.key === currentKey);
  const getHeaderType = (index) => {
    if (activeIndex > index) {
      return 'success';
    } else if ((index === activeIndex) && (index !== options.length - 1)) {
      return 'active';
    } else if (activeIndex === options.length - 1) {
      return 'done';
    }
    return 'rest';
  };
  const getHeaderIcon = (index, type) => {
    if (type === 'success') {
      return <Icon type='fa-check'/>;
    } else if (type === 'done') {
      return <Icon type='fa-smile-o'/>;
    }
    return index + 1;
  };
  const currentPrefix = getPrefix(prefix);
  return <div className={`${currentPrefix}-step`}>
    <div className={`${currentPrefix}-step-title`}>
      {options.map((o, index) => {
        const type = getHeaderType(index);
        return (
          <div
            className={`${currentPrefix}-step-title-item ${currentPrefix}-step-title-item-${type}`}
            key={o.key}
          >
            {o.icon ? <Icon type={o.icon}/> :
            <span
              className={`${currentPrefix}-step-title-item-number`}
            >
              {getHeaderIcon(index, type)}
            </span>
            }
            <span>{o.title}</span>
            <span className={`${currentPrefix}-step-title-item-line`}>{}</span>
          </div>
        );
      })}
    </div>
    <div className={`${currentPrefix}-step-content`}>
      {
        options.map(o => (
          <div
            key={forceUpdate ? Math.uuid() : o.key}
            className={`${currentPrefix}-step-content-item-${currentKey === o.key ? 'active' : 'default'}`}
          >
            <StepContent stepId={o.key} activeStep={currentKey}>
              {o.content}
            </StepContent>
          </div>
        ))
      }
    </div>
  </div>;
});
