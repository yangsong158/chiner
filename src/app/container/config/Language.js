import React, { useContext } from 'react';
import { Select, FormatMessage } from 'components';
import { langType } from '../../../lib/variable';
import { ConfigContent } from '../../../lib/context';
import {getPrefix} from '../../../lib/prefixUtil';

export default React.memo(({prefix, dataChange}) => {
  const { lang } = useContext(ConfigContent);
  const Option = Select.Option;
  const onChange = (e) => {
    dataChange && dataChange(e.target.value, 'language');
  };
  const currentPrefix = getPrefix(prefix);
  return <div className={`${currentPrefix}-setting-language`}>
    <div className={`${currentPrefix}-form-item`}>
      <span
        className={`${currentPrefix}-form-item-label`}
        title={FormatMessage.string({id: 'config.language.label'})}
      >
        <FormatMessage id='config.language.label'/>
      </span>
      <span className={`${currentPrefix}-form-item-component`}>
        <Select allowClear={false} notAllowEmpty defaultValue={lang} onChange={onChange} >
          {(langType || [])
              .map(l => (<Option
                  key={l}
                  value={l}
              >
                {FormatMessage.string({id: `config.language.${l}`})}
              </Option>))}
        </Select>
      </span>
    </div>
  </div>
});
