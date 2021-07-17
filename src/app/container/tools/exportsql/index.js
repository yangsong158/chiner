import React, { useState, useRef } from 'react';
import {
  FormatMessage,
  Select,
  Icon,
  Radio,
  Checkbox,
  Button,
  openModal,
  CodeEditor,
  Download,
} from 'components';
import moment from 'moment';
import _ from 'lodash/object';

import EntitySelect from './EntitySelect';
import {getPrefix} from '../../../../lib/prefixUtil';
import './style/index.less';
import {getAllDataSQLByFilter} from '../../../../lib/json2code_util';
import {separator} from '../../../../../profile';

const CheckboxGroup = Checkbox.CheckboxGroup;
const RadioGroup = Radio.RadioGroup;
const Option = Select.Option;

export default React.memo(({prefix, dataSource}) => {
  const entitySelectErf = useRef(null);
  const defaultTemplate = ['createTable', 'createIndex', 'content'];
  const templateRef = useRef(defaultTemplate);
  const [selected, setSelected] = useState(null);
  const [dataType, setDataType] = useState('all');
  const currentPrefix = getPrefix(prefix);
  const dataTypeSupports = _.get(dataSource, 'profile.dataTypeSupports', []);
  const defaultDb = _.get(dataSource, 'profile.default.db', dataTypeSupports[0]);
  const codeTemplates = _.get(dataSource, 'profile.codeTemplates', []);
  const [codeData, setCodeData] = useState(() => {
    return getAllDataSQLByFilter(dataSource, defaultDb, templateRef.current);
  });
  const [dataTypeSupport, setDataTypeSupport] = useState(() => {
    return codeTemplates.filter(c => c.applyFor === defaultDb)[0];
  });
  const onChange = (e) => {
    setDataTypeSupport(codeTemplates.filter(c => c.applyFor === e.target.value)[0]);
  };
  const onTypeChange = (e) => {
    setDataType(e.target.value);
  };
  const _pickEntity = () => {
    let modal;
    const onOk = () => {
      setSelected(entitySelectErf.current.getCheckeds());
      modal.close();
    };
    const onCancel = () => {
      modal.close();
    };
    modal = openModal(<EntitySelect
      ref={entitySelectErf}
      prefix={currentPrefix}
      dataSource={dataSource}
      defaultCheckeds={selected}
    />, {
      title: FormatMessage.string({id: 'exportSql.pickEntity'}),
      buttons: [
        <Button onClick={onOk} key='ok' type='primary'><FormatMessage id='button.ok'/></Button>,
        <Button onClick={onCancel} key='cancel'><FormatMessage id='button.cancel'/></Button>,
      ],
    });
  };
  const templateChange = (e) => {
    templateRef.current = e.target.value;
  };
  const exportDDL = () => {
    Download(
        [codeData],
        'application/sql', `${moment().unix()}.sql`);
  };
  const onPreview = () => {
    const template = dataTypeSupport.type === 'appCode'
        ? ['content'] : templateRef.current.filter(t => t !== 'content');
    setCodeData(getAllDataSQLByFilter(
        dataSource,
        dataTypeSupport.applyFor,
        template,
        selected?.reduce((a, b) => {
          const tempA = {...a};
          const type = b.split(separator);
          if (!tempA[type[1]]) {
            tempA[type[1]] = [];
          }
          tempA[type[1]].push(type[2]);
          return tempA;
        }, {})));
  };
  const _codeChange = (code) => {
    setCodeData(code);
  };
  return <div className={`${currentPrefix}-export-sql`}>
    <div className={`${currentPrefix}-export-sql-left`}>
      <div className={`${currentPrefix}-form-item`}>
        <span
          className={`${currentPrefix}-form-item-label`}
          title={FormatMessage.string({id: 'project.dataTypeSupport'})}
      >
          <FormatMessage id='project.dataTypeSupport'/>
        </span>
        <span className={`${currentPrefix}-form-item-component`}>
          <Select
            notAllowEmpty
            allowClear={false}
            defaultValue={defaultDb}
            onChange={onChange}
          >
            {dataTypeSupports
              .map(type => (<Option
                key={type}
                value={type}
              >
                {type}
              </Option>))}
          </Select>
        </span>
      </div>
      <div className={`${currentPrefix}-form-item`}>
        <span
          className={`${currentPrefix}-form-item-label`}
          title={FormatMessage.string({id: 'exportSql.entity'})}
        >
          <FormatMessage id='exportSql.entity'/>
        </span>
        <span className={`${currentPrefix}-form-item-component`}>
          <span className={`${currentPrefix}-export-sql-pick`}>
            <span>
              {
              selected ? FormatMessage.string({
                    id: 'exportSql.currentSelect',
                    data: {count: selected.length},
                  })
                  : FormatMessage.string({id: 'exportSql.exportEntityAll'})
              }
            </span>
            <span onClick={_pickEntity} title={FormatMessage.string({id: 'exportSql.pickEntity'})}>
              <Icon type='fa-ellipsis-h'/>
            </span>
          </span>
        </span>
      </div>
      <div className={`${currentPrefix}-form-item`}>
        <span
          className={`${currentPrefix}-form-item-label`}
          title={FormatMessage.string({id: 'exportSql.exportData'})}
        >
          <FormatMessage id='exportSql.exportData'/>
        </span>
        <span className={`${currentPrefix}-form-item-component`}>
          <span>
            <RadioGroup defaultValue='all' onChange={onTypeChange}>
              <Radio value='customer'>
                <FormatMessage id='exportSql.exportType[0]'/>
              </Radio>
              <Radio value='all'>
                <FormatMessage id='exportSql.exportType[1]'/>
              </Radio>
            </RadioGroup>
          </span>
        </span>
      </div>
      {
        dataType === 'customer' && <div className={`${currentPrefix}-form-item`}>
          <span
            className={`${currentPrefix}-form-item-label`}
            title={FormatMessage.string({id: 'exportSql.exportCustomerData'})}
        >
            <FormatMessage id='exportSql.exportCustomerData'/>
          </span>
          <span className={`${currentPrefix}-form-item-component`}>
            <span className={`${currentPrefix}-export-sql-type`}>
              <CheckboxGroup
                onChange={templateChange}
                defaultValue={defaultTemplate}
            >
                {
                dataTypeSupport.type === 'appCode' ? [<Checkbox key='content' value='content'>
                  <span>
                    <FormatMessage id='exportSql.exportType[4]'/>
                  </span>
                </Checkbox>] : [
                  <Checkbox key='createTable' value='createTable'>
                    <span>
                      <FormatMessage id='exportSql.exportType[2]'/>
                    </span>
                  </Checkbox>,
                  <Checkbox key='createIndex' value='createIndex'>
                    <span>
                      <FormatMessage id='exportSql.exportType[3]'/>
                    </span>
                  </Checkbox>,
                ]
              }
              </CheckboxGroup>
            </span>
          </span>
        </div>
      }
      <div>
        <Button type='primary' onClick={onPreview}><FormatMessage id='exportSql.preview'/></Button>
      </div>
    </div>
    <div className={`${currentPrefix}-export-sql-right`}>
      <div><Button type='primary' onClick={exportDDL}><FormatMessage id='exportSql.export'/></Button></div>
      <div>
        <CodeEditor
          value={codeData}
          width='auto'
          height='calc(80vh - 45px)'
          onChange={e => _codeChange(e.target.value)}
        />
      </div>
    </div>
  </div>;
});
