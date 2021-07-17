import { Graph } from '@antv/x6';

Graph.registerEdge('erdRelation-img', {
  inherit: 'edge',
  router: {
    name: 'manhattan',
    args: {
      excludeShapes: ['group-img'],
    },
  },
  zIndex: 2,
  attrs: {
    line: {
      refX: 10,
      refY: 8,
      strokeWidth: 1,
      stroke: '#ACDAFC',
    },
  },
});
