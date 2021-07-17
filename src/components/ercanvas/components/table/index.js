import React, { forwardRef } from 'react';
import { Graph } from '@antv/x6';
import '@antv/x6-react-shape';
import { separator } from '../../../../../profile';
import './style/index.less';
import {hex2Rgba} from '../../../../lib/color';

const Table = forwardRef(({node}, ref) => {
  const data = node.data;
  const store = node.store;
  const id = node.id;
  const allFk = node?._model?.getIncomingEdges(id)?.map(t => t.getTargetPortId()
      .split(separator)[0]) || [];
  const onDragOver = (e) => {
    e.preventDefault();
  };
  const onDrop = (e) => {
    store?.data?.updateFields(store.data.originKey, JSON.parse(e.dataTransfer.getData('fields')));
  };
  const validateSelected = (f, {targetPort, sourcePort}) => {
    const fieldTargetPort = `${f.defKey}${separator}in`;
    const fieldSourcePort = `${f.defKey}${separator}out`;
    return targetPort === fieldTargetPort
        || targetPort === fieldSourcePort
        || sourcePort === fieldTargetPort
        || sourcePort === fieldSourcePort;
  };
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
  const calcColor = () => {
    const color = node.getProp('fillColor') || '#DDE5FF';
    if (color.startsWith('#')) {
      return hex2Rgba(color, 0.05);
    }
    const tempColor = color.replace(/rgb?\(/, '')
        .replace(/\)/, '')
        .replace(/[\s+]/g, '')
        .split(',');
    return `rgba(${tempColor.join(',')}, 0.05)`;
  };
  return <div
    ref={ref}
    className='chiner-er-table'
    onDragOver={onDragOver}
    onDrop={onDrop}
    style={{color: node.getProp('fontColor')}}
  >
    <div
      className='chiner-er-table-header'
      style={{background: node.getProp('fillColor')}}
    >
      {`${getTitle()}${store?.data.count > 0 ? `:${store?.data.count}` : ''}`}
    </div>
    <div
      className='chiner-er-table-body'
      style={{background: calcColor()}}
    >
      {
        data.fields.map((f) => {
          return <div
            key={`${f.defKey}${f.defName}`}
            className={`${validateSelected(f, store.data) ? 'chiner-er-table-body-selected' : ''} ${f.primaryKey ? 'chiner-er-table-body-primary' : ''}`}>
            {
              data.headers.map((h) => {
                return <span
                  style={{width: data.maxWidth[h.refKey]}}
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

Graph.registerNode('table', {
  inherit: 'react-shape',
  zIndex: 2,
  attrs: {
    body: {
      stroke: '#DFE3EB',  // 边框颜色
      strokeWidth: 2,
      rx: 5,
      ry: 5,
    },
  },
  component: <Table/>,
});


/*Graph.registerNode('table', {
  zIndex: 2,
  //inherit: 'rect',
  propHooks(metadata){
    const { data, count, fillColor, fontColor, headerWidth, size, ...rest } = metadata;
    if (data) {
      const column = [];
      console.log(size.width, data.headers
          .reduce((a, b) => a + data.maxWidth[b.refKey], (data.headers.length - 1) * 5));
      const calcFKPKShow = (f, h) => {
        /!*if (h.refKey === 'primaryKey') {
          if (f[h.refKey]) {
            return '<PK>';
          }
          return '<FK>';
        }*!/
        return f[h.refKey] || '';
      };
      const attrs = {
        header: {
          text: `${data.defKey}${count > 0 ? `:${count}` : ''}(${data.defName})`,
          x: (size.width / 2) - (data.headerWidth / 2),
          y: 20,
          fill: fontColor || 'rgba(0,0,0,0.85)',
          fontSize: 12,
        },
      };
      const calcX = (hI, x) => {
        if (hI === 0) {
          return x;
        }
        const preHeaders = (data.headers || []).slice(0, hI);
        return preHeaders.reduce((a, b) => {
          return a + data.maxWidth[b.refKey];
        }, x + 10 * preHeaders.length);
      };
      const calcAttrs = (f, i, h, hI, x, y) => {
        const name = `${i}-${hI}`;
        attrs[name] = {
          text: calcFKPKShow(f, h),
          x: calcX(hI, x),
          y: y + 13,
          fill: fontColor || 'rgba(0,0,0,0.85)',
          fontSize: 12,
        };
        return name;
      };
      const markup = [
        {
          tagName: 'rect',
          attrs: {
            stroke: '#DFE3EB',  // 边框颜色
            strokeWidth: 2,
            fill: fillColor || '#ACDAFC',
            x: 0,
            y: 0,
            width: size.width,
            height: size.height,
          },
        },
        {
          tagName: 'text',
          selector: 'header',
        },
        {
          tagName: 'line',
          attrs: {
            x1: 8,
            x2: size.width - 8,
            y1: 24,
            y2: 24,
            stroke: fontColor || 'rgba(0,0,0,0.85)',
            'stroke-width': 1,
          },
        },
      ].concat((data.fields || []).map((f, i) => {
        const x = 8;
        const y = 26 + 18 * i + 5 * (i + 1);
        column.push(...(data.headers || []).map((h, hI) => {
          return {
            tagName: 'text',
            selector: calcAttrs(f, i, h, hI, x, y),
          };
        }));
        return {
          tagName: 'rect',
          attrs: {
            x,
            y,
            width: size.width - 16,
            height: 18,
            fill: fillColor || '#ACDAFC',
          },
        };
      })).concat(column);
      return {
        ...rest,
        attrs,
        markup,
        size,
      };
    }
    return rest;
  },
  //component: <Table/>,
});*/
