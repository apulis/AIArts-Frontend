import React from 'react';
import { PageLoading } from '@ant-design/pro-layout';
import { ConfigProvider, message } from 'antd';
import { Redirect, connect } from 'umi';
// import enUS from 'antd/es/locale/en_US';
import zhCN from 'antd/es/locale/zh_CN';
import enUS from 'antd/es/locale/en_US';
import LoginPage from '@/pages/exception/401';
import { USER_LOGIN_URL } from '@/utils/const';
import { stringify } from 'querystring';
import { setLocale, getLocale } from 'umi';
class SecurityLayout extends React.Component {
  state = {
    isReady: false,
  };

  collectAuthInfo = () => {
    let token = '';
    let error = '';
    const { location, history } = this.props;
    if (location && location.query && location.query.token) {
      token = location.query.token;
    }
    if (token) {
      localStorage.token = token;
      let redirectPath = location?.pathname;
      const routerBase = window.routerBase;
      if (routerBase.includes(redirectPath) || redirectPath?.includes(routerBase)) {
        history && history.push('/');
      } else {
        history && history.push(location.pathname);
      }
    }
    if (location && location.query && location.query.error) {
      error = location.query.error;
    }
    if (error) {
      message.error(error);
      let redirectPath = location?.pathname;
      const routerBase = window.routerBase;
      if (routerBase.includes(redirectPath) || redirectPath?.includes(routerBase)) {
        history && history.push('/');
      } else {
        history && history.push(location.pathname);
      }
    }
  };

  componentDidMount() {
    if (!localStorage.token) {
      const queryString = stringify({
        redirect: window.location.href,
      });
      if (process.env.NODE_ENV !== 'development') {
        window.location.href = USER_LOGIN_URL + '?' + queryString;
      }
    }
    if (this.props.dispatch) {
      this.props.dispatch({
        type: 'user/fetchCurrent',
      });
      
      this.props.dispatch({
        type: 'common/fetchPlatformConfig',
      });
    }
    this.setState({
      isReady: true,
    });
    this.collectAuthInfo();
  }

  render() {
    const { isReady } = this.state;
    const { children, loading } = this.props;
    const token = localStorage.token;
    if (loading || !isReady) {
      return <PageLoading />;
    }
    const getLanguage = () => {
      const lang = getLocale();
      if (lang === 'en-US') {
        return enUS;
      } else if (lang === 'zh-CN') {
        return zhCN;
      }
    };
    if (!token) {
      return (
        // <LoginPage />
        <PageLoading />
      );
    }

    return <ConfigProvider locale={getLanguage()}>{children}</ConfigProvider>;
  }
}

export default connect(({ user }) => ({
  user,
}))(SecurityLayout);
