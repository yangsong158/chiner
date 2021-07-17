import FormatMessage from '../../formatmessage';

class Canvas {
  constructor(data, config){
    this.config = config;
    this.state = []; // 缓存数据栈
    this.currentIndex = 0; // 当前渲染的数据栈中的数据
    this.drawEdgeMarkStatus = false; // 锚点拖拽状态
    this.drawEdgeMarkData = []; // 锚点拖拽的临时数据 拖拽结束后需要缓存到数据栈中
    this.dragEdgeMarkCacheItem = {}; // 锚点拖拽时的缓存数据
    this.drawNodeStatus = false; // 节点拖拽状态
    this.dragNodeCacheData = {}; // 节点拖拽初始化数据
    this.drawNodeData = null; // 节点拖拽的临时数据
    this.generateEdgeStatus = false; // 连接线生成的状态
    this.generateEdgeCacheData = {}; // 连接线缓存数据
    this.moveCanvasStatus = false; // 画布平移的状态
    this.moveCanvasCacheData = {}; // 缓存画布平移时的坐标数据
    this.scaleNumber = 1; // 当前缩放的比例
    this.selectedItem = {}; // 缓存当前选中的item
    this.renderData = {}; // 当前渲染的数据
    this.plugs = []; // 插件列表
    this.fontSize = 13; // 设置关系图字体大小
    this.linePadding = 15; // 设置每一行文字与上一行的间距
    this.columnPadding = 8; // 设置每一列的列宽
    this.rectPadding = 8; // 设置矩形的边距
    this.defaultStrokeStyle = '#ACDAFC'; // 设置默认颜色
    this.selectedStrokeStyle = '#1890FF'; // 设置选中颜色
    this.defaultFontColor = '#000000'; // 字体颜色
    this.arrowPathDefaultColor = '#C9D1D9'; // 连接线默认颜色
    this.tableCellColor = '#EAEAEA'; // 网格背景色
    this.matrix = [1, 0, 0, 1, 0, 0]; // 位置坐标矩阵
    this.reverseMatrix = [1, 0, 0, 1, 0, 0]; // 位置反向坐标矩阵
    this.fixOffset = 15; // 固定点偏移量
    this.canvas = config?.offScreen ? document.createElement('canvas') : document.getElementById(config.id);
    this.initSize(config);
    this.initCanvas(data);
  }
  // 初始化绘图宽高
  initSize = (config) => {
    this.canvasW = config?.offScreen ? 2000 : config.w; // 设置画布宽
    this.canvasH = config?.offScreen ? 2000 : config.h; // 设置画布高
    this.canvas.width = this.canvasW * 2;
    this.canvas.height = this.canvasH * 2;
    this.canvas.style.width = `${this.canvasW}px`;
    this.canvas.style.height = `${this.canvasH}px`;
  }
  // 初始化整个绘图组件
  initCanvas = (data) => {
    const newData = this.constructionData(data);
    this.dataChange(newData, true);
    this.draw(newData.nodes, newData.edges);
    if (this.config?.mode !== 'simple' && !this.config?.offScreen) {
      this.initListener();
    }
  };
  // 组装数据，过滤无效数据
  constructionData = (data) => {
    // 1.组装edges
    // 1.1 给每一条edge生成一个唯一的id，如果其id不存在的话
    // 1.2 删除无效的连接线
    const { dataSource } = this.config;
    const allNodeId = data?.nodes?.map(n => n.id);
    const tempEdges = data?.edges?.filter((e) => {
      return allNodeId.includes(e.target) && allNodeId.includes(e.source);
    }).map((e) => {
      return {
        ...e,
        id: e.id || Math.uuid(),
        pointers: (e.controlPoints || e.pointers || []).map(p => ({...p, id: p.id || Math.uuid()})),
      };
    });
    // 2.组装nodes
    // 2.1 给每一条node生成一个唯一的id，如果其id不存在的话
    // 2.2 每个矩形生成一个锚点
    const tempNodes = data?.nodes?.map((n) => {
      return {
        ...n,
        id: n.id || Math.uuid(),
        origin: dataSource?.entities?.filter(e => e.defKey === n.title)[0],
      };
    }).filter(n => n.origin);
    return {
      edges: tempEdges,
      nodes: tempNodes,
    };
  };
  // 实时计算节点和连接线的宽高位置
  calcNodesAndEdgesData = (nodes = [], edges = [], ctx) => {
    return {
      edges,
      nodes: nodes.map((n) => {
        // 节点源数据
        const origin = n?.origin || {};
        // 获取该数据表需要显示的字段
        const headers = origin?.headers.filter(h => !h.hideInGraph).map((h) => {
          if (h.refKey === 'domain'){
            return {
              ...h,
              refKey: 'type',
            };
          }
          return h;
        });
        const dataSource = this.config?.dataSource || {};
        const getDbType = (type) => {
          const defaultDb = dataSource?.profile?.default?.db;
          const map = (dataSource?.dataTypeMapping?.mappings || [])
            .filter(d => d.defKey === type)[0];
          if (defaultDb && map) {
            return map[defaultDb] || type;
          }
          return type;
        };
        const fields = (origin?.fields || []).filter(f => !f.hideInGraph).map(f => (
          {
            ...f,
            dbType: getDbType(f.type),
          }
        ));
        const contextPosition =
          { x: n.x + this.columnPadding, y: n.y + this.linePadding }; // 内容的实际起始位置
        // 开始绘制文本
        ctx.font = `${this.fontSize}px Arial`;
        // 绘制节点字段列表
        // 计算每一列最长的内容
        const maxWidth = {};
        fields.forEach((f) => {
          Object.keys(f).forEach((fName) => {
            if (!maxWidth[fName]) {
              maxWidth[fName] = 0;
            }
            if (maxWidth[fName] < ctx.measureText(f[fName].toString()).width) {
              maxWidth[fName] = ctx.measureText(f[fName].toString()).width;
            }
          });
        });
        // 计算矩形的宽高
        const width = headers.reduce((a, b) => {
          return a + (maxWidth[b.refKey] || 10) + this.columnPadding;
        }, 0) + this.rectPadding; // 内容宽度加上左侧边距
        // 高度除了字段还包含表名 所以需要字段 +1 同时需要加上上边距
        const height = (fields.length + 1) * (this.linePadding + this.fontSize) + this.rectPadding;
        let newY = contextPosition.y + this.fontSize + this.linePadding; // 重新计算Y的坐标
        let markPointers = [];
        fields.forEach(() => {
          // 计算锚点
          const markY = newY - (this.fontSize / 2.5);
          const marks = [{x: n.x, y: markY}, {x: n.x + width, y: markY}];
          markPointers = markPointers.concat(marks);
          newY += this.linePadding + this.fontSize;
        });
        return {
          ...n,
          width,
          height,
          markPointers,
          maxWidth,
          origin: {
            defName: origin.defName,
            headers,
            fields,
          },
        };
      }),
    };
  };
  // 设置节点或者连接线的样式
  drawNodesAndEdgesStyle = (event, nodes, edges, updateType) => {
    let data = this.positionTransformRect(event, nodes, edges);
    if (!data.type) {
      // 防止闪烁
      data = this.selectedItem;
    }
    const { type, item } = data;
    switch (type) {
      case 'edge':
      case 'edge-mark':
        // 选中的是连接线或者是连接线上的锚点 设置连接线的样式
        if (!updateType || updateType !== 'node') {
          if (type === 'edge-mark') {
            this.canvas.style.cursor = 'crosshair';
          } else {
            this.canvas.style.cursor = 'pointer';
          }
          this.draw(this.updateStyles(nodes, item, this.defaultStrokeStyle,
            true, this.defaultStrokeStyle),
            this.updateStyles(edges, item, this.selectedStrokeStyle,
              false, this.defaultStrokeStyle));
        }
        break;
      case 'node':
      case 'node-mark':
        // 选中的是节点
        if (!updateType || updateType !== 'edge') {
          if (type === 'node') {
            this.canvas.style.cursor = 'move';
          } else {
            // 选中的是节点上的锚点
            this.canvas.style.cursor = 'crosshair';
          }
          this.draw(this.updateStyles(nodes, item, this.selectedStrokeStyle,
            false, this.defaultStrokeStyle),
            this.updateStyles(edges, item, this.defaultStrokeStyle, true, this.defaultStrokeStyle));
        }
        break;
      default:
        // 无效的选中
        if (!updateType) {
          this.canvas.style.cursor = 'grab';
          this.draw(this.updateStyles(nodes, item, this.defaultStrokeStyle,true),
            this.updateStyles(edges, item, this.defaultStrokeStyle, true));
        }
        break;
    }
  };
  // 绘制方法
  /*
  * 参数 nodes: 节点信息 edges: 连接线信息 id: dom节点的id
  * */
  draw = (nodes, edges) => {
    this.execPlug('beforeDraw');
    if (!this.canvas.getContext) return;
    const ctx = this.canvas.getContext('2d');
    // 重置矩阵
    ctx.setTransform(1,0,0,1,0,0);
    // 清除画布
    ctx.clearRect(0, 0, this.canvasW * 2, this.canvasH * 2);
    // 变换矩阵
    ctx.transform(...this.matrix);
    this.renderData = this.calcNodesAndEdgesData(nodes, edges, ctx);
    const { tableCell = true } = this.config;
    if (tableCell) {
      // 是否需要绘制背景网格格栅
      this.drawTableCell(ctx);
    }
    // 绘制连接线
    this.drawEdges(this.renderData.nodes, this.renderData.edges, ctx);
    this.drawNodes(this.renderData.nodes, ctx);
    this.execPlug('afterDraw');
  };
  getXY = (x, y) => {
    const newX = this.reverseMatrix[0] * (x * 2 + this.reverseMatrix[4]);
    const newY = this.reverseMatrix[3] * (y * 2 + this.reverseMatrix[5]);
    return { x: newX, y: newY };
  };
// 坐标转节点方法
  /*
  * 参数 event: 事件 nodes:节点数据 edges:连接线数据
  * 返回 event: 事件 type: 节点类型 item: 节点数据 [node][edges][mark],
  * */
  positionTransformRect = (event, nodes, edges) => {
    // 返回的可能是点，线，面
    const matrixData = this.getXY(event.layerX, event.layerY);
    const layerX =  matrixData.x;
    const layerY =  matrixData.y;
    // 1.判断鼠标所处位置是连接线
    // 1.1 每两个点为一根线 根据点到线段两端的距离之和 与线段的长度的比较判断点是否是在线段上
    let type = '';
    let item = null;
    const selectedEdge = edges.filter((e) => {
      const { pointers = [] } = e;
      // 将左边数据进行两两比较
      return pointers.some((p, index) => {
        // 计算两点的距离（上一点和当前点的距离）
        if (index !== 0) {
          const preIndex = index - 1;
          const prePointer = pointers[preIndex];
          const pointerOffset = this.calcPointerOffset(prePointer, p);
          const offsetAll = this.calcPointerOffset({x: layerX, y: layerY}, p)
            + this.calcPointerOffset({x: layerX, y: layerY}, prePointer);
          return offsetAll - pointerOffset <= 1; // 允许一个像素的误差值
        }
        return false;
      });
    }).reverse()[0]; // 取后绘制的第一根连接线（多数情况下多个连接线会重合）
    // 2.判断鼠标所处位置是连接线上的锚点
    if (selectedEdge) {
      item = {...selectedEdge};
      type = 'edge';
      const { pointers = [] } = selectedEdge;
      const allPointers = pointers.slice(1, pointers.length - 1);
      // 去除首尾两个节点
      const clickPointer = allPointers.filter((p) => {
        // 判断点击时是否是锚点
        return this.calcPointerOffset({x: layerX, y: layerY}, p) < 10; // 允许锚点八个像素的误差
      })[0];
      if (clickPointer) {
        type = 'edge-mark';
        item = {
          edgeId: selectedEdge.id,
          ...clickPointer,
        };
      }
    }
    // 3.判断鼠标所处位置是节点
    const preId = this.preState?.item?.id;
    const selectedNodes = nodes.filter((n) => {
      const { x, y, width, height } = n;
      // 2.1 计算最小的坐标 和最大的坐标
      const maxPosition = { x: x + width + 10, y: y + height + 10 };
      return layerX >= x - 3 && layerX <= maxPosition.x &&
        layerY >= y - 3 && layerY <= maxPosition.y;
    });
    const selectedNode = preId ? selectedNodes.filter(n => n.id === preId)[0] : selectedNodes[0];
    if (selectedNode) {
      type = 'node';
      item = {...selectedNode};
      // 4.判断鼠标所处位置是否是节点上的锚点
      const { markPointers = [] } = selectedNode;
      const clickMark = markPointers
        .filter(p => this.calcPointerOffset({x: layerX, y: layerY}, p) < 10)[0]; // 允许锚点八个像素的误差
      if (clickMark) {
        type = 'node-mark';
        item = {
          nodeId: selectedNode.id,
          markIndex: markPointers.findIndex(m => m === clickMark),
          ...clickMark,
        };
      }
    }
    return {
      type,
      item,
    };
  };
  // 计算两点之间的距离
  /*
  * 参数 p1,p2 两个包含{x: x1, y: y1}结构的坐标数据
  * 返回 距离
  * */
  calcPointerOffset = (p1, p2) => {
    // 两点之间距离计算
    return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
  };
  // 删除连接线
  removeEdge = (item, nodes, edges) => {
    const tempEdges = edges.filter(e => e.id !== (item.edgeId || item.id));
    this.dataChange({nodes, edges: tempEdges});
    this.draw(nodes, tempEdges);
  };
  // 删除连接线锚点
  removeEdgeMark = (item, nodes, edges) => {
    const tempEdges = edges.map((e) => {
      if (e.id === item.edgeId) {
        return {
          ...e,
          pointers: e.pointers.filter(p => p.id !== item.id),
        };
      }
      return e;
    });
    this.dataChange({nodes, edges: tempEdges});
    this.draw(nodes, tempEdges);
  };
  // 新增连接线锚点方法
  addEdgeMark = (event, item, nodes, edges) => {
    const tempPointers = [].concat(item.pointers);
    const tempClick = this.getXY(event.layerX, event.layerY);
    const clickX = tempClick.x;
    const clickY = tempClick.y;
    // 需要判断是否点击在固定的横向距离连线上
    if (!((Math.abs(clickX - item.pointers[0]?.x) <= this.fixOffset
      && Math.abs(clickY - item.pointers[0]?.y) <= 3) ||
      (Math.abs(clickX - item.pointers[item.pointers.length - 1]?.x) <= this.fixOffset
      && Math.abs(clickY - item.pointers[item.pointers.length - 1]?.y) <= 3))){
      const pointer = tempPointers.map((p, index) => {
        // 计算两点的距离（上一点和当前点的距离）
        if (index !== 0) {
          const preIndex = index - 1;
          const prePointer = tempPointers[preIndex];
          const pointerOffset = this.calcPointerOffset(prePointer, p);
          const offsetAll = this.calcPointerOffset({x: clickX, y: clickY}, p)
            + this.calcPointerOffset({x: clickX, y: clickY}, prePointer);
          return {
            offset: offsetAll - pointerOffset,
            index: index,
          };
        }
        return null;
      }).filter(off => !!off).sort((a, b) => a.offset - b.offset)[0];
      tempPointers.splice(pointer.index, 0, {x: clickX, y: clickY, id: Math.uuid()});
      // 备份连接线的数据放在数据栈中
      const tempEdges = edges.map((e) => {
        if (e.id === item.id) {
          return {
            ...e,
            pointers: tempPointers,
          };
        }
        return e;
      });
      this.dataChange({nodes, edges: tempEdges});
      this.draw(nodes, tempEdges);
    }
  };
  cacheTempEdge = (edges, item) => {
    let tempEdges = [].concat(edges);
    const tempEdge = {
      id: Math.uuid(),
      source: item.nodeId,
      isTemp: true,
      sourceAnchor: item.markIndex || 0,
      pointers: [{x: item.x, y: item.y, id: Math.uuid()}],
    };
    tempEdges.push(tempEdge);
    return {
      tempEdge,
      tempEdges,
    };
  };
  // 连接线生成方法
  startGenerateEdge = ({ layerX, layerY }, nodes, { tempEdge, tempEdges }) => {
    requestAnimationFrame(() => {
      // 鼠标移动的过程中绘制临时的连接线
      if (this.generateEdgeStatus) {
        // eslint-disable-next-line no-param-reassign
        tempEdge.pointers[1] = this.getXY(layerX, layerY);
        this.draw(nodes, tempEdges);
      }
    });
  };
  // 结束连接线的生成
  endGenerateEdge = (data, nodes, edges) => {
    let tempEdges = edges;
    if (data.type === 'node-mark') {
      tempEdges = tempEdges.map((edge) => {
        if (edge.isTemp){
          return {
            id: edge.id,
            source: edge.source,
            target: data.item.nodeId,
            sourceAnchor: edge.sourceAnchor,
            targetAnchor: data?.item?.markIndex || 0,
            pointers: [edge.pointers[0], {x: data.item.x, y: data.item.y, id: Math.uuid()}],
          };
        }
        return edge;
      });
      this.dataChange({nodes, edges: tempEdges});
    } else {
      tempEdges = tempEdges.filter(edge => !edge.isTemp);
    }
    this.draw(nodes, tempEdges);
  };
  // 画布内容平移方法
  moveCanvas = (e, { event = e }) => {
    requestAnimationFrame(() => {
      const { layerX, layerY } = event;
      const tempOffset = {
        x: (e.layerX - layerX) * 2,
        y: (e.layerY - layerY) * 2,
      };
      this.matrix[4] += tempOffset.x;
      this.matrix[5] += tempOffset.y;
      this.reverseMatrix[4] -= tempOffset.x;
      this.reverseMatrix[5] -= tempOffset.y;
      this.execPlug('moveCanvas', tempOffset);
      this.refresh();
    });
  };
  // 缓存节点拖拽所需缓存数据
  cacheDragNodeData = (event, edges, item) => {
    const tempPosition = this.getXY(event.layerX, event.layerY);
    const layerX = tempPosition.x;
    const layerY = tempPosition.y;
    const offsetX = layerX - item.x;
    const offsetY = layerY - item.y;
    // 获取所有与该节点有关联的连接线
    const effectEdges = edges.map((e) => {
      // 修改起点或者终点坐标
      let pointer = null;
      let index = -1;
      if (e.source === item.id) {
        index = 0;
        pointer = e.pointers[index];
      } else if (e.target === item.id) {
        index = e.pointers.length - 1;
        pointer = e.pointers[index];
      }
      if (pointer) {
        const { x, y } = pointer;
        // 增加临时缓存坐标信息
        return {
          ...e,
          __temp: {
            index,
            x,
            y,
          },
        };
      }
      return e;
    });
    return {
      id: item.id,
      layerX,
      layerY,
      offsetX,
      offsetY,
      effectEdges,
    };
  };
  //节点的拖拽方法
  dragNode = (event, nodes, cacheData) => {
    const tempPosition = this.getXY(event.layerX, event.layerY);
    const layerX = tempPosition.x;
    const layerY = tempPosition.y;
    requestAnimationFrame(() => {
      // 更新连接线的 起点和终点 锚点
      this.drawNodeData = {
        nodes: nodes.map((n) => {
          if (n.id === cacheData.id) {
            return {
              ...n,
              x: layerX - cacheData.offsetX,
              y: layerY - cacheData.offsetY,
            };
          }
          return n;
        }),
        edges: cacheData.effectEdges.map((e) => {
          if (e.__temp) {
            const { x, y, index } = e.__temp;
            return {
              ...e,
              target: e.target,
              source: e.source,
              id: e.id,
              pointers: e.pointers.map((p, i) => {
                if (i === index) {
                  return {
                    ...p,
                    x: x - (cacheData.layerX - layerX),
                    y: y - (cacheData.layerY - layerY),
                  };
                }
                return p;
              }),
            };
          }
          return e;
        }),
      };
      this.draw(this.drawNodeData.nodes,
        this.merge(this.drawNodeData.edges, this.drawNodeData.nodes));
    });
  };

  // 连接线锚点拖拽事件
  dragEdgeMark = (e, item, nodes, edges) => {
    requestAnimationFrame(() => {
      const { x, y } = this.getXY(e.layerX, e.layerY);
      const tempEdge = edges.map((edge) => {
        if (edge.id === item.edgeId) {
          return {
            ...edge,
            pointers: edge.pointers.map((p) => {
              if (p.id === item.id) {
                return {
                  id: p.id,
                  x,
                  y,
                };
              }
              return p;
            }),
          };
        }
        return edge;
      });
      this.drawEdgeMarkData = tempEdge;
      this.draw(nodes, tempEdge);
    });
  };
  // 绘制网格格栅
  drawTableCell = (ctx) => {
    let line = 1;
    let col = 1;
    ctx.strokeStyle = this.tableCellColor;
    while (line * 10 <= this.canvas.offsetHeight) {
      ctx.beginPath();
      const movePointer = this.getXY(0, line * 10);
      const toPointer = this.getXY(this.canvas.offsetWidth, line * 10);
      ctx.moveTo(movePointer.x, movePointer.y);
      ctx.lineTo(toPointer.x, toPointer.y);
      ctx.stroke();
      line += 1;
    }
    while (col * 10 <= this.canvas.offsetWidth) {
      ctx.beginPath();
      const movePointer = this.getXY(col * 10, 0);
      const toPointer = this.getXY(col * 10, this.canvas.offsetHeight);
      ctx.moveTo(movePointer.x, movePointer.y);
      ctx.lineTo(toPointer.x,toPointer.y);
      ctx.stroke();
      col += 1;
    }
  };
  // 绘制节点
  drawNodes = (nodes, ctx) => {
    nodes.sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0)).forEach((n) => {
      const { width, height, markPointers, maxWidth = {} } = n;
      const { headers, fields, defName } = n?.origin;
      const contextPosition =
        { x: n.x + this.columnPadding, y: n.y + this.linePadding };
      ctx.fillStyle = this.defaultStrokeStyle;
      ctx.fillRect(n.x, n.y, width, height);  //绘制矩形
      ctx.strokeStyle = n.strokeStyle || this.defaultStrokeStyle;
      ctx.strokeRect(n.x, n.y, width, height); // 绘制矩形边框
      // 绘制节点标题
      // 标题居中显示
      ctx.fillStyle = this.defaultFontColor;
      const repeatTitle = n.count ? `${n.title}:${n.count}` : n.title;
      const titleValue = `${repeatTitle}(${defName})`;
      ctx.fillText(titleValue,
        n.x + (width - ctx.measureText(titleValue).width) / 2,
        contextPosition.y);
      // 绘制字段
      let newY = contextPosition.y + this.fontSize + this.linePadding; // 重新计算Y的坐标
      fields.forEach((f) => {
        let newX = contextPosition.x;
        headers.forEach((h) => {
          ctx.fillText(f[h.refKey], newX, newY);
          newX += this.columnPadding + maxWidth[h.refKey];
        });
        newY += this.linePadding + this.fontSize;
      });
      // 绘制锚点
      if (n.strokeStyle === this.selectedStrokeStyle) {
        const radius = 5;
        markPointers.forEach((m, i) => {
          if (i === n.markIndex) {
            ctx.fillStyle = this.selectedStrokeStyle;
          } else {
            ctx.fillStyle = this.defaultStrokeStyle;
          }
          ctx.beginPath();
          ctx.arc(m.x, m.y, radius , 0, 2 * Math.PI);
          ctx.fill();
          ctx.stroke();
        });
      }
      // 绘制标题下划线
      ctx.beginPath();
      ctx.strokeStyle = this.defaultFontColor;
      ctx.moveTo(n.x, n.y + this.fontSize + this.rectPadding);
      ctx.lineTo(n.x + width, n.y + this.fontSize + this.rectPadding);
      ctx.stroke();
    });
  };
  // 绘制连接线
  drawEdges = (nodes, edges, ctx) => {
    const tempEdges = [];
    const filterEdges = edges.sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0)).filter((e) => {
      // 过滤掉起点和终点相等的 过滤掉两条相同的起点和终点的 连接线在同一个节点上的
      const targetNode = nodes.filter(n => n.id === e.target)[0];
      const sourceNode = nodes.filter(n => n.id === e.source)[0];
      e.pointers = e.pointers.map((p, index) => {
        // 更新起点和终点的坐标
        const sourceAnchor = e.sourceAnchor || 0;
        const targetAnchor = e.targetAnchor || 0;
        if (!e.isTemp){
          if (index === 0 && sourceNode && sourceNode.markPointers) {
            return {
              id: p.id,
              x: sourceNode?.markPointers[sourceAnchor]?.x || p.x,
              y: sourceNode?.markPointers[sourceAnchor]?.y || p.y,
            };
          } else if (index === (e.pointers.length - 1) && targetNode && targetNode.markPointers) {
            return {
              id: p.id,
              x: targetNode?.markPointers[targetAnchor]?.x || p.x,
              y: targetNode?.markPointers[targetAnchor]?.y || p.y,
            };
          }
        }
        return p;
      });
      const { pointers = [] } = e;
      const eStartPointer = pointers[0];
      const eEndPointer = pointers[pointers.length - 1];
      if (e.target === e.source || this.calcPointerOffset(eStartPointer, eEndPointer) < 3
        || tempEdges
          .some(te => this.calcPointerOffset(eStartPointer, te.pointers[0]) < 3
            && this.calcPointerOffset(eEndPointer, te.pointers[te.pointers.length - 1]) < 3)) {
        return false;
      }
      tempEdges.push(e);
      return true;
    });
    // 重新赋值过滤后的连接线
    this.renderData.edges = filterEdges;
    filterEdges.forEach((e) => {
      const { pointers } = e;
      const targetNode = nodes.filter(n => n.id === e.target)[0];
      const sourceNode = nodes.filter(n => n.id === e.source)[0];
      let paths = pointers.slice(1, pointers.length - 1);
      const startPointer = pointers[0];
      const endPointer = pointers[pointers.length - 1];
      if (pointers.length === 2 && targetNode && Math.abs(pointers[0].y - pointers[1].y) > 3){
        // 当只有两个坐标点的时候需要判断
        // 判断是否需要拐弯 判断最近的两点之间的x,y是否相等
        // 获取离终点最近的节点 判断终点所处的位置
        let tempNode = {};
        if (endPointer.x >= targetNode.x + targetNode.width) {
          // 在右侧
          tempNode = nodes
            .filter(n => n.id !== targetNode.id && n.x > endPointer.x)
            .map(n => ({
              origin: n.x - endPointer.x,
              node: n,
            })).filter(n => n.origin !== 0)
            .sort((a, b) => a.origin - b.origin)[0];
          if (!tempNode) {
            tempNode = { origin: 20 };
          }
        } else {
          // 在左侧
          tempNode = nodes
            .filter(n => n.id !== targetNode.id && n.x < endPointer.x)
            .map(n => ({
              origin: n.x + n.width - endPointer.x,
              node: n,
            })).filter(n => n.origin !== 0)
            .sort((a, b) => b.origin - a.origin)[0];
          if (!tempNode) {
            tempNode = { origin: -20 };
          }
        }
        const origin = tempNode.origin;
        paths =  [
          {x: endPointer.x + origin / 2, y: startPointer.y, id: Math.uuid()},
          {x: endPointer.x + origin / 2, y: endPointer.y, id: Math.uuid()},
        ];
        // 需要将新创建出来的两个坐标点存入线的数据中
        e.pointers.splice(1, 0, ...paths);
      }
      // 连接线保留一小段距离（该距离不可创建锚点，与起点终点保持水平平行【10】）
      const offset = this.fixOffset;
      const newStartPointer = this.getFixPointer(startPointer, sourceNode, offset);
      const newEndPointer = this.getFixPointer(endPointer, targetNode, offset);
      paths.unshift(newStartPointer);
      paths.splice(paths.length, 0, newEndPointer);
      ctx.beginPath(); //新建一条path
      ctx.strokeStyle = e.strokeStyle === this.selectedStrokeStyle
        ? this.selectedStrokeStyle : this.arrowPathDefaultColor;
      ctx.moveTo(startPointer.x, startPointer.y); //把画笔移动到指定的坐标
      paths.forEach((p) => {
        ctx.lineTo(p.x, p.y);
      });
      ctx.lineTo(endPointer.x, endPointer.y);
      ctx.stroke();
      // 绘制折线点
      if (e.strokeStyle === this.selectedStrokeStyle) {
        // 过滤掉固定的两点
        paths.filter((p, index) => (index !== 0 && index !== paths.length - 1)).forEach((p, i) => {
          ctx.beginPath();
          ctx.fillStyle = i === e.markIndex ? this.selectedStrokeStyle : this.defaultStrokeStyle;
          ctx.arc(p.x, p.y, 5 , 0, 2 * Math.PI);
          ctx.fill();
          ctx.stroke();
        });
      }
      // 绘制箭头
      this.drawRelationArrows([newStartPointer, newEndPointer], ctx, e);
    });
  };
  // 用来合并直线中的点
  merge = (edges, nodes) => {
    let needUpdate = false;
    const tempEdges = edges.map((e) => {
      const { pointers } = e;
      const tempPointers = pointers.filter((p, index) => {
        if (index !== 0 && index !== pointers.length - 1){
          const pointerOffset = this.calcPointerOffset(pointers[index - 1], p)
            + this.calcPointerOffset(pointers[index + 1], p);
          const allOffset = this.calcPointerOffset(pointers[index - 1], pointers[index + 1]);
          if (Math.abs(allOffset - pointerOffset) < 3) {
            // 移除该节点
            needUpdate = true;
            return false;
          }
          return true;
        }
        return true;
      });
      return {
        ...e,
        pointers: tempPointers,
      };
    });
    if (needUpdate) {
      const cacheId = this.dragNodeCacheData.effectEdges.map(e => e.id);
      // 更新缓存节点
      this.dragNodeCacheData.effectEdges = tempEdges.filter(e => cacheId.includes(e.id));
      this.dataChange({nodes, edges: tempEdges});
    }
    return tempEdges;
  };
  // 判断坐标点位置
  getFixPointer = (pointer, node, offset) => {
    const index = node?.markPointers.findIndex(p => this.calcPointerOffset(p, pointer) <= 3);
    // 判断坐标点是在节点的左侧还是右侧， 如果是左侧是减 右侧是加
    let flag = index % 2 === 0;
    return {
      x: pointer.x + (flag ? -offset : offset),
      y: pointer.y,
      id: Math.uuid(),
      flag,
    };
  };
  // 根据点绘制线
  drawLine = (ctx, pointers) => {
    const tempPointers = pointers.slice(1, pointers.length - 1);
    ctx.beginPath();
    ctx.moveTo(pointers[0].x, pointers[0].y);
    tempPointers.forEach((p) => {
      ctx.lineTo(p.x, p.y);
    });
    ctx.lineTo(pointers[pointers.length - 1].x, pointers[pointers.length - 1].y);
    ctx.stroke();
  };
  // 根据点绘制圆
  drawRound = (ctx, pointer) => {
    ctx.beginPath();
    ctx.fillStyle = '#FFFFFF';
    ctx.arc(pointer.x + (pointer.flag ? 5 : -5), pointer.y, 2 , 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
  };
  // 绘制对应关系的箭头
  drawRelationArrows = (pointers, ctx, e) => {
    const { relation = '1:1' } = e;
    const relationData = relation.split(':');
    relationData.forEach((r, index) => {
      const currentPointer = pointers[index];
      const linePointers = [
        {x: currentPointer.x + (currentPointer.flag ? 7 : -7), y: currentPointer.y + 3},
        {x: currentPointer.x + (currentPointer.flag ? 7 : -7), y: currentPointer.y - 3},
      ];
      const arrowPointers = [
        {x: currentPointer.x + (currentPointer.flag ? 11 : -11), y: currentPointer.y + 3},
        {x: currentPointer.x + (currentPointer.flag ? 7 : -7), y: currentPointer.y},
        {x: currentPointer.x + (currentPointer.flag ? 11 : -11), y: currentPointer.y - 3},
      ];
      if (r === '1') {
        this.drawLine(ctx, linePointers);
      } else if (r === '1,n'){
        this.drawLine(ctx, linePointers);
        this.drawLine(ctx, arrowPointers);
      } else if (r === '0,1') {
        this.drawLine(ctx, linePointers);
        this.drawRound(ctx, currentPointer);
      } else if (r === '0,n') {
        this.drawLine(ctx, linePointers);
        this.drawLine(ctx, arrowPointers);
        this.drawRound(ctx, currentPointer);
      } else if (r === '0') {
        this.drawRound(ctx, currentPointer);
      }
    });
  };
  filterObjectField = (object,  fields = []) => {
    return Object.keys(object).reduce((a, b) => {
      const tempA = {...a};
      if (!fields.includes(b)) {
        tempA[b] = object[b];
      }
      return tempA;
    }, {});
  };
  // 数据栈操作
  dataChange = ({ nodes, edges }, isInit) => {
    // 手动正常操作 重置数据栈
    // 移除重做数据
    if (!isInit) {
      // 监听数据变化，排除第一次初始化
      const { dataChange } = this.config;
      // 需要移除无用的origin属性
      dataChange && dataChange({
        nodes: nodes.map(n => this.filterObjectField(n,
            ['origin', 'markIndex', 'strokeStyle', 'zIndex', 'maxWidth'])),
        edges: edges.map(e => this.filterObjectField(e,
            ['__temp', 'markIndex', 'strokeStyle', 'zIndex']))});
    }
    if (nodes && edges) {
      const index = this.currentIndex + 1;
      this.state.splice(index, this.state.length - index);
      this.state.push({nodes: [].concat(nodes), edges: [].concat(edges)});
      this.currentIndex = this.state.length - 1;
    }
  };
  // 设置节点或者连接线高亮锚点
  calcMarkIndex = (d, item) => {
    if (item) {
      if (d.id === item.nodeId) {
        return item.markIndex;
      } else if (d.id === item.edgeId) {
        return d.pointers.findIndex(p => p.id === item.id) - 1;
      }
    }
    return -1;
  };
  // 更新节点或者连接线的样式
  updateStyles = (data, item, style, reset, defaultStrokeStyle) => {
    return data.map((d) => {
      if (reset || d.id === item.id || d.id === item.nodeId || d.id === item.edgeId) {
        return {
          ...d,
          strokeStyle: style,
          zIndex: 999,
          markIndex: this.calcMarkIndex(d, item),
        };
      } else {
        return {
          ...d,
          strokeStyle: defaultStrokeStyle,
          zIndex: 1,
        };
      }
    });
  };
  // 撤销
  undo = () => {
    if (this.currentIndex > 0) {
      // 如果是可撤销的状态
      this.currentIndex -= 1;
      const { nodes, edges } = this.state[this.currentIndex];
      this.draw(nodes, edges);
    }
  };
  // 重做
  redo = () => {
    if (this.state.length - 1 > this.currentIndex) {
      // 如果是可重做的状态
      this.currentIndex += 1;
      const { nodes, edges } = this.state[this.currentIndex];
      this.draw(nodes, edges);
    }
  };
  // 放大
  scale = (size = 0.5) => {
    if (size > 0) {
      this.matrix[0] = size;
      this.matrix[3] = size;
      this.matrix[4] -= this.canvasW * (size - this.scaleNumber);
      this.reverseMatrix[4] += this.canvasW * (size - this.scaleNumber);
      this.matrix[5] -= this.canvasH * (size - this.scaleNumber);
      this.reverseMatrix[5] += this.canvasH * (size - this.scaleNumber);
      this.reverseMatrix[0] = 1 / size;
      this.reverseMatrix[3] = 1 / size;
      this.scaleNumber = size;
      this.execPlug('canVasScale', size);
      this.refresh();
    }
  };
  // 获取数据
  getData = () => {
    const { nodes = [], edges = [] } = this.state[this.currentIndex];
    return {
      nodes: nodes.map(n => ({...n, strokeStyle: this.defaultStrokeStyle})),
      edges: edges.map(e => ({...e, strokeStyle: this.defaultStrokeStyle})),
    };
  };
  // 创建右键菜单
  createContentMenu = (event, menus, cb) => {
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
  // 初始化监听事件
  initListener = () => {
    // 1.设置事件监听
    this.preState = {type: 'unset'}; // 设置鼠标移动时的初始状态
    this.canvas.onmouseleave = (event) => {
      // 鼠标离开canvas时
      this.canvas.onmouseup(event); // 触发鼠标放开事件
      // 重置所有样式
      this.preState = { type: 'unset' };
      this.draw(this.updateStyles(this.renderData.nodes, null, this.defaultStrokeStyle,true),
        this.updateStyles(this.renderData.edges, null, this.defaultStrokeStyle, true));
    };
    this.canvas.onmousemove = (event) => {
      const { nodes, edges } = this.renderData;
      if (this.drawNodeStatus) {
        this.dragNode(event, nodes, this.dragNodeCacheData);
      } else if (this.drawEdgeMarkStatus) {
        this.dragEdgeMark(event, this.dragEdgeMarkCacheItem, nodes, edges);
      } else if (this.generateEdgeStatus) {
        this.drawNodesAndEdgesStyle(event, nodes, edges, 'node');
        this.startGenerateEdge(event, nodes, this.generateEdgeCacheData);
      } else if (this.moveCanvasStatus) {
        this.canvas.style.cursor = 'grabbing';
        this.moveCanvas(event, this.moveCanvasCacheData);
        this.moveCanvasCacheData = { event };
      } else {
        const data = this.positionTransformRect(event, nodes, edges);
        if (this.preState.type !== data.type || data?.item?.id !== this.preState?.item?.id) {
          this.preState = {...data};
          this.drawNodesAndEdgesStyle(event, nodes, edges);
        }
      }
    };
    this.canvas.onmouseup = (event) => {
      this.selectedItem = {}; // 重置选中的item
      const { nodes, edges } = this.renderData;
      if (this.drawNodeStatus) {
        if (this.drawNodeData) {
          this.dataChange(this.drawNodeData);
        }
        this.drawNodeData = null;
        this.drawNodeStatus = false;
      } else if (this.drawEdgeMarkStatus) {
        if (this.drawEdgeMarkData.length > 0) {
          this.dataChange({nodes, edges: this.drawEdgeMarkData});
        }
        this.drawEdgeMarkData = [];
        this.drawEdgeMarkStatus = false;
      } else if (this.generateEdgeStatus) {
        const data = this.positionTransformRect(event, nodes, edges);
        this.endGenerateEdge(data, nodes, this.generateEdgeCacheData.tempEdges);
        this.generateEdgeStatus = false;
      } else if (this.moveCanvasStatus) {
        this.canvas.style.cursor = 'grab';
        this.moveCanvasCacheData = {};
        this.moveCanvasStatus = false;
      }
    };
    // 2.鼠标按下时
    this.canvas.onmousedown = (event) => {
      // canvas的鼠标拖拽事件
      const { relationEditor } = this.config;
      const { nodes, edges } = this.renderData;
      const data = this.positionTransformRect(event, nodes, edges);
      const { type, item } = data;
      this.selectedItem = data;
      const { button } = event;
      switch (type) {
        case 'edge':
          // 新增锚点事件
          if (button === 0) {
            this.addEdgeMark(event, item, nodes, edges);
          } else if (button === 2) {
            this.createContentMenu(event, [
              {name: FormatMessage.string({id: 'canvas.edge.addEdgeMark'})},
              {name: FormatMessage.string({id: 'canvas.edge.removeEdge'})},
              {name: FormatMessage.string({id: 'canvas.edge.setRelation'})},
            ], (i) => {
              if (i === 0) {
                this.addEdgeMark(event, item, nodes, edges);
              } else if (i === 1) {
                this.removeEdge(item, nodes, edges);
              } else {
                relationEditor && relationEditor(item, this);
              }
            });
          }
          break;
        case 'edge-mark':
          // 锚点拖拽事件
          if (button === 0) {
            this.drawEdgeMarkStatus = true; // 开启锚点拖拽
            // 记录初始化的数据
            this.dragEdgeMarkCacheItem = item;
          } else if (button === 2) {
            this.createContentMenu(event, [
              {name: FormatMessage.string({id: 'canvas.edge.removeEdgeMark'})},
              {name: FormatMessage.string({id: 'canvas.edge.removeEdge'})},
              {name: FormatMessage.string({id: 'canvas.edge.setRelation'})},
            ], (i) => {
              if (i === 0){
                this.removeEdgeMark(item, nodes, edges);
              } else if (i === 1) {
                this.removeEdge(item, nodes, edges);
              } else {
                relationEditor && relationEditor(item, this);
              }
            });
          }
          break;
        case 'node':
          // 节点拖拽事件
          if (button === 0) {
            this.drawNodeStatus = true; // 开启节点拖拽
            // 记录初始化的数据
            this.dragNodeCacheData = this.cacheDragNodeData(event, edges, item);
          } else if (button === 2) {
            this.createContentMenu(event, [
              {name: FormatMessage.string({id: 'canvas.node.delete'})},
            ], (i) => {
              if (i === 0) {
                this.removeNode(item, nodes, edges);
              }
            });
          }
          break;
        case 'node-mark':
          // 创建临时的连接线数据
          this.generateEdgeStatus = true; // 开启生成连接线
          this.generateEdgeCacheData = this.cacheTempEdge(edges, item);
          break;
        default:
          // 平移画布内容
          this.moveCanvasStatus = true; // 开启画布平移
          break;
      }
    };
    // 3.双击鼠标
    this.canvas.ondblclick = (event) => {
      const { nodes, edges } = this.renderData;
      const data = this.positionTransformRect(event, nodes, edges);
      const { type, item } = data;
      switch (type) {
        case 'node': this.config?.on('dblclick', 'node', item);break;
        default: break;
      }
    };
  };
  // 生成相同数据表标题
  generateNodeTitle = (nodes = [], title = '') => {
    const sameTitles = nodes.filter(t => t.title === title);
    if (sameTitles.length > 0) {
      // 查找所有相同的最大数量
      const maxCount = Math.max(...sameTitles.map(t => parseInt((t.count || 0), 10)));
      return maxCount + 1;
    }
    return 0;
  };
  // 增加节点
  addNode = (node) => {
    const { nodes, edges } = this.renderData;
    // 此处需要判断该节点对应的关系图是否存在
    const newData = this.constructionData({
      nodes: nodes.concat({
        ...node,
        count: this.generateNodeTitle(nodes, node.title),
      }),
      edges,
    });
    this.dataChange(newData);
    this.draw(newData.nodes, newData.edges);
  };
  // 删除节点
  removeNode = (item, nodes, edges) => {
    const tempNodes = nodes.filter(n => n.id !== (item.nodeId || item.id));
    const tempEdges = edges
      .filter(e => !(e.target === (item.nodeId || item.id))
        && !(e.source === (item.nodeId || item.id)));
    this.dataChange({nodes: tempNodes, edges: tempEdges});
    this.draw(tempNodes, tempEdges);
  };
  // 注册插件
  registerPlug = (plugName, plug) => {
    // eslint-disable-next-line new-cap
    const plugInstance = new plug(this, Canvas); // 初始化插件
    this.plugs.push({plugName, plug: plugInstance});
  };
  // 触发插件事件 在绘制前以及绘制后
  execPlug = (eventName, data) => {
    this.plugs.forEach((p) => {
      const beforeEvent = p.plug[eventName];
      beforeEvent && beforeEvent(data);
    });
  };
  // 搜索节点
  search = (nodeId) => {
    const { nodes, edges } = this.renderData;
    this.draw(nodes.map((n) => {
      if (n.id === nodeId) {
        return {
          ...n,
          strokeStyle: this.selectedStrokeStyle,
        };
      }
      return n;
    }), edges);
  };
  exportImg = (imageType, type) => {
    const string = this.canvas.toDataURL(`image/${imageType}`);
    if (type === 'file') {
      return Buffer.from(string.replace(/^data:image\/\w+;base64,/, ''), 'base64');
    }
    return string;
  };
  refresh = () => {
    this.draw(this.renderData.nodes, this.renderData.edges);
  };
  fit = () => {
    const getMaxMin = (nodes, type) => {
      const min = nodes.sort((a, b) => a[type] - b[type])[0][type];
      const maxNode = nodes.sort((a, b) => b[type] - a[type])[0];
      const max = maxNode[type] + maxNode[type === 'x' ? 'width' : 'height'];
      return {
        min,
        max,
      };
    };
    const getOffset = (nodes, type, size, scale) => {
      if (nodes.length > 0){
        const { max, min } = getMaxMin(nodes, type);
        return (size / 2) - ((max - min) / 2 + min) * scale;
      }
      return 0;
    };
    const getScale = (nodes, type, size) => {
      if (nodes.length > 0){
        const { max, min } = getMaxMin(nodes, type);
        const allOffset = max - min === 0 ? size : max - min;
        return size / allOffset;
      }
      return 1;
    };
    // 适配 关系图全量显示
    const { nodes, edges } = this.renderData;
    // 内容居中显示 先平移 后缩放
    // 1.计算缩放适配比例
    const scaleX = getScale(nodes, 'x', this.canvasW * 2 * 0.9);
    const scaleY = getScale(nodes, 'y', this.canvasH * 2 * 0.7);
    const scale = scaleX < scaleY ? scaleX : scaleY;
    // 2.寻找平移居中x偏移量
    const offsetX = getOffset(nodes, 'x', this.canvasW * 2 * 0.9, scale);
    // 3.寻找平移居中y偏移量
    const offsetY = getOffset(nodes, 'y', this.canvasH * 2 * 0.7, scale);
    this.matrix = [scale, 0, 0, scale, offsetX, offsetY];
    this.draw(nodes, edges);
  };
  setRelation = (edgeId, relation) => {
    const { nodes, edges } = this.renderData;
    // 更新连接线的关联关系
    this.draw(nodes, edges.map((e) => {
      if (e.id === edgeId){
        return {
          ...e,
          relation,
        };
      }
      return e;
    }));
  };
  updateColor = (type, {hex}) => {
    // 更新颜色（fillColor, fontColor）
    if (type === 'fillColor') {
      this.defaultStrokeStyle = hex;
      this.refresh();
    } else if (type === 'fontColor') {
      this.defaultFontColor = hex;
      this.refresh();
    }
  };
  resize = (config, data, dataSource) => {
    this.initSize(config);
    if (data) {
      this.config.dataSource = dataSource;
      const newData = this.constructionData(data);
      this.dataChange(newData, true);
      this.draw(newData.nodes, newData.edges);
    } else {
      this.refresh();
    }
  };
  updateDataSource = (dataSource) => {
    this.config.dataSource = dataSource;
  };
  addEdge = (edge) => {
    const { nodes, edges } = this.renderData;
    // 此处需要判断该节点对应的关系图是否存在
    const newData = this.constructionData({
      edges: edges.concat([].concat(edge).map((e) => {
        return {
          ...e,
          id: e.id || Math.uuid(),
        };
      })),
      nodes,
    });
    this.dataChange(newData);
    this.draw(newData.nodes, newData.edges);
  };
}
export default Canvas;
