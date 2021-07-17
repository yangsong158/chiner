export const changeArrayPosition = (array = [], index1 = 0, index2 = 0) => {
  // 数组交换位置
  const data1 = array[index1];
  const data2 = array[index2];
  if (data1 && data2) {
    return array.map((data, index) => {
      if (index1 === index) {
        return data2;
      } else if (index2 === index) {
        return data1;
      }
      return data;
    });
  }
  return array;
};

export const moveArrayPosition = (array = [], moveIndex = 0, toIndex = 0) => {
  // 数组移动位置
  const data1 = array[moveIndex];
  const data2 = array[toIndex];
  if (data1 && data2) {
    const tempArray = [...array];
    // 先将移动的项删除
    tempArray.splice(moveIndex, 1);
    // 将移动的项放置
    tempArray.splice(toIndex, 0, data1);
    return tempArray;
  }
  return array;
};

export const moveArrayPositionByFuc = (array = [], fromFuc, toIndex) => {
  // 数组插入位置
  if (fromFuc) {
    const fromIndex = array.findIndex(fromFuc);
    return moveArrayPosition(array, fromIndex, toIndex);
  }
  return array;
};

export const moveArrayPositionByArray = (array, moveArray, step, keyName, status) => {
  let tempArray = [...(array || [])];
  const getSelectedFieldsIndex = () => {
    return tempArray.map((field, index) => {
      if (moveArray.includes(field[keyName])) {
        return index;
      }
      return null;
    }).filter(field => field !== null);
  };
  const moveArrayIndex = getSelectedFieldsIndex();
  const maxIndex = Math.max(...moveArrayIndex);
  const minIndex = Math.min(...moveArrayIndex);
  let changeIndex = step < 0 ? minIndex + step : maxIndex + step;
  if (changeIndex >= 0 && changeIndex <= tempArray.length - 1) {
    // 获取将要插入位置的属性
    // 循环移动每一条数据
    moveArrayIndex.map(fieldIndex => ({
      fieldIndex,
      from: tempArray[fieldIndex],
      to: tempArray[step < 0 ? fieldIndex + step : fieldIndex + step],
    }))
        .sort((a, b) => (step < 0 ? a.fieldIndex - b.fieldIndex : b.fieldIndex - a.fieldIndex))
        .forEach((field) => {
          tempArray = moveArrayPositionByFuc(
              tempArray,  (f) => {
                return f[keyName] === field.from[keyName];
                // eslint-disable-next-line no-nested-ternary
              }, step < 0 ? (status === 'start' ? field.fieldIndex - minIndex : field.fieldIndex + step) :
                  (status === 'end' ? field.fieldIndex + (tempArray.length - 1 - maxIndex) : field.fieldIndex + step));
        });
    return tempArray;
  }
  return tempArray;
};
