import {Graph} from '@antv/x6';
import _ from 'lodash/object';

import { calcCellData } from '../datasource_util';
import html2canvas from 'html2canvas';
import { saveTempImages } from '../middle';

export const img = (data, dataSource, needCalc = true, groups) => {
  return new Promise((res) => {
    const dom = document.createElement('div');
    dom.style.width = `${300}px`;
    dom.style.height = `${600}px`;
    document.body.appendChild(dom);
    const graph = new Graph({
      container: dom,
      async: true,
      autoResize: false,
      grid: false,
      scroller: {
        enabled: true,
      },
    });
    const cells = ((needCalc ? calcCellData(data, dataSource, null, groups) : data)).map((d) => {
      const other = {}
      if (d.shape === 'erdRelation') {
        const relation = d.relation.split(':');
        other.labels = [{
          attrs: {
            text: {
              text: (relation[0] || '').toLocaleUpperCase(),
            },
          },
          position: {
            distance: 10,
            offset: {
              x: 10,
              y: 8,
            },
          },
        },
          {
            attrs: {
              text: {
                text: (relation[1] || '').toLocaleUpperCase(),
              },
            },
            position: {
              distance: -10,
              offset: {
                x: 10,
                y: 8,
              },
            },
          }];
      }
      return {
        ..._.omit(d, ['attrs', 'component']),
        shape: `${d.shape}-img`,
        ...other,
      };
    });
    graph.on('render:done', () => {
      res(dom);
    });
    graph.fromJSON({cells});
    if (cells.length === 0) {
      res(dom);
    }
  })
};

export const imgAll = (dataSource) => {
  if ((dataSource.diagrams || []).length === 0){
    return new Promise((res, rej) => {
      saveTempImages([])
        .then((dir) => {
          res(dir);
        }).catch(err => rej(err));
    });
  }
  return new Promise((res, rej) => {
    Promise.all((dataSource.diagrams).map(d => {
      return new Promise((res, rej) => {
        const hiddenPort = {
          attrs: {
            circle: {
              r: 4,
              magnet: true,
              strokeWidth: 1,
              style: {
                visibility: 'hidden',
              },
            },
          },
          position: { name: 'absolute' },
          zIndex: 3,
        };
        img(d.canvasData.cells, dataSource, true, {
          in: {
            ...hiddenPort,
          },
          out: {
            ...hiddenPort,
          },
          extend: {
           ...hiddenPort,
          },
        }).then((dom) => {
          html2canvas(dom).then((canvas) => {
            document.body.removeChild(dom.parentElement.parentElement);
            const dataBuffer = Buffer.from(canvas.toDataURL('image/png')
                    .replace(/^data:image\/\w+;base64,/, ""),
                'base64');
            res({fileName: d.defKey, data: dataBuffer});
          });
        })
      });
    })).then((result) => {
      saveTempImages(result)
          .then((dir) => {
        res(dir);
      }).catch(err => rej(err));
    }).catch(err => rej(err));
  });
}

