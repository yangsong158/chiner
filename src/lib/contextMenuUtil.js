import React from 'react';
import _ from 'lodash/object';

import { Button, openModal, Modal, Message, FormatMessage } from 'components';

import { Copy, Paste } from './event_tool';
import { replaceDataByTabId } from './cache';
import NewEntity from '../app/container/entity/NewEntity';
import NewView from '../app/container/view/NewViewStep';
import NewRelation from '../app/container/relation/NewRelation';
import NewDict from '../app/container/dict/NewDict';
import NewGroup from '../app/container/group';
import SelectGroup from '../app/container/group/SelectGroup';
import DataType from '../app/container/datatype';
import Domain from '../app/container/domain';
import Preview from '../app/container/database';
import { getEmptyEntity, getEmptyView, emptyRelation, emptyGroup, emptyDomain, emptyDataType, emptyCodeTemplate,
  emptyDict, validateItem, validateKey, emptyDiagram, defaultTemplate, validateItemInclude,
updateAllFieldsType } from './datasource_util';
// 专门处理左侧菜单 右键菜单数据
import { separator } from '../../profile';

const opt = [{
  key: 'add',
  icon: 'fa-plus',
}, {
  key: 'delete',
  icon: 'fa-minus'
}, {
  key: 'move',
  icon: 'fa-arrows'
}, {
  key: 'copy',
  icon: 'fa-clone'
}, {
  key: 'cut',
  icon: 'fa-scissors'
}, {
  key: 'paste',
  icon: 'fa-clipboard'
}, {
  key: 'clear',
  icon: 'fa-eraser'
}, {
  key: 'edit',
  icon: 'fa-pencil-square-o'
}]; // 所有菜单操作的的KEY;

const normalOpt = ['add', 'copy', 'cut', 'paste', 'delete'];
const domainNormalOpt = ['add', 'clear'];
const domainChildNormalOpt = ['add', 'copy', 'paste', 'delete'];
const menusType = {
  groups: ['add', 'delete', 'clear', 'edit'],
  entities: normalOpt,
  entity: normalOpt.concat('move'),
  views: normalOpt,
  view: normalOpt.concat('move'),
  diagrams: normalOpt,
  diagram: normalOpt.concat('move', 'edit'),
  dicts: normalOpt,
  dict: normalOpt.concat('move'),
  domains: domainNormalOpt,
  domain: domainChildNormalOpt,
  dataTypeMapping: domainNormalOpt,
  mapping: domainChildNormalOpt,
  dataTypeSupport: domainNormalOpt,
  dataType: domainChildNormalOpt,
};

export const getMenu = (m, key, type, selectedMenu, groupType, parentKey, tempType = type) => {
  const getName = () => {
    const base = FormatMessage.string({id: `menus.opt.${m}`});
    if (m === 'move') {
      return base;
    } else if (m === 'edit' && type === 'diagram') {
      return FormatMessage.string({id: 'menus.opt.editRelation'});
    }
    return base + FormatMessage.string({id: `menus.${tempType}`});
  }
  return {
    key: m,
    dataKey: key,
    dataType: type,
    otherMenus: selectedMenu,
    groupType,
    parentKey,
    icon: opt.filter(o => o.key === m)[0]?.icon || '',
    name: getName(),
  }
};

export const getMenus = (key, type, selectedMenu, parentKey, groupType) => {
  return menusType[type].filter(m => {
    if (type === 'groups' && !key) {
      return m === 'add';
    }
    return m;
  }).map(m => {
    let tempType = type;
    if (type.endsWith('s') && (m === 'add') && (type !== 'groups')) {
      if (type === 'entities'){
        tempType = 'entity';
      } else {
        tempType = tempType.substring(0, tempType.length - 1);
      }
    }
    return getMenu(m, key, type, selectedMenu, groupType, parentKey, tempType);
  });
};

export const dealMenuClick = (dataSource, menu, updateDataSource, tabOpt, tabClose, callback) => {
  const { key } = menu;
  switch (key) {
    case 'add': addOpt(dataSource, menu, updateDataSource, {}, null, null, callback); break;
    case 'edit': editOpt(dataSource, menu, updateDataSource, tabOpt); break;
    case 'copy': copyOpt(dataSource, menu); break;
    case 'cut': cutOpt(dataSource, menu); break;
    case 'paste': pasteOpt(dataSource, menu, updateDataSource); break;
    case 'delete': deleteOpt(dataSource, menu, updateDataSource, tabClose); break;
    case 'clear': clearOpt(dataSource, menu, updateDataSource); break;
    case 'move': moveOpt(dataSource, menu, updateDataSource); break;
    default:break;
  }
};

const validate = (require, data) => {
  return !require.some(r => !data[r]);
};

const addOpt = (dataSource, menu, updateDataSource, oldData = {}, title, customerDealData, callback) => {
  // 新增操作合集
  const { dataType, parentKey } = menu;
  let modal = null;
  const data = {group: (parentKey && [parentKey]) || [], ...oldData};
  const dataChange = (value, name) => {
    data[name] = value;
  };
  const commonRequire = ['defKey'];
  const commonPick = ['defKey', 'defName'];
  const commonProps = { dataSource, dataChange };
  const commonAllKeys = (dataSource?.entities || []).concat(dataSource?.views || []).map(d => d.defKey);
  const modalComponent = {
    entities: {
      uniqueKey: 'defKey',
      uniqueKeyNamePath: 'tableBase.defKey',
      refName: 'refEntities',
      empty: getEmptyEntity(_.get(dataSource, 'profile.default.entityInitFields', [])),
      dataPick: commonPick.concat('fields'),
      component: NewEntity,
      title: FormatMessage.string({id: 'menus.add.newEntity'}),
      allKeys: commonAllKeys,
      require: commonRequire,
    },
    views: {
      uniqueKey: 'defKey',
      uniqueKeyNamePath: 'tableBase.defKey',
      refName: 'refViews',
      empty: getEmptyView(),
      dataPick: commonPick.concat(['refEntities', 'fields']),
      component: NewView,
      title: FormatMessage.string({id: 'menus.add.newView'}),
      allKeys: commonAllKeys,
      require: commonRequire,
    },
    diagrams: {
      uniqueKey: 'defKey',
      uniqueKeyNamePath: 'relation.defKey',
      refName: 'refDiagrams',
      empty: emptyRelation,
      dataPick: commonPick,
      component: NewRelation,
      title: FormatMessage.string({id: 'menus.add.newRelation'}),
      allKeys: (dataSource?.diagrams || []).map(d => d.defKey),
      require: commonRequire,
    },
    dicts: {
      uniqueKey: 'defKey',
      uniqueKeyNamePath: 'dict.defKey',
      refName: 'refDicts',
      empty: emptyDict,
      dataPick: commonPick,
      component: NewDict,
      title: FormatMessage.string({id: 'menus.add.newDict'}),
      allKeys: (dataSource?.dicts || []).map(d => d.defKey),
      require: commonRequire,
    },
    viewGroups: {
      uniqueKey: 'defKey',
      uniqueKeyNamePath: 'group.defKey',
      empty: emptyGroup,
      dataPick: commonPick.concat(['refEntities', 'refViews', 'refDiagrams', 'refDicts']),
      component: NewGroup,
      title: FormatMessage.string({id: 'menus.add.newGroup'}),
      allKeys: (dataSource?.viewGroups || []).map(d => d.defKey),
      require: commonRequire,
    },
    domains: {
      uniqueKey: 'defKey',
      uniqueKeyNamePath: 'domain.defKey',
      empty: emptyDomain,
      dataPick: 'all',
      component: Domain,
      title: FormatMessage.string({id: 'menus.add.newDomain'}),
      allKeys: (dataSource?.domains || []).map(d => d.defKey),
      require: commonRequire,
    },
    dataTypeMapping: {
      uniqueKey: 'defKey',
      uniqueKeyNamePath: 'dataType.defKey',
      empty: emptyDataType,
      dataPick: 'all',
      component: DataType,
      title: FormatMessage.string({id: 'menus.add.newDataType'}),
      allKeys: (dataSource?.dataTypeMapping?.mappings || []).map(d => d.defKey),
      require: commonRequire,
    },
    dataTypeSupports: {
      uniqueKey: 'dataTypeSupport',
      uniqueKeyNamePath: 'database.name',
      empty: {},
      dataPick: [],
      component: Preview,
      allKeys: (dataSource?.profile?.dataTypeSupports || []),
      title: FormatMessage.string({id: 'menus.add.newDataTypeSupport'}),
      require: ['dataTypeSupport'],
    },
  };
  const getRealType = () => {
    switch (dataType) {
      case 'entities':
      case 'entity': return 'entities';
      case 'views':
      case 'view': return 'views';
      case 'diagrams':
      case 'diagram': return 'diagrams';
      case 'dicts':
      case 'dict': return 'dicts';
      case 'groups': return 'viewGroups';
      case 'domain':
      case 'domains': return 'domains';
      case 'mapping':
      case 'dataTypeMapping': return 'dataTypeMapping';
      case 'dataType':
      case 'dataTypeSupport': return 'dataTypeSupports';
    }
  };
  const realType = getRealType();
  const modalData = modalComponent[realType];
  const onOK = () => {
    const result = validate(modalData.require, data);
    if (!result) {
      Modal.error({
        title: FormatMessage.string({id: 'optFail'}),
        message: FormatMessage.string({id: 'formValidateMessage'})
      });
    } else {
      if (customerDealData) {
        // 自定义处理数据
        customerDealData(data, modal);
      } else {
        const allKeys = modalData.allKeys;
        if (allKeys.includes(data[modalData.uniqueKey])) {
          Modal.error({
            title: FormatMessage.string({id: 'optFail'}),
            message: FormatMessage.string({
              id: 'entityAndViewUniquenessCheck',
              data: {
                key: FormatMessage.string({id: `${modalData.uniqueKeyNamePath}`})
              }
            })});
        } else {
          const refName = modalData.refName;
          let tempDataSource = {...dataSource};
          if (refName) {
            // modal
            tempDataSource = {
              ...tempDataSource,
              viewGroups: data.group?.length > 0 ? (dataSource?.viewGroups || []).map((v) => {
                if (data.group.includes(v.defKey)) {
                  return {
                    ...v,
                    [refName]: v?.[refName]?.concat(data[modalData.uniqueKey]),
                  }
                }
                return v;
              }) : (dataSource?.viewGroups || []),
            }
          }
          const getData = () => {
            return {
              ...modalData.empty,
              ...(modalData.dataPick === 'all' ? _.omit(data, 'group') : _.pick(data, modalData.dataPick)),
            };
          };
          if (realType === 'dataTypeMapping') {
            tempDataSource = {
              ...tempDataSource,
              [realType]: {
                ...(dataSource?.[realType] || {}),
                mappings: (dataSource?.[realType]?.mappings || []).concat(getData())
              }
            };
          } else if (realType === 'dataTypeSupports') {
            tempDataSource = {
              ...tempDataSource,
              profile: {
                ...(tempDataSource?.profile || {}),
                dataTypeSupports: (tempDataSource?.profile?.dataTypeSupports || []).concat(data[modalData.uniqueKey]),
                default: {
                  ..._.get(tempDataSource, 'profile.default', {}),
                  db: data.defaultDb ? data[modalData.uniqueKey] : '',
                },
                codeTemplates: _.get(tempDataSource, 'profile.codeTemplates', []).concat({
                  applyFor: data[modalData.uniqueKey],
                  type: data.type || 'dbDDL',
                  ...defaultTemplate[`${data.type || 'dbDDL'}Template`].reduce((a, b) => {
                    const temp = {...a};
                    temp[b] = data[b] || '';
                    return temp;
                  }, {})
                })
              },
            };
            if (_.get(tempDataSource, 'profile.default.db') !== _.get(dataSource, 'profile.default.db')){
              // 如果默认数据库发生变化
              tempDataSource = updateAllFieldsType(tempDataSource);
            }
          } else {
            // viewGroup domains
            tempDataSource = {
              ...tempDataSource,
              [realType]: (dataSource?.[realType] || []).concat(getData()),
            };
          }
          updateDataSource && updateDataSource({...tempDataSource});
          modal && modal.close();
          Message.success({title: FormatMessage.string({id: 'optSuccess'})});
          callback && callback(realType);
        }
      }
    }
  };
  const onCancel = () => {
    modal && modal.close();
  };
  const buttons = modalData.refName === 'refViews' ? [] : [
    <Button key='onOK' onClick={onOK}>
      <FormatMessage id='button.ok'/>
    </Button>,
    <Button key='onCancel' onClick={onCancel}>
      <FormatMessage id='button.cancel'/>
    </Button>,
  ];
  const Com = modalData.component;
  modal = openModal(
    <Com {...commonProps} data={data} onOK={onOK} onCancel={onCancel}/>,
    {
      bodyStyle: realType === 'dataTypeSupports' ? {width: '80%'} : {},
      title: title || modalData.title,
      buttons,
      focusFirst: true,
    }
  )
};

const editOpt = (dataSource, menu, updateDataSource, updateTabs) => {
  // 暂时只有关系图和分组可以进行右键编辑 后续可以基于此进行拓展
  // 数据域 双击将触发此处的编辑方法
  const { dataType, dataKey } = menu;
  let title = '';
  let name = '';
  let keyName = 'defKey';
  let pickGroup = false;
  const getData = () => {
    if (dataType === 'diagram') {
      pickGroup = true;
      name = 'diagrams';
      title = FormatMessage.string({id: 'menus.edit.editRelation'});
      const group = (dataSource?.viewGroups || [])
        .filter(v => v?.refDiagrams?.includes(dataKey))
        .map(v => v.defKey) || [];
      return {
        ...(dataSource?.diagrams || []).filter(d => d.defKey === dataKey)[0] || {},
        group,
      };
    } else if (dataType === 'groups') {
      name = 'viewGroups';
      title = FormatMessage.string({id: 'menus.edit.editGroup'});
      return _.get(dataSource, name, []).filter(v => v.defKey === dataKey)[0] || {};
    } else if (dataType === 'domain') {
      name = 'domains';
      title = FormatMessage.string({id: 'menus.edit.editDomain'});
      return _.get(dataSource, name, []).filter(v => v.defKey === dataKey)[0] || {};
    } else if (dataType === 'mapping') {
      name = 'dataTypeMapping.mappings';
      title = FormatMessage.string({id: 'menus.edit.editMapping'});
      return _.get(dataSource, name, []).filter(v => v.defKey === dataKey)[0] || {};
    } else if (dataType === 'dataType') {
      keyName = 'dataTypeSupport';
      name = 'profile.dataTypeSupports';
      title = FormatMessage.string({id: 'menus.edit.editDataTypeSupport'});
      const defaultDb = dataSource?.profile?.default?.db;
      const templateData = (dataSource?.profile?.codeTemplates || [])
        .filter(t => t.applyFor === dataKey)[0] || {};
      return {
        dataTypeSupport: dataKey,
        defaultDb,
        templateData,
        type: templateData.type || 'dbDDL',
      }
    }
    return {};
  };
  const oldData = getData();
  addOpt(dataSource, menu, updateDataSource, oldData, title, (data, modal) => {
    const allKeys = (_.get(dataSource, name, [])).map(d => d.defKey || d);
    if ((data[keyName] !== oldData[keyName]) && allKeys.includes(data[keyName])) {
      Modal.error({title: FormatMessage.string({id: 'optFail'}),
        message: FormatMessage.string({id: 'entityAndViewUniquenessCheck'})});
    } else {
      if (dataType === 'diagram') {
        updateDataSource && updateDataSource({
          ...dataSource,
          diagrams: (dataSource?.diagrams || []).map((d) => {
            if (oldData.defKey === d.defKey) {
              return {
                ...d,
                defKey: data.defKey,
                defName: data.defName,
              }
            }
            return d;
          }),
          viewGroups: (dataSource?.viewGroups || []).map((v) => {
            let tempDiagramRefs = (v?.refDiagrams || []);
            if (oldData.group.includes(v.defKey)) {
              // 移除旧的数据
              tempDiagramRefs = tempDiagramRefs.filter(r => r !== oldData.defKey);
            }
            if (data.group.includes(v.defKey)){
              // 插入新的数据
              tempDiagramRefs = tempDiagramRefs.concat(data.defKey);
            }
            return {
              ...v,
              refDiagrams: tempDiagramRefs,
            };
          }),
        });
        const tabKey = data.defKey + separator + dataType;
        const oldTabKey = oldData.defKey + separator + dataType;
        replaceDataByTabId(oldTabKey, tabKey);
        updateTabs(oldData.defKey, data.defKey, dataType);
      } else if (dataType === 'mapping') {
        let domains = _.get(dataSource, 'domains', []);
        let tempDataSource = {
          ...dataSource,
          dataTypeMapping: {
            ...(dataSource?.dataTypeMapping || {}),
            mappings: _.get(dataSource, name, []).map((v) => {
              if (v.defKey === oldData.defKey) {
                if (v.defKey !== data.defKey) {
                  // 与之相关的domains的apply需要更新
                  domains = domains.map((d) => {
                    if (d.applyFor === v.defKey) {
                      return {
                        ...d,
                        applyFor: data.defKey,
                      };
                    }
                    return d;
                  })
                }
                return _.omit(data, 'group');
              }
              return v;
            })
          },
        };
        tempDataSource.domains = domains; // 更新domains
        const mappings = _.get(dataSource, 'dataTypeMapping.mappings', []);
        const db = _.get(dataSource, 'profile.default.db', _.get(dataSource, 'dataTypeSupports', [])[0]);
        tempDataSource = updateAllFieldsType(tempDataSource, ({domain, type}) => {
          // 替换某些字段的type
          const oldDomain = domains.filter(d => d.defKey === domain)[0] || {};
          const oldDataType = mappings.filter(m => m.defKey === oldDomain.applyFor)[0]?.[db] || '';
          if (data.defKey === oldDomain.applyFor) {
            return {
              type: oldDataType === type ? data[db] : type,
            };
          }
          return { type };
        });
        updateDataSource && updateDataSource(tempDataSource);
      } else if (dataType === 'dataType') {
        let tempDataSource = {
          ...dataSource,
          profile: {
            ..._.get(dataSource, 'profile', {}),
            default: {
              ..._.get(dataSource, 'profile.default', {}),
              db: (data.defaultDb !== oldData.defaultDb) ? data[keyName] : oldData.defaultDb,
            },
            dataTypeSupports: _.get(dataSource, 'profile.dataTypeSupports', []).map((d) => {
              if (d === oldData[keyName]) {
                return data[keyName];
              }
              return d;
            }),
            codeTemplates: _.get(dataSource, 'profile.codeTemplates', []).map((t) => {
              if (t.applyFor === oldData[keyName]) {
                return {
                  type: data.type,
                  applyFor: data[keyName],
                  ...defaultTemplate[`${data.type}Template`].reduce((a, b) => {
                    const temp = {...a};
                    temp[b] = b in data ? data[b] : (oldData?.templateData[b] || '');
                    return temp;
                  }, {}),
                }
              }
              return t;
            }),
          }
        };
        if (_.get(tempDataSource, 'profile.default.db') !== _.get(dataSource, 'profile.default.db')){
          // 如果默认数据库发生变化
          tempDataSource = updateAllFieldsType(tempDataSource);
        }
        updateDataSource && updateDataSource(tempDataSource);
      } else {
        let tempDataSource = {
          ...dataSource,
          [name]: (dataSource?.[name] || []).map((v) => {
            if (v.defKey === oldData.defKey) {
              return pickGroup ? data : _.omit(data, 'group');
            }
            return v;
          }),
        };
        if ((dataType === 'domain')) {
          const mappings = _.get(dataSource, 'dataTypeMapping.mappings', []);
          const db = _.get(dataSource, 'profile.default.db', _.get(dataSource, 'dataTypeSupports', [])[0]);
          const domainCompare = ['defKey', 'applyFor', 'len', 'scale'];
          if (domainCompare.some(d => oldData[d] !== data[d])) {
            tempDataSource = updateAllFieldsType(tempDataSource, (f) => {
              // 替换所有字段的domain
              if (f.domain === oldData.defKey) {
                let type = f.type;
                if (oldData.applyFor !== data.applyFor) {
                  // 需要更新字段的type
                  const oldType = mappings.filter(m => m.defKey === oldData.applyFor)[0]?.[db];
                  if (oldType === type) {
                    // type 未被修改过
                    type = mappings.filter(m => m.defKey === data.applyFor)[0]?.[db] || type;
                  }
                }
                return {
                  domain: data.defKey,
                  len: f.len === oldData.len ? data.len : f.len,
                  scale: f.len === oldData.scale ? data.scale : f.scale,
                  type
                };
              }
              return f;
            })
          }
        }
        updateDataSource && updateDataSource(tempDataSource);
      }
      modal && modal.close();
      Message.success({title: FormatMessage.string({id: 'optSuccess'})});
    }
  });
};

const domainData = [
  {
    type: 'domain',
    parentType: 'domains',
    name: 'domains',
    key: 'defKey',
    emptyData: emptyDomain,
  },
  {
    type: 'mapping',
    parentType: 'dataTypeMapping',
    name: 'dataTypeMapping.mappings',
    key: 'defKey',
    emptyData: emptyDataType,
  },
  {
    type: 'dataType',
    parentType: 'dataTypeSupport',
    name: 'profile.codeTemplates',
    key: 'applyFor',
    emptyData: emptyCodeTemplate,
  }
];

const copyOpt = (dataSource, menu, type = 'copy', cb) => {
  const { otherMenus = [], groupType, dataType } = menu;
  let tempTypeData = [];
  const checkData = [
    ['entity', 'entities'],
    ['view', 'views'],
    ['diagram', 'diagrams'],
    ['dict', 'dicts']
  ];
  const getData = (name, data) => {
    return dataSource?.[name].filter((d) => {
      return data.includes(d.defKey);
    })
  };
  const getResult = (data, group) => {
    const tempOtherMenus = group ? otherMenus.filter(m => m.parentKey === group) : otherMenus;
    return checkData.filter(c => c.includes(dataType)).reduce((pre, next) => {
      let name = next[1];
      if (tempOtherMenus.some(o => o.type === next[1]) && !tempOtherMenus.some(o => o.type === next[0])) {
        // 选中了父节点 复制所有的子节点
        return pre.concat(typeof data === 'function' ? data(name) : data?.[name]);
      } else {
        // 复制选中的子节点
        return pre.concat(getData(name, tempOtherMenus.filter(o => o.type === next[0]).map(o => o.key)));
      }
    }, []);
  };
  if (otherMenus.length > 0){
    // 组装各类复制数据
    // 获取各个分类所有的数据
    const domainIndex = domainData.findIndex((d) => d.type === dataType);
    if (domainIndex > -1) {
      // 数据域相关操作
      const { name, key } = domainData[domainIndex];
      const selectKey = otherMenus.filter(m => m.type === dataType).map(m => m.key);
      tempTypeData = _.get(dataSource, name, []).filter(d => selectKey.includes(d[key]));
    } else {
      if (groupType === 'modalGroup') {
        // 如果是在分组模式下
        // 先计算每个分组的数据 然后合并所有的数据
        tempTypeData = (dataSource?.viewGroups || []).reduce((a, b) => {
          return a.concat(getResult((names) => {
            return getData(names, b[`ref${names.slice(0, 1).toUpperCase() + names.slice(1)}`]);
          }, b.defKey));
        }, []);
      } else {
        tempTypeData = getResult(dataSource);
      }
    }
    if (cb) {
      cb({ type, data: tempTypeData });
    } else {
      Copy({ type, data: tempTypeData }, FormatMessage.string({id: `${type}Success`}));
    }
  } else {
    Message.warring({title: FormatMessage.string({id: `${type}Warring`})});
  }
};

const cutOpt = (dataSource, menu) => {
  copyOpt(dataSource, menu, 'cut')
};

const getOptConfig = (dataType) => {
  const entityConfig = {
    type: ['entities', 'entity'],
    mainKey: 'entities',
    key: 'defKey',
    emptyData: getEmptyEntity(),
    viewRefs: 'refEntities',
  };
  const viewConfig = {
    type: ['views', 'view'],
    mainKey: 'views',
    key: 'defKey',
    emptyData: getEmptyView(),
    viewRefs: 'refViews',
  };
  const diagramConfig = {
    type: ['diagrams', 'diagram'],
    mainKey: 'diagrams',
    key: 'defKey',
    emptyData: emptyDiagram,
    viewRefs: 'refDiagrams',
  };
  const dictConfig = {
    type: ['dicts', 'dict'],
    mainKey: 'dicts',
    key: 'defKey',
    emptyData: emptyDict,
    viewRefs: 'refDicts',
  };
  const domianConfig = {
    type: ['domain'],
    mainKey: 'domains',
    key: 'defKey',
    emptyData: emptyDomain,
  };
  const mappingConfig = {
    type: ['mapping'],
    mainKey: 'dataTypeMapping.mappings',
    key: 'defKey',
    emptyData: emptyDataType,
  };
  const dataTypeSupportConfig = {
    type: ['dataType'],
    mainKey: 'profile.codeTemplates',
    key: 'applyFor',
    emptyData: emptyCodeTemplate,
  };
  const optConfigMap = {
    entityConfig,
    viewConfig,
    diagramConfig,
    dictConfig,
    domianConfig,
    mappingConfig,
    dataTypeSupportConfig
  };
  return Object.keys(optConfigMap)
    .filter(config => optConfigMap[config].type.includes(dataType))
    .map(config => optConfigMap[config])[0];
};

const pasteOpt = (dataSource, menu, updateDataSource) => {
  const { dataType, parentKey } = menu;
  Paste((value) => {
    let data = {};
    try {
      data = JSON.parse(value);
    } catch (e) {
      Message.warring({title: FormatMessage.string({id: 'pasteWarring'})});
    }
    const config = getOptConfig(dataType);
    const validate = (dataType === 'mapping' || dataType === 'dataType')
        ? validateItemInclude : validateItem;
    const newData = (data?.data || []).filter(e => validate(e, config.emptyData));
    const newDataKeys = newData.map(e => e[config.key]);
    const oldData = _.get(dataSource, config.mainKey, []).filter((e) => {
      if (data?.type === 'cut') {
        return !newDataKeys.includes(e[config.key]);
      }
      return true;
    });
    const newGroupData = config.viewRefs && (dataSource?.viewGroups || []).map(v => {
      if (data?.type === 'cut') {
        return {
          ...v,
          [config.viewRefs]: (v[config.viewRefs] || []).filter(k => !newDataKeys.includes(k)),
        }
      }
      return v;
    });
    const allKeys = oldData.map(e => e[config.key]);
    const realData = newData
        .map((e) => {
          const key = validateKey(e[config.key], allKeys);
          allKeys.push(key);
          return {
            ...e,
            [config.key]: key,
          };
        });
    if (realData.length === 0) {
      Message.warring({title: FormatMessage.string({id: 'pasteWarring'})});
    } else {
      const mainKeys = config.mainKey.split('.');
      let tempNewData = {};
      if (mainKeys.length > 1) {
        tempNewData = _.set(dataSource, mainKeys, oldData.concat(realData));
      } else {
        tempNewData[config.mainKey] = oldData.concat(realData);
      }
      if (dataType === 'dataType') {
        tempNewData.profile.dataTypeSupports
            = (tempNewData.profile.dataTypeSupports || []).concat(realData.map(d => d.applyFor));
      }
      if (parentKey) {
        updateDataSource({
          ...dataSource,
          ...tempNewData,
          viewGroups: newGroupData ? newGroupData.map((v) => {
            if (v.defKey === parentKey) {
              return {
                ...v,
                [config.viewRefs]: (v[config.viewRefs] || []).concat(realData.map(e => e[config.key])),
              }
            }
            return v;
          }) : (dataSource.viewGroups || [])
        });
      } else {
        updateDataSource({
          ...dataSource,
          ...tempNewData,
          viewGroups: newGroupData ? newGroupData : (dataSource.viewGroups || []),
        });
      }
    }
    Message.success({title: FormatMessage.string({id: 'pasteSuccess'})});
  });
};

const deleteOpt = (dataSource, menu, updateDataSource, tabClose) => {
  Modal.confirm({
    title: FormatMessage.string({id: 'deleteConfirmTitle'}),
    message: FormatMessage.string({id: 'deleteConfirm'}),
    onOk: () => {
      const { dataType, dataKey, otherMenus = [] } = menu;
      const domain = domainData.filter(d => d.type === dataType)[0];
      if (dataType === 'groups') {
        updateDataSource && updateDataSource({
          ...dataSource,
          viewGroups: (dataSource?.viewGroups || []).filter(v => v.defKey !== dataKey),
        });
        Message.success({title: FormatMessage.string({id: 'deleteSuccess'})});
      } else if (domain && domain.type === 'mapping') {
        const deleteData = otherMenus.filter(m => m.type === dataType).map(m => m.key);
        updateDataSource && updateDataSource({
          ...dataSource,
          dataTypeMapping: {
            ...dataSource.dataTypeMapping,
            mappings: (dataSource.dataTypeMapping?.mappings || [])
                .filter(d => !deleteData.includes(d[domain.key]))
          }
        });
        Message.success({title: FormatMessage.string({id: 'deleteSuccess'})});
      } else if(domain && domain.type === 'dataType') {
        const deleteData = otherMenus.filter(m => m.type === dataType).map(m => m.key);
        updateDataSource && updateDataSource({
          ...dataSource,
          profile: {
            ...dataSource.profile,
            dataTypeSupports: (dataSource.profile?.dataTypeSupports || [])
                .filter(d => !deleteData.includes(d)),
            codeTemplates: (dataSource.profile?.codeTemplates || [])
                .filter(d => !deleteData.includes(d.applyFor))
          }
        });
        Message.success({title: FormatMessage.string({id: 'deleteSuccess'})});
      } else {
        const optConfig = getOptConfig(dataType);
        if (optConfig) {
          copyOpt(dataSource, menu, 'delete', (data) => {
            const deleteData = (data?.data || []);
            const deleteDataKeys = deleteData.map(e => e[optConfig.key]);
            const newData = (dataSource?.[optConfig.mainKey] || [])
              .filter(e => !deleteDataKeys.includes(e[optConfig.key]));
            const newGroupData = (dataSource?.viewGroups || []).map(v => ({
              ...v,
              [optConfig.viewRefs]: (v[optConfig.viewRefs] || []).filter(k => !deleteDataKeys.includes(k)),
            }));
            updateDataSource && updateDataSource({
              ...dataSource,
              [optConfig.mainKey]: newData,
              viewGroups: newGroupData,
            });
            tabClose && tabClose(dataKey + separator + dataType);
            Message.success({title: FormatMessage.string({id: 'deleteSuccess'})});
          });
        }
      }
    },
  });
};

const clearOpt = (dataSource, menu, updateDataSource) => {
  const { dataKey, dataType } = menu;
  Modal.confirm({
    title: FormatMessage.string({id: 'clearConfirmTitle'}),
    message: FormatMessage.string({id: 'clearConfirm'}),
    onOk: () => {
      const domain = domainData.filter(d => d.parentType === dataType)[0];
      // 数据域相关操作
      if (domain) {
        if (dataType === 'dataTypeMapping') {
          updateDataSource && updateDataSource({
            ...dataSource,
            dataTypeMapping: {
              referURL: '',
              mappings: [],
            },
          });
        } else if (dataType === 'domains') {
          updateDataSource && updateDataSource({
            ...dataSource,
            domains: [],
          });
        }
      } else {
        updateDataSource && updateDataSource({
          ...dataSource,
          viewGroups: (dataSource?.viewGroups || []).map((v) => {
            if (v.defKey === dataKey) {
              return {
                ...v,
                refEntities:[],
                refViews:[],
                refDiagrams:[],
                refDicts:[]
              }
            }
            return v;
          }),
        });
      }
      Message.success({title: FormatMessage.string({id: 'clearSuccess'})});
    }
  });
};

const moveOpt = (dataSource, menu, updateDataSource) => {
  const { dataType, dataKey } = menu;
  let modal = null;
  const getRefName = () => {
    switch (dataType) {
      case 'entity': return 'refEntities';
      case 'view': return 'refViews';
      case 'diagram': return 'refDiagrams';
      case 'dict': return 'refDicts';
    }
  };
  const refName = getRefName();
  let oldData = (dataSource?.viewGroups || []).filter(v => v[refName]?.includes(dataKey)).map(v => v.defKey);
  const dataChange = (groups) => {
    oldData = groups;
  };
  const onCancel = () => {
    modal && modal.close();
  };
  const onOK = () => {
    const selectGroups = [...new Set(oldData)];
    updateDataSource && updateDataSource({
      ...dataSource,
      viewGroups: (dataSource?.viewGroups || []).map((v) => {
        if (selectGroups.includes(v.defKey)) {
          return {
            ...v,
            [refName]: [...new Set((v[refName] || []).concat(dataKey))]
          }
        } else {
          return {
            ...v,
            [refName]: (v[refName] || []).filter(k => k !== dataKey),
          }
        }
      }),
    });
    Message.success({title: FormatMessage.string({id: 'moveSuccess'})});
    modal && modal.close();
  };
  modal = openModal(
    <SelectGroup dataSource={dataSource} dataChange={dataChange} data={oldData}/>,
    {
      title: FormatMessage.string({id: 'group.selectGroup'}),
      buttons: [
        <Button key='onOK' onClick={onOK}>
          <FormatMessage id='button.ok'/>
        </Button>,
        <Button key='onCancel' onClick={onCancel}>
          <FormatMessage id='button.cancel'/>
        </Button>],
    }
  )
};
