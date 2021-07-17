import React from 'react';

import FormatMessage from '../formatmessage';

import './style/index.less';
import {getPrefix} from '../../lib/prefixUtil';

export default React.memo(({data, prefix}) => {
  const currentPrefix = getPrefix(prefix);
  const download = (url) => {
    // eslint-disable-next-line global-require,import/no-extraneous-dependencies
    require('electron').shell.openExternal(url);
  };
  return <div className={`${currentPrefix}-updatemessage`}>
    <div className={`${currentPrefix}-updatemessage-info`}>
      <div className={`${currentPrefix}-updatemessage-info-item`}>
        <span><FormatMessage id='version.number'/>:</span>
        <span>{data.version}</span>
      </div>
      <div className={`${currentPrefix}-updatemessage-info-item`}>
        <span><FormatMessage id='version.date'/>:</span>
        <span>{data.date}</span>
      </div>
    </div>
    <div className={`${currentPrefix}-updatemessage-lease`}>
      <div><FormatMessage id='version.log'/>:</div>
      {
        (data.leaseLog || []).map((l) => {
          return <div key={l} title={l} className={`${currentPrefix}-updatemessage-lease-item`}>
            {l}
          </div>;
        })
      }
    </div>
    <div className={`${currentPrefix}-updatemessage-url`}>
      <div><FormatMessage id='version.download'/>:</div>
      {
        (Object.keys(data.downloadURL) || []).map((l) => {
          return <div key={l} title={l} className={`${currentPrefix}-updatemessage-url-item`}>
            {l}:<a href='#' onClick={() => download(data.downloadURL[l])}>{data.downloadURL[l]}</a>
          </div>;
        })
      }
    </div>
  </div>;
});
