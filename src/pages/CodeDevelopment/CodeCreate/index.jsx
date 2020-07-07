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
      xs: { span: 24 },
      sm: { span: 8 },
    },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 16 },
    },
  };
  const { validateFields, getFieldsValue } = form;
  const handleClick = async () => {
    const result = await validateFields();// 提交前表单验证
    alert(result.toString());
  }
  const handleChange = (value) => {
    console.log(`selected ${value}`)
  }
  return (
    <>
      <PageHeader ghost={false}
        onBack={() => history.push('/AIarts/CodeList')}
        title="返回代码开发">
      </PageHeader>
      <div style={{ margin: "50px", width:"600px" }}>
        <Form
          {...formItemLayout}
          labelAlign='left'
        >
          <Form.Item
            label="开发环境名称"
            name="username"
            rules={[{ required: true, message: '请输入开发环境名称' }]}
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
            <Select defaultValue="tensorflow" style={{ width: "50%" }} onChange={handleChange}>
              <Option value="what">what</Option>
              <Option value="tensorflow">tensorflow</Option>
            </Select>
            <Select defaultValue="tf-1.8.0-py2.7" style={{ width: "50%" }} onChange={handleChange}>
              <Option value="tf-1.8.0-py2.7">tf-1.8.0-py2.7</Option>
              <Option value="tf-1.8.0-py3.7">tf-1.8.0-py3.7</Option>
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
            rules={[{ required: true }]}
          >
            <Select style={{ width: "50%" }} onChange={handleChange}>
              <Option value="one">one</Option>
              <Option value="two">two</Option>
              <Option value="three">three</Option>
              <Option value="four">four</Option>
            </Select>
          </Form.Item>
        </Form>
      </div>
      <Row style={{ float: "right" }}>
          <Button type="primary" danger onClick={handleClick}>立即创建</Button>
        </Row>
    </>
  )

}

export default CodeCreate;