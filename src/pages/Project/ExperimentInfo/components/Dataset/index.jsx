import { connect, Link, FormattedMessage } from 'umi';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { Table } from 'antd';
import React, { useState, useEffect } from 'react';
import { PAGEPARAMS } from '../../../../../const';
import { formatDate } from '@/utils/time';

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

  const pageParamsChange = (page, size) => {
    setPageParams({ page: page, size: size });
  };

  const columns = [
    // {
    //   title: 'ID',
    //   dataIndex: 'id'
    // },
    {
      title: 'Name',
      dataIndex: 'name',
      width: 150,
      // render: (text, record) => <Link to={`/data-manage/ProjectManage/Dataset?id=${record.id}`}>{text}</Link>
    },
    {
      title: 'Description',
      dataIndex: 'desc',
      ellipsis: true,
      // width: 350,
    },
    {
      title: 'Version',
      dataIndex: 'version',
      ellipsis: true,
      width: 100,
    },
    {
      title: 'Creator',
      dataIndex: 'creator',
    },
    {
      title: 'Update Time',
      dataIndex: 'updateTime',
      render: text => formatDate(text, 'YYYY-MM-DD HH:MM:SS')
    },
    // {
    //   title: 'Operation',
    //   render: (item) => {
    //     return (
    //       <div>
    //         <a onClick={() => showEditModal(item)}>编辑</a>
    //       </div>
    //     );
    //   }
    // }
  ];

  const showEditModal = (item) => {
    setVisible(true);
    setCurrent(item);
  };

  return (
    <PageHeaderWrapper title='实验数据集'>
      <Table
        columns={columns}
        dataSource={data.list}
        rowKey={(r, i) => `${i}`}
        pagination={{
          total: data.pagination.total,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条`,
          showSizeChanger: true,
          onChange: pageParamsChange,
          onShowSizeChange: pageParamsChange,
        }}
        loading={loading}
      />
    </PageHeaderWrapper>
  );
};

export default connect(({ experimentDataset, loading }) => ({
  experimentDataset,
  loading: loading.models.experimentDataset
}))(Dataset);