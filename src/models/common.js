const common = {
  namespace: 'common',
  state: {
    interval: localStorage.interval || 3000,
  },
  effects: {
    * changeInterval({ payload }, { put }) {
      // 先停止
      yield put({
        type: 'updateInterval',
        payload: null,
      })
      // 再重启定时器
      yield put({
        type: 'updateInterval',
        payload,
      })
      if (payload) {
        localStorage.interval = payload;
      }
    }
  },
  reducers: {
    updateInterval(state, { payload }) {
      return {
        ...state,
        interval: payload,
      }
    }
  }
}


export default common;