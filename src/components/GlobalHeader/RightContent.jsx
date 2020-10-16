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

  return (
    <div
      className={className}
      style={{ display: 'flex', alignItems: 'center', marginRight: '20px' }}
    >
      {/* <Dropdown overlay={menu}>
        <a className="ant-dropdown-link" onClick={e => e.preventDefault()}>
          当前虚拟集群 <DownOutlined />
        </a>
      </Dropdown> */}
      <Button href="/custom-user-dashboard" style={{ marginLeft: '20px' }}>
        {intl.formatMessage({
          id: 'component.globalHeader.rightContent.globalHeaderRight.userManagementSystem',
        })}
      </Button>
      <Avatar menu />
      {REACT_APP_ENV && (
        <span>
          <Tag color={ENVTagColor[REACT_APP_ENV]}>{REACT_APP_ENV}</Tag>
        </span>
      )}
      <SelectLang className={styles.action} />
    </div>
  );
};

export default connect(({ settings }) => ({
  theme: settings.navTheme,
  layout: settings.layout,
}))(GlobalHeaderRight);
