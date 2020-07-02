import { pagination as defaultPagination } from '@/config'
import { normalizeTableResult } from '@/utils/utils'
import { getModels, addModel, updateModel } from '../services'

export default {
  namespace: 'modelList',
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
        const pagination = yield select(state => state.modelList.data.pagination)
        const { pageNum = pagination.current, pageSize = pagination.pageSize, ...restParams } = payload
        const params = {
          ...restParams,
          pageNum,
          pageSize
        }
        const {
          code, data, msg
        } = yield call(getModels, params)
        // console.log(code, data, msg)
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
    },
    *add ({ payload }, { call }) {
      try {
        const {
          data: { code, data, msg }
        } = yield call(addModel, payload)

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
        } = yield call(updateModel, payload)
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
