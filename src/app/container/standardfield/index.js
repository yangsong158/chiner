import React, { useState, useRef, useImperativeHandle, forwardRef } from 'react';
import moment from 'moment';

import {
  Button,
  Download,
  FormatMessage,
  Icon, IconTitle,
  Modal,
  openModal,
  SearchInput,
  Tooltip, Upload,
} from 'components';
import _ from 'lodash/object';
import StandardFieldsEdit from './StandardFieldsEdit';
import StandardFieldsListSelect from './StandardFieldsListSelect';
import {getPrefix} from '../../../lib/prefixUtil';
import { separator } from '../../../../profile';
import { validateStandardFields } from '../../../lib/datasource_util';
import './style/index.less';

const OptHelp = ({currentPrefix}) => {
  return <div className={`${currentPrefix}-standard-fields-list-title-help`}>
    <span>{FormatMessage.string({id: 'standardFields.help'})}</span>
  </div>;
};

export default forwardRef(({prefix, dataSource, updateDataSource, activeKey}, ref) => {
  const currentPrefix = getPrefix(prefix);
  const [fold, setFold] = useState(true);
  const [filterValue, setFilterValue] = useState('');
  const [selectFields, setSelectFields] = useState([]);
  const listSelectRef = useRef([]);
  const contentRef = useRef(null);
  const iconClick = () => {
    setFold(pre => !pre);
  };
  const getKey = (f) => {
    return `${f.defKey}(${f.defName})`;
  };
  const onItemClick = (e, f) => {
    if (e.shiftKey) {
      setSelectFields((pre) => {
        const tempFields = [...pre];
        const index = tempFields.findIndex(t => getKey(f) === getKey(t));
        if (index >= 0) {
          tempFields.splice(index, 1);
        } else {
          tempFields.push(f);
        }
        return tempFields;
      });
    } else {
      setSelectFields([f]);
    }
  };
  const onDragStart = (e) => {
    e.dataTransfer.setData('fields', JSON.stringify(selectFields));
  };
  const onChange = (e) => {
    setFilterValue(e.target.value);
  };
  const finalData = (dataSource.standardFields || []).map((g) => {
    return {
      ...g,
      fields: (g.fields || [])
          .filter(f => getKey(f).toLocaleLowerCase().includes(filterValue.toLocaleLowerCase())),
    };
  });
  const onClick = (d) => {
    let tempData;
    let modal;
    const onOK = () => {
      if (tempData) {
        if (validateStandardFields(tempData)) {
          tempData && updateDataSource({
            ...dataSource,
            standardFields: tempData.map((group) => {
              return {
                ..._.omit(group, ['__key']),
                fields: (group.fields || []).map(f => _.omit(f, ['__key'])),
              };
            }),
          });
          modal.close();
        } else {
          Modal.error({
            title: FormatMessage.string({id: 'optFail'}),
            message: FormatMessage.string({id: 'standardFields.groupAndFieldNotAllowRepeatAndEmpty'}),
          });
        }
      } else {
        modal.close();
      }
    };
    const onCancel = () => {
      modal.close();
    };
    const dataChange = (data) => {
      tempData = data;
    };
    let twinkle;
    if (d?.defKey) {
      const defKey = d?.defKey;
      const group = d?.groups?.[0];
      if (group) {
        twinkle = group + separator + defKey;
      } else {
        twinkle = defKey;
      }
    }
    modal = openModal(<StandardFieldsEdit
      twinkle={twinkle}
      prefix={prefix}
      dataChange={dataChange}
      dataSource={dataSource}
    />, {
      bodyStyle: {width: '80%'},
      title: FormatMessage.string({id: 'standardFields.editStandardFields'}),
      buttons: [
        <Button key='onOK' onClick={onOK} type='primary'>
          <FormatMessage id='button.ok'/>
        </Button>,
        <Button key='onCancel' onClick={onCancel}>
          <FormatMessage id='button.cancel'/>
        </Button>,
      ],
    });
  };
  const exportStandardFields = () => {
    const standardFields = _.get(dataSource, 'standardFields', []);
    Download(
        [JSON.stringify(standardFields, null, 2)],
        'application/json', `${FormatMessage.string({id: 'standardFields.standardFieldsLib'})}-${moment().unix()}.json`);
  };
  const importStandardFields = () => {
    Upload('application/json', (data) => {
      try {
        const dataObj = JSON.parse(data);
        let modal;
        const onOk = () => {
          updateDataSource({
            ...dataSource,
            standardFields: listSelectRef.current.getStandardFields(),
          });
          modal.close();
        };
        const onClose = () => {
          modal.close();
        };
        const standardFields = _.get(dataSource, 'standardFields', []);
        modal = openModal(<StandardFieldsListSelect
          prefix={`${currentPrefix}-standard-fields`}
          ref={listSelectRef}
          data={dataObj}
          groups={standardFields}
        />, {
          bodyStyle: {width: '60%'},
          title: <FormatMessage id='toolbar.importStandardFieldsLib'/>,
          buttons: [
            <Button key='ok' onClick={onOk} type='primary'>
              <FormatMessage id='button.ok'/>
            </Button>,
            <Button key='cancel' onClick={onClose}>
              <FormatMessage id='button.close'/>
            </Button>],
        });
      } catch (err) {
        Modal.error({
          title: FormatMessage.string({id: 'optFail'}),
          message: FormatMessage.string({id: 'standardFields.errData'}),
        });
      }
    }, (file) => {
      return file.name.endsWith('.json');
    });
  };
  useImperativeHandle(ref, () => {
    return {
      openEdit: onClick,
    };
  }, [dataSource]);
  const type = activeKey.split(separator)[1];
  return <div
    style={{display: (type === 'entity' || type === 'diagram') ? 'block' : 'none'}}
    className={`${currentPrefix}-standard-fields-list-${fold ? 'fold' : 'unfold'}`}
  >
    <div className={`${currentPrefix}-standard-fields-list-icon`} onClick={iconClick}>
      {
        fold ? <div>
          <Icon type='lib.svg'/>
          <span>{
            FormatMessage.string({id: 'standardFields.fieldsLib'})
                .split('').map((m) => {
              return <span key={m}>{m}</span>;
            })
          }</span>
        </div> : <Icon type='fa-times'/>
      }
    </div>
    {
      !fold && <div
        className={`${currentPrefix}-standard-fields-list-title`}
      >
        <span style={{marginRight: '5px'}}>
          <FormatMessage id='standardFields.standardFieldsLib'/>
        </span>
        <span className={`${currentPrefix}-standard-fields-list-title-opt`}>
          <Tooltip title={<OptHelp currentPrefix={currentPrefix}/>} force placement='topLeft'>
            <IconTitle type='icon-xinxi'/>
          </Tooltip>
          <IconTitle title={FormatMessage.string({id: 'standardFields.importStandardFieldsLib'})} type='icon-daoru' onClick={importStandardFields}/>
          <IconTitle title={FormatMessage.string({id: 'standardFields.exportStandardFieldsLib'})} type='icon-daochu' onClick={exportStandardFields}/>
          <IconTitle title={FormatMessage.string({id: 'standardFields.setting'})} type='icon-weihu' onClick={onClick}/>
        </span>
      </div>
    }
    <div ref={contentRef} className={`${currentPrefix}-standard-fields-list-${fold ? 'fold' : 'unfold'}-content`}>
      <span className={`${currentPrefix}-standard-fields-list-search`}>
        <SearchInput placeholder={FormatMessage.string({id: 'standardFields.standardFieldsLibSearch'})} onChange={onChange}/>
      </span>
      {
        finalData.length === 0 ?
          <div className={`${currentPrefix}-standard-fields-list-empty`}>
            <FormatMessage id='standardFields.standardFieldsLibEmpty'/>
          </div>
            : finalData.map((g) => {
              return <div key={g.defKey}>
                <span className={`${currentPrefix}-standard-fields-list-group`}>
                  <Icon type='icon-shuju2'/>
                  <span>{g.defName}({g.defKey})</span>
                </span>
                {
                  (g.fields || []).map((f) => {
                    const key = getKey(f);
                    const selected = selectFields.findIndex(s => getKey(s) === key) >= 0;
                    return <div
                      onDragStart={onDragStart}
                      draggable={selected}
                      className={`${currentPrefix}-standard-fields-list-content-${selected ? 'selected' : 'unselected'}`}
                      onClick={e => onItemClick(e, f)}
                      key={key}
                    >
                      {key}
                    </div>;
                  })
                }
              </div>;
            })
      }
    </div>
  </div>;
});
