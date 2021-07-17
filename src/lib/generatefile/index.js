import React from 'react';
import ReactDom from 'react-dom';
import { html } from './html';
import { markdown } from './markdown';
import { projectSuffix } from '../../../profile';
import { saveFile } from '../middle';
import { Message, FormatMessage, ErCanvas } from 'components';

const getProjectName = (path = '') => {
  // 1.不同的操作系统文件名的分隔符不同 此处需要统一转化为'\'
  const realPath = path.replace('/', '\\');
  const paths = realPath.split('\\');
  return paths[paths.length - 1].split(`.${projectSuffix}.json`)[0];
};

export const generateFile = (fileType, dataSource, projectInfo) => {
  // 生成各类文件 总入口
  // 1.生成每个分组的关系图
  const name = getProjectName(projectInfo);
  // 分析所有分组数据，需要创建空白分组来存储未分组数据（默认空白分组置于最后）
  const tempViewGroups = (dataSource?.viewGroups || []);
  const getNoGroupData = (name, groupName) => {
    const currentGroup = tempViewGroups
        .reduce((a, b) => a.concat(b[groupName]), [])
    return dataSource[name].filter(d => !currentGroup.includes(d.defKey)).map(d => d.defKey);
  };
  const tempGroup = {
    defKey: '__defaultGroup',
    defName: '默认分类',
    refEntities: getNoGroupData('entities', 'refEntities'),
    refViews: getNoGroupData('views', 'refViews'),
    refDiagrams: getNoGroupData('diagrams', 'refDiagrams'),
    refDicts: getNoGroupData('dicts', 'refDicts'),
  };
  const tempDataSource = {
    ...dataSource,
    viewGroups: tempViewGroups.concat(tempGroup),
  };
  const renderGraph = (data) => {
    const div = document.createElement('div');
    document.body.appendChild(div);
    ReactDom.render(<ErCanvas
        width={100}
        height={100}
        dataSource={dataSource}
        data={data}
    />, div);
  };
  new Promise((res) => {
    const graphCanvas = tempDataSource.viewGroups.reduce((a, b) => {
      const tempA = {...a};
      tempA[b?.defKey] = (tempDataSource?.diagrams || [])
        .filter(d => b?.refDiagrams.includes(d.defKey))
        .map(d => d.canvasData || {})
        .filter(data => data?.cells?.length > 0).map((data) => {
          console.log(data);
        });
      return tempA;
    }, {});
    if (fileType === 'html'){
      html(tempDataSource, graphCanvas, name, (htmlString) => {
        res({
          data: htmlString,
          file: 'html',
        });
      });
    } else if (fileType === 'markdown') {
      markdown(tempDataSource, graphCanvas, name, (markString) => {
        res({
          data: markString,
          file: 'md',
        });
      });
    }
  }).then(({data, file}) => {
    saveFile(data, [{ name: file, extensions: [file]}], null, { defaultPath: name }).then(() => {
      Message.success({title: FormatMessage.string({id: 'optSuccess'})});
    }).catch(err => {
      Message.error({title: FormatMessage.string({id: 'optFail'})});
    });
  });
};
