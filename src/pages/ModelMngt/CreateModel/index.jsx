import { Link, history } from 'umi';
import { message, Table, Modal, Form, Input, Button, Space, Card, PageHeader, Tooltip } from 'antd';
import React, { useState, useEffect, useRef } from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { connect } from 'umi';
import { formatDate } from '@/utils/time';
import { FolderOpenOutlined } from '@ant-design/icons';
import ModalForm from './components/ModalForm';
import { addModel } from '../ModelList/services';
import { fetchAvilableResource } from '@/services/modelTraning';

const { TextArea } = Input;

const CreateModel = props => {
  // const {
  //   dispatch
  // } = props;
  const [codePathPrefix, setCodePathPrefix] = useState('');
  const [visible, setVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    getAvailableResource();
  }, []);

  const getAvailableResource = async () => {
    const res = await fetchAvilableResource();
    if (res.code === 0) {
      let { data: { codePathPrefix } } = res;
      if (!/\/$/.test(codePathPrefix)) {
        codePathPrefix = codePathPrefix + '/' 
      }
      
      setCodePathPrefix(codePathPrefix);
    }
  }

  const selectTrainingJob = () => {

  };

  const onFinish = async (values) => {
    // console.log(values);
    const { name, description, path, jobId } = values;
    const data = {
      name,
      description,
      path,
      jobId: jobId || '1'
    }
    
    const { code, msg } = await addModel(data);

    if (code === 0) {
      message.success(`创建成功`);
      history.push('/ModelList')
    } else {
      msg && message.error(`创建失败:${msg}`);
    }
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
    // console.log(item)
    form.setFieldsValue({job: item.name, jobId: item.id});
    setVisible(false);
  };

  const layout = {
    labelCol: { span: 3 },
    wrapperCol: { span: 8 }
  };

  return (
    <>
    <PageHeader
      ghost={false}
      onBack={() => history.push('/ModelList')}
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
            name="name"
            label="名称"
            rules={[{ required: true, message: '名称不能为空!' }]}
          >
            <Input placeholder="请输入模型名称" />
          </Form.Item>
          <Form.Item
            labelCol={{ span: 3 }} 
            wrapperCol={{ span: 14 }}
            name="description"
            label="描述"
            rules={[{ max: 256 }]}
          >
            <TextArea rows={4} placeholder="请输入描述信息" />
          </Form.Item>
          <Form.Item
            {...layout}
            name="path"
            label="存储路径"
            rules={[{ required: true, message: '存储路径不能为空!' }]}
          >
            <Input addonBefore={codePathPrefix} placeholder="请输入存储路径" />
          </Form.Item>       
          <Form.Item
            {...layout}
            label="选择训练作业"
            // rules={[{ required: true, message: '训练作业不能为空!' }]}
          >
            <Form.Item
              name="job"
              rules={[{ required: true, message: '训练作业不能为空!' }]}
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
              name="jobId"
              hidden            
            >
              <Input type="hidden"/>
            </Form.Item>          
          <Form.Item
            style={{ float: 'right' }}
          >
            <Button type="primary" htmlType="submit">立即创建</Button>
          </Form.Item>
        </Form>
      </div>
    </PageHeader>
    {/* 选择训练作业弹框 */}
    {
      visible && <ModalForm
      // current={current}
      visible={visible}
      onCancel={handleCancel}
      onSubmit={handleSubmit}
    />
    }
    </>  
  );
};

export default CreateModel;