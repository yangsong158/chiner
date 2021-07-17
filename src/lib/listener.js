import ResizeObserver from 'resize-observer-polyfill';

let listeners = [];

window.onresize = (e) => {
  listeners.forEach(listener => {
    listener?.fuc(e);
  })
};

export const addOnResize = (id, fuc) => {
  // 监听窗口大小变化
  listeners.push({id, fuc});
};

export const removeOnResize = (id) => {
  // 移除监听
  listeners = listeners.filter(listener => listener.id !== id);
};

// 监听某个dom节点的大小变化
let ro;
let callbackCache = {};
export const addDomResize = (dom, id, callback) => {
  callbackCache[id] = {dom, callback};
  if (!ro) {
    // 创建监听实例
    ro = new ResizeObserver((entries) => {
      entries.forEach(({target, contentRect}) => {
        const currentId = Object.keys(callbackCache)
            .filter((c) => callbackCache[c]?.dom === target)[0];
        callbackCache[currentId]?.callback(contentRect);
      });
    });
  }
  ro.observe(dom);
};

export const removeDomResize = (dom, id) => {
  ro && ro.unobserve(dom);
  delete callbackCache[id];
};

export const removeAllDomResize = () => {
  if (ro) {
    ro.disconnect();
    ro = null;
    callbackCache = null;
  }
};

const eventMap = {};

export const addBodyEvent = (eventName, eventId, event) => {
  if (!eventMap[eventName]) {
    eventMap[eventName] = [];
    document.body[eventName] = (e) => {
      eventMap[eventName].forEach(eve => {
        eve?.event(e);
      })
    };
  }
  eventMap[eventName].push({eventId, event});
};

export const removeBodyEvent = (eventName, eventId) => {
  eventMap[eventName] = (eventMap[eventName] || []).filter(e => e.eventId !== eventId);
  if (eventMap[eventName] === 0) {
    document.body[eventName] = null;
  }
};

export const addBodyClick = (id, event) => {
  addBodyEvent('onclick', id, event);
}

export const removeBodyClick = (id) => {
  removeBodyEvent('onclick', id);
}


