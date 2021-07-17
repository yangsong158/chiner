// 差异化数据转化成SQL或者代码信息

import _ from 'lodash/object';
import { Message, FormatMessage } from '../components';
import doT from 'dot';

import { separator, msgSeparator } from '../../profile';
import {firstUp} from './string';
export const packageDataSource = (dataSource) => {
  return {
    ...dataSource,
    entities: (dataSource?.entities || [])
  }
};
// 获取所有的数据表信息（包含真实的type）
const mapDataSourceEntities = (dataSource, datatype, domains, code, currentCode, path = 'entities') => {
  return _.get(dataSource, path, []).map((entity) => {
    return {
      ...entity,
      fields: (entity.fields || []).map(field => {
        return {
          ...field,
          type: getFieldType(datatype, domains, field, code, currentCode),
        }
      })
    }
  });
};
// 根据数据库类型 返回真实的数据类型
const getFieldType = (datatype, domains, field, code, currentCode) => {
  const domain = domains.filter(d => d.defKey === field.domain)[0];
  if (domain) {
    const type = datatype.filter(d => d.defKey === domain.applyFor)[0];
    if (type) {
      if (field.type !== type[currentCode]) {
        return field.type;
      } else {
        return type[code];
      }
    }
    return field.type;
  }
  return field.type;
};
// 根据模板数据生成代码
const getTemplateString = (template, templateData) => {
  const camel = (str, firstUpper) => {
    let ret = str.toLowerCase();
    ret = ret.replace( /_([\w+])/g, function( all, letter ) {
      return letter.toUpperCase();
    });
    if(firstUpper){
      ret = ret.replace(/\b(\w)(\w*)/g, function($0, $1, $2) {
        return $1.toUpperCase() + $2;
      });
    }
    return ret;
  };
  const underline = (str, upper) => {
    const ret = str.replace(/([A-Z])/g,"_$1");
    if(upper){
      return ret.toUpperCase();
    }else{
      return ret.toLowerCase();
    }
  };
  const upperCase = (str) => {
    return str.toLocaleUpperCase();
  };
  const lowerCase = (str) => {
    return str.toLocaleLowerCase();
  };
  const join = (...args) => {
    if(args.length<=2)return args[0];
    const datas = [];
    const delimter = args[args.length-1];
    for(let i=0;i<args.length-1;i++){
      if(/^\s*$/.test(args[i]))continue;
      datas.push(args[i]);
    }
    return datas.join(delimter);
  };
  const objectkit = {
    isJSON: function(obj) {
      var isjson = typeof(obj) == "object" && Object.prototype.toString.call(obj).toLowerCase() == "[object object]" && !obj.length;
      return isjson;
    },
    deepClone: function(obj) {
      return JSON.parse(JSON.stringify(obj));
    },
    equals: function(v1, v2) {
      if (typeof(v1) === "object" && objectkit.isJSON(v1) && typeof(v2) === "object" && objectkit.isJSON(v2)) {
        return JSON.stringify(v1) == JSON.stringify(v2);
      } else {
        return v1 == v2;
      }

    }
  };
  const getIndex = (array, arg, n) => {
    var i = isNaN(n) || n < 0 ? 0 : n;
    for (; i < array.length; i++) {
      if (array[i] == arg) {
        return i;
      } else if (typeof(array[i]) === "object" && objectkit.equals(array[i], arg)) {
        return i;
      }
    }
    return -1;
  };
  const contains = (array, obj) => {
    return getIndex(array, obj) >= 0;
  };
  const uniquelize = (array) => {
    var copy = clone(array);
    const temp = [];
    for (var i = 0; i < copy.length; i++) {
      if (!contains(temp, copy[i])) {
        temp.push(copy[i]);
      }
    }
    return temp;
  };
  const clone = (array) => {
    var cloneList = Array();
    for (var i = 0, a = 0; i < array.length; i++) {
      cloneList.push(array[i]);
    }
    return cloneList;
  };
  const each = (array, fn) => {
    fn = fn || Function.K;
    var a = [];
    var args = Array.prototype.slice.call(arguments, 1);
    for (var i = 0; i < array.length; i++) {
      var res = fn.apply(array, [array[i], i].concat(args));
      if (res != null) a.push(res);
    }
    return a;
  };
  const intersect = (array1, array2) => {
    // 交集
    const copy = clone(array1);
    const r = each(uniquelize(copy), function(o) { return contains(array2, o) ? o : null });
    return [].concat(r);
  };
  const union = (array1, array2) => {
    var copy = clone(array1);
    var r = uniquelize(copy.concat(array2));
    return [].concat(r);
  };
  const minus = (array1, array2) => {
    var copy = clone(array1);
    var r = each(uniquelize(copy), function(o) { return contains(array2, o) ? null : o });
    return [].concat(r);
  };
  const tplText = template.replace(/(^\s*)|(\s*$)/g, "");
  const conf = {
    evaluate:    /\{\{([\s\S]+?)\}\}/g,
    interpolate: /\{\{=([\s\S]+?)\}\}/g,
    encode:      /\{\{!([\s\S]+?)\}\}/g,
    use:         /\{\{#([\s\S]+?)\}\}/g,
    define:      /\{\{##\s*([\w\.$]+)\s*(\:|=)([\s\S]+?)#\}\}/g,
    conditional: /\{\{\?(\?)?\s*([\s\S]*?)\s*\}\}/g,
    iterate:     /\{\{~\s*(?:\}\}|([\s\S]+?)\s*\:\s*([\w$]+)\s*(?:\:\s*([\w$]+))?\s*\}\})/g,
    varname: 'it',
    strip: false,
    append: true,
    doNotSkipEncoded:false,
    selfcontained: false
  };
  let resultText = doT.template(tplText, conf)({
    ...templateData,
    func: {
      camel: camel,
      underline: underline,
      upperCase: upperCase,
      lowerCase: lowerCase,
      join: join,
      intersect: intersect,
      union: union,
      minus: minus,
    }
  });
  resultText = resultText.replace(/\n(\n)*( )*(\n)*\n/g,"\n");  //删除空行
  resultText = resultText.replace(/\$blankline/g,'');              //单独处理需要空行的情况
  return resultText;
};
// 生成增量代码数据
const generateIncreaseSql = (dataSource, group, dataTable, code, templateShow) => {
  const currentCode = _.get(dataSource, 'profile.default.db', '');
  const datatype = _.get(dataSource, 'dataTypeMapping.mappings', []);
  const domains = _.get(dataSource, 'domains', []);
  // 获取该数据库下的模板信息
  const allTemplate = _.get(dataSource, 'profile.codeTemplates', []);
  const template = allTemplate.filter(t => t.applyFor === code)[0]?.[templateShow] || '';
  const sqlSeparator = _.get(dataSource, 'profile.sql.delimiter', ';');
  // 构造新的数据表传递给模板
  const tempDataTable = {
    ...dataTable,
    fields: (dataTable.fields || []).map(field => {
      return {
        ...field,
        type: getFieldType(datatype, domains, field, code, currentCode),
      }
    })
  };
  const templateData = {
    entity: tempDataTable,
    group,
    separator: sqlSeparator
  };
  return getTemplateString(template, templateData);
};
// 获取所有变更数据代码
const generateUpdateSql = (dataSource, changesData = [], code, oldDataSource) => {
  const currentCode = _.get(dataSource, 'profile.default.db', []);
  const datatype = _.get(dataSource, 'dataTypeMapping.mappings', []);
  const domains = _.get(dataSource, 'domains', []);
  const allTemplate = _.get(dataSource, 'profile.codeTemplates', []);
  // 合并字段其他变化，只留一个
  const fieldsChanges = [];
  const changes = changesData.filter(c => {
    if (c.type === 'field' && c.opt === 'update') {
      const name = c.name.split(separator);
      const fieldName = name[0] + name[1];
      if (fieldsChanges.includes(fieldName)) {
        return false;
      } else {
        fieldsChanges.push(fieldName);
        return true;
      }
    }
    return true;
  });
  let templateResult = '';
  const getTemplate = (templateShow) => {
    return allTemplate.filter(t => t.applyFor === code)[0]?.[templateShow] || '';
  };
  const sqlSeparator = _.get(dataSource, 'profile.sql.delimiter', ';');
  // 构造新的数据表传递给模板
  const tempEntities = mapDataSourceEntities(dataSource, datatype, domains, code, currentCode);
  // 上个版本的数据表信息，用于重建数据表
  const oldEntities = _.get(oldDataSource, 'entities', []).map((entity) => {
    return {
      ...entity,
      fields: (entity.fields || []).map(field => {
        return {
          ...field,
          type: getFieldType(datatype, domains, field, code, currentCode),
        }
      })
    }
  });

  // 将不同类型的模板组装到一起生成一个sql文件
  // 1.生成属性的sql
  templateResult += changes
    .filter(c => c.type === 'field')
    .map((c) => {
      if (c.opt === 'update') {
        const change = c.name.split(separator);
        const dataTable = tempEntities.filter(t => t.defKey === change[0])[0] || {};
        const field = (dataTable.fields || []).filter(f => f.defKey === change[1])[0] || {};
        const changeData = (c.changeData || '').split(msgSeparator);
        return getTemplateString(getTemplate('updateField'), {
          entity: dataTable,
          field: {
            ...field,
            updateName: change[2],
            update: changeData[1],
          },
          separator: sqlSeparator
        });
      } else if (c.opt === 'add') {
        const change = c.name.split(separator);
        const dataTable = tempEntities.filter(t => t.defKey === change[0])[0] || {};
        const field = (dataTable.fields || []).filter(f => f.defKey === change[1])[0] || {};
        // 从当前的属性中获取该位置之前的属性位置
        let addAfter = undefined;
        const position = (dataTable.fields || []).findIndex(f => field.defKey === f.defKey);
        if (position > 0) {
          addAfter = (dataTable.fields || [])[position - 1] && (dataTable.fields || [])[position - 1].defKey || undefined;
        }
        return getTemplateString(getTemplate('createField'), {
          entity: dataTable,
          field: {
            ...field,
            addAfter,
          },
          separator: sqlSeparator
        });
      } else {
        const change = c.name.split(separator);
        const dataTable = tempEntities.filter(t => t.title === change[0])[0] || {};
        return getTemplateString(getTemplate('dropField'), {
          entity: dataTable,
          field: {
            name: change[1],
          },
          separator: sqlSeparator
        });
      }
    }).join('\n');

  templateResult += changes
    .filter(c => c.type === 'index')
    .map((c) => {
      const change = c.name.split(separator);
      const dataTable = tempEntities.filter(t => t.defKey === change[0])[0] || {};
      const indexName = change[1];
      const indexData = _.get(dataTable, 'indexes', []);
      const index = indexData.filter(i => i.name === indexName)[0] || { name: indexName };
      if (c.opt === 'add') {
        // 根据数据表中的内容获取索引
        return getTemplateString(getTemplate('createIndex'), {
          entity: dataTable,
          index,
          separator: sqlSeparator
        });
      } else if (c.opt === 'update') {
        // 1.先删除再重建
        let deleteString = getTemplateString(getTemplate('dropIndex'), {
          entity: dataTable,
          index,
          separator: sqlSeparator
        });
        let createString = getTemplateString(getTemplate('createIndex'), {
          entity: dataTable,
          index,
          separator: sqlSeparator
        });
        return `${deleteString}${sqlSeparator}\n${createString}`;
      }
      return getTemplateString(getTemplate('dropIndex'), {
        entity: dataTable,
        index,
        separator: sqlSeparator
      });
    })
    .join('\n');

  // 3.生成实体的sql
  templateResult += changes
    .filter(c => c.type === 'entity')
    .map((c) => {
      if (c.opt === 'add') {
        const change = c.name;
        const dataTable = tempEntities.filter(t => t.defKey === change)[0] || {};
        return getTemplateString(getTemplate('createTable'), {
          entity: dataTable,
          separator: sqlSeparator
        });
      } else if (c.opt === 'update') {
        // 重建数据表
        const change = c.name;
        const dataTable = tempEntities.filter(t => t.defKey === change)[0] || {};
        const oldDataTable = oldEntities.filter(t => t.defKey === change)[0] || {};
        return getTemplateString(getTemplate('updateTable'), {
          oldEntity: oldDataTable,
          newEntity: dataTable,
          separator: sqlSeparator
        });
      } else {
        const change = c.name;
        return getTemplateString(getTemplate('dropTable'), {
          entity: {
            defKey: change
          },
          separator: sqlSeparator
        });
      }
    }).join('\n');
  return templateResult.endsWith(sqlSeparator) ? templateResult : templateResult + sqlSeparator;
};
// 获取重建数据表代码
const getCodeByRebuildTableTemplate = (dataSource, changes, code, oldDataSource) => {
  let sqlString = '';
  try {
    const domains = _.get(dataSource, 'domains', []);
    const currentCode = _.get(dataSource, 'profile.default.db', '');
    const datatype = _.get(dataSource, 'dataTypeMapping.mappings', []);
    const allTemplate = _.get(dataSource, 'profile.codeTemplates', []);
    const sqlSeparator = _.get(dataSource, 'profile.sql.delimiter', ';');
    const getTemplate = (templateShow) => {
      return allTemplate.filter(t => t.applyFor === code)[0]?.[templateShow] || '';
    };
    // 构造新的数据表传递给模板
    const tempEntities = mapDataSourceEntities(dataSource, datatype, domains, code, currentCode);
    // 上个版本的数据表信息，用于重建数据表
    const oldEntities = mapDataSourceEntities(oldDataSource, datatype, domains, code, currentCode);
    const entities = changes.map(c => c.name.split(separator)[0]);
    [...new Set(entities)].forEach(e => {
      const dataTable = tempEntities.filter(t => t.defKey === e)[0] || {};
      const oldDataTable = oldEntities.filter(t => t.defKey === e)[0] || {};
      sqlString += getTemplateString(getTemplate('updateTable'), {
        oldEntity: oldDataTable,
        newEntity: dataTable,
        separator: sqlSeparator
      })
    });
  } catch (e) {
    Message.error({title: FormatMessage});
    sqlString = JSON.stringify(e.message);
  }
  return sqlString;
};
// 根据变更信息生成代码
export const getCodeByChanges = (dataSource, changes, code, oldDataSource = {}) => {
  let sqlString = '';
  try {
    sqlString = generateUpdateSql(dataSource, changes, code, oldDataSource)
  } catch (e) {
    Message.error({title: FormatMessage.string({id: 'database.templateError'})});
    sqlString = JSON.stringify(e.message);
  }
  return sqlString;
};
// 获取单个数据表的各个模板的代码
export const getCodeByDataTable = (dataSource, group, dataTable, code, templateShow) => {
  let sqlString = '';
  try {
      sqlString = generateIncreaseSql(dataSource, group, dataTable, code, templateShow);
  } catch (e) {
    Message.error({title: FormatMessage.string({id: 'database.templateError'})});
    sqlString = JSON.stringify(e.message);
  }
  return sqlString;
};
// 获取demo数据的代码
export const getDemoTemplateData = (templateShow) => {
  let data = '';
  const demoGroup = [{defKey: "USER", defName: "用户"}];
  const demoTable = {
    entity: {
      "defKey": "SIMS_STUDENT",
      "defName": "学生",
      "comment": "学生信息表",
      "properties": {
        "partitionBy": ""
      },
      "fields": [
        {
          "defKey": "COLLEGE_ID",
          "defName": "所在学院ID",
          "comment": "",
          "type": "VARCHAR",
          "len": 32,
          "scale": "",
          "primaryKey": false,
          "notNull": false,
          "autoIncrement": false,
          "defaultValue": "",
          "hideInGraph": false,
          "domain": "IdOrKey"
        },
        {
          "defKey": "CLASS_ID",
          "defName": "所在班级ID",
          "comment": "",
          "type": "VARCHAR",
          "len": 32,
          "scale": "",
          "primaryKey": false,
          "notNull": false,
          "autoIncrement": false,
          "defaultValue": "",
          "hideInGraph": false,
          "domain": "IdOrKey"
        },
        {
          "defKey": "STUDENT_ID",
          "defName": "学生ID",
          "comment": "",
          "type": "VARCHAR",
          "len": 32,
          "scale": "",
          "primaryKey": true,
          "notNull": true,
          "autoIncrement": false,
          "defaultValue": "",
          "hideInGraph": false,
          "domain": "IdOrKey"
        },
        {
          "defKey": "STUDENT_NAME",
          "defName": "学生姓名",
          "comment": "",
          "type": "VARCHAR",
          "len": 90,
          "scale": "",
          "primaryKey": false,
          "notNull": false,
          "autoIncrement": false,
          "defaultValue": "",
          "hideInGraph": false,
          "domain": "Name"
        },
        {
          "defKey": "ENG_NAME",
          "defName": "英文名",
          "comment": "",
          "type": "VARCHAR",
          "len": 90,
          "scale": "",
          "primaryKey": false,
          "notNull": false,
          "autoIncrement": false,
          "defaultValue": "",
          "hideInGraph": false,
          "domain": "Name"
        },
        {
          "defKey": "ID_CARD_NO",
          "defName": "身份证号",
          "comment": "",
          "type": "VARCHAR",
          "len": "60",
          "scale": "",
          "primaryKey": false,
          "notNull": false,
          "autoIncrement": false,
          "defaultValue": "",
          "hideInGraph": false,
          "domain": "DefaultString"
        },
        {
          "defKey": "MOBILE_PHONE",
          "defName": "手机号",
          "comment": "",
          "type": "VARCHAR",
          "len": "60",
          "scale": "",
          "primaryKey": false,
          "notNull": false,
          "autoIncrement": false,
          "defaultValue": "",
          "hideInGraph": false,
          "domain": "DefaultString"
        },
        {
          "defKey": "GENDER",
          "defName": "性别",
          "comment": "",
          "type": "VARCHAR",
          "len": "32",
          "scale": "",
          "primaryKey": false,
          "notNull": false,
          "autoIncrement": false,
          "defaultValue": "M",
          "hideInGraph": false,
          "domain": "Dict",
          "refDict": "Gender"
        },
        {
          "defKey": "MONTHLY_SALARY",
          "defName": "月薪",
          "comment": "",
          "type": "NUMBER",
          "len": 32,
          "scale": 8,
          "primaryKey": false,
          "notNull": false,
          "autoIncrement": false,
          "defaultValue": "",
          "hideInGraph": false,
          "domain": "Money"
        },
        {
          "defKey": "BIRTH",
          "defName": "出生日期",
          "comment": "",
          "type": "DATETIME",
          "len": "",
          "scale": "",
          "primaryKey": false,
          "notNull": false,
          "autoIncrement": false,
          "defaultValue": "",
          "hideInGraph": false,
          "domain": "DateTime"
        },
        {
          "defKey": "AVATAR",
          "defName": "头像",
          "comment": "",
          "type": "INT",
          "len": "",
          "scale": "",
          "primaryKey": false,
          "notNull": false,
          "autoIncrement": false,
          "defaultValue": "",
          "hideInGraph": false,
          "domain": "Int"
        },
        {
          "defKey": "HEIGHT",
          "defName": "身高",
          "comment": "",
          "type": "INT",
          "len": "",
          "scale": "",
          "primaryKey": false,
          "notNull": false,
          "autoIncrement": false,
          "defaultValue": "",
          "hideInGraph": false,
          "domain": "Int"
        },
        {
          "defKey": "WEIGHT",
          "defName": "体重",
          "comment": "",
          "type": "INT",
          "len": "",
          "scale": "",
          "primaryKey": false,
          "notNull": false,
          "autoIncrement": false,
          "defaultValue": "",
          "hideInGraph": false,
          "domain": "Int"
        },
        {
          "defKey": "NATION",
          "defName": "名族",
          "comment": "",
          "type": "VARCHAR",
          "len": "32",
          "scale": "",
          "primaryKey": false,
          "notNull": false,
          "autoIncrement": false,
          "defaultValue": "01",
          "hideInGraph": false,
          "domain": "Dict",
          "refDict": "GBNation"
        },
        {
          "defKey": "POLITICAL",
          "defName": "政治面貌",
          "comment": "",
          "type": "VARCHAR",
          "len": "32",
          "scale": "",
          "primaryKey": false,
          "notNull": false,
          "autoIncrement": false,
          "defaultValue": "",
          "hideInGraph": false,
          "domain": "Dict",
          "refDict": "Political"
        },
        {
          "defKey": "MARITAL",
          "defName": "婚姻状况",
          "comment": "",
          "type": "VARCHAR",
          "len": "32",
          "scale": "",
          "primaryKey": false,
          "notNull": false,
          "autoIncrement": false,
          "defaultValue": "UNMARRIED",
          "hideInGraph": true,
          "domain": "Dict",
          "refDict": "Marital"
        },
        {
          "defKey": "DOMICILE_PLACE_PROVINCE",
          "defName": "籍贯（省）",
          "comment": "",
          "type": "VARCHAR",
          "len": "60",
          "scale": "",
          "primaryKey": false,
          "notNull": false,
          "autoIncrement": false,
          "defaultValue": "",
          "hideInGraph": true,
          "domain": "DefaultString"
        },
        {
          "defKey": "DOMICILE_PLACE_CITY",
          "defName": "籍贯（市）",
          "comment": "",
          "type": "VARCHAR",
          "len": "60",
          "scale": "",
          "primaryKey": false,
          "notNull": false,
          "autoIncrement": false,
          "defaultValue": "",
          "hideInGraph": true,
          "domain": "DefaultString"
        },
        {
          "defKey": "DOMICILE_PLACE_ADDRESS",
          "defName": "户籍地址",
          "comment": "",
          "type": "VARCHAR",
          "len": "60",
          "scale": "",
          "primaryKey": false,
          "notNull": false,
          "autoIncrement": false,
          "defaultValue": "",
          "hideInGraph": true,
          "domain": "DefaultString"
        },
        {
          "defKey": "HOBBY",
          "defName": "爱好",
          "comment": "",
          "type": "VARCHAR",
          "len": "60",
          "scale": "",
          "primaryKey": false,
          "notNull": false,
          "autoIncrement": false,
          "defaultValue": "",
          "hideInGraph": true,
          "domain": "DefaultString"
        },
        {
          "defKey": "INTRO",
          "defName": "简要介绍",
          "comment": "",
          "type": "VARCHAR",
          "len": "900",
          "scale": "",
          "primaryKey": false,
          "notNull": false,
          "autoIncrement": false,
          "defaultValue": "",
          "hideInGraph": true,
          "domain": "DescText"
        },
        {
          "defKey": "PRESENT_ADDRESS",
          "defName": "居住地址",
          "comment": "",
          "type": "VARCHAR",
          "len": "60",
          "scale": "",
          "primaryKey": false,
          "notNull": false,
          "autoIncrement": false,
          "defaultValue": "",
          "hideInGraph": true,
          "domain": "DefaultString"
        },
        {
          "defKey": "EMAIL",
          "defName": "电子邮件",
          "comment": "",
          "type": "VARCHAR",
          "len": "60",
          "scale": "",
          "primaryKey": false,
          "notNull": false,
          "autoIncrement": false,
          "defaultValue": "",
          "hideInGraph": true,
          "domain": "DefaultString"
        },
        {
          "defKey": "ENTRY_DATE",
          "defName": "入学日期",
          "comment": "",
          "type": "DATETIME",
          "len": "",
          "scale": "",
          "primaryKey": false,
          "notNull": false,
          "autoIncrement": false,
          "defaultValue": "",
          "hideInGraph": true,
          "domain": "DateTime"
        },
        {
          "defKey": "STATUS",
          "defName": "状态",
          "comment": "",
          "type": "VARCHAR",
          "len": "32",
          "scale": "",
          "primaryKey": false,
          "notNull": false,
          "autoIncrement": false,
          "defaultValue": "Normal",
          "hideInGraph": true,
          "domain": "Dict",
          "refDict": "StudentStatus"
        },
        {
          "defKey": "TENANT_ID",
          "defName": "租户号",
          "comment": "",
          "type": "VARCHAR",
          "len": 32,
          "scale": "",
          "primaryKey": false,
          "notNull": false,
          "autoIncrement": false,
          "defaultValue": "",
          "hideInGraph": true,
          "domain": "IdOrKey"
        },
        {
          "defKey": "REVISION",
          "defName": "乐观锁",
          "comment": "",
          "domain": "Int",
          "type": "INT",
          "len": "",
          "scale": "",
          "primaryKey": false,
          "notNull": false,
          "autoIncrement": false,
          "defaultValue": "",
          "hideInGraph": true
        },
        {
          "defKey": "CREATED_BY",
          "defName": "创建人",
          "comment": "",
          "domain": "IdOrKey",
          "type": "VARCHAR",
          "len": 32,
          "scale": "",
          "primaryKey": false,
          "notNull": false,
          "autoIncrement": false,
          "defaultValue": "",
          "hideInGraph": true
        },
        {
          "defKey": "CREATED_TIME",
          "defName": "创建时间",
          "comment": "",
          "domain": "DateTime",
          "type": "DATETIME",
          "len": "",
          "scale": "",
          "primaryKey": false,
          "notNull": false,
          "autoIncrement": false,
          "defaultValue": "",
          "hideInGraph": true
        },
        {
          "defKey": "UPDATED_BY",
          "defName": "更新人",
          "comment": "",
          "domain": "IdOrKey",
          "type": "VARCHAR",
          "len": 32,
          "scale": "",
          "primaryKey": false,
          "notNull": false,
          "autoIncrement": false,
          "defaultValue": "",
          "hideInGraph": true
        },
        {
          "defKey": "UPDATED_TIME",
          "defName": "更新时间",
          "comment": "",
          "domain": "DateTime",
          "type": "DATETIME",
          "len": "",
          "scale": "",
          "primaryKey": false,
          "notNull": false,
          "autoIncrement": false,
          "defaultValue": "",
          "hideInGraph": true
        }
      ],
      "correlations": [],
      "indexes": [
        {
          "defKey": "idx_smis_student_id",
          "defName": null,
          "unique": true,
          "comment": "",
          "fields": [
            {
              "fieldDefKey": "STUDENT_ID",
              "ascOrDesc": "A"
            }
          ]
        },
        {
          "defKey": "idx_smis_student_01",
          "defName": null,
          "unique": false,
          "comment": "",
          "fields": [
            {
              "fieldDefKey": "STUDENT_NAME",
              "ascOrDesc": "A"
            },
            {
              "fieldDefKey": "ENG_NAME",
              "ascOrDesc": "A"
            }
          ]
        },
        {
          "defKey": "idx_smis_student_cert",
          "defName": null,
          "unique": false,
          "comment": "",
          "fields": [
            {
              "fieldDefKey": "ID_CARD_NO",
              "ascOrDesc": "A"
            }
          ]
        }
      ]
    },
    group: demoGroup,
  };
  switch (templateShow) {
    case 'content':
      data = JSON.stringify({...demoTable, separator: ';'}, null, 2);
      break;
    case 'createTable':
      data = JSON.stringify({...demoTable, separator: ';'}, null, 2);
      break;
    case 'createIndex':
      data = JSON.stringify({
        ...demoTable,
        separator: ';'
      }, null, 2);
      break;
    default:break;
  }
  return data;
};
// 传入模板内容和数据 返回代码信息
export const getDataByTemplate = (data, template) => {
  let sqlString = '';
  try {
    sqlString = getTemplateString(template, data);
  } catch (e) {
    //Message.error({title: FormatMessage.string({id: 'database.templateError'})});
    sqlString = JSON.stringify(e.message);
  }
  return sqlString;
};
// 获取项目的一些配置信息
const getDataSourceProfile = (data) => {
  const dataSource = packageDataSource(data);
  const datatype = _.get(dataSource, 'dataTypeMapping.mappings', []);
  const allTemplate = _.get(dataSource, 'profile.codeTemplates', []);
  const sqlSeparator = _.get(dataSource, 'profile.sql.delimiter', ';');
  return {
    dataSource,
    datatype,
    allTemplate,
    sqlSeparator
  };
};
// 获取所有数据表的全量脚本
export const getAllDataSQL = (data, code) => {
  const { dataSource, datatype, allTemplate, sqlSeparator } = getDataSourceProfile(data);
  const domains = _.get(dataSource, 'domains', []);
  const currentCode = _.get(dataSource, 'profile.default.db', '');
  const getTemplate = (templateShow) => {
    return allTemplate.filter(t => t.applyFor === code)[0]?.[templateShow] || '';
  };
  let sqlString = '';
  // 1.获取所有的表
  const tempEntities = mapDataSourceEntities(dataSource, datatype, domains, code, currentCode);
  sqlString += tempEntities.map(e => {
    // 1.1.删除表
    // 1.2.新建表
    // 1.3.新建索引
    const templateData = {
      entity: e,
      separator: sqlSeparator
    };
    // 循环创建该表下所有的索引
    let indexData = (e.indexes || []).map(i => {
      return `${getTemplateString(getTemplate('createIndex'), {
        ...templateData,
        index: i,
      })}`;
    }).join('\n');
    return `${getTemplateString(getTemplate('dropTable'), templateData)}\n
    ${getTemplateString(getTemplate('createTable'), templateData)}${indexData}`
  }).join('\n');
  return sqlString.endsWith(separator) ? sqlString : sqlString + separator;
};
// 获取所有数据表的全量脚本（filter）
export const getAllDataSQLByFilter = (data, code, filterTemplate, filterDefKey) => {
  // 获取全量脚本（删表，建表，建索引，表注释）
  const { dataSource, datatype, allTemplate, sqlSeparator } = getDataSourceProfile(data);
  const domains = _.get(dataSource, 'domains', []);
  const currentCode = _.get(dataSource, 'profile.default.db', '');
  const getTemplate = (templateShow) => {
    return allTemplate.filter(t => t.applyFor === code)[0]?.[templateShow] || '';
  };
  const getFilterData = (name) => {
    return (dataSource[name] || []).filter(e => {
      if (filterDefKey) {
        return (filterDefKey[name] || []).includes(e.defKey);
      }
      return true;
    }).map(e => ({
      ...e,
      groupType: `ref${firstUp(name)}`
    }));
  };
  let sqlString = '';
  try {
    const tempData = getFilterData('entities')
        .concat(getFilterData('views'));
    sqlString += tempData.map(e => {
      let tempData = '';
      let allData = {};
      const templateData = {
        entity: {
          ..._.omit(e, 'groupType'),
          fields: (e.fields || []).map(field => {
            return {
              ...field,
              type: getFieldType(datatype, domains, field, code, currentCode),
            }
          })
        },
        group: (dataSource.viewGroups || [])
            .filter(g => g[e.groupType].includes(e.defKey))
            .map(g => _.omit(g, ['defKey', 'defName'])),
        separator: sqlSeparator
      };
      allData.createIndex = (e.indexes || []).map(i => {
        return `${getTemplateString(getTemplate('createIndex'), {
          ...templateData,
          index: i,
        })}`;
      }).join('\n');
      allData.createTable = `${getTemplateString(getTemplate('createTable'), templateData)}`;
      allData.content = `${getTemplateString(getTemplate('content'), templateData)}`;
      filterTemplate.forEach(f => {
        tempData += allData[f] ? `${allData[f]}\n` : '';
      });
      return tempData;
    }).join('');
  } catch (e) {
    sqlString = JSON.stringify(e.message);
  }
  return sqlString;
};
