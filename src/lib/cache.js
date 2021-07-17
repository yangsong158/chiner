// 缓存项目信息 等待后续调用update方法

const tabs = {}; // 当前已经打开的所tabs

export const getDataByTabId = (id) => {
  // 获取tab的数据
  return tabs[id];
};

export const setDataByTabId = (id, data) => {
  // 缓存tab的数据
  tabs[id] = data;
};

export const replaceDataByTabId = (oldId, newId) => {
  // 替换tab的数据
  setDataByTabId(newId, getDataByTabId(oldId));
  removeDataByTabId(oldId);
};

export const removeDataByTabId = (id) => {
  // 删除tab的数据
  delete tabs[id]
};

export const getAllTabData = () => {
  return tabs;
};

export const clearAllTabData = () => {
  Object.keys(tabs).forEach((t) => {
    delete tabs[t];
  })
};

const cache = localStorage || {};

export const getCache = (key, needParse) => {
  const item = cache.getItem(key);
  return needParse ? JSON.parse(item) : item;
};

export const setCache = (key, value) => {
  cache.setItem(key, typeof value !== 'string' ? JSON.stringify(value) : value);
};

export const clearCache = (item) => {
  if (item) {
    cache.removeItem(item);
  } else {
    cache.clear();
  }
};

let memoryCache = {};

export const getMemoryCache = (key) => {
  return memoryCache[key];
};

export const setMemoryCache = (key, value) => {
  memoryCache[key] = value;
};

export const clearMemoryCache = () => {
  memoryCache = {};
};


