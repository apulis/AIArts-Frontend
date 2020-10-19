import { LogoutOutlined, SettingOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Menu, Spin } from 'antd';
import React from 'react';
import { history, connect } from 'umi';
import HeaderDropdown from '../HeaderDropdown';
import styles from './index.less';
import { avatar } from '@/utils/const';
import { formatMessage } from 'umi';
class AvatarDropdown extends React.Component {
  onMenuClick = (event) => {
    const { key } = event;

    if (key === 'logout') {
      const { dispatch } = this.props;

      if (dispatch) {
        dispatch({
          type: 'login/logout',
        });
      }

      return;
    }

    history.push(`/account/${key}`);
  };

  render() {
    const {
      currentUser = {
        name: 'User',
      },
      menu,
    } = this.props;
    const menuHeaderDropdown = (
      <Menu className={styles.menu} selectedKeys={[]} onClick={this.onMenuClick}>
        {/* {menu && (
          <Menu.Item key="center">
            <UserOutlined />
            个人中心
          </Menu.Item>
        )} */}
        {/* {menu && (
          <Menu.Item key="settings">
            <SettingOutlined />
            个人信息
          </Menu.Item>
        )}
        {menu && <Menu.Divider />} */}

        <Menu.Item key="logout">
          <LogoutOutlined />
          {formatMessage({ id: 'component.globalHeader.avatarDropdown.logout' })}
        </Menu.Item>
      </Menu>
    );
    // console.log('currentUser', currentUser);
    return currentUser && currentUser.userName ? (
      <HeaderDropdown overlay={menuHeaderDropdown} placement="bottomCenter">
        <span className={`${styles.action} ${styles.account}`}>
          <span className={styles.name}>{currentUser.userName}</span>
        </span>
      </HeaderDropdown>
    ) : (
      <span className={`${styles.action} ${styles.account}`}>
        {/* <Spin
          size="small"
          style={{
            marginLeft: 8,
            marginRight: 8,
          }}
        /> */}
      </span>
    );
  }
}

export default connect(({ user }) => ({
  currentUser: user.currentUser,
}))(AvatarDropdown);
