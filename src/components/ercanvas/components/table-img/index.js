import React, { forwardRef } from 'react';
import { Graph } from '@antv/x6';
import '@antv/x6-react-shape';
import { separator } from '../../../../../profile';

const Table = forwardRef(({node}, ref) => {
  const data = node.data;
  const store = node.store;
  const id = node.id;
  const allFk = node?._model?.getIncomingEdges(id)?.map(t => t.getTargetPortId()
      .split(separator)[0]) || [];
  const calcFKPKShow = (f, h) => {
    if (h.refKey === 'primaryKey') {
      if (f[h.refKey]) {
        return '<PK>';
      } else if (allFk.includes(f.defKey)) {
        return '<FK>';
      }
    }
    return f[h.refKey];
  };
  const getTitle = () => {
    const tempDisplayMode = data.nameTemplate || '{defKey}[{defName}]';
    return tempDisplayMode.replace(/\{(\w+)\}/g, (match, word) => {
      return data[word] || data.defKey || '';
    });
  };
  return <div
    ref={ref}
    style={{
      background: '#FFFFFF',
      color: node.getProp('fontColor'),
      borderRadius: '5px',
      border: '1px solid #DFE3EB',
    }}
  >
    <div
      style={{
        background: node.getProp('fillColor') || '#DDE5FF',
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: '12px',
        borderRadius: '5px 5px 0 0',
        padding: '2px 0 2px 0',
      }}
    >
      {`${getTitle()}${store?.data.count > 0 ? `:${store?.data.count}` : ''}`}
    </div>
    <div>
      {
        data.fields.map((f) => {
          return <div
            key={`${f.defKey}${f.defName}`}
            style={{
              padding: '2.5px 4px 2.5px 4px',
              fontSize: '12px',
              lineHeight: '1.5',
            }}
            >
            {
              data.headers.map((h) => {
                return <span
                  style={{
                    width: data.maxWidth[h.refKey],
                    fontSize: '12px',
                    display: 'inline-block',
                    marginLeft: '8px',
                    WebkitTextFillColor: node.getProp('fontColor') || 'rgba(0,0,0,.65)',
                  }}
                  key={h.refKey}
                >
                  {calcFKPKShow(f, h)}
                </span>;
              })
            }
          </div>;
        })
      }
    </div>
  </div>;
});

Graph.registerNode('table-img', {
  inherit: 'react-shape',
  zIndex: 2,
  attrs: {
    body: {
      strokeWidth: 0,
    },
  },
  component: <Table/>,
});

