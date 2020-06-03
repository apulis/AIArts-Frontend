import { connect, Link, FormattedMessage } from 'umi';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { Table, Card } from 'antd';
import React, { useState, useEffect } from 'react';
import { PAGEPARAMS } from '../../../../../const';
import { formatDate } from '@/utils/time';

const ModelFiles = props => {
  const {
    loading,
    dispatch,
    experimentModels: { data },
  } = props;
  const [pageParams, setPageParams] = useState(PAGEPARAMS);

  useEffect(() => {
    dispatch({
      type: 'experimentModels/fetch',
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
    },
    {
      title: 'Size',
      dataIndex: 'size',
    } 
  ];

  return (
    <Card
      loading={loading}
      bordered={false}
      title={'Model Files'}
      style={{
        height: '100%',
      }}
    >    
    <Table
      columns={columns}
      dataSource={data.list}
      rowKey={record => record.index}
      size='small'
      pagination={{
        style: {
          marginBottom: 0,
        },
        pageSize: 5
      }}
    />
  </Card>  
  );
};

export default connect(({ experimentModels, loading }) => ({
  experimentModels,
  loading: loading.models.experimentModels
}))(ModelFiles);