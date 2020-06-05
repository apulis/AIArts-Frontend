import { Card } from 'antd';
import React from 'react';
import styles from './index.less';

const Code = props => {
  const {
    data,
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
        {data && data.length>0 && <a className={styles.number} href={data[0].codePath} target='_blank'>{data[0].version}</a>}
      </div>
    </Card>
  );
};

export default Code;