import React from 'react';
import { Form, Input, Button, Select, Tooltip, Row, Col, PageHeader } from 'antd';
import { history } from 'umi';
import { QuestionCircleOutlined } from '@ant-design/icons';
const CodeCreate = () => {
  const [form] = Form.useForm();
  const { Option } = Select;
  const { TextArea } = Input;
  const formItemLayout = {
    labelCol: {
      span: 4
    },
    wrapperCol: {
      span: 12
    },
  };
  const buttonItemLayout = {
    wrapperCol: {
      span: 2,
      offset: 22
    }
  }
  const { validateFields, getFieldValue, resetFields } = form;
  const codeStorePath = 'xxxxxxxxxxx'
  const deviceType = [
    {
      name: 'one',
      value: 'one'
    },
    {
      name: 'two',
      value: 'two'
    },
    {
      name: 'three',
      value: 'three'
    }]
  const deviceNum = [
    {
      name: 'one',
      value: 'one'
    },
    {
      name: 'two',
      value: 'two'
    },
    {
      name: 'three',
      value: 'three'
    }]
  const engineType = [
    {
      name: 'one',
      value: 'one'
    },
    {
      name: 'two',
      value: 'two'
    },
    {
      name: 'three',
      value: 'three'
    }]

  const handleSubmit = async () => {
    const values = await validateFields();// 提交前表单验证
    console.log('result', values);
    // if success
    resetFields()
  }
  const handleChange = (value) => {
    console.log(`selected ${value}`)
  }
  const validateMessages = {
    required: '${label} 是必填项!',
    types: {
    },
  }
  return (
    <>
      <PageHeader ghost={false}
        onBack={() => history.push('/CodeList')}
        title="返回代码开发">
      </PageHeader>
      <div style={{ margin: "50px" }}>
        <Form
          {...formItemLayout}
          labelAlign='right'
          onFinish={handleSubmit}
          validateMessages={validateMessages}
          form={form}
        >
          <Form.Item
            label="开发环境名称"
            name="devName"
            rules={[{ required: true }]}
          >
            <Input placeholder="请输入开发环境名称" />
          </Form.Item>
          <Form.Item
            label="描述"
            name="description"
          >
            <TextArea
              placeholder="请输入描述信息"
              autoSize={{ minRows: 2, maxRows: 6 }}
              maxLength={256}
            />
          </Form.Item>
          <Form.Item
            label="代码存储路径"
            name="codeStorePath"
            rules={[{ required: true }]}
          >
            {codeStorePath}
            <Input placeholder="代码存储路径" />
          </Form.Item>
          <Form.Item
            label="设备类型"
            name="deviceType"
            rules={[{ required: true }]}
          >
            <Select defaultValue={deviceType[0].name}   style={{ width: "50%" }} onChange={handleChange}>
              {
                deviceType.map((item) => (<Option value={item.value}>{item.name}</Option>))
              }
            </Select>
          </Form.Item>
          <Form.Item
            label="设备数量"
            name="deviceNum"
            rules={[{ required: true }]}
          >
            <Select defaultValue={deviceNum[0].name} style={{ width: "50%" }} onChange={handleChange}>
              {
                deviceNum.map((item) => (
                  <Option value={item.value}>{item.name}</Option>
                ))
              }
            </Select>
          </Form.Item>
          <Form.Item
            label="引擎类型"
            name="engineType"
            rules={[{ required: true, message: '请选择 引擎类型' }]}
          >
            <Select defaultValue={engineType[0].name} style={{ width: "50%" }} onChange={handleChange}>
              {
                engineType.map((item) => (
                  <Option value={item.value}>{item.name}</Option>
                ))
              }
            </Select>
          </Form.Item>
          <Form.Item {...buttonItemLayout}>
            <Button type="primary" htmlType="submit">立即创建</Button>
          </Form.Item>
        </Form>
      </div>

    </>
  )

}

export default CodeCreate;