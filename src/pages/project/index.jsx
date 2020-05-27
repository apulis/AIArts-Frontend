import { message, Table, Modal, Form, Input, Button } from 'antd';
import React, { useState, useEffect, useRef } from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { getProject, deleteProject, submit, edit } from './service';
import { PAGEPARAMS } from '../../const';
import ModalForm from './components/ModalForm';
const { confirm } = Modal;

const ProjectList = () => {
  const emptyValue = { Name: '', Info: '' };
  const [project, setProject] = useState({ data: [], total: 0 });
  const [modalFlag, setModalFlag] = useState(false);
  const [modalType, setModalType] = useState('');
  const [pageParams, setPageParams] = useState(PAGEPARAMS);
  const [editProjectId, setEditProjectId] = useState('');
  const [form] = Form.useForm();
  const modalFormRef = useRef();

  useEffect(() => {
    getData();
  }, [pageParams]);

  const getData = async () => {
    const { page, size } = pageParams;
    const { successful, projects, msg, totalCount } = await getProject(page, size);
    if (successful === 'true') {
      setProject({
        data: projects,
        total: totalCount,
      });
    }
  };

  const handleRemove = (id) => {
    confirm({
      content: `确定要删除该项目吗？`,
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        const res = await deleteProject(id);
        const { successful, msg } = res;
        if (successful === 'true') {
          getData();
        }
      },
      onCancel() {},
    });
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
      dataIndex: 'Name',
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
            {/* <a
              style={{ color: 'red', marginLeft: 10 }}
              onClick={() => handleRemove(item.ProjectId)}
            >
              删除
            </a> */}
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
      {/* <Button
        type="primary"
        style={{ marginBottom: 14 }}
        onClick={() => {
          setModalType('new');
          resetModal(true);
        }}
      >
        新增数据集
      </Button> */}
      <Table
        columns={columns}
        dataSource={project.data}
        rowKey={(r, i) => `${i}`}
        // rowSelection={{
        //   type: 'checkbox'
        // }}
        pagination={{
          total: project.total,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条`,
          showSizeChanger: true,
          onChange: pageParamsChange,
          onShowSizeChange: pageParamsChange,
        }}
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

export default ProjectList;
