// 树形数据相关操作

export const tree2array = (tree, parents = [], keyAttribute = 'children') => {
  // 树转扁平数组 同时计算好每一条数据的父子关系
  return tree
    .reduce((pre, next) => {
      const children = tree2array(next[keyAttribute] || [], parents.concat(next));
      return pre.concat({
        ...next,
        parents,
        children: next[keyAttribute] ? children : null,
      }).concat(children);
    }, []);
};
