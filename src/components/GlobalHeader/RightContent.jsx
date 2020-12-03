import { Button, Tag, Menu, Dropdown } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import React, { useEffect, useState } from 'react';
import { connect } from 'umi';
import Avatar from './AvatarDropdown';
import SelectLang from '../SelectLang';
import styles from './index.less';
import { useIntl } from 'umi';
const ENVTagColor = {
  dev: 'orange',
  test: 'green',
  pre: '#87d068',
};

const GlobalHeaderRight = (props) => {
  const intl = useIntl();
  const { theme, layout } = props;
  let className = styles.right;

  if (theme === 'dark' && layout === 'topmenu') {
    className = `${styles.right}  ${styles.dark}`;
  }

  const menu = (
    <Menu>
      <Menu.Item>
        <a target="_blank" rel="noopener noreferrer" href="/custom-user-dashboard">
          {intl.formatMessage({ id: 'component.globalHeader.rightContent.globalHeaderRight.userManagementSystem' })}
        </a>
      </Menu.Item>
      <Menu.Item>
        <a target="_blank" rel="noopener noreferrer" href="/expert">
          {intl.formatMessage({ id: 'component.globalHeader.rightContent.globalHeaderRight.expert' })}
        </a>
      </Menu.Item>
    </Menu>

  );

  return (
    <div
      className={className}
      style={{ display: 'flex', alignItems: 'center', marginRight: '20px' }}
    >
      <Dropdown overlay={menu}>
        <a className="ant-dropdown-link" style={{ display: 'inline-block', marginRight: '10px' }} onClick={e => e.preventDefault()}>
          {intl.formatMessage({ id: 'component.globalHeader.rightContent.globalHeaderRight.menu' })} <DownOutlined />
        </a>
      </Dropdown>
      <Avatar menu />
      <SelectLang className={styles.action} />
    </div>
  );
};

export default connect(({ settings }) => ({
  theme: settings.navTheme,
  layout: settings.layout,
}))(GlobalHeaderRight);
