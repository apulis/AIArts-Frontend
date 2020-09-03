import { fetchCommonResource } from "@/services/common";

let devices = {}

export function beforeSumbitJob(isDistributed, deviceType, deviceNum, distributedJobOptions) {
  const detail = devices[deviceType].detail;
  const allocatables = detail.map(val => val.allocatable);
  const maxAllocatables = Math.max(allocatables);
  maxAllocatables.sort((x, y) => y - x);
  if (isDistributed) {
    const { nodeNum } = distributedJobOptions;
    if (deviceNum <= maxAllocatables[nodeNum - 1]) {
      return true;
    }
  } else {
    if (deviceNum <= maxAllocatables) {
      return true;
    }
  }
  return false;
}

const EnumDeviceTypes = {
  'nvidia.com/gpu': 'GPU',
  'huawei.com/npu': 'NPU',
}

export function checkIfGpuOrNpu(deviceType) {
  const deviceStr = devices[deviceType].deviceStr;
  return EnumDeviceTypes[deviceStr];
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
          payload: { devices: resources },
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
