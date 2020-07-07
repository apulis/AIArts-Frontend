import { stringify } from 'querystring';
import { history } from 'umi';
import { getPageQuery } from '@/utils/utils';

const Model = {
  namespace: 'login',
  state: {
    status: undefined,
  },
  effects: {
    logout() {
      const { redirect } = getPageQuery(); // Note: There may be security issues, please note
      if (window.location.pathname !== '/AIarts/user/login' && !redirect) {
        localStorage.removeItem('token');
        localStorage.removeItem('userLevel');
        history.replace({
          pathname: '/AIarts/user/login',
          search: stringify({
            redirect: window.location.href,
          }),
        });
      }
    },
  },
  reducers: {},
};
export default Model;
