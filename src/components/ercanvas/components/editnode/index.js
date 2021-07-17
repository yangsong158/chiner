import React, { forwardRef, useRef, useEffect } from 'react';
import { Graph, Markup } from '@antv/x6';
import FormatMessage from '../../../formatmessage';
import '@antv/x6-react-shape';
import './style/index.less';

const EditNode = forwardRef(({node}, ref) => {
  const label = node.getProp('label');
  const inputRef = useRef(null);
  const editable = node.getProp('editable');
  const onChange = () => {
    node.setProp('label', inputRef.current.value, { ignoreHistory : true});
  };
  useEffect(() => {
    if (editable) {
      inputRef.current.focus();
    }
  }, [editable]);
  return <div
    ref={ref}
    className={`chiner-er-editnode ${node.shape === 'edit-node-circle' ? 'chiner-er-editnode-circle' : ''}`}
    style={{
      background: node.getProp('fillColor'),
      color: node.getProp('fontColor'),
      zIndex: 10,
      alignItems: node.shape === 'group' ? 'start' : 'center',
    }}
  >
    {
      editable ? <textarea
        onChange={onChange}
        placeholder={FormatMessage.string({id: 'canvas.node.remarkPlaceholder'})}
        ref={inputRef}
        defaultValue={label}
      /> : <pre>
        {label}
      </pre>
    }
  </div>;
});

Graph.registerNode('edit-node', {
  inherit: 'react-shape',
  zIndex: 2,
  attrs: {
    body: {
      stroke: '#DFE3EB',  // 边框颜色
      strokeWidth: 1,
    },
  },
  portMarkup: [Markup.getForeignObjectMarkup()],
  component: <EditNode/>,
});

Graph.registerNode('edit-node-circle', {
  inherit: 'react-shape',
  zIndex: 2,
  attrs: {
    body: {
      stroke: '#DFE3EB',  // 边框颜色
      strokeWidth: 1,
      rx: 10,
      ry: 10,
    },
  },
  portMarkup: [Markup.getForeignObjectMarkup()],
  component: <EditNode/>,
});

Graph.registerNode('group', {
  inherit: 'react-shape',
  zIndex: 1,
  attrs: {
    body: {
      strokeDasharray: '5 5',
      strokeWidth: 1,
      stroke: '#000000',
    },
  },
  component: <EditNode/>,
});
