import { connect, Link, FormattedMessage } from 'umi';
import { Card, Table } from 'antd';
import React, { useState, useEffect } from 'react';
import { PAGEPARAMS } from '../../../../../const';
import { formatDate } from '@/utils/time';
import styles from './index.less';

const Code = props => {
  const {
    loading,
    dispatch,
    experimentCode: { data },
  } = props;
  const [pageParams, setPageParams] = useState(PAGEPARAMS);

  useEffect(() => {
    dispatch({
      type: 'experimentCode/fetch',
      payload: {
        current: pageParams.page,
        pageSize: pageParams.size
      },
    });
  }, [pageParams]);

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
        {/* <span className={styles.number}>{'xxxxxx'}</span> */}
        <a className={styles.number}>{'e64c1cab6457fce0e9be9425fb20bd90880ceccf'}</a>
      </div>
    </Card>     
  );
};

export default connect(({ experimentCode, loading }) => ({
  experimentCode,
  loading: loading.models.experimentCode
}))(Code);