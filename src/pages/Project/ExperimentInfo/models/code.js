import { pagination as defaultPagination } from '@/config'
import { normalizeTableResult } from '@/utils/utils'
import { getExperimentCode } from '../services/code-api'

export default {
  namespace: 'experimentCode',
  state: {
    data: {
      list: [],
      pagination: defaultPagination
    }
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
        const pagination = yield select(state => state.experimentCode.data.pagination)
        const { pageNum = pagination.current, pageSize = pagination.pageSize, ...restParams } = payload
        const params = {
          ...restParams,
          pageNum,
          pageSize
        }
        const {
          code, data, msg
        } = yield call(getExperimentCode, params)
        let error = null
        if (code === 0) {
          const result = normalizeTableResult(data)
          yield put({
            type: 'save',
            payload: result
          })
        } else {
          error = { code, msg }
        }
        return { error, data }
      } catch (error) {
        return { error, data: null }
      }
    }
  }
}
