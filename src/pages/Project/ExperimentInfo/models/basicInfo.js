import * as services from '../services/basicInfo'

export default {
  namespace: 'experimentInfo',
  state: {
    info: {}
  },
  reducers: {
    save (state, { payload }) {
      return {
        ...state,
        info: payload
      }
    }
  },
  effects: {
    *fetch ({ payload = {} }, { call, put }) {
      try {
        const {
          data: { code, data, msg }
        } = yield call(services.query, payload)
        let error = null
        if (code === 0) {
          yield put({
            type: 'save',
            payload: data
          })
        } else {
          yield put({
            type: 'save',
            payload: {}
          })
          error = { code, msg }
        }
        return { error, data }
      } catch (error) {
        return { error, data: null }
      }
    }
  }
}