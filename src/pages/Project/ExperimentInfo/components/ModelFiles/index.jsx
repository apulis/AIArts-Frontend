import { Link } from 'umi';
import { Table, Card } from 'antd';
import React from 'react';
import { bytesToSize } from '@/utils/utils';

const ModelFiles = props => {
  const {
    loading,
    data
  } = props;

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
      render: (text) => bytesToSize(parseInt(text))
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

export default ModelFiles;