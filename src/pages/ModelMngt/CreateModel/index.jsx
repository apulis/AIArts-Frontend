import { Link, history } from 'umi'
import { message, Table, Modal, Form, Input, Button, Space, Card, PageHeader } from 'antd';
import React, { useState, useEffect, useRef } from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { getProjects, deleteProject, addProject, updateProject } from './services';
import { connect } from 'umi';
import { formatDate } from '@/utils/time';
import { FolderOpenOutlined } from '@ant-design/icons';
import ModalForm from './components/ModalForm';

const { TextArea } = Input;

const CreateModel = props => {
  const {
    dispatch
  } = props;
  const [visible, setVisible] = useState(false);
  const [form] = Form.useForm();

  const selectTrainingJob = () => {

  };

  const onFinish = values => {
    console.log(values.modelName);
  };

  const showJobModal = () => {
    setVisible(true);
    // setCurrent(item);
  };

  const onReset = () => {
    form.resetFields();
  };

  const handleCancel = () => {
    setVisible(false);
  };

  const handleSubmit = item => {
    // const id = item ? item.id : '';
    // const params = {id, ...values }
    // dispatch({
    //   type: 'modelList/update',
    //   payload: params
    // });
    form.setFieldsValue(item);
  };

  const layout = {
    labelCol: { span: 3 },
    wrapperCol: { span: 8 }
  };

  return (
    <>
    <PageHeader
      ghost={false}
      onBack={() => history.push('/aIarts/ModelList')}
      title="创建模型"
    >
      <div
        style={{
          padding: '24px'
        }}
      >
        <Form
          form={form}
          onFinish={onFinish}
        >
          <Form.Item
            {...layout}
            name="modelName"
            label="名称"
            rules={[{ required: true, message: '名称不能为空!' }]}
          >
            <Input placeholder="请输入模型名称" />
          </Form.Item>
          <Form.Item
            labelCol={{ span: 3 }} 
            wrapperCol={{ span: 14 }}
            name="desc"
            label="描述"
          >
            <TextArea rows={4} placeholder="请输入描述信息" maxLength={256}/>
          </Form.Item>
          <Form.Item
            {...layout}
            name='jobWrapper'
            label="选择训练作业"
            rules={[{ required: true, message: '训练作业不能为空!' }]}
          >
            <Form.Item
              name="job" 
              style={{ display: 'inline-block', width: 'calc(95% - 4px)' }}              
            >
              <Input placeholder="请选择训练作业名称" />
            </Form.Item>
            <Form.Item
              style={{ display: 'inline-block', width: 'calc(5% - 4px)', margin: '0 0 0 8px' }}
            >
              <Button icon={<FolderOpenOutlined />} onClick={showJobModal}></Button>
            </Form.Item>
          </Form.Item>
          <Form.Item
            style={{ float: 'right' }}
          >
            <Button type="primary" htmlType="submit">立即创建</Button>
          </Form.Item>
        </Form>
      </div>
    </PageHeader>
    <ModalForm
      // current={current}
      visible={visible}
      onCancel={handleCancel}
      onSubmit={handleSubmit}
    />
    </>  
  );
};

export default CreateModel;