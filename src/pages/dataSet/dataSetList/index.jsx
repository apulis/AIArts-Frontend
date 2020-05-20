import { message, Table, Modal, Form, Input, Button } from 'antd';
import React, { useState, useEffect } from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { getProject, deleteProject, submit, edit } from './service';
import { PAGEPARAMS } from '../../../const';
const { confirm } = Modal;

const DataSetList = () => {
  const emptyValue = { Name: '', Info: '' };
  const [project, setProject] = useState({ data: [], total: 0 });
  const [modalFlag, setModalFlag] = useState(false);
  const [modalType, setModalType] = useState('');
  const [pageParams, setPageParams] = useState(PAGEPARAMS);
  const [editProjectId, setEditProjectId] = useState('');
  const [form] = Form.useForm();

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
    form
      .validateFields()
      .then(async (values) => {
        if (modalType === 'new') {
          await submit(values);
        } else if (modalType === 'edit') {
          await edit(editProjectId, values);
        }
        message.success('提交成功！');
        resetModal(false);
        getData();
      })
      .catch((info) => {
        message.error('提交失败！');
        console.log('Validate Failed:', info);
      });
  };

  const columns = [
    {
      title: '项目ID',
      dataIndex: 'ProjectId',
      width: 300,
    },
    {
      title: '项目名称',
      dataIndex: 'Name',
    },
    {
      title: '项目分类',
      dataIndex: 'type',
      render: () => <span>图片标注</span>,
    },
    {
      title: '项目描述',
      dataIndex: 'Info',
      ellipsis: true,
      width: 350,
    },
    {
      title: '操作',
      render: (item) => {
        return (
          <div>
            <a onClick={() => onEditClick(item)}>编辑</a>
            <a
              style={{ color: 'red', marginLeft: 10 }}
              onClick={() => handleRemove(item.ProjectId)}
            >
              删除
            </a>
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
    form.setFieldsValue(emptyValue);
    setModalFlag(type);
  };

  return (
    <>
      <Button
        type="primary"
        style={{ marginBottom: 14 }}
        onClick={() => {
          setModalType('new');
          resetModal(true);
        }}
      >
        新建项目
      </Button>
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
          title={`${modalType === 'edit' ? '编辑' : '新建'}项目`}
          visible={modalFlag}
          onOk={onSubmit}
          onCancel={() => resetModal(false)}
          okText="提交"
          cancelText="取消"
          destroyOnClose
        >
          <Form form={form}>
            <Form.Item
              label="项目名称"
              name="Name"
              rules={[{ required: true, message: '请填写项目名称' }]}
            >
              <Input placeholder="请填写项目名称" />
            </Form.Item>
            <Form.Item
              label="项目描述"
              name="Info"
              rules={[{ required: true, message: '请填写项目描述' }, { min: 10 }]}
            >
              <Input.TextArea placeholder="请填写项目描述" autoSize={{ minRows: 4 }} />
            </Form.Item>
          </Form>
        </Modal>
      )}
    </>
  );
};

export default DataSetList;
