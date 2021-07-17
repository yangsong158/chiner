// 缩略图插件

export default class MinMap {
  constructor(cav, Canvas){
    this.cav = cav;
    this.Canvas = Canvas;
    this.initMinMap();
    this.scale = 1;
    this.viewScale = 1;
    this.style = {};
  }
  afterDraw = () => {
    // 此处需要更新缩略图
    const { nodes, edges } = this.filterData(this.cav.renderData);
    this.calcData({nodes, edges});
  };
  moveCanvas = (data) => {
    console.log(data.x / 2 * this.scale * this.cav.scaleNumber);
    this.style = {
      left: this.style.left - data.x / 2 * this.scale / this.cav.scaleNumber,
      top: this.style.top - data.y / 2 * this.scale / this.cav.scaleNumber,
    };
    this.view.style.transform = `matrix(${this.viewScale}, 0, 0, ${this.viewScale},${this.style.left}, ${this.style.top})`;
  };
  canVasScale = (data) => {
    this.viewScale = 1 / (data - 0.1);
    this.view.style.transform =
        `matrix(${1 / (data - 0.1)}, 0, 0, ${1 / (data - 0.1)},${this.style.left}, ${this.style.top})`;
  };
  initMinMap = () => {
    // 获取画布的上层dom节点
    const { canvas } = this.cav;
    const parentDom = canvas.parentNode;
    parentDom.style.position = 'relative';
    // 创建缩略图的canvas
    this.createMinMapCanvas(parentDom);
    this.initListener();
    // 简易模式，关闭所有的编辑拖拽样式等
    const data = this.filterData(this.cav.renderData);
    this.tempCanvas = new this.Canvas(data,
        { id: 'test', mode: 'simple', w: 200, h: 200, tableCell: false });
    this.calcData(data);
  };
  initListener = () => {
    this.view.onmouseleave = () => {
      this.drag = false;
    };
    this.view.onmousemove = (e) => {
      if (this.drag) {
        const { clientX, clientY } = this.startDragData;
        const tempOffset = {
          x: e.clientX - clientX,
          y: e.clientY - clientY,
        };
        this.startDragData = {
          clientX: e.clientX,
          clientY: e.clientY,
        };
        let left = tempOffset.x;
        let top = tempOffset.y;
        this.style = {
          left: this.style.left + left,
          top: this.style.top + top,
        };
        this.view.style.transform = `matrix(${this.viewScale}, 0, 0, ${this.viewScale},${this.style.left}, ${this.style.top})`;
        this.cav.matrix[4] -= tempOffset.x * 2 / this.scale * this.cav.scaleNumber;
        this.cav.matrix[5] -= tempOffset.y * 2 / this.scale * this.cav.scaleNumber;
        this.cav.reverseMatrix[4] += tempOffset.x * 2 / this.scale * this.cav.scaleNumber;
        this.cav.reverseMatrix[5] += tempOffset.y * 2 / this.scale * this.cav.scaleNumber;
        this.cav.refresh();
      }
    };
    this.view.onmousedown = (e) => {
      this.startDragData = {
        clientX: e.clientX,
        clientY: e.clientY,
      };
      this.drag = true;
    };
    this.view.onmouseup = () => {
      this.drag = false;
    };
  };
  createMinMapCanvas = (parentDom) => {
    const minMapContainer = document.createElement('div');
    minMapContainer.setAttribute('class', 'minmap-container');
    parentDom.appendChild(minMapContainer);
    // view
    const view = document.createElement('div');
    view.setAttribute('class', 'minmap-view');
    minMapContainer.appendChild(view);
    this.view = view;
    // canvas
    const minMapCanvas = document.createElement('canvas');
    minMapCanvas.setAttribute('class', 'minmap-canvas');
    minMapCanvas.setAttribute('id', 'test');
    minMapCanvas.setAttribute('width', '200');
    minMapCanvas.setAttribute('height', '200');
    minMapContainer.appendChild(minMapCanvas);
  };
  filterData = ({nodes, edges}) => {
    return {
      edges: edges.map(e => ({...e, strokeStyle: ''})), // 清除多余的样式
      nodes: nodes.map(e => ({...e, strokeStyle: ''})), // 清除多余的样式
    };
  };
  calcData = ({nodes, edges}) => {
    // 按比例缩放数据
    // 计算比例 获取最小的坐标 和最大的坐标 与宽高都是两百的缩略图进行比较
    // 连接线所有的锚点 所有节点的坐标
    const allPointers = edges
      .reduce((a, b) => a.concat(b.pointers), [])
      .concat(nodes
        .reduce((a, b) => a.concat([
          {x: b.x + b.width, y: b.y}, // 节点左下角
          {x: b.x, y: b.y + b.height}, // 节点右上角
          ]), []));
    // 获取最小的x, 最大的x
    if (allPointers.length > 0) {
      const sortX = allPointers.sort((a, b) => b.x - a.x);
      const maxX = sortX[0].x;
      const minX = sortX[allPointers.length - 1].x;
      const offsetX = maxX - minX;
      // 获取最小的y, 最大的y
      const sortY = allPointers.sort((a, b) => b.y - a.y);
      const maxY = sortY[0].y;
      const minY = sortY[allPointers.length - 1].y;
      const offsetY = maxY - minY;
      const xScale = offsetX / 200;
      const yScale = offsetY / 200;
      const realScale = (xScale > yScale) ? xScale : yScale;
      // 默认的缩放量
      const maxScale = ((this.cav.canvasH > this.cav.canvasW) ?
          this.cav.canvasH : this.cav.canvasW) / 200;
      // 缩放关系图
      const scale = 1 / (realScale < maxScale ? maxScale : realScale);
      const finalOffsetX = this.tempCanvas.canvasW - ((maxX - minX) / 2 + minX) * scale;
      const finalOffsetY = this.tempCanvas.canvasH - ((maxY - minY) / 2 + minY) * scale;
      if (this.scale !== scale) {
        this.tempCanvas.matrix = [scale, 0, 0, scale, 0, 0];
        this.view.style.width = `${this.cav.canvasW * scale}px`;
        this.view.style.height = `${this.cav.canvasH * scale}px`;
        this.scale = scale;
        this.style = {
          left: 0, //finalOffsetX,
          top: 0, //finalOffsetY - this.cav.canvasH * scale / 2,
        };
        this.view.style.transform = `matrix(1, 0, 0, 1,${0}, ${0})`;
      }
      this.tempCanvas.draw(nodes, edges);
    }
  }
}
