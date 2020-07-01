import { Link } from 'umi';
import { Card, Table } from 'antd';
import React from 'react';

const Dataset = props => {
  const {
    loading,
    data
  } = props;

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      width: 150,
      render: (text, record) => <Link to={`/aIarts/dataSetManage/detail?id=${record.id}`}>{text}</Link>
    },
    {
      title: 'Description',
      dataIndex: 'desc',
      ellipsis: true,
      // width: 350
    },
    {
      title: 'Version',
      dataIndex: 'version',
      ellipsis: true,
      width: 100
    }
  ];

  return (
    <Card
      loading={loading}
      bordered={false}
      title={'Datasets'}
      style={{
        height: '100%',
      }}
    > 
      <Table
        columns={columns}
        dataSource={data}
        rowKey={record => record.id}
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

export default Dataset;