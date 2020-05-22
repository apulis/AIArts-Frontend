import { message, Table, Modal, Form, Input, Button } from 'antd';
import React, { useState, useEffect, useRef } from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { getProject, deleteProject, submit, edit } from './service';
import { PAGEPARAMS } from '../../const
import ModalForm from './components/ModalForm';
const { confirm } = Modal;

const DataSetList = () => {
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
      content: `确定要删除该数据集吗？`,
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
      title: '数据集ID',
      dataIndex: 'ProjectId',
      width: 300,
    },
    {
      title: '数据集名称',
      dataIndex: 'Name',
    },
    {
      title: '数据分类',
      dataIndex: 'type',
      render: () => <span>图片</span>,
    },
    {
      title: '数据集简介',
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
    // form.setFieldsValue(emptyValue);
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
        新增数据集
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
          title={`${modalType === 'edit' ? '编辑' : '新增'}数据集`}
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

export default DataSetList;
