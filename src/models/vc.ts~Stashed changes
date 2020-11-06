import { Reducer } from 'redux';
import { Effect } from 'dva';

export interface VCStateType {
  availVC: string[];
  currentSelectedVC: string;
}

export interface VCModelType {
  namespace: 'vc';
  state: VCStateType;
  effects: {
    fetchUserAvailVC: Effect;
    userSelectVC: Effect;
  };
  reducers: {
    saveCurrentSelectedVC: Reducer;
    saveAvailVC: Reducer;
  };
}

const VCModel: VCModelType = {
  namespace: 'vc',
  state: {
    availVC: [],
    currentSelectedVC: localStorage.vc || '',
  },
  effects: {
    * fetchUserAvailVC({ payload }, { call, put }) {
      //
    },
    * userSelectVC({ payload }, { call, put }) {
      localStorage.vc = payload.vcName;
      yield put({
        type: 'saveCurrentSelectedVC',
        payload: {
          vcName: payload.vcName
        },
      })
    },
  },

  reducers: {
    saveCurrentSelectedVC(state = {}, { payload }) {
      return 
    },
    saveAvailVC(state = {}, { payload }) {
      return {
        ...state,
        currentSelectedVC: payload.vcName,
      }
    }
  },
};
export default VCModel;
