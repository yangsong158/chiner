import React, { useState } from 'react';
import {
  SimpleTab,
  CodeEditor,
  openModal,
  Button,
  FormatMessage,
  Input,
  Radio,
  Checkbox, Message,
} from 'components';

import Preview from './Preview';
//import DefaultTemplate from './DefaultTemplate';
import './style/index.less';
import { defaultTemplate } from '../../../lib/datasource_util';
import {getPrefix} from '../../../lib/prefixUtil';

const RadioGroup = Radio.RadioGroup;

const CodeEditorContent = ({prefix, onChange, value, templateShow,
                             templateType, dataTypeSupport, ...restProps}) => {
  const [codeData, updateCodeData] = useState(value);
  const codeChange = (e) => {
    onChange && onChange(e);
    updateCodeData(e.target.value || '');
  };
  const openOptModal = (type) => {
    let modal = null;
    let cacheTemplate = codeData;
    const templateChange = (tempValue) => {
      cacheTemplate = tempValue;
    };
    const onOk = () => {
      onChange && onChange({target: {
        value: cacheTemplate,
      }});
      updateCodeData(cacheTemplate);
      modal && modal.close();
    };
    const onCancel = () => {
      modal && modal.close();
    };
    if (type === 'previewEdit') {
      modal = openModal(<Preview
        template={codeData}
        mode={templateType === 'appCode' ? dataTypeSupport : 'SQL'}
        templateShow={templateShow}
        templateChange={templateChange}
      />, {
        fullScreen: true,
        title: FormatMessage.string({id: 'database.templateEditOpt.previewEdit'}),
        buttons: [<Button key='ok' onClick={onOk}>
          <FormatMessage id='button.ok'/>
        </Button>,
          <Button key='cancel' onClick={onCancel}>
            <FormatMessage id='button.cancel'/>
          </Button>],
      });
    } else {
      Message.warring({title: FormatMessage.string({id: 'wait'})});
      /*modal = openModal(<DefaultTemplate
        templateChange={templateChange}
      />, {
        bodyStyle: { width: '80%' },
        modalStyle: { overflow: 'hidden' },
        title: FormatMessage.string({id: 'database.templateEditOpt.getTemplateByDefaultOrRemote'}),
        buttons: [<Button key='ok' onClick={onOk}>
          <FormatMessage id='database.templateEditOpt.useTemplate'/>
        </Button>,
          <Button key='cancel' onClick={onCancel}>
            <FormatMessage id='button.cancel'/>
          </Button>],
      });*/
    }
  };
  return <div className={`${prefix}-code-editor-content`}>
    <div className={`${prefix}-code-editor-content-opt`}>
      <span
        onClick={() => openOptModal('previewEdit')}
      >
        <FormatMessage id='database.templateEditOpt.previewEdit'/>
      </span>
      <span
        onClick={() => openOptModal('getTemplateByDefaultOrRemote')}
      >
        <FormatMessage id='database.templateEditOpt.getTemplateByDefaultOrRemote'/>
      </span>
    </div>
    <div>
      <CodeEditor value={codeData} onChange={codeChange} {...restProps}/>
    </div>
  </div>;
};

export default React.memo(({prefix, data, dataChange}) => {
  const { templateData = {}, defaultDb = '' } = data;
  const [allTemplate, setAllTemplate] = useState(() => {
    return defaultTemplate[`${templateData.type || 'dbDDL'}Template`];
  });
  const onChange = (e, type) => {
    const value = type === 'defaultDb' ? e.target.checked : e.target.value;
    switch (type) {
      case 'defaultDb': dataChange && dataChange(value, type);
      break;
      case 'applyFor':
        dataChange && dataChange(value, 'dataTypeSupport');
        break;
      case 'type':
        setAllTemplate(defaultTemplate[`${value}Template`]);
        dataChange && dataChange(value, 'type');
        break;
      default: dataChange && dataChange(value, type);break;
    }
  };
  const currentPrefix = getPrefix(prefix);
  return <div className={`${currentPrefix}-database-container`}>
    <div className={`${currentPrefix}-form-item`}>
      <span
        className={`${currentPrefix}-form-item-label`}
        title={FormatMessage.string({id: 'database.applyFor'})}
      >
        <span className={`${currentPrefix}-form-item-label-require`}>{}</span>
        <span>
          <FormatMessage id='database.applyFor'/>
        </span>
      </span>
      <span className={`${currentPrefix}-form-item-component`}>
        <Input
          onChange={e => onChange(e, 'applyFor')}
          defaultValue={templateData.applyFor || ''}
        />
      </span>
    </div>
    <div className={`${currentPrefix}-form-item`}>
      <span
        className={`${currentPrefix}-form-item-label`}
        title={FormatMessage.string({id: 'database.type'})}
      >
        <span>
          <FormatMessage id='database.type'/>
        </span>
      </span>
      <span className={`${currentPrefix}-form-item-component`}>
        <span>
          <RadioGroup
            name='type'
            onChange={e => onChange(e, 'type')}
            defaultValue={templateData.type || 'dbDDL'}
          >
            <Radio value='dbDDL'>
              <FormatMessage id='database.codeType.dbDDL'/>
            </Radio>
            <Radio value='appCode'>
              <FormatMessage id='database.codeType.appCode'/>
            </Radio>
          </RadioGroup>
        </span>
      </span>
    </div>
    <div className={`${currentPrefix}-form-item`}>
      <span
        className={`${currentPrefix}-form-item-label`}
        title={FormatMessage.string({id: 'database.defaultDb'})}
      >
        <span>
          <FormatMessage id='database.defaultDb'/>
        </span>
      </span>
      <span className={`${currentPrefix}-form-item-component`}>
        <Checkbox
          defaultChecked={defaultDb === templateData.applyFor}
          onChange={e => onChange(e, 'defaultDb')}
        >
          <span
            className={`${currentPrefix}-database-container-defaultdb-message`}
          >
            <FormatMessage id='database.defaultDbMessage'/>
          </span>
        </Checkbox>
      </span>
    </div>
    <div className={`${currentPrefix}-form-item`}>
      <span
        className={`${currentPrefix}-form-item-label`}
        title={FormatMessage.string({id: 'database.defaultDb'})}
      >
        <span>
          <FormatMessage id='database.templateEdit'/>
        </span>
      </span>
      <span className={`${currentPrefix}-form-item-component`}>
        <SimpleTab
          options={allTemplate
               .map(d => ({
                 key: d,
                 title: FormatMessage.string({id: `tableTemplate.${d}`}) || d,
                 content: <CodeEditorContent
                   prefix={currentPrefix}
                   value={templateData.type === 'appCode' ? templateData.content : templateData[d]}
                   width='auto'
                   height='40vh'
                   onChange={e => onChange(e, d)}
                   templateType={templateData.type}
                   dataTypeSupport={templateData.applyFor}
                   templateShow={d}
                 />,
               }))}
       />
      </span>
    </div>
  </div>;
});
