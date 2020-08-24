import React from 'react';
import { Form, Input, PageHeader, Button, message } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { jobNameReg } from '@/utils/reg';
import { createVisualization } from '@/services/modelTraning';
import { history } from 'umi';



const { TextArea } = Input;

export default function CreateVisualization() {
  const goBackPath = '/model-training/visualization';
  const [form] = useForm();
  const { validateFields } = form;


  const onCreate = async () => {
    const values = await validateFields();
    const res = await createVisualization(values);
    if (res.code === 0) {
      message.success('创建成功')
    }
  };


  return (
    <>
      <PageHeader
        className="site-page-header"
        onBack={() => history.push(goBackPath)}
        title='创建可视化作业'
      />
      <Form form={form}>
        <Form.Item labelCol={{ span: 4 }} wrapperCol={{ span: 14 }} style={{ marginTop: '30px' }} name="name" label="可视化作业名称" rules={[{ required: true }, { ...jobNameReg }]}>
          <Input style={{ width: 300 }} placeholder="请输入可视化作业名称" />
        </Form.Item>
        <Form.Item labelCol={{ span: 4 }} wrapperCol={{ span: 14 }} name="tensorboardLogDir" label="可视化日志路径" rules={[{ required: true }]}>
          <Input placeholder="请输入可视化日志路径" />
        </Form.Item>
        <Form.Item labelCol={{ span: 4 }} wrapperCol={{ span: 14 }} name="description" label="描述" rules={[{ max: 191 }]}>
          <TextArea placeholder="请输入描述信息" />
        </Form.Item>
      </Form>
      <Button type="primary" onClick={onCreate} style={{ marginLeft: '16.7%' }}>创建</Button>
    </>
  );
}
