import React from 'react';
import { PageLoading } from '@ant-design/pro-layout';
import { ConfigProvider, message } from 'antd';
import { Redirect, connect } from 'umi';
// import enUS from 'antd/es/locale/en_US';
import zhCN from 'antd/es/locale/zh_CN';
import LoginPage from '@/pages/exception/401';

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
  }

  componentDidMount() {
    
    if (this.props.dispatch) {
      this.props.dispatch({
        type: 'user/fetchCurrent',
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
    if ((loading) || !isReady) {
      return <PageLoading />;
    }

    if (!token) {
      return (
        <LoginPage />
      )
    }

    return (
      <ConfigProvider locale={zhCN}>
        {children}
      </ConfigProvider>
    )
  }
}

export default connect(({ user }) => ({
  user,
}))(SecurityLayout);
