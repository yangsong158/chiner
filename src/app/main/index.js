import React, {useState, useMemo, useEffect, useRef} from 'react';
import _ from 'lodash/object';
import {
  Menu,
  Tab,
  Button,
  Loading,
  openModal,
  Message,
  ToolBar,
  Icon,
  Modal,
  FormatMessage,
  Checkbox, Tooltip, Upload, Terminal,
} from 'components';
import Dict from '../container/dict';
import Entity from '../container/entity';
import View from '../container/view';
import Relation from '../container/relation';
import Config from '../container/config';
import DbConnect from '../container/dbconnect';
import DbReverseParse from '../container/tools/dbreverseparse';
import ExportSql from '../container/tools/exportsql';
import ImportPd from '../container/tools/importpd';
import StandardField from '../container/standardfield';
import HeaderTool from './HeaderTool';
import MessageHelp from './MessageHelp';
import { separator } from '../../../profile';
import { getMenu, getMenus, dealMenuClick } from '../../lib/contextMenuUtil';
//import { getCurrentVersionData } from '../../lib/datasource_version_util';
//import { connectDB } from '../../lib/middle';
//import { generateFile } from '../../lib/generatefile';
//import { getCurrentVersionData } from '../../lib/datasource_version_util';
import {
  validateKey,
  updateAllData,
  allType, pdman2sino,
} from '../../lib/datasource_util';
import { setDataByTabId } from '../../lib/cache';
import { Save } from '../../lib/event_tool';

import './style/index.less';
import {getPrefix} from '../../lib/prefixUtil';
import {addBodyEvent, removeBodyEvent} from '../../lib/listener';
import {firstUp} from '../../lib/string';
import {connectDB, selectWordFile} from '../../lib/middle';
import { imgAll } from '../../lib/generatefile/img';

const TabItem = Tab.TabItem;

const Index = React.memo(({getUserData, open, config, common, prefix, projectInfo,
                            ...restProps}) => {
  const [tabs, updateTabs] = useState([]);
  const menuNorWidth = 290;
  const menuMinWidth = 50;
  const isResize = useRef({status: false});
  const resizeContainer = useRef(null);
  const resizeOther = useRef(null);
  const menuContainerModel = useRef(null);
  const menuContainerDataType = useRef(null);
  const injectTempTabs = useRef([]);
  const activeTabStack = useRef([]);
  const importPdRef = useRef(null);
  const tabsRef = useRef(tabs);
  tabsRef.current = tabs;
  const dataSourceRef = useRef({});
  dataSourceRef.current = restProps.dataSource;
  const [groupType, updateGroupType] = useState(restProps.dataSource?.profile?.modelType || 'modalAll');
  const [activeKey, updateActiveKey] = useState('');
  const tabInstanceRef = useRef({});
  const menuModelRef = useRef(null);
  const menuDomainRef = useRef(null);
  const currentMenu = useRef(null);
  const standardFieldRef = useRef(null);
  const activeKeyRef = useRef(activeKey);
  activeKeyRef.current = activeKey;
  const activeTab = tabs.filter(t => t.tabKey === activeKey)[0];
  const [contextMenus, updateContextMenus] = useState([]);
  const [draggable, setDraggable] = useState(false);
  const { lang } = config;
  const cavRefArray = useRef([]);
  const replace = useMemo(() => [], []);
  const headerToolRef = useRef(null);
  const [menuType, setMenuType] = useState('1');
  const projectInfoRef = useRef(projectInfo);
  projectInfoRef.current = projectInfo;
  const saveProject = (saveAs, callback) => {
    const isSaveAs = saveAs || !projectInfoRef.current;
    const newData = updateAllData(dataSourceRef.current,
        injectTempTabs.current.concat(tabsRef.current));
    if (newData.result.status) {
      replace.splice(0, replace.length - 1, ...newData.replace); // 重置数组
      restProps.save(newData.dataSource, FormatMessage.string({id: 'saveProject'}), isSaveAs);
      if (!isSaveAs) {
        restProps?.update(newData.dataSource);
        Message.success({title: FormatMessage.string({id: 'saveSuccess'})});
      }
      injectTempTabs.current = [];
      callback && callback(false);
    } else {
      callback && callback(true);
      Modal.error({
        title: FormatMessage.string({id: 'optFail'}),
        message: newData.result.message,
      });
    }
  };
  /*const changes = useMemo(() => {
    return getCurrentVersionData(restProps.dataSource, restProps.versionsData);
  }, [restProps.dataSource, restProps.versionsData]);*/
  useEffect(() => {
    Save(() => {
      saveProject();
    });
  }, [restProps.dataSource, tabs]);
  const replaceAllTab = (replaceTabs) => {
    const index = replaceTabs.findIndex(r => (r.old + separator + r.type) === activeKey);
    updateTabs(tabs.map((t) => {
      const replaceTab = replaceTabs.filter(r => (r.old + separator + r.type) === t.tabKey)[0];
      if (replaceTab) {
        return {
          ...t,
          tabKey: replaceTab.new + separator + replaceTab.type,
          menuKey: replaceTab.new,
          type: replaceTab.type,
        };
      }
      return t;
    }));
    if (index > -1) {
      const newActiveTab = replaceTabs[index];
      updateActiveKey(newActiveTab.new + separator + newActiveTab.type);
    }
  };
  useEffect(() => {
    if (replace.length !== 0) {
      replaceAllTab(replace);
    }
    replace.splice(0, replace.length);
  }, [restProps.dataSource]);
  const validateTableStatus = (key) => {
    return tabsRef.current.findIndex(t => t.tabKey === key) >= 0;
  };
  const scaleChange = (scale) => {
    headerToolRef.current.setScaleNumber(scale);
  };
  const renderReady = (cav, key) => {
    scaleChange(1);
    cavRefArray.current.push({
      cav,
      key,
    });
  };
  const _groupMenuChange = () => {
    updateGroupType((pre) => {
      return pre === 'modalAll' ?  'modalGroup' : 'modalAll';
    });
  };
  const getCurrentCav = () => {
    return cavRefArray.current.filter(cav => activeKeyRef.current === cav.key)[0]?.cav;
  };
  useEffect(() => {
    const cavRef = getCurrentCav();
    if (cavRef) {
      // 更新放大倍数
      scaleChange(cavRef.getScaleNumber().sx || 1);
      setDraggable(true);
    } else {
      setDraggable(false);
    }
    const activeIndex = activeTabStack.current.findIndex(a => a === activeKey);
    if (activeIndex > -1) {
      activeTabStack.current.splice(activeIndex, 1);
    }
    if (activeKey) {
      activeTabStack.current.push(activeKey);
    }
  }, [activeKey]);
  const _tabChange = (menuKey) => {
    updateActiveKey(menuKey);
  };
  const _tabClose = (tabKey) => {
    // 重新设置激活的tab页
    let newActiveKey = null;
    if (activeKey === tabKey) {
      const length = activeTabStack.current.length;
      newActiveKey = activeTabStack.current[length - 2];
    }
    activeTabStack.current = activeTabStack.current.filter(a => a !== tabKey);
    updateTabs((pre) => {
      return pre.filter(t => t.tabKey !== tabKey);
    });
    cavRefArray.current = cavRefArray.current.filter(c => c.key !== tabKey);
    updateActiveKey((pre) => {
      return newActiveKey || pre;
    });
  };
  const _tabCloseOther = (tabKey) => {
    activeTabStack.current = [tabKey];
    updateTabs(pre => pre.filter(t => t.tabKey === tabKey));
    cavRefArray.current = cavRefArray.current.filter(c => c.key !== tabKey);
    updateActiveKey(tabKey);
    _tabChange(tabKey);
  };
  const _tabCloseAll = () => {
    updateTabs([]);
    cavRefArray.current = [];
    activeTabStack.current = [];
    updateActiveKey('');
  };
  const _onMenuClick = (menuKey, type, parentKey, icon, param) => {
    console.log(menuKey, type, parentKey, icon);
    const tabKey = menuKey + separator + type;
    const tempTabs = [...tabsRef.current];
    if (!tempTabs.some(t => t.tabKey === tabKey)) {
      tempTabs.push({
        tabKey,
        menuKey,
        type,
        icon,
        style: type === 'diagram' ? { overflow: 'hidden' } : {},
        param,
      });
    } else if (param){
      tabInstanceRef.current[tabKey].twinkle(param.defKey);
    }
    updateTabs(tempTabs);
    updateActiveKey(tabKey);
  };
  const _replaceTab = (oldMenuKey, menuKey, type) => {
    const tempTabs = [...tabsRef.current];
    const tabKey = menuKey + separator + type;
    const oldTabKey = oldMenuKey + separator + type;
    if (tempTabs.findIndex(t => t.tabKey === oldTabKey) > -1) {
      updateTabs(tempTabs.map((t) => {
        if (t.tabKey === oldTabKey) {
          return {
            ...t,
            tabKey,
            menuKey,
            type,
          };
        }
        return t;
      }));
      if (activeKeyRef.current === oldTabKey) {
        updateActiveKey(tabKey);
      }
    }
  };
  const _onContextMenu = (key, type, selectedMenu, parentKey) => {
    updateContextMenus(getMenus(key, type, selectedMenu, parentKey, groupType));
  };
  const _contextMenuClick = (e, m, callback) => {
    dealMenuClick(restProps?.dataSource, m, restProps?.update, _replaceTab, _tabClose, callback);
  };
  const sliderChange = (percent) => {
    const cavRef = cavRefArray.current.filter(cav => activeKeyRef.current === cav.key)[0]?.cav;
    if (cavRef) {
      cavRef.zoomGraph(percent * 2 / 100, true);
    }
  };
  const resize = (factor) => {
    const cavRef = getCurrentCav();
    if (cavRef) {
      cavRef.validateScale(factor);
    }
  };
  const undo = () => {
    const cavRef = getCurrentCav();
    cavRef.undo();
  };
  const redo = () => {
    const cavRef = getCurrentCav();
    cavRef.redo();
  };
  const exportWord = () => {
    if (projectInfo) {
      selectWordFile(dataSourceRef.current)
        .then(([dir, template]) => {
          //restProps.openLoading(FormatMessage.string({id: 'toolbar.exportWord'}));
          restProps.openLoading(FormatMessage.string({id: 'toolbar.exportWordStep1'}));
          imgAll(dataSourceRef.current).then((imgDir) => {
            restProps.openLoading(FormatMessage.string({id: 'toolbar.exportWordStep2'}));
            connectDB(dataSourceRef.current, {
              sinerFile: projectInfo,
              docxTpl: template,
              imgDir: imgDir,
              imgExt: '.png',
              outFile: dir,
            }, 'GenDocx', (result) => {
              if (result.status === 'FAILED') {
                const termReady = (term) => {
                  term.write(typeof result.body === 'object' ? JSON.stringify(result.body, null, 2)
                    : result.body);
                };
                restProps.closeLoading();
                Modal.error({
                  bodyStyle: {width: '80%'},
                  contentStyle: {width: '100%', height: '100%'},
                  title: FormatMessage.string({id: 'optFail'}),
                  message: <Terminal termReady={termReady}/>,
                });
              } else {
                restProps.closeLoading();
                Modal.success({
                  title: FormatMessage.string({
                    id: 'toolbar.exportSuccess',
                  }),
                  message: FormatMessage.string({
                    id: 'toolbar.exportPath',
                    data: {path: dir},
                  }),
                });
              }
            });
          });
        });
    } else {
      Modal.error({
        title: FormatMessage.string({id: 'optFail'}),
        message: FormatMessage.string({id: 'toolbar.exportWordTplProject'}),
      });
    }
  };
  const exportImg = () => {
    const cavRef = getCurrentCav();
    cavRef.exportImg();
  };
  const injectDataSource = (dataSource, selectData, domains, modal) => {
    const allEntityKey = selectData.map(d => d.defKey);
    const currentDomains = dataSource.domains || [];
    restProps?.update({
      ...dataSource,
      domains: currentDomains.concat(domains.filter(((d) => {
        return currentDomains.findIndex(cd => cd.defKey === d.defKey) < 0;
      }))),
      entities: (dataSource.entities || [])
          .filter(e => !allEntityKey.includes(e.defKey))
          .concat(selectData.map(d => _.omit(d, ['group']))),
      viewGroups: (dataSource.viewGroups || []).map((g) => {
        const currentGroupData = selectData.filter(d => d.group === g.defKey)
            .map(d => d.defKey);
        return {
          ...g,
          refEntities: [...new Set((g.refEntities || []).concat(currentGroupData))],
        };
      }),
    });
    Message.success({title: FormatMessage.string({id: 'optSuccess'})});
    modal && modal.close();
  };
  const importFromPDMan = () => {
    Upload('application/json', (data, file) => {
      try {
        const newData = pdman2sino(JSON.parse(data), file.name);
        let modal;
        const onCancel = () => {
          modal.close();
        };
        const onOk = () => {
          const allEntities = importPdRef.current.getData()
              .reduce((a, b) => a.concat((b.fields || [])
                  .map(f => ({...f, group: b.defKey}))), []);
          console.log(allEntities);
          // 合并分组 关系图 数据域
          // 1.判断关系图是否有重复
          let tempNewData = {...newData};
          const tempDiagrams = (dataSourceRef.current?.diagrams || []);
          const tempDiagramKeys = tempDiagrams.map(d => d.defKey);
          const calcDefKey = (defKey) => {
            if (tempDiagramKeys.findIndex(d => d.defKey === defKey) > -1) {
              return calcDefKey(`${defKey}1`);
            }
            return defKey;
          };
          const needReplace = [];
          const newViewDiagrams = (tempNewData.diagrams || []).map((d) => {
            const newKey = calcDefKey(d.defKey);
            tempDiagramKeys.push(newKey);
            if (newKey !== d.defKey) {
              needReplace.push({old: d.defKey, new: newKey});
            }
            return {
              ...d,
              defKey: calcDefKey(d.defKey),
            };
          });
          const newViewGroups = (tempNewData.viewGroups || []).map((g) => {
            return {
              ...g,
              refEntities: [],
              refDiagrams: (g.refDiagrams || []).map((d) => {
                const r = needReplace.filter(n => n.old === d)[0];
                if (r) {
                  return r.new;
                }
                return d;
              }),
            };
          });
          // 2.复制或增量更新分组（包含关系图）
          const injectViewsGroups = [];
          const preViewGroups = (dataSourceRef.current.viewGroups || []).map((g) => {
            const index = newViewGroups.findIndex(ng => ng.defKey === g.defKey);
            if (index > -1) {
              injectViewsGroups.push(g.defKey);
              return {
                ...g,
                refDiagrams: (g.refDiagrams || []).concat(newViewGroups[index]?.refDiagrams || []),
              };
            }
            return g;
          });
          const finalViewGroups = preViewGroups.concat(newViewGroups
              .filter(g => !injectViewsGroups.includes(g.defKey)));
          const finalDiagrams = tempDiagrams.concat(newViewDiagrams);
          const newDataSource = {
            ...dataSourceRef.current,
            viewGroups: finalViewGroups,
            diagrams: finalDiagrams,
          };
          injectDataSource(newDataSource, allEntities, newData.domains || [], modal);
        };
        modal = openModal(<ImportPd
          defaultSelected={newData.diagrams.reduce((a, b) => a
              .concat((b.canvasData?.cells || []).map(c => c.originKey)
                  .filter(c => !!c)), [])}
          customerData={newData.viewGroups.map((g) => {
            return {
              ...g,
              fields: (newData.entities || [])
                  .filter(e => (g.refEntities || [])
                      .includes(e.defKey)),
            };
          })}
          ref={importPdRef}
          dataSource={dataSourceRef.current}
        />, {
          bodyStyle: {width: '80%'},
          buttons: [
            <Button type='primary' key='ok' onClick={onOk}><FormatMessage id='button.ok'/></Button>,
            <Button key='cancel' onClick={onCancel}><FormatMessage id='button.cancel'/></Button>],
          title: FormatMessage.string({id: 'toolbar.importPDMan'}),
        });
      } catch (err) {
        Modal.error({
          title: FormatMessage.string({id: 'optFail'}),
          message: err.message,
        });
      }
    }, (file) => {
      const result = file.name.endsWith('.pdman.json');
      if (!result) {
        Modal.error({
          title: FormatMessage.string({id: 'optFail'}),
          message: FormatMessage.string({id: 'invalidPDManFile'}),
        });
      }
      return result;
    });
  };
  const importFromPb = () => {
    Upload('', (data) => {
      restProps.openLoading();
      connectDB(dataSourceRef.current, {
        pdmFile: data.path,
      }, 'ParsePDMFile', (result) => {
        if (result.status === 'FAILED') {
          const termReady = (term) => {
            term.write(typeof result.body === 'object' ? JSON.stringify(result.body, null, 2)
                : result.body);
          };
          Modal.error({
            bodyStyle: {width: '80%'},
            contentStyle: {width: '100%', height: '100%'},
            title: FormatMessage.string({id: 'optFail'}),
            message: <Terminal termReady={termReady}/>,
          });
        } else {
          restProps.closeLoading();
          let modal;
          const onCancel = () => {
            modal.close();
          };
          const onOk = () => {
            const allEntities = importPdRef.current.getData()
                .reduce((a, b) => a.concat((b.fields || [])
                    .map(f => ({...f, group: b.defKey}))), []);
            injectDataSource(dataSourceRef.current, allEntities, result.body?.domains, modal);
          };
          modal = openModal(<ImportPd
            data={result.body?.tables || []}
            ref={importPdRef}
            dataSource={dataSourceRef.current}
          />, {
            bodyStyle: {width: '80%'},
            buttons: [
              <Button type='primary' key='ok' onClick={onOk}><FormatMessage id='button.ok'/></Button>,
              <Button key='cancel' onClick={onCancel}><FormatMessage id='button.cancel'/></Button>],
            title: FormatMessage.string({id: 'toolbar.importPowerDesigner'}),
          });
        }
      });
      console.log(data);
    }, (file) => {
      const result = file.name.endsWith('.pdm');
      if (!result) {
        Modal.error({
          title: FormatMessage.string({id: 'optFail'}),
          message: FormatMessage.string({id: 'invalidPdmFile'}),
        });
      }
      return result;
    }, false);
  };
  const importFromDb = () => {
    // 判断是否已经存在数据库连接
    const dbConn = dataSourceRef.current?.dbConn || [];
    if (dbConn.length === 0) {
      Modal.error({
        title: FormatMessage.string({id: 'optFail'}),
        message: FormatMessage.string({id: 'dbReverseParse.emptyDbConn'}),
      });
    } else {
      let modal;
      const onClose = () => {
        modal && modal.close();
      };
      const onOk = (data) => {
        injectDataSource(dataSourceRef.current, data, [], modal);
      };
      modal = openModal(<DbReverseParse
        onOk={onOk}
        onClose={onClose}
        dataSource={dataSourceRef.current}
      />, {
        title: FormatMessage.string({id: 'toolbar.importDb'}),
        bodyStyle: { width: '80%' },
      });
    }
  };
  const exportSql = () => {
    let modal;
    const onClose = () => {
      modal && modal.close();
    };
    modal = openModal(<ExportSql dataSource={dataSourceRef.current}/>, {
      title: FormatMessage.string({id: 'toolbar.exportSql'}),
      bodyStyle: { width: '80%' },
      buttons: [
        <Button key='onClose' onClick={onClose}>
          <FormatMessage id='button.close'/>
        </Button>,
      ],
    });
  };
  const createEmptyTable = (e, key) => {
    const cavRef = getCurrentCav();
    cavRef?.startDrag(e, key);
    return cavRef;
  };
  const createNode = (e, type) => {
    const cavRef = getCurrentCav();
    cavRef?.startRemarkDrag(e, type);
  };
  const createGroupNode = (e) => {
    const cavRef = getCurrentCav();
    cavRef?.startGroupNodeDrag(e);
  };
  const domainMenu = useMemo(() => [
    {
      defKey: 'dataTypeMapping',
      type: 'dataTypeMapping',
      icon: 'fa-cube',
      defName: FormatMessage.string({id: 'project.dataTypeMapping'}),
      children: (restProps.dataSource?.dataTypeMapping?.mappings || []).map(d => ({...d, type: 'mapping'})),
    },
    {
      defKey: 'domains',
      type: 'domains',
      icon: 'fa-key',
      defName: FormatMessage.string({id: 'project.domains'}),
      children: (restProps.dataSource?.domains || []).map(d => ({...d, type: 'domain'})),
    },
    {
      defKey: 'dataTypeSupports',
      type: 'dataTypeSupport',
      icon: 'fa-database',
      defName: FormatMessage.string({id: 'project.dataTypeSupport'}),
      children: (restProps.dataSource?.profile?.dataTypeSupports || []).map(d => ({defKey: d, type: 'dataType'})),
    },
  ], [restProps.dataSource, config]);
  const simpleMenu = useMemo(() => [
    {
      defKey: 'entities',
      type: 'entities',
      icon: 'fa-table',
      defName: FormatMessage.string({id: 'project.entities'}),
      children: (restProps.dataSource?.entities || []).map(e => ({...e, type: 'entity'})),
    },
    {
      defKey: 'views',
      type: 'views',
      icon: 'icon-shitu',
      defName: FormatMessage.string({id: 'project.views'}),
      children: (restProps.dataSource?.views || []).map(v => ({...v, type: 'view'})),
    },
    {
      defKey: 'diagrams',
      type: 'diagrams',
      icon: 'icon-guanxitu',
      defName: FormatMessage.string({id: 'project.diagram'}),
      children: (restProps.dataSource?.diagrams || []).map(d => ({...d, type: 'diagram'})),
    },
    {
      defKey: 'dicts',
      type: 'dicts',
      icon: 'icon-shujuzidian',
      defName: FormatMessage.string({id: 'project.dicts'}),
      children: (restProps.dataSource?.dicts || []).map(d => ({...d, type: 'dict'})),
    },
  ], [restProps.dataSource, config]);
  const groupMenu = useMemo(() => restProps.dataSource?.viewGroups?.map(v => ({
    ...v,
    type: 'groups',
    icon: 'fa-th-large',
    children: simpleMenu.map(c => ({
      ...c,
      defKey: `${v.defKey}${separator}${c.defKey}`,
      type: c.defKey,
      children: (v[`ref${c.defKey.slice(0, 1).toUpperCase() + c.defKey.slice(1)}`] || [])
          .map((key) => {
            return c.children.filter(e => e.defKey === key)[0];
          }).filter(e => !!e),
    })),
  })), [restProps.dataSource, config]);
  const menus = {
    modalAll: simpleMenu,
    modalGroup: groupMenu,
    domains: domainMenu,
  };
  const tabDataChange = (data, t, injectTab) => {
    if (injectTab && (injectTempTabs.current.findIndex(it => it.tabKey === injectTab.tabKey) < 0)) {
      injectTempTabs.current.push(injectTab);
    }
    setDataByTabId(t.tabKey, data);
  };
  const hasRender = (key, instance) => {
    tabInstanceRef.current[key] = instance;
  };
  const hasDestroy = (key) => {
    delete tabInstanceRef.current[key];
  };
  const getDataSource = () => {
    return dataSourceRef.current;
  };
  const otherTabSave = (tab, callback) => {
    saveProject(false, tab, callback);
  };
  const selectionChanged = (cell) => {
    headerToolRef.current.setIsCellSelected(cell.length > 0);
  };
  const jumpEntity = (tabKey) => {
    updateActiveKey(tabKey);
  };
  const getTabComponent = (t) => {
    const type = t.type;
    const key = t.menuKey;
    let group = [];
    if (type === 'entity' || type === 'view'  || type === 'diagram' || type === 'dict') {
      // 需要计算分组信息
      const tempType = type === 'entity' ? 'entities' : `${type}s`;
      const groupRefKey = [`ref${firstUp(tempType)}`];
      group = restProps?.dataSource?.viewGroups?.filter(v => v[groupRefKey]?.includes(key)) || [];
    }
    if (type === 'entity') {
      return (
        <Entity
          getDataSource={getDataSource}
          hasRender={instance => hasRender(t.tabKey, instance)}
          hasDestory={() => hasDestroy(t.tabKey)}
          param={t.param}
          tabKey={t.tabKey}
          common={common}
          updateDataSource={restProps?.update}
          dataSource={restProps?.dataSource}
          openDict={_onMenuClick}
          entity={key}
          group={group}
          tabDataChange={data => tabDataChange(data, t)}
          versionsData={restProps.versionsData[0]}
          />);
    } else if (type === 'view') {
      return <View
        getDataSource={getDataSource}
        updateDataSource={restProps?.update}
        hasRender={instance => hasRender(t.tabKey, instance)}
        hasDestory={() => hasDestroy(t.tabKey)}
        param={t.param}
        tabKey={t.tabKey}
        common={common}
        dataSource={restProps?.dataSource}
        openDict={_onMenuClick}
        entity={key}
        group={group}
        tabDataChange={data => tabDataChange(data, t)}
        versionsData={restProps.versionsData[0]}
      />;
    } else if (type === 'diagram') {
      return <Relation
        jumpEntity={jumpEntity}
        selectionChanged={selectionChanged}
        openDict={_onMenuClick}
        getDataSource={getDataSource}
        common={common}
        save={otherTabSave}
        scaleChange={scaleChange}
        activeKey={activeKey}
        validateTableStatus={validateTableStatus}
        tabKey={t.tabKey}
        diagramKey={key}
        group={group}
        openEntity={_onMenuClick}
        updateDataSource={restProps?.update}
        dataSource={restProps?.dataSource}
        renderReady={cav => renderReady(cav, t.tabKey)}
        tabDataChange={(data, tab) => tabDataChange(data, tab || t, tab)}
        versionsData={restProps.versionsData[0]}
      />;
    } else if (type === 'dict') {
      return <Dict
        param={t.param}
        hasRender={instance => hasRender(t.tabKey, instance)}
        hasDestory={() => hasDestroy(t.tabKey)}
        tabKey={t.tabKey}
        dictKey={key}
        dataSource={restProps?.dataSource}
        tabDataChange={data => tabDataChange(data, t)}
      />;
    }
    return '';
  };
  const tempData = {};
  const _openModal = (name) => {
    let modal = null;
    let Com = '';
    let title = '';
    const onOk = () => {
      if (Object.keys(tempData).length !== 0) {
        let tempDataSource = {...(restProps?.dataSource || {})};
        if (name === 'dbreverse') {
          const { value = [], realData : { entities = [], viewGroups = [] } = {} }
              = tempData?.dbreverse || {};
          // 此处有多处需要更新
          // 先处理实体和分组信息
          const entitiesKey = (restProps?.dataSource?.entities || [])
              .concat(restProps?.dataSource?.views || [])
              .map(e => e.defKey);
          const newEntities = entities
              .filter(e => value.includes(e.defKey))
              .map((e) => {
                const defKey = validateKey(e.defKey, entitiesKey);
                entitiesKey.push(defKey);
                return {
                  ...e,
                  defKey,
                };
              });
          tempDataSource = {
            ...tempDataSource,
            entities: (tempDataSource?.entities || []).concat(newEntities),
            viewGroups: (tempDataSource?.viewGroups || []).concat({
              ...(viewGroups[0] || {}),
              refEntities: newEntities.map(e => e.defKey),
            }),
          };
          const valueNames = ['domains', 'dataTypeMapping.mappings'];
          valueNames.forEach((n) => {
            const oldKeys = _.get(tempDataSource, n, []).map(d => d.defKey);
            const newData = _.get(tempData, `dbreverse.realData.${n}`, [])
                .filter(d => !oldKeys.includes(d.defKey))
                .map(d => _.omit(d, '__key'));
            tempDataSource = _.set(tempDataSource, n, _.get(tempDataSource, n, []).concat(newData));
          });
          restProps?.update(tempDataSource);
        } else {
          if (name === 'dbConnect') {
            if (new Set((tempData.dbConn || [])
                .filter(d => !!d.defKey)
                .map(d => d.defKey)).size !== (tempData.dbConn || []).length) {
              Modal.error({
                title: FormatMessage.string({id: 'optFail'}),
                message: FormatMessage.string({id: 'dbConnect.validateDb'}),
              });
              return;
            }
          }
          Object.keys(tempData).filter(f => f !== 'language').forEach((f) => {
            tempDataSource = _.set(tempDataSource, f,
                Array.isArray(tempData[f]) ? tempData[f].map(d => _.omit(d, '__key')) : tempData[f]);
          });
        }
        if ('language' in tempData && tempData.language !== lang) {
          restProps?.changeLang(tempData.language, FormatMessage.string({id: 'changeLang'}));
          // 需要更新一些默认的数据
          const needUpdates = [
            {
              key: 'profile.default.entityInitFields',
              langName: 'entityInitFields',
            },
          ];
          needUpdates.forEach(({key, langName}) => {
            tempDataSource = _.set(tempDataSource, key,
                _.get(tempDataSource, key).map((f) => {
                  return {
                    ...f,
                    defName: FormatMessage.string({id: `projectTemplate.${langName}.${f.defKey}`})
                        || f.defName,
                  };
                }));
          });
        }
        restProps?.save(tempDataSource); // 配置项内容在关闭弹窗后自动保存
      }
      modal && modal.close();
    };
    const onCancel = () => {
      modal && modal.close();
    };
    if (name === 'config'){
      Com = Config;
      title = FormatMessage.string({id: 'config.title'});
    } else if (name === 'dbreverse') {
      Com = DbReverseParse;
      title = FormatMessage.string({id: 'dbReverseParse.title'});
    } else {
      Com = DbConnect;
      title = FormatMessage.string({id: 'dbConnect.title'});
    }
    const dataChange = (value, fieldName) => {
      if (name === 'dbreverse') {
        tempData.dbreverse = {
          value,
          realData: fieldName,
        };
      } else {
        tempData[fieldName] = value;
      }
    };
    modal = openModal(<Com
      lang={config.lang}
      dataChange={dataChange}
      prefix={prefix}
      dataSource={restProps?.dataSource}
    />, {
      bodyStyle: { width: '80%' },
      title,
      buttons: [<Button type='primary' key='ok' onClick={() => onOk(modal)}>
        <FormatMessage id='button.ok'/>
      </Button>,
        <Button key='cancel' onClick={() => onCancel(modal)}>
          <FormatMessage id='button.cancel'/>
        </Button>],
    });
  };
  const domainGetName = (m) => {
    const dataTypeSupports = _.get(restProps, 'dataSource.profile.dataTypeSupports', []);
    const defaultDb = _.get(restProps, 'dataSource.profile.default.db', dataTypeSupports[0]);
    if (defaultDb === m.defKey) {
      return `${m.defName || m.defKey}(${FormatMessage.string({id: 'project.default'})})`;
    }
    return m.defName || m.defKey;
  };
  const getName = (m) => {
    if (m.type === 'groups'){
      return `${m.defKey}-${m.defName || m.defKey}`;
    } else if (m.type === 'entity' || m.type === 'view' || m.type === 'diagram' || m.type === 'dict'){
      const tempDisplayMode = m.nameTemplate || '{defKey}[{defName}]';
      return tempDisplayMode.replace(/\{(\w+)\}/g, (match, word) => {
        return m[word] || m.defKey || '';
      });
    }
    return m.defName;
  };
  const _colorChange = (key, value) => {
    // 颜色发生变化
    const cavRef = getCurrentCav();
    cavRef.updateColor(key, value);
  };
  const iconClick = (e, key) => {
    console.log(key);
    switch (key) {
      case 'save': saveProject();break;
      case 'saveAs': saveProject(true);break;
      case 'pdman': importFromPDMan();break;
      case 'powerdesigner': importFromPb();break;
      case 'db': importFromDb();break;
      case 'undo': undo(); break;
      case 'redo': redo(); break;
      case 'img': exportImg(); break;
      case 'word': exportWord(); break;
      case 'sql': exportSql(); break;
      case 'empty': createEmptyTable(e);break;
      case 'rect': createNode(e, 'rect');break;
      case 'round': createNode(e, 'round');break;
      case 'group': createGroupNode(e);break;
      default: break;
    }
  };
  // 在过滤为空的数据
  const tempMenu = menus[groupType];
  const currentPrefix = getPrefix(prefix);
  const getTabTitle = (t) => {
    const currentType = allType.filter(a => a.type === t.type)[0];
    const currentData = restProps?.dataSource[currentType.name]?.
    filter(d => d[currentType.defKey] === t.menuKey)[0];
    const tempDisplayMode = currentData?.nameTemplate || '{defKey}[{defName}]';
    return {
      title: currentData?.defName || t.menuKey,
      tooltip: tempDisplayMode.replace(/\{(\w+)\}/g, (match, word) => {
        return currentData?.[word] || currentData?.defKey || '';
      }),
    };
  };
  const standardFieldMemo = useMemo(() => {
    return <StandardField
      ref={standardFieldRef}
      activeKey={activeKey}
      dataSource={restProps.dataSource}
      updateDataSource={restProps.update}
    />;
  }, [restProps.dataSource?.standardFields, activeKey]);
  const dropDownMenus = useMemo(() => ([
    {key: 'closeCurrent', name: FormatMessage.string({id: 'closeCurrent'})},
    {key: 'closeOthers', name: FormatMessage.string({id: 'closeOthers'})},
    {key: 'closeAll', name: FormatMessage.string({id: 'closeAll'})},
  ]),[]);
  const dropDownMenuClick = (m, e, c) => {
    switch (m.key){
      case 'closeCurrent':
        _tabClose(c.key);
        break;
      case 'closeOthers':
        _tabCloseOther(c.key);
        break;
      case 'closeAll':
        _tabCloseAll();
        break;
      default: break;
    }
  };
  const _menuTypeChange = (key) => {
    if (key === '1') {
      currentMenu.current = menuModelRef.current;
    } else {
      currentMenu.current = menuDomainRef.current;
    }
    setMenuType(key);
    resizeContainer.current.style.minWidth = `${menuNorWidth}px`;
    resizeContainer.current.style.width = `${menuNorWidth}px`;
  };
  const _jumpPosition = (d, key) => {
    setMenuType('1');
    if ((d.groups || []).length > 0) {
      updateGroupType('modalGroup');
    } else {
      updateGroupType('modalAll');
    }
    (currentMenu.current || menuModelRef.current)?.jumpPosition(d, key);
  };
  const _jumpDetail = (d, key) => {
    if (key === 'standardFields') {
      standardFieldRef.current?.openEdit(d);
    } else {
      setMenuType('1');
      if ((d.groups || []).length > 0) {
        updateGroupType('modalGroup');
      } else {
        updateGroupType('modalAll');
      }
      (currentMenu.current || menuModelRef.current)?.jumpDetail(d, key);
    }
  };
  const onMouseDown = (e) => {
    isResize.current = {
      status: true,
      width: resizeContainer.current.getBoundingClientRect().width,
      x: e.clientX,
    };
  };
  const onMouseMove = (e) => {
    if (isResize.current.status) {
      const width = isResize.current.width + (e.clientX - isResize.current.x);
      if (width < (window.innerWidth - 10) && width > menuNorWidth) {
        resizeContainer.current.style.width = `${width}px`;
        resizeOther.current.style.width = `calc(100% - ${width}px)`;
        menuContainerModel.current.style.width = `${width - menuMinWidth}px`;
        menuContainerDataType.current.style.width = `${width - menuMinWidth}px`;
      }
    }
  };
  const onMouseUp = () => {
    isResize.current.status = false;
  };
  const fold = () => {
    setMenuType('3');
    resizeContainer.current.style.minWidth = `${menuMinWidth}px`;
    resizeContainer.current.style.width = `${menuMinWidth}px`;
  };
  useEffect(() => {
    const id = Math.uuid();
    addBodyEvent('onmousemove', id, onMouseMove);
    addBodyEvent('onmouseup', id, onMouseUp);
    addBodyEvent('onmouseleave', id,  onMouseUp);
    return () => {
      removeBodyEvent('onmousemove', id);
      removeBodyEvent('onmouseup', id);
      removeBodyEvent('onmouseleave', id);
    };
  }, []);
  const createGroupMenu = getMenu('add', '', 'groups', [], groupType, '');
  return <Loading visible={common.loading} title={common.title}>
    <div className={`${currentPrefix}-main-toolbar`}>
      <ToolBar
        resizeable
        title={<FormatMessage id='system.title'/>}
        info={projectInfo || <FormatMessage id='system.template'/>}
      />
    </div>
    <HeaderTool
      dataSource={restProps.dataSource}
      ref={headerToolRef}
      currentPrefix={currentPrefix}
      close={restProps.close}
      iconClick={iconClick}
      activeTab={activeTab}
      resize={resize}
      sliderChange={sliderChange}
      colorChange={_colorChange}
      openModal={_openModal}
      jumpPosition={_jumpPosition}
      jumpDetail={_jumpDetail}
    />
    <div className={`${currentPrefix}-home`}>
      <div className={`${currentPrefix}-home-resize-container`} ref={resizeContainer}>
        {
          menuType !== '3' && <span
            onClick={fold}
            className={`${currentPrefix}-home-fold`}
          >
            <Icon type='fa-angle-double-left '/>
          </span>
        }
        <Tab activeKey={menuType} onChange={_menuTypeChange}>
          <TabItem key='1' title={FormatMessage.string({id: 'modelTab'})} icon='model.svg'>
            <div
              ref={menuContainerModel}
              className={`${currentPrefix}-home-menu-container`}
            >
              <div className={`${currentPrefix}-home-menu-header`}>
                <span className={`${currentPrefix}-home-menu-header-title`}>
                  <FormatMessage id='moduleList'/>
                </span>
                <span onClick={_groupMenuChange} className={`${currentPrefix}-home-menu-header-opt`}>
                  <span>
                    <Tooltip
                      title={<div
                        className={`${currentPrefix}-home-menu-header-opt-title`}
                        >
                        <FormatMessage id='hiddenGroupInfo'/>
                      </div>}
                      force
                      placement='top'
                    >
                      <Icon type='icon-xinxi'/>
                    </Tooltip>
                  </span>
                  <span>
                    <FormatMessage id='hiddenGroup'/>
                  </span>
                  <span>
                    <Checkbox onChange={_groupMenuChange} checked={groupType === 'modalAll'}/>
                  </span>
                </span>
              </div>
              <Menu
                ref={menuModelRef}
                prefix={prefix}
                {...restProps}
                menus={tempMenu}
                doubleMenuClick={_onMenuClick}
                onContextMenu={_onContextMenu}
                contextMenus={contextMenus}
                contextMenuClick={_contextMenuClick}
                draggable={draggable}
                getName={getName}
                dragTable={createEmptyTable}
                groupType={groupType}
                emptyData={<div
                  onClick={() => _contextMenuClick(null, createGroupMenu)}
                  className={`${currentPrefix}-home-menu-empty`}
                  >
                  <FormatMessage id='emptyGroup'/>
                </div>}
              />
            </div>
          </TabItem>
          <TabItem key='2' title={FormatMessage.string({id: 'domainTab'})} icon='data_type.svg'>
            <div
              ref={menuContainerDataType}
              className={`${currentPrefix}-home-menu-container`}
            >
              <div className={`${currentPrefix}-home-menu-header`}>
                <span className={`${currentPrefix}-home-menu-header-title`}>
                  <FormatMessage id='project.domains'/>
                </span>
              </div>
              <Menu
                ref={menuDomainRef}
                prefix={prefix}
                {...restProps}
                onContextMenu={_onContextMenu}
                contextMenus={contextMenus}
                contextMenuClick={_contextMenuClick}
                menus={menus.domains}
                getName={domainGetName}
                draggable={draggable}
                dragTable={createEmptyTable}
                doubleMenuClick={(key, type, parentKey) => _contextMenuClick(null,
                      getMenu('edit', key, type, [], groupType, parentKey))}
              />
            </div>
          </TabItem>
        </Tab>
        {
          menuType !== '3' && <div
            onMouseDown={onMouseDown}
            className={`${currentPrefix}-home-resize-container-line`}
          >
            {}
          </div>
        }
      </div>
      <div className={`${currentPrefix}-home-resize-other`} ref={resizeOther}>
        {
          tabs.length > 0 ?  <Tab
            menuClick={dropDownMenuClick}
            dropDownMenus={dropDownMenus}
            position='top'
            activeKey={activeKey}
            closeTab={_tabClose}
            onChange={_tabChange}
            excess={standardFieldMemo}
          >
            {tabs.map((t) => {
              const title = getTabTitle(t);
              return (
                <TabItem
                  style={t.style}
                  key={t.tabKey}
                  title={title.title}
                  tooltip={title.tooltip}
                  icon={t.icon}
                  >
                  {getTabComponent(t)}
                </TabItem>
              );
            })}
          </Tab> : <MessageHelp prefix={currentPrefix}/>
        }
      </div>
    </div>
  </Loading>;
});

export default Index;
