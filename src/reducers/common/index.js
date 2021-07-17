import { OPEN_LOADING, CLOSE_LOADING, OPT_RESET, STATUS } from '../../actions/common';

const common = (state = {}, { type, data: { title, status, result, pageType } = {}}) => {
  switch (type) {
    case OPEN_LOADING:
      return {
        ...state,
        status: STATUS[0],
        result: null,
        loading: true,
        title: title,
      };
    case CLOSE_LOADING:
      return {
        ...state,
        status,
        result,
        loading: false,
        title: null,
        type: pageType || state.type,
      };
    case OPT_RESET:
      return {
        ...state,
        status: STATUS[0],
        result: null,
        loading: false,
        title,
        type: pageType,
      };
    default:
      return state;
  }
};

export default common;
