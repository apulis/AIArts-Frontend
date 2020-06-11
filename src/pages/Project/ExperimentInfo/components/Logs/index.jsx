import { Link } from 'umi';
import { Card, Table } from 'antd';
import React from 'react';

const Logs = props => {
  const {
    loading,
    data,
  } = props;

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      width: 150,
      render: (text, record) => <Link to={`/data-manage/ProjectManage/Dataset?id=${record.id}`}>{text}</Link>
    },
    {
      title: 'Time',
      dataIndex: 'time'
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
        dataSource={data}
        rowKey={record => record.id}
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

export default Logs;