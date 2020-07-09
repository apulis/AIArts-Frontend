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
  const { validateFields, getFieldValue,resetFields} = form;

  const engineType1 = [
  {
    name:'one',
    value:'one'
  },
  {
    name:'two',
    value:'two'
  },
  {
    name:'three',
    value:'three'
  }]
  const engineType2 = [
    {
      name:'one',
      value:'one'
    },
    {
      name:'two',
      value:'two'
    },
    {
      name:'three',
      value:'three'
    }]
  const nodeSpeciation = [
    {
      name:'one',
      value:'one'
    },
    {
      name:'two',
      value:'two'
    },
    {
      name:'three',
      value:'three'
    }]

  const handleSubmit = async () => {
    const values = await validateFields();// 提交前表单验证
    console.log('result',values);
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
          onFinish = {handleSubmit}
          validateMessages={validateMessages}
          form={form}
        >
          <Form.Item
            label="开发环境名称"
            name="devName"
            rules={[{ required: true}]}
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
            label="引擎类型"
            name="engineType"
          >
            <Select style={{ width: "50%" }} onChange={handleChange}>
              {
                engineType1.map((item)=>( <Option value={item.value}>{item.name}</Option>))
              }
            </Select>
            <Select style={{ width: "50%" }} onChange={handleChange}>
            {
                engineType2.map((item)=>(
                <Option value={item.value}>{item.name}</Option>
                ))
              }
            </Select>
          </Form.Item>
          <Form.Item
            label={<span>
              计算节点规格&nbsp;
            <Tooltip title="计算节点提示信息。。。。。">
                <QuestionCircleOutlined />
              </Tooltip>
            </span>}
            name="nodeSpecification"
            rules={[{ required: true,message:'请选择 计算节点规格'}]}
          >
            <Select style={{ width: "50%" }} onChange={handleChange}>
            {
                nodeSpeciation.map((item)=>(
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