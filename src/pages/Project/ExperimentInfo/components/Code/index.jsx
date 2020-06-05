// import { connect, Link, FormattedMessage } from 'umi';
import { Card, Table } from 'antd';
import React from 'react';
import styles from './index.less';

const Code = props => {
  const {
    codePath,
    version = 'e64c1cab6457fce0e9be9425fb20bd90880ceccf',
    data,
    loading
  } = props;
console.log(data)
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
        {/* <a className={styles.number} href={data[0].codePath} target='_blank'>{data[0].version}</a> */}
        <a className={styles.number} href={codePath} target='_blank'>{version}</a>
      </div>
    </Card>
  );
};

export default Code;