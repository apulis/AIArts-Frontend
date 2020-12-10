import { Reducer } from 'redux';
import { Effect } from 'dva';

import { getVCDetail } from '@/services/vc';

export interface VCStateType {
  currentSelectedVC: string;
  jobMaxTimeSecond: number | null;
}

export interface VCModelType {
  namespace: 'vc';
  state: VCStateType;
  effects: {
    userSelectVC: Effect;
  };
  reducers: {
    saveCurrentSelectedVC: Reducer;
    saveCurrentVCTime: Reducer;
  };
}

const defaultVC = localStorage.vc || localStorage.team || '';

const VCModel: VCModelType = {
  namespace: 'vc',
  state: {
    currentSelectedVC: defaultVC,
    jobMaxTimeSecond: null,
  }, 
  effects: {
    * userSelectVC({ payload }, { call, put, select }) {
      localStorage.vc = payload.vcName;
      const currentUser = yield select(state => state.user.currentUser);
      const userJobMaxTimeSecond = currentUser.jobMaxTimeSecond
      const res = yield call(getVCDetail, payload.vcName);
      if (res.code === 0) {
        const time = JSON.parse(res.data.metadata || '{}').admin?.job_max_time_second;
        const jobMaxTimeSecond = time || userJobMaxTimeSecond;
        if (jobMaxTimeSecond) {
          yield put({
            type: 'saveCurrentVCTime',
            payload: {
              jobMaxTimeSecond: jobMaxTimeSecond,
            }
          })
        }
      }
      yield put({
        type: 'saveCurrentSelectedVC',
        payload: {
          currentSelectedVC: payload.vcName,
        }
      })
    },
  },

  reducers: {
    saveCurrentSelectedVC(state = {}, { payload }) {
      return {
        ...state,
        currentSelectedVC: payload.currentSelectedVC,
      }
    },
    saveCurrentVCTime(state = {}, { payload }) {
      return {
        ...state,
        jobMaxTimeSecond: payload.jobMaxTimeSecond,
      }
    }
  },
};
export default VCModel;
