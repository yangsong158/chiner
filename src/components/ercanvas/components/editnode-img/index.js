import React, { forwardRef } from 'react';
import { Graph, Markup } from '@antv/x6';
import '@antv/x6-react-shape';

const EditNode = forwardRef(({node}, ref) => {
  const label = node.getProp('label');
  return <div
    ref={ref}
    style={{
        background: node.getProp('fillColor') || '#FFFFFF',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: node.shape === 'group-img' ? 'start' : 'center',
        width: '100%',
        height: '100%',
        fontSize: '12px',
        borderRadius: node.shape === 'edit-node-circle-img' ? '10px' : '0px',
        border: node.shape === 'group-img' ? '1px dashed #DFE3EB' : '1px solid #DFE3EB',
      }}
  >
    <pre style={{WebkitTextFillColor: node.getProp('fontColor') || 'rgba(0,0,0,.65)'}}>
      {label}
    </pre>
  </div>;
});

Graph.registerNode('edit-node-img', {
  inherit: 'react-shape',
  zIndex: 2,
  attrs: {
    body: {},
  },
  portMarkup: [Markup.getForeignObjectMarkup()],
  component: <EditNode/>,
});

Graph.registerNode('edit-node-circle-img', {
  zIndex: 2,
  inherit: 'react-shape',
  attrs: {
    /*body: {
      rx: 10,
      ry: 10,
    },*/
  },
  portMarkup: [Markup.getForeignObjectMarkup()],
  component: <EditNode/>,
});

Graph.registerNode('group-img', {
  inherit: 'react-shape',
  zIndex: 1,
  attrs: {
    body: {},
  },
  component: <EditNode/>,
});
