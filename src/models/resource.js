import { fetchCommonResource } from "@/services/common";

let devices = {}

export function beforeSumbitJob(isDistributed, deviceType, deviceNum) {
  console.log('111', isDistributed, deviceType, deviceNum)
  console.log('devices', devices)
  return false
  
}

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
          payload: { devices: resources }
        });
        devices = resources;
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
