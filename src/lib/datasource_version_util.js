import * as _ from 'lodash/object';
import { separator } from '../../profile';

// 数据版本对比工具（只考虑数据表的变更，不考虑视图等其他内容）
// 字段比较方法
const compareField = (currentField, checkField, table) => {
  const changes = [];
  Object.keys(currentField).forEach((name) => {
    if (checkField[name] !== currentField[name]) {
      changes.push({
        type: 'field',
        name: `${table.defKey}${separator}${currentField.defKey}${separator}${name}`,
        opt: 'update',
        changeData: `${checkField[name]}=>${currentField[name]}`,
      });
    }
  });
  return changes;
};
// 索引比较方法
const compareIndex = (currentIndex, checkIndex, table) => {
  const changes = [];
  Object.keys(currentIndex).forEach((name) => {
    if (checkIndex[name] !== currentIndex[name]) {
      changes.push({
        type: 'index',
        name: `${table.defKey}${separator}${currentIndex.name}${separator}${name}`,
        opt: 'update',
        changeData: `${checkIndex[name]}=>${currentIndex[name]}`,
      });
    }
  });
  return changes;
};
// 索引数据内的字段比较
const compareStringArray = (currentFields, checkFields, title, name) => {
  const changes = [];
  currentFields.forEach((f) => {
    if (!checkFields.includes(f)) {
      changes.push({
        type: 'index',
        name: `${title}${separator}${name}${separator}fields${separator}${f}`,
        opt: 'update',
        changeData: `addField=>${f}`,
      });
    }
  });
  checkFields.forEach((f) => {
    if (!currentFields.includes(f)) {
      changes.push({
        type: 'index',
        name: `${title}${separator}${name}${separator}fields${separator}${f}`,
        opt: 'update',
        changeData: `deleteField=>${f}`,
      });
    }
  });
  return changes;
};
// 多个索引比较方法
const compareIndexes = (currentTable, checkTable) => {
  const changes = [];
  const currentIndexes = currentTable.indexes || [];
  const checkIndexes = checkTable.indexes || [];
  const checkIndexNames = checkIndexes.map(index => index.defKey);
  const currentIndexNames = currentIndexes.map(index => index.defKey);
  currentIndexes.forEach((cIndex) => {
    if (!checkIndexNames.includes(cIndex.defKey)) {
      changes.push({
        type: 'index',
        name: `${currentTable.defKey}${separator}${cIndex.defKey}`,
        opt: 'add',
      });
    } else {
      const checkIndex = checkIndexes.filter(c => c.defKey === cIndex.defKey)[0] || {};
      changes.push(...compareIndex(_.omit(cIndex, ['fields']),
        _.omit(checkIndex, ['fields']), currentTable));
      // 比较索引中的属性
      const checkFields = checkIndex.fields || [];
      const currentFields = cIndex.fields || [];
      changes.push(...compareStringArray(
        currentFields, checkFields, currentTable.defKey, cIndex.defKey));
    }
  });
  checkIndexes.forEach((cIndex) => {
    if (!currentIndexNames.includes(cIndex.defKey)) {
      changes.push({
        type: 'index',
        name: `${currentTable.defKey}${separator}${cIndex.defKey}`,
        opt: 'delete',
      });
    }
  });
  return changes;
};
// 实体数据表比较方法
const compareEntity = (currentTable, checkTable) => {
  const changes = [];
  Object.keys(currentTable).forEach((name) => {
    if (checkTable[name] !== currentTable[name]) {
      changes.push({
        type: 'entity',
        name: `${currentTable.defKey}${separator}${name}`,
        opt: 'update',
        changeData: `${checkTable[name]}=>${currentTable[name]}`,
      });
    }
  });
  return changes;
};
// 项目所有实体版本比较方法
export const checkVersionData = (dataSource1, dataSource2) => {
  // 循环比较每个模块下的每张表以及每一个字段的差异
  const changes = [];
  // 1.获取所有的表
  const currentTables = dataSource1?.entities || [];
  const checkTables = dataSource2?.entities || [];
  const checkTableNames = checkTables.map(e => e.defKey);
  const currentTableNames = currentTables.map(e => e.defKey);
  // 2.将当前的表循环
  currentTables.forEach((table) => {
    // 1.1 判断该表是否存在
    if (checkTableNames.includes(table.defKey)) {
      // 1.2.1 如果该表存在则需要对比字段
      const checkTable = checkTables.filter(t => t.defKey === table.defKey)[0] || {};
      // 将两个表的所有的属性循环比较
      const checkFields = (checkTable.fields || []).filter(f => f.defKey);
      const tableFields = (table.fields || []).filter(f => f.defKey);
      const checkFieldsName = checkFields.map(f => f.defKey);
      const tableFieldsName = tableFields.map(f => f.defKey);
      tableFields.forEach((field) => {
        if (!checkFieldsName.includes(field.defKey)) {
          changes.push({
            type: 'field',
            name: `${table.defKey}${separator}${field.defKey}`,
            opt: 'add',
          });
        } else {
          // 比较属性的详细信息
          const checkField = checkFields.filter(f => f.defKey === field.defKey)[0] || {};
          const result = compareField(_.omit(field, ['hideInGraph', 'uiHint']), checkField, table);
          changes.push(...result);
        }
      });
      checkFields.forEach((field) => {
        if (!tableFieldsName.includes(field.defKey)) {
          changes.push({
            type: 'field',
            name: `${table.defKey}${separator}${field.defKey}`,
            opt: 'delete',
          });
        }
      });
      // 1.2.2 其他信息
      const entityResult = compareEntity(_.omit(table,
        ['fields', 'indexes', 'headers', 'partitionBy', 'correlations', 'nameTemplate']),
        _.omit(checkTable, ['fields', 'indexes']));
      changes.push(...entityResult);
      // 1.2.3 对比索引
      const result = compareIndexes(table, checkTable);
      changes.push(...result);
    } else {
      // 1.3 如果该表不存在则说明当前版本新增了该表
      changes.push({
        type: 'entity',
        name: table.defKey,
        opt: 'add',
      });
    }
  });
  // 3.将比较的表循环，查找删除的表
  checkTables.forEach((table) => {
    // 1.1 判断该表是否存在
    if (!currentTableNames.includes(table.defKey)) {
      // 1.2 如果该表不存在则说明当前版本删除了该表
      changes.push({
        type: 'entity',
        name: table.defKey,
        opt: 'delete',
      });
    }
  });
  return changes;
};
// 获取当前版本与前一个版本的版本变更信息
export const getCurrentVersionData = (dataSource, versionsData) => {
  if (!versionsData[0]) {
    return [];
  }
  return checkVersionData(dataSource, versionsData[0]);
};
