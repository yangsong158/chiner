/*import React, { useEffect, useState } from 'react';
import {Button, Modal, openModal} from 'components';
import FormatMessage from '../formatmessage';
import Canvas from './_util';
import './_util/style/index.less'; // 引入样式
import RelationEditor from './RelationEditor';
//import MinMap from './plug/minmap';
import {getPrefix} from '../../lib/prefixUtil';
import NewEntity from '../../app/container/entity/NewEntity';
import { getEmptyEntity } from '../../lib/datasource_util';

const ErCanvas = React.memo(({prefix, dataSource, data = {}, openEntity,
                               renderReady, width, height, dataChange, updateDataSource}) => {
  const currentPrefix = getPrefix(prefix);
  const [id] = useState(`${currentPrefix}-${Math.uuid()}`);
  const [cav, initCav] = useState(null);
  useEffect(() => {
    const cavInstance = new Canvas({}, {
      id,
      dataSource: {},
      w: width,
      h: height,
      relationEditor: (item, context) => {
        const relationArray = (item.relation || '').split(':');
        const relationChange = (value, type) => {
          const index = type === 'form' ? 0 : 1;
          relationArray[index] = value;
        };
        let modal = null;
        const onOK = () => {
          context.setRelation(item.id, relationArray.join(':'));
          modal && modal.close();
        };
        const onCancel = () => {
          modal && modal.close();
        };
        modal = openModal(
          <RelationEditor
            edge={item}
            relationChange={relationChange}
          />,
          {
            title: <FormatMessage id='canvas.edge.setRelation'/>,
            buttons: [
              <Button key='onOK' onClick={onOK}>
                <FormatMessage id='button.ok'/>
              </Button>,
              <Button key='onCancel' onClick={onCancel}>
                <FormatMessage id='button.cancel'/>
              </Button>,
            ],
          });
      },
      on: (event, type, item) => {
        if (event === 'dblclick' && type === 'node') {
          openEntity(item.title, 'entity', null, 'entity.svg');
        }
      },
      dataChange,
    });
    //cavInstance.registerPlug('MinMap', MinMap);
    renderReady && renderReady(cavInstance);
    initCav(cavInstance);
  }, []);
  useEffect(() => {
    cav && cav.resize({h: height, w: width}, data, dataSource);
  }, [width, height, cav, data, dataSource]);
  const onDrop = (e) => {
    e.preventDefault();
    const newNode = {
      title: e.dataTransfer.getData('key'),
      x: (e.clientX - (document.documentElement.clientWidth - width) - 50) * 2,
      y: (e.clientY - (document.documentElement.clientHeight - height) - 50) * 2,
    };
    if (!e.dataTransfer.getData('key')) {
      const empty = getEmptyEntity();
      let modal = null;
      let extendEntity = '';
      // 拖入此处的是空表
      const onOK = () => {
        if (!empty.defKey) {
          Modal.error({
            title: FormatMessage.string({id: 'optFail'}),
            message: FormatMessage.string({id: 'formValidateMessage'}),
          });
        } else {
          const newDataSource = {
            ...dataSource,
            entities: dataSource.entities.concat(empty),
          };
          updateDataSource && updateDataSource(newDataSource);
          cav.updateDataSource(newDataSource);
          const sourceId = Math.uuid();
          cav.addNode({
            ...newNode,
            id: sourceId,
            title: empty.defKey,
          });
          if (extendEntity) {
            const { nodes } = cav.getData();
            let edges = nodes
                .filter(n => (n.title === extendEntity) && (n.id !== sourceId))
                .reduce((pre, next) => {
                  return pre.concat((next.origin?.fields || [])
                      .map((f, i) => {
                        const targetAnchor = (empty.fields || [])
                            .findIndex(field => field.defKey === f.defKey);
                        if (f.primaryKey && targetAnchor >= 0) {
                          return {
                            id: Math.uuid(),
                            source: next.id,
                            target: sourceId,
                            sourceAnchor: i + 1,
                            targetAnchor,
                            pointers: [{}, {}],
                          };
                        }
                        return null;
                  }).filter(edge => !!edge));
                }, []);
            if (edges.length > 0) {
              cav.addEdge(edges);
            }
          }
          modal.close();
        }
      };
      const onCancel = () => {
        modal.close();
      };
      const entityChange = (value, name, extend) => {
        empty[name] = value;
        extendEntity = extend;
      };
      modal = openModal(<NewEntity
        dataChange={entityChange}
        dataSource={dataSource}
        data={{group: []}}
      />, {
        title: FormatMessage.string({id: 'menus.add.newEntity'}),
        buttons: [
          <Button key='onOK' onClick={onOK}>
            <FormatMessage id='button.ok'/>
          </Button>,
          <Button key='onCancel' onClick={onCancel}>
            <FormatMessage id='button.cancel'/>
          </Button>,
        ],
      });
    } else {
      cav.addNode(newNode);
    }
  };
  const onDragOver = (e) => {
    e.preventDefault();
  };
  return (
    <div
      className={`${currentPrefix}-relation-container`}
      style={{width: width, height: height, overflow: 'hidden'}}
      onDrop={onDrop}
      onDragOver={onDragOver}
    >
      <canvas id={id}>{}</canvas>
      <span className={`${currentPrefix}-relation-title`}>
        <FormatMessage id='canvas.title'/>
      </span>
    </div>);
});

export default ErCanvas;*/

import ReactDOM from 'react-dom';
import moment from 'moment';
import html2canvas from 'html2canvas';
import React, { useEffect, useRef, useMemo } from 'react';
import { Graph, Shape, Addon, DataUri } from '@antv/x6';
import {Button, openModal, FormatMessage, Message, Modal, openDrawer} from 'components';
import './components';
import _ from 'lodash/object';
import RelationEditor from './RelationEditor';
import {
  getEmptyEntity,
  generatorTableKey,
  getFullColumns,
  calcCellData, calcNodeData,
} from '../../lib/datasource_util';
import { separator } from '../../../profile';
import Entity from '../../app/container/entity';
import {getPrefix} from '../../lib/prefixUtil';
import { img } from '../../lib/generatefile/img';

const { Dnd } = Addon;

export default ({data, dataSource, renderReady, updateDataSource, validateTableStatus, prefix,
                  dataChange, openEntity, tabKey, activeKey, scaleChange, common, tabDataChange,
                  changes, versionsData, save, getDataSource, openDict, selectionChanged,
                  jumpEntity, diagramKey, ...restProps}) => {
  const currentPrefix = getPrefix(prefix);
  const needRender = useRef(false);
  const graphRef = useRef(null);
  const dndRef = useRef(null);
  const dataSourceRef = useRef(dataSource);
  dataSourceRef.current = dataSource;
  const dataRef = useRef(data);
  dataRef.current = data;
  const currentColor = useRef({
    selected: '#1890FF', // 选中色
    border: '#DFE3EB', // 边框色
    fillColor: '#ACDAFC', // 节点和边的背景色
    fontColor: '#000000', // 节点字体色
    circleFill: '#FFF', // 锚点填充色
  });
  const defaultGroupNodeSize = {
    width: 240,
    height: 160,
    minHeight: 160,
  };
  const defaultEditNodeSize = {
    width: 80,
    height: 60,
    minHeight: 20,
  };
  const defaultEditNodeCircleSize = {
    width: 80,
    height: 60,
    minHeight: 20,
  };
  const commonPort = {
    attrs: {
      fo: {
        width: 8,
        height: 8,
        x: -4,
        y: -4,
        magnet: 'true',
        style: {
          visibility: 'hidden',
        },
      },
    },
    zIndex: 3,
  };
  const commonPorts = {
    groups: {
      in: {
        ...commonPort,
        position: { name: 'left' },
      },
      out: {
        ...commonPort,
        position: { name: 'right' },
      },
      top: {
        ...commonPort,
        position: { name: 'top' },
      },
      bottom: {
        ...commonPort,
        position: { name: 'bottom' },
      },
    },
    items: [
      {group: 'in', id: 'in'},
      {group: 'in', id: 'in2'},
      {group: 'in', id: 'in3'},
      {group: 'out', id: 'out'},
      {group: 'out', id: 'out2'},
      {group: 'out', id: 'out3'},
      {group: 'top', id: 'top'},
      {group: 'top', id: 'top2'},
      {group: 'top', id: 'top3'},
      {group: 'bottom', id: 'bottom'},
      {group: 'bottom', id: 'bottom2'},
      {group: 'bottom', id: 'bottom3'},
    ],
  };
  const id = useMemo(() => `er-${Math.uuid()}`, []);
  const getTableGroup = () => {
    return {
      in: {
        attrs: {
          circle: {
            r: 4,
            magnet: true,
            stroke: currentColor.current.selected,
            fill: currentColor.current.circleFill,
            strokeWidth: 1,
            style: {
              visibility: 'hidden',
            },
          },
        },
        position: { name: 'absolute' },
        zIndex: 3,
      },
      out: {
        attrs: {
          circle: {
            r: 4,
            magnet: true,
            stroke: currentColor.current.selected,
            fill: currentColor.current.circleFill,
            strokeWidth: 1,
            style: {
              visibility: 'hidden',
            },
          },
        },
        position: { name: 'absolute' },
        zIndex: 3,
      },
      extend: {
        attrs: {
          circle: {
            r: 4,
            magnet: true,
            stroke: currentColor.current.selected,
            fill: currentColor.current.circleFill,
            strokeWidth: 1,
            style: {
              visibility: 'hidden',
            },
          },
        },
        position: { name: 'absolute' },
        zIndex: 3,
      },
    };
  };
  const getEntityInitFields = () => {
    return _.get(dataSourceRef.current, 'profile.default.entityInitFields', []);
  };
  const updateFields = (originKey, fields) => {
    if (!validateTableStatus(`${originKey}${separator}entity`)) {
      const getKey = (f) => {
        return `${f.defKey}${f.defName}`;
      };
      const result = {};
      const newDataSource = {
        ...dataSourceRef.current,
        entities: dataSourceRef.current.entities.map((e) => {
          if (e.defKey === originKey) {
            const success = fields
                .filter(f => (e.fields || [])
                    .findIndex(eFiled => getKey(eFiled) === getKey(f)) < 0);
            result.success = success.length;
            result.hidden = success.filter(f => f.hideInGraph).length;
            return {
              ...e,
              fields: (e.fields || []).concat(success.map(s => ({...s, isStandard: true}))),
            };
          }
          return e;
        }),
      };
      updateDataSource && updateDataSource(newDataSource);
      if (result.success === fields.length) {
        Message.success({title: FormatMessage.string({id: 'optSuccess'})});
      } else {
        Modal.info({
          title: <FormatMessage id='optEnd'/>,
          message: <div>
            {result.success > 0 && <div>
              <FormatMessage
                id='standardFields.dropFieldsSuccessResult'
                data={{success: result.success}}
              />
              (
              <FormatMessage
                id='standardFields.dropFieldsShowResult'
                data={{show: result.success - result.hidden}}
              />{result.hidden > 0 && <FormatMessage
                id='standardFields.dropFieldsHiddenResult'
                data={{hidden: result.hidden}}
            />})</div>}
            <div>
              <FormatMessage
                id='standardFields.dropFieldsFailResult'
                data={{fail: fields.length - result.success}}
              />
            </div>
          </div>,
        });
      }
    } else {
      Modal.error({
        title: <FormatMessage id='optFail'/>,
        message: <FormatMessage id='canvas.node.entityHasOpen'/>,
      });
    }
  };
  const updateColor = (key, color) => {
    //currentColor.current[key] = color.hex;
    let cells = graphRef.current.getSelectedCells();
    if (cells.length === 0) {
      cells = graphRef.current.getCells();
    }
    cells
        .forEach((c) => {
          c.setProp(key, color.hex, { ignoreHistory : true});
          if (c.shape === 'erdRelation' && key === 'fillColor') {
            const tempLine = c.attr('line');
            c.attr('line', {
              ...tempLine,
              stroke: color.hex,
              sourceMarker: {
                ...tempLine.sourceMarker,
                fillColor: color.hex,
              },
              targetMarker: {
                ...tempLine.targetMarker,
                fillColor: color.hex,
              },
            }, { ignoreHistory : true});
          }
        });
  };
  const getScaleNumber = () => {
    return graphRef.current.scale();
  };
  const validateScale = (factor) => {
    const scale = getScaleNumber().sx;
    if (factor + scale >= 2) {
      Message.warring({title: FormatMessage.string({id: 'canvas.isMax'})});
      graphRef.current.scale(2);
    } else if(factor + scale < 0.2) {
      Message.warring({title: FormatMessage.string({id: 'canvas.isMin'})});
      graphRef.current.scale(0.2);
    } else {
      graphRef.current.zoom(factor);
    }
  };
  const render = () => {
    graphRef.current.resetSelection();
    graphRef.current.fromJSON({
      cells: calcCellData(dataRef.current.cells, dataSourceRef.current, updateFields,
          getTableGroup(), commonPorts),
    });
  };
  useEffect(() => {
    const container = document.getElementById(id);
    const changePortsVisible = (visible, node, source) => {
      const currentNodeDom = node ? Array.from(container.querySelectorAll('.x6-node')).filter((n) => {
        return n.getAttribute('data-cell-id') === node.id;
      })[0] : container;
      const ports = currentNodeDom.querySelectorAll(
          '.x6-port-body',
      );
      for (let i = 0, len = ports.length; i < len; i += 1) {
        const portName = ports[i].getAttribute('port');
        if (source && source.includes('extend')) {
          if (portName.includes('extend')) {
            ports[i].style.visibility = visible ? 'visible' : 'hidden';
          } else {
            ports[i].style.visibility = 'hidden';
          }
        } else if (source && portName.includes('extend')) {
          ports[i].style.visibility = 'hidden';
        } else {
          ports[i].style.visibility = visible ? 'visible' : 'hidden';
        }
      }
      if (visible && (!node || node.shape !== 'group')) {
        node.toFront();
      }
    };
    const graph = new Graph({
      container,
      autoResize: false,
      snapline: true,
      history: {
        enabled: true,
        beforeAddCommand(event, args) {
          if (args.key === 'zIndex') {
            return false;
          }
          return !args.options.ignoreHistory;
        },
      },
      keyboard: {
        enabled: true,
      },
      scroller: {
        enabled: true,
        pannable: true,
        modifiers: ['ctrl', 'meta'],
      },
      selecting: {
        enabled: true,
        multiple: true,
        rubberband: true,
        //modifiers: 'alt|ctrl',
      },
      mousewheel: {
        enabled: true,
        modifiers: ['ctrl', 'meta'],
        guard: (e) => {
          if (e.ctrlKey || e.metaKey) {
            validateScale(e.wheelDelta > 0 ? 0.1 : -0.1);
            return false;
          }
          return false;
        },
      },
      connecting: {
        connectionPoint: 'anchor',
        snap: true,
        allowBlank: false,
        allowNode: false,
        createEdge() {
          return new Shape.Edge({
            shape: 'erdRelation',
            attrs: {
              line: {
                strokeDasharray: '5 5',
                strokeWidth: 1,
                stroke: currentColor.current.fillColor,
              },
            },
            router: {
              name: 'manhattan',
            },
          });
        },
        validateConnection({targetPort, targetView, sourcePort}) {
          if (targetView) {
            const node = targetView.cell;
            changePortsVisible(true, node, sourcePort);
            if (sourcePort && sourcePort.includes('extend')) {
              return targetPort.includes('extend');
            }
            return !targetPort.includes('extend');
          }
          return true;
        },
      },
      grid: false,
      resizing: {
        minWidth: defaultEditNodeSize.width,
        minHeight: defaultEditNodeSize.minHeight,
        enabled:  (node) => {
          return node.shape === 'edit-node' ||
              node.shape === 'edit-node-circle' ||
              node.shape === 'group';
        },
      },
      interacting: {
        nodeMovable: ({cell}) => {
          return !((cell.shape === 'edit-node' || cell.shape === 'group' || cell.shape === 'edit-node-circle')
              && cell.getProp('editable'));
        },
      },
      onPortRendered(args) {
        const selectors = args.contentSelectors;
        const c = selectors && selectors.foContent;
        if (c) {
          ReactDOM.render(
            <div className={`${currentPrefix}-port`} />,
              c,
          );
        }
      },
      embedding: {
        enabled: true,
        findParent({ node }) {
          const bbox = node.getBBox();
          return this.getNodes().filter((n) => {
            const shape = n.shape;
            if (shape === 'group') {
              const targetBBox = n.getBBox();
              return bbox.isIntersectWithRect(targetBBox);
            }
            return false;
          });
        },
      },
      highlighting: {
        embedding: {
          name: 'stroke',
          args: {
            padding: -1,
            attrs: {
              stroke: '#4e75fd',
            },
          },
        },
      },
    });
    graph.bindKey(['ctrl+z','command+z'], () => {
      graph.undo({undo: true});
    });
    graph.bindKey(['ctrl+shift+z','command+shift+z'], () => {
      graph.redo({redo: true});
    });
    graphRef.current = graph;
    dndRef.current = new Dnd({
      target: graph,
      scaled: false,
      animation: true,
    });
    // 创建右键菜单
    const createContentMenu = (event, menus, cb) => {
      let menuContainer = document.querySelector('.ercanvas-menus');
      if (menuContainer) {
        menuContainer.parentElement.removeChild(menuContainer);
      }
      menuContainer = document.createElement('div');
      menuContainer.setAttribute('class', 'ercanvas-menus');
      document.body.appendChild(menuContainer);
      menuContainer.onblur = () => {
        menuContainer.onblur = null;
        menuContainer.onclick = null;
        menuContainer.style.display = 'none';
      };
      menuContainer.onclick = () => {
        menuContainer.blur();
      };
      menuContainer.setAttribute('tabindex', '0');
      menuContainer.style.left = `${event.clientX + 1}px`;
      menuContainer.style.top = `${event.clientY + 1}px`;
      const ul = document.createElement('ul');
      menus.forEach((m, i) => {
        const li = document.createElement('li');
        li.onclick = () => {
          cb && cb(i);
        };
        li.innerText = m.name;
        ul.appendChild(li);
      });
      menuContainer.appendChild(ul);
      setTimeout(() => {
        menuContainer.focus();
      });
    };
    graph.on('cell:changed', () => {
      dataChange && dataChange(graph.toJSON({diff: true}));
    });
    graph.on('cell:removed', () => {
      dataChange && dataChange(graph.toJSON({diff: true}));
    });
    graph.on('cell:added', () => {
      dataChange && dataChange(graph.toJSON({diff: true}));
    });
    graph.on('selection:changed', ({ added,removed }) => {
      added.forEach((cell) => {
        if (cell.isNode()) {
          cell.attr('body', {
            stroke: 'red',
            strokeWidth: 1,
          }, { ignoreHistory : true});
          cell.shape !== 'table' && changePortsVisible(false, cell);
        } else {
          cell.attr('line/stroke', currentColor.current.selected, { ignoreHistory : true});
          cell.addTools({
            name: 'vertices',
            args: {
              attrs: {
                stroke: currentColor.current.selected,
                fill: currentColor.current.circleFill,
                strokeWidth: 1,
              },
            },
          }, null, { ignoreHistory : true});
        }
      });
      removed.forEach((cell) => {
        if (cell.isNode()) {
          cell.attr('body', {
            stroke: cell.shape === 'group' ? '#000000' : currentColor.current.border,
          }, { ignoreHistory : true});
          if (cell.shape === 'edit-node' || cell.shape === 'edit-node-circle' || cell.shape === 'group') {
            if (cell.shape === 'group') {
              // 暂时隐藏所有的子节点
              const cells = cell.getChildren();
              if (cells) {
                cells.forEach((c) => {
                  c.show();
                });
              }
            }
            cell.setProp('editable', false, { ignoreHistory : true});
          }
        } else {
          cell.attr('line/stroke', cell.getProp('fillColor')
              || currentColor.current.fillColor, { ignoreHistory : true});
          cell.removeTools({ ignoreHistory : true});
        }
      });
      selectionChanged && selectionChanged(added);
    });
    graph.on('edge:removed', ({edge}) => {
      const sourceCell = graph.getCell(edge.getSourceCellId());
      const targetCell = graph.getCell(edge.getTargetCellId());
      targetCell && targetCell.setProp('targetPort', Math.uuid(), { ignoreHistory : true});
      sourceCell && sourceCell.setProp('sourcePort', Math.uuid(), { ignoreHistory : true});
    });
    graph.on('edge:connected', (args) => {
      const edge = args.edge;
      const node = graph.getCellById(edge.target.cell);
      const sourceNode = graph.getCellById(edge.source.cell);
      if (edge.target.port.includes('extend')) {
        graph.removeCell(edge, { ignoreHistory: true });
        graph.history.undoStack.pop();
        const primaryKeys = (node.data?.fields || []).filter(f => f.primaryKey);
        if (primaryKeys.length === 0) {
          Message.error({title: FormatMessage.string({id: 'canvas.node.extendError'})});
        } else {
          // 增加主键之间的连线
          const allEdges = graph.getEdges();
          const tempEdges = primaryKeys.map((p) => {
            return {
              id: Math.uuid(),
              shape: 'erdRelation',
              relation: '1:n',
              source: {
                cell: edge.target.cell,
                port: `${p.defKey}${separator}out`,
              },
              target: {
                cell: edge.source.cell,
                port: `${p.defKey}${separator}in`,
              },
            };
          }).filter((e) => {
            // 过滤重复的连接线
            return allEdges.findIndex((old) => {
              if((old.source.cell === e.source.cell)
                  && (old.target.cell === e.target.cell)) {
                return  (old.source.port === e.source.port)
                    && (old.target.port === e.target.port);
              } else if((old.source.cell === e.target.cell)
                  && (old.target.cell === e.source.cell)) {
                return  (old.source.port === e.target.port)
                    && (old.target.port === e.source.port);
              }
              return false;
            }) < 0;
          });
          graph.addEdges(tempEdges, { auto: true});
          const sourceKey = sourceNode.getProp('originKey');
          const newDataSource = {
            ...dataSourceRef.current,
            entities: (dataSourceRef.current.entities || []).map(((entity) => {
              if (entity.defKey === sourceKey) {
                const tempFields = entity.fields || [];
                const tempPrimaryKeys = primaryKeys
                    .filter(p => tempFields
                        .findIndex(f => f.defKey === p.defKey) < 0);
                return {
                  ...entity,
                  fields: tempPrimaryKeys.concat(tempFields),
                };
              }
              return entity;
            })),
          };
          updateDataSource && updateDataSource(newDataSource);
        }
      } else {
        edge.setProp('relation', '1:n', { ignoreHistory: true });
        edge.setProp('fillColor', currentColor.current.fillColor, { ignoreHistory: true });
        edge.attr({
          line: {
            strokeDasharray: '',
            sourceMarker: {
              name: 'relation',
              relation: '1',
            },
            targetMarker: {
              name: 'relation',
              relation: 'n',
            },
          },
        }, { ignoreHistory: true });
      }
      const calcPorts = (port, calcNode) => {
        const incomingEdges = graph.getIncomingEdges(calcNode) || [];
        const outgoingEdges = graph.getOutgoingEdges(calcNode) || [];
        const usedPorts = incomingEdges.map((e) => {
          return e.getTargetPortId();
        }).concat(outgoingEdges.map((e) => {
          return e.getSourcePortId();
        }));
        const currentGroup = (/(\d+)/g).test(port) ? port.match(/[A-Za-z]+/g)[0] : port;
        const currentGroupPorts = calcNode.getPorts()
            .filter(p => p.group === currentGroup).map(p => p.id);
        if (currentGroupPorts.length ===
            [...new Set(usedPorts.filter(p => p.includes(currentGroup)))].length) {
          calcNode.addPort({
            id: `${currentGroup}${currentGroupPorts.length + 1}`, group: currentGroup,
          });
        }
      };
      if (node.shape === 'edit-node') {
        // 判断输入锚点是否已经用完
        calcPorts(edge.target.port, node);
      }
      if (sourceNode.shape === 'edit-node') {
        // 判断输出锚点是否已经用完
        calcPorts(edge.source.port, sourceNode);
      }
    });
    graph.on('edge:contextmenu', ({cell, e}) => {
      createContentMenu(e, [
        {name: FormatMessage.string({id: 'canvas.edge.editRelation'})}], (i) => {
        if (i === 0) {
          const label = cell.getProp('relation') || '1:n';
          const relationArray = label.split(':');
          const relationChange = (value, type) => {
            const index = type === 'form' ? 0 : 1;
            relationArray[index] = value;
          };
          let modal = null;
          const onOK = () => {
            cell.setProp('relation', relationArray.join(':') || '1:n', { ignoreHistory : true});
            cell.attr('line', {
              sourceMarker: {
                relation: relationArray[0],
              },
              targetMarker: {
                relation: relationArray[1],
              },
            });
            modal && modal.close();
          };
          const onCancel = () => {
            modal && modal.close();
          };
          modal = openModal(
            <RelationEditor
              label={label}
              relationChange={relationChange}
              />,
              {
                title: <FormatMessage id='canvas.edge.setRelation'/>,
                buttons: [
                  <Button key='onOK' onClick={onOK}>
                    <FormatMessage id='button.ok'/>
                  </Button>,
                  <Button key='onCancel' onClick={onCancel}>
                    <FormatMessage id='button.cancel'/>
                  </Button>,
                ],
              });
        }
      });
    });
    graph.on('edge:change:target', (cell) => {
      const previous = graph.getCell(cell.previous.cell);
      const current = graph.getCell(cell.current.cell);
      previous?.setProp('targetPort', '', { ignoreHistory : true});
      if (!cell.options.propertyPath) {
        current?.setProp('targetPort', cell.current.port, { ignoreHistory : true});
      }
    });
    graph.on('edge:change:source', (cell) => {
      const previous = graph.getCell(cell.previous.cell);
      const current = graph.getCell(cell.current.cell);
      previous?.setProp('sourcePort', '', { ignoreHistory : true});
      if (!cell.options.propertyPath) {
        current?.setProp('sourcePort', cell.current.port, { ignoreHistory : true});
      }
    });
    graph.on('edge:mouseup', ({edge}) => {
      const target = edge.getTargetCell();
      const source = edge.getSourceCell();
      target?.setProp('targetPort', '', { ignoreHistory : true});
      source?.setProp('sourcePort', '', { ignoreHistory : true});
      changePortsVisible(false);
    });
    graph.on('edge:added', ({edge, options}) => {
      if (!options.auto && !options.undo && !options.redo) {
        const source = edge.getSourceCell();
        source.setProp('sourcePort', edge.getSource().port, { ignoreHistory : true});
      } else if (options.redo) {
        edge.attr({
          line: {
            strokeDasharray: '',
            sourceMarker: {
              name: 'relation',
              relation: '1',
            },
            targetMarker: {
              name: 'relation',
              relation: 'n',
            },
          },
        }, { ignoreHistory: true });
      }
      edge.removeTools();
    });
    graph.on('edge:selected', ({ edge }) => {
      edge.addTools([
        {
          name: 'target-arrowhead',
          args: {
            attrs: {
              d: 'M 0, -5 a 5,5,0,1,1,0,10 a 5,5,0,1,1,0,-10',
              fill: currentColor.current.selected,
            },
          },
        },
        {
          name: 'source-arrowhead',
          args: {
            attrs: {
              d: 'M 0, -5 a 5,5,0,1,1,0,10 a 5,5,0,1,1,0,-10',
              fill: currentColor.current.selected,
            },
          },
        },
      ], null, { ignoreHistory : true});
    });
    graph.on('edge:unselected', ({ edge }) => {
      edge.removeTools({ ignoreHistory : true});
    });
    graph.on('edge:mouseenter', ({edge}) => {
      const sourceNode = edge.getSourceCell();
      const targetNode = edge.getTargetCell();
      sourceNode.setProp('sourcePort', edge.getSourcePortId(), { ignoreHistory : true});
      targetNode?.setProp('targetPort', edge.getTargetPortId(), { ignoreHistory : true});
      edge.attr('line/stroke', currentColor.current.selected, { ignoreHistory : true});
    });
    graph.on('edge:mouseleave', ({edge}) => {
      const sourceNode = edge.getSourceCell();
      const targetNode = edge.getTargetCell();
      sourceNode.setProp('sourcePort','', { ignoreHistory : true});
      targetNode?.setProp('targetPort', '', { ignoreHistory : true});
      edge.attr('line/stroke', edge.getProp('fillColor') ||
          currentColor.current.fillColor, { ignoreHistory : true});
    });
    graph.on('node:dblclick', ({cell}) => {
      if (cell.shape === 'table') {
        const cellData = cell.getData();
        const key = cell.getProp('originKey');
        const group = dataSourceRef.current?.viewGroups?.
        filter(v => v.refEntities?.some(r => r === key))[0]?.defKey || '';
        const entityTabKey = `${key + separator}entity`;
        if (!validateTableStatus(entityTabKey)) {
          let drawer;
          const tab = {
            type: 'entity',
            tabKey: entityTabKey,
          };
          tabDataChange && tabDataChange(null, tab);
          const onOK = () => {
            save((fail) => {
              if (!fail) {
                drawer.close();
              }
            });
          };
          const onCancel = () => {
            drawer.close();
          };
          const entityChange = (cData) => {
            tabDataChange && tabDataChange(cData, tab);
          };
          const _openDict = (...args) => {
            openDict && openDict(...args);
            drawer.close();
          };
          drawer = openDrawer(<Entity
            openDict={_openDict}
            getDataSource={getDataSource}
            tabKey={entityTabKey}
            common={common}
            updateDataSource={updateDataSource}
            dataSource={dataSourceRef.current}
            entity={key}
            group={group}
            tabDataChange={entityChange}
            changes={changes}
            versionsData={versionsData}
          />, {
            title: cellData.defName || cellData.defKey,
            width: '80%',
            buttons: [
              <Button key='onSave' onClick={onOK}>
                <FormatMessage id='button.save'/>
              </Button>,
              <Button key='onCancel' onClick={onCancel}>
                <FormatMessage id='button.cancel'/>
              </Button>,
            ],
          });
        } else {
          jumpEntity(entityTabKey);
         /* let modal;
          const _jumpEntity = () => {
            jumpEntity(entityTabKey);
            modal.close();
          };
          modal = Modal.error({
            title: <FormatMessage id='optFail'/>,
            // message: <FormatMessage id='canvas.node.entityHasOpen'/>,
            message: <div className={`${currentPrefix}-relation-editor-open-entity`}>
              <div><FormatMessage id='canvas.node.entityHasOpen'/></div>
              <div>
                <FormatMessage id='canvas.node.entityJump'/>
                [<a onClick={_jumpEntity}><FormatMessage id='canvas.node.entityOpen'/></a>]
                <FormatMessage id='canvas.node.entityTab'/>
              </div>
            </div>,
          });*/
        }
      } else if (cell.shape === 'edit-node'
          || cell.shape === 'edit-node-circle'
          || cell.shape === 'group') {
        if (cell.shape === 'group') {
          // 暂时隐藏所有的子节点
          const cells = cell.getChildren();
          if (cells) {
            cells.forEach((c) => {
              c.hide();
            });
          }
        }
        cell.setProp('editable', true, { ignoreHistory : true});
      }
      //openEntity(cell.getProp('originKey'), 'entity', null, 'entity.svg');
    });
    graph.on('node:added', ({cell, options}) => {
      if (cell.shape === 'table') {
        if ((dataSourceRef.current.entities || [])
            .findIndex(e => cell.data.defKey === e.defKey) < 0){
          const newDataSource = {
            ...dataSourceRef.current,
            entities: dataSourceRef.current.entities.concat({
              ..._.omit(cell.data, ['maxWidth', 'count']),
              headers: getFullColumns()
                  .map(h => ({
                    refKey: h.newCode,
                    hideInGraph: h.relationNoShow,
                  })),
              fields: getEntityInitFields(),
            }),
          };
          updateDataSource && updateDataSource(newDataSource);
        }
      }
      if (options.undo && cell.isNode()) {
        cell.attr('body', {
          stroke: currentColor.current.border,
        }, { ignoreHistory : true});
      }
      if (cell.shape === 'group') {
        cell.setZIndex(1, { ignoreHistory : true});
      }
    });
    graph.on('node:mouseenter', ({node}) => {
      if (!graph.isSelected(node) || node.shape === 'table') {
        changePortsVisible(true, node);
      }
    });
    graph.on('node:mouseleave', ({node}) => {
      changePortsVisible(false, node);
    });
    graph.on('scale', (scale) => {
      scaleChange && scaleChange(scale.sx);
    });
    graph.history.on('undo', (args) => {
      console.log(args);
    });
    graph.bindKey('backspace', () => {
      const cells = graph.getSelectedCells();
      if (cells.length) {
        graph.removeCells(cells.filter(c => !((c.shape === 'edit-node'
            || c.shape === 'edit-node-circle' || c.shape === 'group') && (c.getProp('editable')))));
      }
    });
    const startDrag = (e, key) => {
      let empty;
      let count = 0;
      if (!key) {
        empty = {
          ...getEmptyEntity(),
          count: 0,
          defKey: generatorTableKey('TABLE_1', dataSourceRef.current),
          defName: '数据表',
          fields: getEntityInitFields(),
        };
      } else {
        empty = dataSourceRef.current?.entities?.filter(entity => entity.defKey === key)[0];
        count = graph.getNodes().filter(n => n.data?.defKey === key).length;
      }
      const { width, height, fields, headers, maxWidth, ports } =
          calcNodeData(empty, dataSourceRef.current, getTableGroup());
      const node =  graphRef.current.createNode({
        size: {
          width,
          height,
        },
        shape: 'table',
        ports,
        originKey: empty.defKey,
        count,
        updateFields,
        data: {
          ...empty,
          fields,
          headers,
          maxWidth,
        },
      });
      dndRef.current.start(node, e.nativeEvent);
    };
    const startRemarkDrag = (e, type) => {
      const shape = type === 'rect' ? 'edit-node' : 'edit-node-circle';
      const size = type === 'rect' ? defaultEditNodeSize : defaultEditNodeCircleSize;
      const node =  graphRef.current.createNode({
        shape: shape,
        label: '',
        size: size,
        ports: commonPorts,
      });
      dndRef.current.start(node, e.nativeEvent);
    };
    const startGroupNodeDrag = (e) => {
      const node =  graphRef.current.createNode({
        shape: 'group',
        label: '',
        size: defaultGroupNodeSize,
      });
      dndRef.current.start(node, e.nativeEvent);
    };
    const zoomGraph = (factor, scale) => {
      if (scale) {
        graphRef.current.scale(factor);
      } else if (typeof factor === 'number') {
        graphRef.current.zoom(factor);
      } else if (factor === 'fit') {
        graphRef.current.scale(1);
        graphRef.current.zoomToFit({ padding: 12 });
      } else {
        graphRef.current.scale(1);
        graphRef.current.centerContent();
      }
    };
    renderReady && renderReady({
      undo: () => graph.undo({undo: true}),
      redo: () => graph.redo({redo: true}),
      startDrag,
      startRemarkDrag,
      startGroupNodeDrag,
      zoomGraph,
      validateScale,
      getScaleNumber,
      updateColor,
      exportImg: () => {
        img(graph.toJSON().cells, null, false).then((dom) => {
          html2canvas(dom).then((canvas) => {
            document.body.removeChild(dom.parentElement.parentElement);
            const diagram = (dataSourceRef.current?.diagrams || [])
                .filter(d => d.defKey === diagramKey)[0] || {};
            DataUri.downloadDataUri(canvas.toDataURL('image/png'),
                `${diagram.defKey}-${diagram.defName}-${moment().unix()}.png`);
          });
        });
      },
    });
  }, []);
  useEffect(() => {
    if (activeKey === tabKey) {
      render();
    } else {
      needRender.current = true;
    }
  }, [data, dataSource]);
  useEffect(() => {
    graphRef.current.resize(restProps.width, restProps.height);
  }, [restProps.width, restProps.height]);
  useEffect(() => {
    if (activeKey === tabKey && needRender.current) {
      render();
      needRender.current = false;
    }
  }, [activeKey]);
  return <>
    <div
      id={id}
      style={{height: '100%'}}
    >{}</div>
  </>;
};
