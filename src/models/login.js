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
      if (window.location.pathname !== '/data-manage/user/login' && !redirect) {
        localStorage.removeItem('token');
        localStorage.removeItem('userLevel');
        history.replace({
          pathname: '/data-manage/user/login',
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
