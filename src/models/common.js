const common = {
  namespace: 'common',
  state: {
    interval: localStorage.interval === 'null' ? null : Number(localStorage.interval) || 3000,
  },
  effects: {
    *changeInterval({ payload }, { put }) {
      if (payload === 0) {
        payload = null;
      }
      // 先停止
      yield put({
        type: 'updateInterval',
        payload: null,
      });
      // 再重启定时器
      yield put({
        type: 'updateInterval',
        payload,
      });
      console.log('payload', payload);
      if (payload) {
        localStorage.interval = payload;
      } else {
        localStorage.interval = payload;
      }
    },
  },
  reducers: {
    updateInterval(state, { payload }) {
      return {
        ...state,
        interval: payload,
      };
    },
  },
};

export default common;
