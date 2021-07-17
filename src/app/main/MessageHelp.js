import React from 'react';

import { FormatMessage } from 'components';

export default React.memo(({prefix}) => {
  return <div className={`${prefix}-main-message`}>
    <div><span>Ctrl/Command + S</span><span><FormatMessage id='quick.save'/></span></div>
    <div><span>Ctrl/Command + Shift + U</span><span><FormatMessage id='quick.toggleCase'/></span></div>
    <div><FormatMessage id='quick.drag'/></div>
  </div>;
});
