import React from 'react';
import { PageLoading } from '@ant-design/pro-layout';
import { Redirect, connect } from 'umi';
import { stringify } from 'querystring';

class SecurityLayout extends React.Component {
  state = {
    isReady: false,
  };

  componentDidMount() {
    this.setState({
      isReady: true,
    });
    this.props.dispatch({
      type: 'user/fetchCurrent',
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
      redirect: '/data-manage/project/my-project',
      // redirect: window.location.href,
    });

    if ((!token && loading) || !isReady) {
      return <PageLoading />;
    }

    if (!token && window.location.pathname !== '/data-manage/user/login') {
      return <Redirect to={`/data-manage/user/login?${queryString}`} />;
    }

    return children;
  }
}

export default connect(({ user }) => ({
  user,
}))(SecurityLayout);
