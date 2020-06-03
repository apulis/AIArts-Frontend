import { connect, Link, FormattedMessage } from 'umi';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { Table } from 'antd';
import React, { useState, useEffect } from 'react';
import { PAGEPARAMS } from '../../../const';
import ModalForm from './components/ModalForm';
import { formatDate } from '@/utils/time';

const ExperimentList = props => {
  const {
    loading,
    dispatch,
    experimentList: { data },
  } = props;
  const [visible, setVisible] = useState(false);
  const [current, setCurrent] = useState(undefined);  
  const [pageParams, setPageParams] = useState(PAGEPARAMS);

  useEffect(() => {
    dispatch({
      type: 'experimentList/fetch',
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
      render: (text, record) => <Link to={`/data-manage/ProjectList/ExperimentList/ExperimentInfo?id=${record.id}`}>{text}</Link>
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
      title: 'Latest Time',
      dataIndex: 'latestTime',
      render: text => formatDate(text, 'YYYY-MM-DD HH:MM:SS')
    },
    {
      title: 'Operation',
      render: (item) => {
        return (
          <div>
            <a onClick={() => showEditModal(item)}>编辑</a>
          </div>
        );
      },
    },
  ];

  const showEditModal = (item) => {
    setVisible(true);
    setCurrent(item);
  };

  const handleCancel = () => {
    setVisible(false);
  };

  const handleSubmit = values => {
    const id = current ? current.id : '';
    const params = {id, ...values }
    dispatch({
      type: 'experimentList/update',
      payload: params
    });
  };

  const routes = [
    {
      path: 'index',
      breadcrumbName: 'Home',
    },
    {
      path: '/data-manage/ProjectList',
      breadcrumbName: 'Project List',
    },
    {
      path: '/data-manage/ProjectList/ExperimentList',
      breadcrumbName: 'Experiment List',
    },
  ];

  return (
    // <PageHeaderWrapper content={<FormattedMessage id="project.experimentlist.description" />}>
    <PageHeaderWrapper title="Experiment lists" content={'下面展示了实验列表。'} breadcrumb={{ routes }}>
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
      <ModalForm 
        current={current}
        visible={visible}
        onCancel={handleCancel}
        onSubmit={handleSubmit}
      />
    </PageHeaderWrapper>
  );
};

export default connect(({ experimentList, loading }) => ({
  experimentList,
  loading: loading.models.experimentList
}))(ExperimentList);