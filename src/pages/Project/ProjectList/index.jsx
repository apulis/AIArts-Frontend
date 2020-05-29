import { Link } from 'umi'
import { message, Table, Modal, Form, Input, Button } from 'antd';
import React, { useState, useEffect, useRef } from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { getProjects, deleteProject, addProject, updateProject } from './services';
import { PAGEPARAMS } from '../../../const';
import ModalForm from './components/ModalForm';
import { connect } from 'umi';
import { formatDate } from '@/utils/time';

const ProjectList = props => {
  const {
    loading,
    dispatch,
    projectList: { data },
  } = props;
  // console.log(data)
  const [visible, setVisible] = useState(false);
  const [current, setCurrent] = useState(undefined);  
  const [pageParams, setPageParams] = useState(PAGEPARAMS);

  useEffect(() => {
    dispatch({
      type: 'projectList/fetch',
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
      width: 100,
      render: (text, record) => <Link to={ { pathname: '/project/basic-info', query: { id: record.id } } }>{text}</Link>
    },
    {
      title: 'Description',
      dataIndex: 'desc',
      ellipsis: true,
      width: 350,
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
    debugger
    const params = {id, ...values }
    dispatch({
      type: 'projectList/update',
      payload: params
    });
  };

  return (
    <>
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
    </>
  );
};

export default connect(({ projectList, loading }) => ({
  projectList,
  loading: loading.models.projectList,
}))(ProjectList);