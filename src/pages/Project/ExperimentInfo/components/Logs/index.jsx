import { connect, Link, FormattedMessage } from 'umi';
import { Card, Table } from 'antd';
import React, { useState, useEffect } from 'react';
import { PAGEPARAMS } from '../../../../../const';
import { formatDate } from '@/utils/time';

const Logs = props => {
  const {
    loading,
    dispatch,
    experimentLogs: { data },
  } = props;
  const [pageParams, setPageParams] = useState(PAGEPARAMS);

  useEffect(() => {
    dispatch({
      type: 'experimentLogs/fetch',
      payload: {
        current: pageParams.page,
        pageSize: pageParams.size
      },
    });
  }, [pageParams]);

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      width: 150,
      render: (text, record) => <Link to={`/data-manage/ProjectManage/Dataset?id=${record.id}`}>{text}</Link>
    }
  ];

 return (
    <Card
      loading={loading}
      bordered={false}
      title={'Logs'}
      style={{
        height: '100%',
      }}
    >    
      <Table
        columns={columns}
        dataSource={data.list}
        // rowKey={record => record.index}
        rowKey={(r, i) => `${i}`}
        size='small'
        pagination={{
          style: {
            marginBottom: 0,
          },
          pageSize: 2
        }}
      />
    </Card>      
  );
};

export default connect(({ experimentLogs, loading }) => ({
  experimentLogs,
  loading: loading.models.experimentLogs
}))(Logs);