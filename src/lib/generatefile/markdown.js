/* eslint-disable */
import _object from 'lodash/object';

const groupList = '分组清单';
const relation = '关联关系';
const tableList = '表清单';
const tableColumnList = '表列清单';

const name = '名称';
const code = '代码';
const dataType = '数据类型';
const main = '主键';
const remark = '备注';

const getFieldType = (datatypes, type, code) => {
  const data = (datatypes || []).filter(dt => dt.defKey === type)[0];
  return data?.[code] || type;
};

const escapingChar = (str) => {
// \   反斜线
//     `   反引号
// *   星号
// _   下划线
// {}  大括号
// []  中括号
// ()  小括号
// #   井号
// +   加号
// -   减号（连字符）
// .   句点
// !   感叹号
// 针对某些markdown编辑器无法正确显示特殊字符的情况，需要给特殊字符添加转义字符
  return str.replace(/[`*_{}[\]()#+-.!]/g, (a) => {
    return `\\${a}`;
  });
};

const generateHeader = (dataSource) => {
  /*
  - ### 1.分组清单
	- #### [1.1. 测试分组](#groupTset "测试分组")
		- ##### 1.1.1. 关联关系
		- ##### 1.1.2. 表清单
		- ##### 1.1.3. 表列清单
			- ###### 1.1.3.1. 用户信息表1
			- ###### 1.1.3.1. 用户信息表2
			- ###### 1.1.3.1. 用户信息表3
   */
  let groupString = ` - ### 1. ${groupList}\n`;
  const viewGroups = _object.get(dataSource, 'viewGroups', []);
  viewGroups.forEach((group, index) => {
    const entityRefs = _object.get(group, 'refEntities', []);
    const entities = (dataSource?.entities || []).filter(e => entityRefs.includes(e.defKey));
    groupString += `- [<h4 id="group-${group.defKey}-from">1.${index + 1}. ${escapingChar(group.defName || group.defKey)}</h4>](#group-${group.defKey} "${group.defKey}")\n`;
    groupString += `\t- [<h5 id="group-${group.defKey}-relation}-from">1.${index + 1}.1. ${relation}</h5>](#group-${group.defKey}-relation "${relation}")\n`;
    groupString += `\t- [<h5 id="group-${group.defKey}-tableList-from">1.${index + 1}.2. ${tableList}</h5>](#group-${group.defKey}-tableList "${tableList}")\n`;
    groupString += `\t- [<h5 id="group-${group.defKey}-tableColumnList-from">1.${index + 1}.3. ${tableColumnList}</h5>](#group-${group.defKey}-tableColumnList "${tableColumnList}")\n`;
    entities.forEach((entity, entityIndex) => {
      groupString += `\t\t- [<h6 id="group-${group.defKey}-tableColumnList-${entity.defKey}-from">1.${index + 1}.3.${entityIndex + 1} ${escapingChar(entity.defKey)}【${entity.defName || ''}】</h6>](#group-${group.defKey}-tableColumnList-${entity.defKey} "${entity.defKey}")\n`
    })
  });
  return groupString;
};

const generateTableListTable = (dataSource, groupKey) => {
  /*
  |  名称 | 代码  |
  | ------------ | ------------ |
  | 用户信息  | userManage  |
   */
  let tableString = `| ${name} | ${code} | ${remark} |\n`;
  tableString += `| ------------ | ------------ | ------------ |\n`;
  const viewGroups = _object.get(dataSource, 'viewGroups', []);
  viewGroups.forEach((group) => {
    if (group.defKey === groupKey) {
      const entityRefs = _object.get(group, 'refEntities', []);
      const entities = (dataSource?.entities || []).filter(e => entityRefs.includes(e.defKey));
      entities.forEach((entity) => {
        tableString += `| ${entity.defName || ''} | ${escapingChar(entity.defKey)} | ${entity.comment || ''} |\n`;
      })
    }
  });
  return tableString;
};

const generateTableColumnListTable = (dataSource, groupKey, tableKey) => {
  /*
  |  名称 | 代码  |
  | ------------ | ------------ |
  | 用户信息  | userManage  |
   */
  const datatypes = _object.get(dataSource, 'dataTypeMapping.mappings', []);
  const defaultDb = _object.get(dataSource, 'profile.default.dbs', '');
  let tableString = `| ${code} | ${name} | ${dataType}${defaultDb} | ${main} | ${remark} |\n`;
  tableString += `| ------------ | ------------ | ------------ | ------------ | ------------ |\n`;
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
            tableString += `| ${escapingChar(field.defKey)} | ${field.defName || ''} | ${fieldType} | ${field.primaryKey && '√' || ''} | ${field.comment || ''} |\n`;
          });
        }
      })
    }
  });
  return tableString;
};

const generateRelation = (groupKey, images) => {
  /*
  ![Alt text](/path/to/img.jpg "Optional title")
   */
  if (images[groupKey]) {
    return images[groupKey]
      .map((i) => `\n![image](${i})\n`)
      .join('\n');
  }
  return `\n该模块未配置关系图\n`;
};

const generateModuleBody = (dataSource, images = []) => {
  /*
  ---
### 1. 分组清单
#### 1.1. 测试分组
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
  let groupsString = `  ---\n\n`;
  groupsString += `### 1. ${groupList}\n`;
  const viewGroups = _object.get(dataSource, 'viewGroups', []);
  // 循环所有的分组
  // 生成关系图
  // 生成该分组的表清单
  viewGroups.forEach((group, index) => {
    groupsString += ` - [<h4 id="group-${group.defKey}">1.${index + 1}. ${group.defName || group.defKey}</h4>](#group-${group.defKey}-from)\n`;
    // 关系图
    groupsString += ` - [<h5 id="group-${group.defKey}-relation">1.${index + 1}.1 ${relation}</h5>](#group-${group.defKey}-relation-from)\n`;
    groupsString += ` ---\n\n`;
    if (index === 0){
      groupsString += `${generateRelation(group.defKey, images)}\n`;
    }
    groupsString += ` ---\n\n`;
    // 表清单
    groupsString += ` - [<h5 id="group-${group.defKey}-tableList">1.${index + 1}.2 ${tableList}</h5>](#group-${group.defKey}-tableList-from)\n\n`;

    groupsString += ` ---\n\n`;
    groupsString += `${generateTableListTable(dataSource, group.defKey)}\n`;
    groupsString += ` ---\n\n`;
    // 列清单
    // 循环所有的表
    groupsString += ` - [<h5 id="group-${group.defKey}-tableColumnList">1.${index + 1}.3 ${tableColumnList}</h5>](#group-${group.defKey}-tableColumnList-from)\n\n`;
    groupsString += ` ---\n\n`;
    const entityRefs = _object.get(group, 'refEntities', []);
    const entities = (dataSource?.entities || []).filter(e => entityRefs.includes(e.defKey));
    entities.forEach((entity) => {
      groupsString += ` - [<h6 id="group-${group.defKey}-tableColumnList-${entity.defKey}">${entity.defKey}【${entity.defName || ''}】</h6>](#group-${group.defKey}-tableColumnList-${entity.defKey}-from)\n\n`;
      groupsString += `${generateTableColumnListTable(dataSource, group.defKey, entity.defKey)}\n`;
      groupsString += ` ---\n\n`;
    });
  });
  // 生成该分组的表列清单
  return groupsString;
};

export const markdown = (dataSource, images, projectName, callBack) => {
  const index = '## <center>目录</center>\n';
  const header = generateHeader(dataSource);
  const body = generateModuleBody(dataSource, images);
  callBack && callBack(`${index}${header}${body}`);
};
