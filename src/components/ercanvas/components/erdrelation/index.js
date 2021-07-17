import { Graph } from '@antv/x6';

Graph.registerMarker('relation', (args) => {
  const { relation, fillColor, ...attrs} = args;
  const r = 4;
  const x = 4;
  const y = 0;
  const relationArrow = {
    n: `M${x + 2 * r + 1},${y - r}a ${r},${r},0,1,1,0,${2 * r}a ${r},${r},0,1,1,0,${-2 * r}M ${x + r + 1},${r + 1}L ${x + r + 1},${-r - 1}M ${x + r + 1},${y}L ${y},-${r}M ${x + r + 1},${y}L ${y},${r} z`,
    '0,1' : `M${x + 2 * r + 1},${y - r}a ${r},${r},0,1,1,0,${2 * r}a ${r},${r},0,1,1,0,${-2 * r}M ${x + r + 1},${r + 1}L ${x + r + 1},${-r - 1} z`,
    '0,n' : `M${x + 2 * r + 1},${y - r}a ${r},${r},0,1,1,0,${2 * r}a ${r},${r},0,1,1,0,${-2 * r}M ${x + r + 1},${r + 1}L ${x + r + 1},${-r - 1}M ${x + r + 1},${y}L ${y},-${r}M ${x + r + 1},${y}L ${y},${r} z`,
    1 : `M ${x + r + 1},${r + 1}L ${x + r + 1},${-r - 1} z`,
    '1,n' : `M ${x + r + 1},${r + 1}L ${x + r + 1},${-r - 1}M ${x + r + 1},${y}L ${y},-${r}M ${x + r + 1},${y}L ${y},${r} z`,
    0 : `M${x},${y - r}a ${r},${r},0,1,1,0,${2 * r}a ${r},${r},0,1,1,0,${-2 * r}`,
  };
  return {
    ...attrs, // 原样返回非特殊涵义的参数
    tagName: 'path',
    fill: '#fff',  // 使用自定义填充色
    stroke: fillColor || '#ACDAFC', // 使用自定义边框色
    d: relationArrow[relation],
  };
});

Graph.registerEdge('erdRelation', {
  inherit: 'edge',
  router: {
    name: 'manhattan',
    args: {
      excludeShapes: ['group'],
    },
  },
  zIndex: 2,
  propHooks(metadata) {
    const { relation, fillColor, ...others } = metadata;
    if (relation) {
      return {
        ...metadata,
        attrs: {
          line: {
            stroke: fillColor,
            sourceMarker: {
              fillColor,
              relation: relation.split(':')[0],
            },
            targetMarker: {
              fillColor,
              relation: relation.split(':')[1],
            },
          },
        },
      };
    }
    return others;
  },
  attrs: {
    line: {
      strokeWidth: 1,
      stroke: '#ACDAFC',
      sourceMarker: {
        name: 'relation',
      },
      targetMarker: {
        name: 'relation',
      },
    },
  },
});
