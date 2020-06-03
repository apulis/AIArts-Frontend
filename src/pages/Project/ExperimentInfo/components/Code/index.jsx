// import { connect, Link, FormattedMessage } from 'umi';
import { Card, Table } from 'antd';
import React from 'react';
import styles from './index.less';

const Code = props => {
  const {
    codePath,
    version = 'e64c1cab6457fce0e9be9425fb20bd90880ceccf',
    loading
  } = props;

 return (
    <Card
      loading={loading}
      bordered={false}
      title={'Code'}
      style={{
        height: '100%',
      }}
    >     
      <div className={styles.field}>
        <span className={styles.label}>{'Version: '}</span>
        <a className={styles.number} href={codePath}>{version}</a>
      </div>
    </Card>
  );
};

export default Code;