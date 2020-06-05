import * as services from '../services/basicInfo'

export default {
  namespace: 'experimentInfo',
  state: {
    data: {}
  },
  reducers: {
    save (state, { payload }) {
      return {
        ...state,
        data: payload
      }
    }
  },
  effects: {
    *fetch ({ payload = {} }, { call, put }) {
      try {
        const {
          // data: { code, data, msg }
          code, data, msg
        } = yield call(services.query, payload)
        // console.log('basicInfo', code, data, msg)
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