import React from 'react';
import { PageLoading } from '@ant-design/pro-layout';
import { ConfigProvider } from 'antd';
import { Redirect, connect } from 'umi';
import { stringify } from 'querystring';
// import enUS from 'antd/es/locale/en_US';
import zhCN from 'antd/es/locale/zh_CN';

class SecurityLayout extends React.Component {
  state = {
    isReady: false,
  };

  componentDidMount() {
    this.setState({
      isReady: true,
    });
    const { location } = this.props;
    if (location && location.query && location.query.token) {
      localStorage.setItem('token', location.query.token);
    }
  }

  render() {
    const { isReady } = this.state;
    const { children, loading, currentUser } = this.props; // You can replace it to your authentication rule (such as check token exists)
    // 你可以把它替换成你自己的登录认证规则（比如判断 token 是否存在）

    const token = localStorage.token;
    const queryString = stringify({
      redirect: '/',
    });

    if ((!token && loading) || !isReady) {
      return <PageLoading />;
    }

    if (!token && window.location.pathname !== '/user/login') {
      return <Redirect to={`/user/login?${queryString}`} />;
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
