import { connect, Link, FormattedMessage } from 'umi';
import { Card, Table } from 'antd';
import React, { useState, useEffect } from 'react';
import { PAGEPARAMS } from '../../../../../const';

const Dataset = props => {
  const {
    loading,
    dispatch,
    experimentDataset: { data },
  } = props;
  const [pageParams, setPageParams] = useState(PAGEPARAMS);

  useEffect(() => {
    dispatch({
      type: 'experimentDataset/fetch',
      payload: {
        current: pageParams.page,
        pageSize: pageParams.size
      },
    });
  }, [pageParams]);

  const columns = [
    {
      key: 'Name',
      title: 'Name',
      dataIndex: 'name',
      width: 150,
      render: (text, record) => <Link to={`/data-manage/ProjectManage/Dataset?id=${record.id}`}>{text}</Link>
    },
    {
      key: 'desc',
      title: 'Description',
      dataIndex: 'desc',
      ellipsis: true,
      // width: 350
    },
    {
      key: 'version',
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
        dataSource={data.list}
        // rowKey={record => record.index}
        rowKey={(r, i) => `${i}`}
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

export default connect(({ experimentDataset, loading }) => ({
  experimentDataset,
  loading: loading.models.experimentDataset
}))(Dataset);