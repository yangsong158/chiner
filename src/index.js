import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import thunkMiddleware from 'redux-thunk';
import { logger } from 'redux-logger';
import { Modal } from 'components';
import Welcome from './app/welcome';
import reducers from './reducers';
import './style/detault.less';
import { writeLog } from './lib/middle';

const store = createStore(reducers,
  {},
  applyMiddleware(
    thunkMiddleware,
    logger,
  ));

class Container extends React.Component{
  componentDidCatch(error) {
    writeLog(error).then((file) => {
      Modal.error({
        title: '出错了',
        message: `程序出现异常，请前往日志文件查看出错日志：${file}`,
      });
    });
  }
  render() {
    return <Welcome store={store}/>;
  }
}

function initComponent() {
  ReactDOM.render(<Provider store={store}>
    <Container/>
  </Provider>, document.getElementById('app'));
}

initComponent();
