import React, { useState } from 'react';
import {IconTitle, Radio, Input, Icon, Button, Modal, FormatMessage, Tooltip, Select, Terminal} from 'components';
import _ from 'lodash/object';
import { emptyDbConn, getDemoDbConnect } from '../../../lib/datasource_util';
import { openFileOrDirPath, connectDB } from '../../../lib/middle';

import './style/index.less';
import {getPrefix} from '../../../lib/prefixUtil';

const Option = Select.Option;

export default React.memo(({prefix, dataSource, dataChange, lang}) => {
  const url = getDemoDbConnect();
  const dataTypeSupports = _.get(dataSource, 'profile.dataTypeSupports', []);
  const defaultDb = _.get(dataSource, 'profile.default.db', dataTypeSupports[0]);
  const [dbConn, updateDbConn] = useState(dataSource?.dbConn || []);
  const [defaultConn, updateDefaultConn] = useState(() => {
    return dbConn.filter(d => d.defKey === dataSource?.profile?.default?.dbConn)[0]?.defKey || '';
  });
  const { properties = {}, defName } = (dbConn.filter(d => d.defKey === defaultConn)[0] || {});
  const defaultConnChange = (e) => {
    const defaultData = dbConn.filter(d => d.defKey === e.target.value)[0];
    updateDefaultConn(defaultData.defKey);
    dataChange && dataChange(defaultData.defKey, 'profile.default.dbConn');
  };
  const currentPrefix = getPrefix(prefix);
  const dbChange = (e, name, key) => {
    const newData = dbConn.map((d) => {
      if (d.defKey === key) {
        return {
          ...d,
          [name]: e.target.value,
          properties: key === 'type' ? {
            driver_class_name: url[e.target.value?.toLocaleLowerCase()]?.driverClass || '',
            url: url[e.target.value?.toLocaleLowerCase()]?.url || '',
            password: '',
            username: '',
          } : d.properties,
        };
      }
      return d;
    });
    updateDbConn(newData);
    dataChange && dataChange(newData, 'dbConn');
  };
  const addConn = () => {
    const empty = {
      ...emptyDbConn,
      defKey: Math.uuid(),
      properties: {
        driver_class_name: url[defaultDb?.toLocaleLowerCase()]?.driverClass || '',
        url: url[defaultDb?.toLocaleLowerCase()]?.url || '',
        password: '',
        username: '',
      },
    };
    const newData = dbConn.concat(empty);
    updateDbConn(newData);
    updateDefaultConn(empty.defKey);
    dataChange && dataChange(empty.defKey, 'profile.default.dbConn');
    dataChange && dataChange(newData, 'dbConn');
  };
  const deleteConn = () => {
    const index = dbConn.findIndex(d => d.defKey === defaultConn);
    const newDefaultIndex = (index === dbConn.length - 1) ? index - 1 : index + 1;
    const newData = dbConn.filter(d => d.defKey !== defaultConn);
    updateDbConn(newData);
    updateDefaultConn(dbConn[newDefaultIndex]?.defKey || '');
    dataChange && dataChange(dbConn[newDefaultIndex]?.defKey || '', 'profile.default.dbConn');
    dataChange && dataChange(newData, 'dbConn');
  };
  const onChange = (e, name) => {
    const newData = dbConn.map((d) => {
      if (d.defKey === defaultConn) {
        return {
          ...d,
          properties: {
            ...(d.properties || {}),
            [name]: e.target.value,
          },
        };
      }
      return d;
    });
    updateDbConn(newData);
    dataChange && dataChange(newData, 'dbConn');
  };
  const selectJarFile = () => {
    openFileOrDirPath([{name: FormatMessage.string({id: 'dbConnect.customDriver'}), extensions: ['jar']}], ['openFile']).then((res) => {
      onChange({target: {
        value: res,
        }}, 'customer_driver');
    }).catch((err) => {
      Modal.error({title: FormatMessage.string({id: 'openDirError'}), message: err.message || err});
    });
  };
  const test = (e, btn) => {
    if (Object.keys(properties).filter(p => p !== 'customer_driver').some(p => !properties[p])) {
      Modal.error({
        title: FormatMessage.string({id: 'optFail'}),
        message: FormatMessage.string({id: 'formValidateMessage'}),
      });
    } else {
      btn && btn.updateStatus('loading');
      connectDB(dataSource, {
        ...properties,
        lang,
      }, 'PingLoadDriverClass', (result) => {
        btn && btn.updateStatus('normal');
        if (result.status === 'FAILED') {
          const termReady = (term) => {
            term.write(result.body);
          };
          Modal.error({
            bodyStyle: {width: '80%'},
            contentStyle: {width: '100%', height: '100%'},
            title: FormatMessage.string({id: 'dbConnect.connectError'}),
            message: <Terminal termReady={termReady}/>,
          });
        } else {
          Modal.success({
            title: FormatMessage.string({id: 'dbConnect.connectSuccess'}),
            message: `${result.body}`,
          });
        }
      });
    }
  };
  const jdbcHelp = <div className={`${currentPrefix}-dbconnect-example-config`}>
    {
      Object.keys(url).map((o) => {
        return (
          <div key={o} className={`${currentPrefix}-dbconnect-example-config-item`}>
            <div className={`${currentPrefix}-dbconnect-example-config-item-header`}>
              {`${o} ${FormatMessage.string({id: 'dbConnect.configExample'})}↓`}
            </div>
            <div className={`${currentPrefix}-dbconnect-example-config-item-content-label`}>
                driver_class:
              <span className={`${currentPrefix}-dbconnect-example-config-item-content-value`}>{url[o].driverClass}</span>
            </div>
            <div className={`${currentPrefix}-dbconnect-example-config-item-content-label`}>
                url:
              <span className={`${currentPrefix}-dbconnect-example-config-item-content-value`}>{url[o].url}</span>
            </div>
          </div>
        );
      })
    }
  </div>;
  return <div className={`${currentPrefix}-dbconnect`}>
    <div style={{width: defaultConn ? '50%' : '100%'}} className={`${currentPrefix}-dbconnect-left`}>
      <div className={`${currentPrefix}-dbconnect-left-header`}>
        <span className={`${currentPrefix}-dbconnect-left-header-opt`}>
          <IconTitle
            type='fa-plus'
            onClick={addConn}
            title={FormatMessage.string({id: 'dbConnect.add'})}
          />
          <IconTitle
            title={FormatMessage.string({id: 'dbConnect.delete'})}
            type='fa-minus'
            onClick={deleteConn}
            disable={!defaultConn}
            style={{opacity: !defaultConn ? 0.48 : 1}}
          />
        </span>
        <span className={`${currentPrefix}-dbconnect-left-header-desc`}>
          {
            defaultConn ?
              <span><FormatMessage id='dbConnect.defaultDbConnectDesc'/>{defName}</span>
                : <FormatMessage id='dbConnect.defaultDbConnectEmpty'/>
          }
        </span>
      </div>
      <div className={`${currentPrefix}-list ${currentPrefix}-dbconnect-left-list`}>
        {
          dbConn.length > 0 ? dbConn.map((conn) => {
            return (
              <div
                key={conn.defKey}
                className={`${currentPrefix}-list-item`}
              >
                <span className={`${currentPrefix}-list-item-com`}>
                  <Radio
                    value={conn.defKey}
                    onChange={defaultConnChange}
                    checked={defaultConn === conn.defKey}
                  />
                </span>
                <span className={`${currentPrefix}-list-item-com`}>
                  <Input onChange={e => dbChange(e, 'defName', conn.defKey)} defaultValue={conn.defName || ''} placeholder={FormatMessage.string({id: 'dbConnect.namePlaceholder'})}/>
                </span>
                <span className={`${currentPrefix}-list-item-com`}>
                  <Select
                    notAllowEmpty
                    defaultValue={conn.type || defaultDb}
                    allowClear={false}
                    onChange={e => dbChange(e, 'type', conn.defKey)}
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
            );
          }) : <div
            className={`${currentPrefix}-list-empty`}
          >
            <FormatMessage id='dbConnect.emptyConnect'/>
          </div>
        }
      </div>
    </div>
    {
      defaultConn && <div className={`${currentPrefix}-dbconnect-right`}>
        <div className={`${currentPrefix}-form-item`}>
          <span
            className={`${currentPrefix}-form-item-label`}
            title={FormatMessage.string({id: 'dbConnect.customDriver'})}
        >
            <FormatMessage id='dbConnect.customDriver'/>
            <Tooltip placement='top' title={FormatMessage.string({id: 'dbConnect.customDriverPlaceholder'})} force>
              <span className={`${currentPrefix}-form-item-label-help`}>
                <Icon type='icon-xinxi'/>
              </span>
            </Tooltip>
          </span>
          <span className={`${currentPrefix}-form-item-component`}>
            <Input
              placeholder={FormatMessage.string({id: 'dbConnect.customDriverPlaceholder'})}
              onChange={e => onChange(e, 'customer_driver')}
              value={properties.customer_driver || ''}
              suffix={<span className={`${currentPrefix}-dbconnect-opt`} onClick={selectJarFile}>
                <Icon type='fa-ellipsis-h' title={FormatMessage.string({id: 'openFile'})}/>
              </span>}
          />
          </span>
        </div>
        <div className={`${currentPrefix}-form-item`}>
          <span
            className={`${currentPrefix}-form-item-label`}
            title={FormatMessage.string({id: 'dbConnect.driver'})}
        >
            <span className={`${currentPrefix}-form-item-label-require`}>{}</span>
            <FormatMessage id='dbConnect.driver'/>
            <Tooltip placement='left' title={jdbcHelp} force>
              <span className={`${currentPrefix}-form-item-label-help`}>
                <Icon type='icon-xinxi'/>
              </span>
            </Tooltip>
          </span>
          <span className={`${currentPrefix}-form-item-component`}>
            <Input
              onChange={e => onChange(e, 'driver_class_name')}
              value={properties.driver_class_name || ''}
          />
          </span>
        </div>
        <div className={`${currentPrefix}-form-item`}>
          <span
            className={`${currentPrefix}-form-item-label`}
            title={FormatMessage.string({id: 'dbConnect.url'})}
        >
            <span className={`${currentPrefix}-form-item-label-require`}>{}</span>
            <FormatMessage id='dbConnect.url'/>
            <Tooltip placement='left' title={jdbcHelp} force>
              <span className={`${currentPrefix}-form-item-label-help`}>
                <Icon type='icon-xinxi'/>
              </span>
            </Tooltip>
          </span>
          <span className={`${currentPrefix}-form-item-component`}>
            <Input
              onChange={e => onChange(e, 'url')}
              value={properties.url || ''}
          />
          </span>
        </div>
        <div className={`${currentPrefix}-form-item`}>
          <span
            style={{paddingRight: '15px'}}
            className={`${currentPrefix}-form-item-label`}
            title={FormatMessage.string({id: 'dbConnect.username'})}
        >
            <span className={`${currentPrefix}-form-item-label-require`}>{}</span>
            <FormatMessage id='dbConnect.username'/>
          </span>
          <span className={`${currentPrefix}-form-item-component`}>
            <Input
              onChange={e => onChange(e, 'username')}
              value={properties.username || ''}
          />
          </span>
        </div>
        <div className={`${currentPrefix}-form-item`}>
          <span
            style={{paddingRight: '15px'}}
            className={`${currentPrefix}-form-item-label`}
            title={FormatMessage.string({id: 'dbConnect.password'})}
        >
            <span className={`${currentPrefix}-form-item-label-require`}>{}</span>
            <FormatMessage id='dbConnect.password'/>
          </span>
          <span className={`${currentPrefix}-form-item-component`}>
            <Input
              onChange={e => onChange(e, 'password')}
              value={properties.password || ''}
          />
          </span>
        </div>
        <div className={`${currentPrefix}-dbconnect-right-button`}>
          <Button onClick={test}>{FormatMessage.string({id: 'dbConnect.test'})}</Button>
        </div>
      </div>
    }
  </div>;
});
