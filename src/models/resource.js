import { fetchCommonResource } from "@/services/common";


const ResourceModole = {
  namespace: 'resource',
  state: {
    devices: {}
  },
  effects: {
    * fetchResource(_, { call, put }) {
      const res = yield call(fetchCommonResource);
      if (res.code === 0) {
        const { data: { resources } } = res;
        yield put({
          type: 'updateState',
          payload: {devices: resources}
        });
      }
    },
  },
  reducers: {
    updateState(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
};

export default ResourceModole;
