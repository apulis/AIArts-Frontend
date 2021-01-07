import { getUserInfo } from '@/services/user';
import { setAuthority } from '@/utils/authority';

const UserModel = {
  namespace: 'user',
  state: {
    currentUser: {
      userName: '',
      id: undefined,
      permissionList: [],
      nickName: undefined,
      phone: '',
      email: '',
      currentVC: [],
      jobMaxTimeSecond: null,
    },
  },
  effects: {
    * fetchCurrent(_, { call, put }) {
      const res = yield call(getUserInfo);
      const { code } = res;
      if (code === 0) {
        setAuthority(res.permissionList);
        yield put({
          type: 'updateState',
          payload: {
            currentUser: {
              userName: res.userName,
              id: res.id,
              permissionList: res.permissionList,
              nickName: res.nickName,
              phone: res.phone,
              email: res.email,
              currentVC: res.currentVC,
              jobMaxTimeSecond: res.jobMaxTimeSecond,
            },
          },
        });
      } else {
        setAuthority([]);
        yield put({
          type: 'updateState',
          payload: {
            currentUser: {
              userName: '',
              id: '',
              permissionList: [],
              nickName: '',
              phone: '',
              email: '',
            },
          },
        });
      }
    },
    * deleteUserCurrentVC({ payload }, { put, select }) {
      const user = yield select((state) => state.user);
      let currentVC = [...user.currentUser.currentVC];
      currentVC = currentVC.filter((val) => val !== payload.vcName);
      yield put({
        type: 'updateState',
        payload: {
          currentUser: {
            ...user.currentUser,
            currentVC,
          },
        },
      });
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
export default UserModel;
