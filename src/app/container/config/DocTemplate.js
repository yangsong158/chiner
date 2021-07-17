import React, { useState } from 'react';
import {Button, Icon, Input, openModal, Upload, FormatMessage, Tooltip, DownloadUrl, CodeEditor} from 'components';
import {getPrefix} from '../../../lib/prefixUtil';
import model from '../../../lib/workModel.json';
import { saveAsWordTemplate } from '../../../lib/middle';


export default React.memo(({ prefix, dataSource, dataChange }) => {
  const [value, updateValue] = useState(dataSource?.profile?.generatorDoc?.docTemplate || '');
  const selectWordFile = () => {
    Upload('application/vnd.openxmlformats-officedocument.wordprocessingml.document', (file) => {
      updateValue(file.path);
      dataChange && dataChange(file.path, 'profile.generatorDoc.docTemplate');
    }, (f) => {
      return f.name.endsWith('.docx');
    }, false);
  };
  const onChange = (e) => {
    updateValue(e.target.value);
    dataChange && dataChange(e.target.value, 'profile.generatorDoc.docTemplate');
  };
  const saveTemplate = () => {
    saveAsWordTemplate();
  };
  const _openModal = () => {
    let modal
    const close = () => {
      modal && modal.close();
    };
    modal = openModal(<div className={`${currentPrefix}-setting-doc-template-preview`}>
      <CodeEditor
          mode='json'
          value={JSON.stringify(model, null, 2)}
          width='800px'
          height='400px'
      />
    </div>, {
      bodyStyle: {width: '810px'},
      title: FormatMessage.string({id: 'config.PreviewModal'}),
      buttons: [<Button key='close' onClick={close}><FormatMessage id='button.close'/></Button>]
    });
  };
  const currentPrefix = getPrefix(prefix);
  return <div className={`${currentPrefix}-setting-doc-template`}>
    <div className={`${currentPrefix}-form-item`}>
      <span
        className={`${currentPrefix}-form-item-label`}
        title={FormatMessage.string({id: 'config.DocTemplateLabel'})}
      >
        <FormatMessage id='config.DocTemplateLabel'/>
        <Tooltip placement='top' title={FormatMessage.string({id: 'config.DocTemplatePlaceholder'})} force>
          <span className={`${currentPrefix}-form-item-label-help`}>
            <Icon type='icon-xinxi'/>
          </span>
        </Tooltip>
      </span>
      <span className={`${currentPrefix}-form-item-component`}>
        <Input
          placeholder={FormatMessage.string({id: 'config.DocTemplatePlaceholder'})}
          onChange={onChange}
          value={value}
          suffix={<span className={`${currentPrefix}-setting-doc-template-opt`}>
            <Icon type='fa-ellipsis-h' onClick={selectWordFile} title={FormatMessage.string({id: 'openFile'})}/>
            <Button onClick={saveTemplate}>
              <FormatMessage id='config.DocTemplateSaveAs'/>
            </Button>
            <Button onClick={_openModal}>
              <FormatMessage id='config.PreviewModal'/>
            </Button>
          </span>}
        />
      </span>
    </div>
  </div>;
});
