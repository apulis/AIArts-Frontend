import { stringify } from 'querystring';
import { getPageQuery } from '@/utils/utils';

import { USER_LOGIN_URL } from '@/utils/const';
import { userLogout } from '@/services/login';

const Model = {
  namespace: 'login',
  state: {
    status: undefined,
  },
  effects: {
    *logout(_, { call }) {
      const { redirect } = getPageQuery();
      yield call(userLogout);
      localStorage.removeItem('token');
      const queryString = stringify({
        redirect: redirect || window.location.href,
      });
      window.location.href = USER_LOGIN_URL + '?' + queryString;
    },
  },
  reducers: {},
};
export default Model;
