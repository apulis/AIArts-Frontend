import { message, Table, Modal, Form, Input, Button } from 'antd';
import React, { useState, useEffect } from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { getProject, deleteProject, submit, edit } from './service';
import { PAGEPARAMS } from '../../const';
const { confirm } = Modal;

const DataSetList = () => {
  const emptyValue = { Name: '', Info: '' };
  const [project, setProject] = useState({ data: [], total: 0 });
  const [modalFlag, setModalFlag] = useState(false);
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

  const pageParamsChange = (page, size) => {
    setPageParams({ page: page, size: size });
  };

  const onSubmit = () => {
    // form.validateFields()
    //   .then(async (values) => {
    //     if (modalType === 'new') {
    //       await submit(values);
    //     } else if (modalType === 'edit') {
    //       await edit(editProjectId, values);
    //     }
    //     message.success('提交成功！');
    //     resetModal(false);
    //     getData();
    //   })
    //   .catch((info) => {
    //     message.error('提交失败！');
    //     console.log('Validate Failed:', info);
    //   });
  };

  const columns = [
    {
      title: 'Dataset Name',
      dataIndex: 'Name',
    },
    {
      title: 'Description',
      dataIndex: 'Info',
      ellipsis: true,
      width: 350,
    },
    {
      title: 'Creator',
      dataIndex: 'Creator',
    },
    {
      title: 'Update Time',
      dataIndex: 'Update Time',
    },
    {
      title: 'Update Version',
      dataIndex: 'Update Version',
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
        dataSource={project.data}
        rowKey={(r, i) => `${i}`}
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
          title='编辑数据集'
          visible={modalFlag}
          onOk={onSubmit}
          onCancel={() => resetModal(false)}
          okText="Submit"
          cancelText="Cancel"
          destroyOnClose
          maskClosable={false}
        >
          <Form form={form}>
            <Form.Item
              label="Dataset Name"
              name="Name"
              rules={[{ required: true }]}
            >
              <Input disabled />
            </Form.Item>
            <Form.Item
              label="Description"
              name="Info"
              rules={[{ required: true, message: 'Description is required！' }]}
            >
              <Input.TextArea placeholder="please enter description" autoSize={{ minRows: 4 }} />
            </Form.Item>
          </Form>
        </Modal>
      )}
    </>
  );
};

export default DataSetList;
