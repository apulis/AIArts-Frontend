import { connect, Link, FormattedMessage } from 'umi';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { Table } from 'antd';
import React, { useState, useEffect } from 'react';
import { PAGEPARAMS } from '../../../../../const';
import { formatDate } from '@/utils/time';

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
      title: 'Version',
      dataIndex: 'version',
      ellipsis: true,
      width: 100,
    }
  ];
  return (
    <PageHeaderWrapper title='实验代码'>
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

export default connect(({ experimentCode, loading }) => ({
  experimentCode,
  loading: loading.models.experimentCode
}))(Code);