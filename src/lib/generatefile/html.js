import _object from 'lodash/object';

const relation = '关联关系';
const relationList = '关联关系清单';
const table = '数据表';
const tableList = '表清单';
const tableColumnList = '表列清单';
const view = '视图';
const viewList = '视图清单';
const viewColumnList = '视图列清单';
const dict = '字典';
const dictList = '字典清单';
const dictItemList = '字典条目清单';

const name = '名称';
const code = '代码';
const dataType = '数据类型';
const main = '主键';
const remark = '备注';

const generateHeader = (dataSource) => {
  let GroupsString = `<ul>\n`;
  const viewGroups = _object.get(dataSource, 'viewGroups', []);
  const generateHeaderIndex = (group, index, groupName, dataName, mainTitle, title, subTitle) => {
    const dataRefs = _object.get(group, name, []);
    const data = (dataSource[dataName] || []).filter(e => dataRefs.includes(e.defKey));
    GroupsString += `<ul>`;
    GroupsString += `<li class="second-li"><a class="group-list" href="#">${index} ${mainTitle}</a></li>\n`;
    GroupsString += `<ul>`;
    GroupsString += `<li class="second-li"><a class="group-list" id="group-${group.defKey}-tableList-from" href="#group-${group.defKey}-${dataName}-to">2 ${title}</a></li>\n`;
    GroupsString += `<li class="second-li"><a class="group-list" id="group-${group.defKey}-tableColumnList-from" href="#group-${group.defKey}-${groupName}-to">3 ${subTitle}</a>\n`;
    GroupsString += `<ul>`;
    data.forEach((d, dIndex) => {
      GroupsString += `<li class="third-li"><a id="group-${group.defKey}-tableColumnList-${d.defKey}-from" href="#group-${group.defKey}-${groupName}-${d.defKey}-to">3.${dIndex + 1} ${d.defKey}[${d.defName || ''}]</a></li>\n`
    });
    GroupsString += `</ul></li></ul></li>`;
    GroupsString += `</ul>`;
    GroupsString += `</ul>`;
  }
  viewGroups.forEach((group, index) => {
    GroupsString += `<li class="first-li"><a class="group" id="group-${group.defKey}-from" href="#group-${group.defKey}-to">${index + 1} ${group.defName || group.defKey}</a>\n`;
    generateHeaderIndex(group, 1, 'refDiagrams', 'diagrams', relation, relationList);
    generateHeaderIndex(group, 2, 'refEntities', 'entities', table, tableList, tableColumnList);
    generateHeaderIndex(group, 3, 'refViews', 'views', view, viewList, viewColumnList);
    generateHeaderIndex(group, 4, 'refDicts', 'dicts', dict, dictList, dictItemList);
  });
  return `${GroupsString}</ul>\n`;
};

const generateTableListTable = (dataSource, groupKey) => {
  /*
  |  名称 | 代码  |
  | ------------ | ------------ |
  | 用户信息  | userManage  |
   */
  let tableString = `<table border="1" cellspacing="0">\n`;
  tableString += `<tr class="first-tr"><td>${name}</td><td>${code}</td><td>${remark}</td></tr>\n`;
  const viewGroups = _object.get(dataSource, 'viewGroups', []);
  const entities = _object.get(dataSource, 'entities', []);
  viewGroups.forEach((group) => {
    if (group.defKey === groupKey) {
      const currentEntities = entities.filter(e => (group?.refEntities || []).includes(e.defKey));
      currentEntities.forEach((entity) => {
        tableString += `<tr><td>${entity.defName || entity.defKey}</td><td>${entity.defKey}</td><td>${entity.comment || ''}</td></tr>\n`;
      })
    }
  });
  return `${tableString}</table>`;
};

const generateTableColumnListTable = (dataSource, groupKey, tableKey) => {
  /*
  |  名称 | 代码  |
  | ------------ | ------------ |
  | 用户信息  | userManage  |
   */
  const defaultDb = _object.get(dataSource, 'profile.default.dbs', '');
  let tableString = `<table border="1" cellspacing="0">\n`;
  tableString += `<tr class="first-tr"><td>${code}</td><td>${name}</td><td>${dataType}${defaultDb}</td><td>${main}</td><td>${remark}</td></tr>\n`;
  const viewGroups = _object.get(dataSource, 'viewGroups', []);
  viewGroups.forEach((group) => {
    if (group.defKey === groupKey) {
      const entities = _object.get(dataSource, 'entities', []);
      entities.forEach((entity) => {
        if (entity.defKey === tableKey) {
          // 循环实体的属性
          (entity.fields || []).forEach((field) => {
            // 获取每一个属性对应的每一个数据的数据类型
            const fieldType = field.type;
            tableString += `<tr><td>${field.defKey}</td><td>${field.defName || ''}</td><td>${fieldType}</td><td>${field.primaryKey && '√' || ''}</td><td>${field.comment || ''}</td></tr>\n`;
          });
        }
      })
    }
  });
  return `${tableString}</table>`;
};

const generateRelation = (group, images) => {
  /*
  ![Alt text](/path/to/img.jpg "Optional title")
   */
  if (images[group.defKey]) {
    return images[group.defKey]
      .map((i, index) => `<img style="width: 98%;margin-top: 10px" src="${i}" title="${group.defName}-关系图-${index + 1}"/>`)
      .join('\n');
  }
  return `<span>该模块未配置关系图</span>`;
};

const generateModuleBody = (dataSource, images = {}) => {
  /*
  ---
### 1. 模块清单
#### 1.1. 测试模块
 - #### 1.1.1 关联关系
 - #### 1.1.2 表清单
 ---
|  名称 | 代码  |
| ------------ | ------------ |
| 用户信息  | userManage  |
---

 - #### 1.1.3 列清单

 ---
 - ##### 用户信息表1

 ---
 - ##### 用户信息表2

 ---
 - ##### 用户信息表3

 ---

   */
  let groupsString = `<ul>\n\n`;
  const viewGroups = _object.get(dataSource, 'viewGroups', []);
  // 循环所有的模块
  // 生成关系图
  // 生成该模块的表清单
  viewGroups.forEach((group, index) => {
    groupsString += `<li class="first-li"><a class="group" id="group-${group.defKey}-to" href="#group-${group.defKey}-from">${index + 1} ${group.defName || group.defKey}</a><ul>\n`;
    groupsString += `<li class="second-li"><a class="group-list" class="block" id="group-${group.defKey}-relation-to" href="#group-${group.defKey}-relation-from">${index + 1}.1 ${relationList}</a>\n`;
    groupsString += `${generateRelation(group, images)}\n`;
    groupsString += `</li><hr>\n`;
    // 表清单
    groupsString += `<li><a class="group-list" id="group-${group.defKey}-tableList-to" href="group-${group.defKey}-tableList-from">${index + 1}.2  ${tableList}</a>\n\n`;

    groupsString += `\n\n`;
    groupsString += `${generateTableListTable(dataSource, group.defKey)}\n`;
    groupsString += `</li><hr>\n\n`;
    // 列清单
    // 循环所有的表
    groupsString += `<li><a class="group-list" id="group-${group.defKey}-tableColumnList-to" href="group-${group.defKey}-tableColumnList-from">${index + 1}.3 ${tableColumnList}</a>\n\n`;
    const entityRefs = _object.get(group, 'refEntities', []);
    const entities = (dataSource?.entities || []).filter(e => entityRefs.includes(e.defKey));
    groupsString += `<ul style="padding: 0">`;
    entities.forEach((entity, entityIndex) => {
      groupsString += ` <li><a class="block" id="group-${group.defKey}-tableColumnList-${entity.defKey}-to" href="group-${group.defKey}-tableColumnList-${entity.defKey}-from">${index + 1}.3.${entityIndex + 1} ${entity.defKey}[${entity.defName || ''}]</a>\n\n`;
      groupsString += `${generateTableColumnListTable(dataSource, group.defKey, entity.defKey)}\n`;
      groupsString += `</li>\n\n`;
    });
    groupsString += '</ul></li></ul><hr></li>'
  });
  // 生成该模块的表列清单
  return `${groupsString}</ul>`;
};

export const html = (dataSource, images, projectName, callBack) => {
  // 初始化去除body的其他内容
  const defaultData = `<!DOCTYPE html>
<html lang="zh">
<head>
    <meta charset="UTF-8">
    <title>${projectName}</title>
    <style>
        .index {
            font-weight: bold;
            font-size: 25px;
        }
        li {
            list-style: none;
            padding: 5px;
        }
        .first-li {
            font-weight: bold;
            font-size: 20px;
        }
        .second-li {
            font-weight: bold;
        }
        .third-li {
            font-weight: normal;
        }
        .block {
            display: block;
        }
        table {
            width: 100%;
            margin-top: 10px;
            border-color: #E8E8E8;
        }
        .first-tr {
            text-align: center;
        }
        tr:hover {
            background: #ECF9FF;
        }
        td {
            font-weight: normal;
            padding: 5px;
            white-space: nowrap;
        }
        a {
            color: #000000;
            background-color: transparent;
            text-decoration: none;
            outline: none;
            cursor: pointer;
        }
        .group {
            color: green;
        }
        .group-list {
            color: #1890ff;
        }
    </style>
</head>
<body>`;
  const index = '<center class="index">目录</center>\n';
  const header = generateHeader(dataSource);
  const body = generateModuleBody(dataSource, images);
  const endTag = "</body>\n" +
    "</html>";
  callBack && callBack(`${defaultData}${index}<hr>${header}<hr>${body}${endTag}`);
};
