import { combineReducers } from 'redux';

import core from './core';
import config from './config';
import common from './common';

export default combineReducers({
  core,
  config,
  common,
});
