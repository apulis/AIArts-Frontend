import { message } from 'antd';
import { Effect } from 'dva';
import { Reducer } from 'redux';

import { fetchCommonResource } from '@/services/common';

let devices = {};

export function beforeSubmitJob(isDistributed, deviceType, deviceNum, distributedJobOptions) {
  const detail = devices[deviceType].detail;
  const allocatables = detail.map((val) => val.allocatable);
  const maxAllocatables = Math.max.apply(undefined, allocatables);
  allocatables.sort((x, y) => y - x);
  if (isDistributed) {
    const { nodeNum } = distributedJobOptions;
    if (deviceNum <= allocatables[nodeNum - 1]) {
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
  'npu.huawei.com/NPU': 'NPU',
};

export function checkIfGpuOrNpu(deviceType) {
  const deviceStr = devices[deviceType]?.deviceStr;
  return EnumDeviceTypes[deviceStr] || EnumDeviceTypes['nvidia.com/gpu'];
}

interface ResorceStateType {
  devices: {
    [props: string]: number;
  },
  images: any[]
}

export interface ResoyrceModelType {
  namespace: 'common';
  state: ResorceStateType;
  effects: {
    fetchResource: Effect;
    fetchPlatformConfig: Effect;

  };
  reducers: {
    updateState: Reducer;
  };
}

const ResourceModole = {
  namespace: 'resource',
  state: {
    devices: {},
    images: [],
  },
  effects: {
    * fetchResource(_, { call, put }) {
      const res = yield call(fetchCommonResource);
      if (res.code === 0) {
        const {
          data: { resources },
        } = res;
        yield put({
          type: 'updateState',
          payload: { devices: resources },
        });
        if (Object.keys(resources).length === 0) {
          message.error('平台 worker 节点未初始化成功，请联系管理员');
        }
        devices = resources;
      }
    },
    * fetchAvailImages(_, { call, put }) {
      
    }
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
