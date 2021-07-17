import React, { useState } from 'react';
import {CodeHighlight, CodeEditor, FormatMessage, openModal, Button} from 'components';

import { getDemoTemplateData, getDataByTemplate } from '../../../lib/json2code_util';
import './style/index.less';
import {getPrefix} from '../../../lib/prefixUtil';
import DotHelp from './DotHelp';

export default React.memo(({prefix, template, mode, templateShow = 'createTable', templateChange}) => {
  const style = {width: 'auto', height: 'calc(100vh - 80px)'};
  const openDotHelp = () => {
    let modal;
    const onClose = () => {
      modal && modal.close();
    };
    modal = openModal(<DotHelp/>, {
      bodyStyle: {width: '80%'},
      title: <FormatMessage id='database.preview.dot'/>,
      buttons: [
        <Button key='close' onClick={onClose}>
          <FormatMessage id='button.close'/>
        </Button>],
    });
  };
  const demoData = getDemoTemplateData(templateShow);
  const [templateData, updateTemplate] = useState(template);
  const _updateTemplate = (value) => {
    updateTemplate(value);
    templateChange && templateChange(value);
  };
  const demoCode = getDataByTemplate(JSON.parse(demoData), templateData || '');
  const currentPrefix = getPrefix(prefix);
  return <div className={`${currentPrefix}-preview`}>
    <div className={`${currentPrefix}-preview-left`}>
      <span className={`${currentPrefix}-preview-left-title`}>
        <FormatMessage id='database.preview.demoData'/>
      </span>
      <CodeHighlight data={demoData} style={style} language='JSON'/></div>
    <div className={`${currentPrefix}-preview-center`}>
      <span className={`${currentPrefix}-preview-center-title`}>
        <span>
          <FormatMessage id='database.preview.templateEdit'/>
        </span>
        <a onClick={openDotHelp}>
          <FormatMessage id='database.preview.dot'/>
        </a>
      </span>
      <CodeEditor value={templateData} width='auto' height={style.height} onChange={e => _updateTemplate(e.target.value)}/></div>
    <div className={`${currentPrefix}-preview-right`}>
      <span className={`${currentPrefix}-preview-right-title`}>
        <FormatMessage id='database.preview.result'/>
      </span>
      <CodeHighlight data={demoCode} style={style} language={mode}/></div>
  </div>;
});
