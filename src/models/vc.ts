import { Reducer } from 'redux';
import { Effect } from 'dva';

export interface VCStateType {
  currentSelectedVC: string;
}

export interface VCModelType {
  namespace: 'vc';
  state: VCStateType;
  effects: {
    userSelectVC: Effect;
  };
  reducers: {
    saveCurrentSelectedVC: Reducer;
  };
}

const defaultVC = localStorage.vc || localStorage.team || '';

const VCModel: VCModelType = {
  namespace: 'vc',
  state: {
    currentSelectedVC: defaultVC,
  }, 
  effects: {
    * userSelectVC({ payload }, { call, put }) {
      localStorage.vc = payload.vcName;
      yield put({
        type: 'saveCurrentSelectedVC',
        payload: {
          currentSelectedVC: payload.vcName
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
  },
};
export default VCModel;
