import { pagination as defaultPagination } from '@/config'
import { normalizeTableResult } from '@/utils/utils'
import { getInferences, addInference, updateInference } from '../services'

export default {
  namespace: 'inferenceList',
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
    *fetch ({ payload = {} }, { call, put, select }) {
      try {
        const pagination = yield select(state => state.inferenceList.data.pagination)
        const { pageNum = pagination.pageNum, pageSize = pagination.pageSize, ...restParams } = payload
        const params = {
          ...restParams,
          pageNum,
          pageSize
        }
        const {
          code, data, msg
        } = yield call(getInferences, params)
        let error = null
        if (code === 0) {
          const result = {
            list: data.inferences || [],
            pagination: {
              current: data.pageNum || 1,
              pageSize: data.pageSize || 10,
              total: data.total
            }
          }          
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
    },
    *add ({ payload }, { call }) {
      try {
        const {
          data: { code, data, msg }
        } = yield call(addInference, payload)

        // console.log('======', code, data, msg)

        let error = null
        if (code !== 0) {
          error = { code, msg }
        }
        return { error, data }
      } catch (error) {
        return {
          error,
          data: null
        }
      }
    },
    *update ({ payload }, { call }) {
      try {
        const {
          data: { code, data, msg }
        } = yield call(updateInference, payload)
        let error = null
        if (code !== 0) {
          error = { code, msg }
        }
        return { error, data }
      } catch (error) {
        return {
          error,
          data: null
        }
      }
    }
  }
}
