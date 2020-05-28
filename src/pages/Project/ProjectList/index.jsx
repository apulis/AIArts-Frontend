import { message, Table, Modal, Form, Input, Button } from 'antd';
import React, { useState, useEffect, useRef } from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { getProjects, deleteProject, addProject, updateProject } from './services';
import { PAGEPARAMS } from '../../../const';
import ModalForm from './components/ModalForm';
import { connect } from 'umi';

const { confirm } = Modal;

const ProjectList = props => {
  const {
    loading,
    dispatch,
    projectList: { data },
  } = props;
  console.log(data)
  const emptyValue = { Name: '', Info: '' };
  const [project, setProject] = useState({ data: [], total: 0 });
  const [modalFlag, setModalFlag] = useState(false);
  const [modalType, setModalType] = useState('');
  const [pageParams, setPageParams] = useState(PAGEPARAMS);
  const [editProjectId, setEditProjectId] = useState('');
  const [form] = Form.useForm();
  const modalFormRef = useRef();

  // useEffect(() => {
  //   getData();
  // }, [pageParams]);
  useEffect(() => {
    dispatch({
      type: 'projectList/fetch',
      payload: {
        current: pageParams.page,
        pageSize: pageParams.size
      },
    });
  }, [pageParams]);
  const getData = async () => {
    const { page, size } = pageParams;
    const { successful, projects, msg, totalCount } = await getProjects(page, size);
    if (successful === 'true') {
      setProject({
        data: projects,
        total: totalCount,
      });
    }
  };

  const pageParamsChange = (page, size) => {
    setPageParams({ page: page, size: size });
  };

  const onSubmit = () => {
    console.log('tttttt', modalFormRef.current.hello());
  };

  const columns = [
    // {
    //   title: 'ID',
    //   dataIndex: 'ProjectId'
    // },
    {
      title: 'Name',
      dataIndex: 'name',
      width: 100
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
      // render: () => <span>图片</span>,
    },
    {
      title: 'Operation',
      render: (item) => {
        return (
          <div>
            <a onClick={() => onEditClick(item)}>编辑</a>
          </div>
        );
      },
    },
  ];

  const onEditClick = (item) => {
    form.setFieldsValue(item);
    setEditProjectId(item.ProjectId);
    setModalType('edit');
    setModalFlag(true);
  };

  const resetModal = (type) => {
    // form.setFieldsValue(emptyValue);
    setModalFlag(type);
  };

  return (
    <>
      <Table
        columns={columns}
        // dataSource={project.data}
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
      {modalFlag && (
        <Modal
          title={`${modalType === 'edit' ? '编辑' : '新增'}项目`}
          visible={modalFlag}
          onOk={onSubmit}
          onCancel={() => resetModal(false)}
          okText="提交"
          cancelText="取消"
          destroyOnClose
          maskClosable={false}
          width={600}
        >
          <ModalForm ref={modalFormRef}></ModalForm>
        </Modal>
      )}
    </>
  );
};

// export default ProjectList;
export default connect(({ projectList, loading }) => ({
  projectList,
  loading: loading.models.projectList,
}))(ProjectList);
