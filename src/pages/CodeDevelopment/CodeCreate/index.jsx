import React, { useState, useEffect, useRef } from 'react';
import { Form, Input, Button, Select, Tooltip, Row, Col, PageHeader, message, Modal } from 'antd';
import { history } from 'umi';
import { postCode, getResource } from '../service.js'
const CodeCreate = () => {
  const [form] = Form.useForm();
  const { Option } = Select;
  const { TextArea } = Input;
  const [deviceTypeArr, setDeviceTypeArr] = useState([])
  const [deviceNumArr, setDeviceNumArr] = useState([])
  const [engineTypeArr, setEngineTypeArr] = useState([])
  const [modelVisible, setModelVisible] = useState(false)
  const [codePathPrefix, setCodePathPrefix] = useState('')
  useEffect(() => {// 初始化处理
    renderForm()
  }, [])// 更新处理
  const renderForm = () => {
    // todo
    // const result = apiGetResource()
    const result = {
      codePathPrefix: 'xxx/xxx/xxx/',
      deviceTypeArr: [{ value: 'one', name: 'one' }, { value: 'two', name: 'two' }, { value: 'three', name: 'three' }],
      deviceNumArr: [{ value: 'one', name: 'one' }, { value: 'two', name: 'two' }, { value: 'three', name: 'three' }],
      engineTypeArr: [{ value: 'one', name: 'one' }, { value: 'two', name: 'two' }, { value: 'three', name: 'three' }],
    }
    setCodePathPrefix(result.codePathPrefix)
    setDeviceTypeArr(result.deviceTypeArr)
    setDeviceNumArr(result.deviceNumArr)
    setEngineTypeArr(result.engineTypeArr)
  }
  const apiPostCode = async (data) => {
    console.log('formData', data)
    // todo 
    // const obj = await postCode(data)
    // const {code,data,msg} = obj
    // if(code===0){
    if (1) {
      // 创建成功后跳转
      showModal()
    } else {
      message.error(msg)
    }
  }
  const apiGetResource = async () => {
    // todo
    // const obj = await getResource()
    // const {code,data,msg} = obj
    // if(code===0){
    // return data
    // }else{
    //   message.error(msg)
    // }
  }
  const { validateFields, getFieldValue, resetFields } = form;
  const handleSubmit = async () => {
    const values = await validateFields();// 提交前表单验证
    console.log('result', values);
    apiPostCode(values)
    resetFields()
  }
  const showModal = () => {
    setModelVisible(true)
  };
  const handleOk = e => {
    setModelVisible(false)
    history.push('/CodeList')
  };

  const handleCancel = e => {
    setModelVisible(false)
  };
  const validateMessages = {
    required: '${label} 是必填项!',
    types: {
    },
  }
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
            name="name"
            rules={[{ required: true }]}
          >
            <Input placeholder="请输入开发环境名称" />
          </Form.Item>
          <Form.Item
            label="描述"
            name="desc"
          >
            <TextArea
              placeholder="请输入描述信息"
              autoSize={{ minRows: 2, maxRows: 6 }}
              maxLength={256}
            />
          </Form.Item>
          <Form.Item
            label="代码存储路径"
            name="codePath"
            rules={[{ required: true }]}
          >
            <Input addonBefore={codePathPrefix} placeholder="代码存储路径" />
          </Form.Item>
          <Form.Item
            label="引擎"
            name="engine"
            rules={[{ required: true, message: '请选择 引擎' }]}
          >
            <Select defaultValue={engineTypeArr[0] ? engineTypeArr[0].name : ''} style={{ width: "50%" }}>
              {
                engineTypeArr.map((item) => (
                  <Option value={item.value}>{item.name}</Option>
                ))
              }
            </Select>
          </Form.Item>
          <Form.Item
            label="设备类型"
            name="deviceType"
            rules={[{ required: true }]}
          >
            <Select defaultValue={deviceTypeArr[0] ? deviceTypeArr[0].name : ''} style={{ width: "50%" }}>
              {
                deviceTypeArr.map((item) => (<Option value={item.value}>{item.name}</Option>))
              }
            </Select>
          </Form.Item>
          <Form.Item
            label="设备数量"
            name="deviceNum"
            rules={[{ required: true }]}
          >
            <Select defaultValue={deviceNumArr[0] ? deviceNumArr[0].name : ''} style={{ width: "50%" }}>
              {
                deviceNumArr.map((item) => (
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
      <Modal
        title="创建成功"
        visible={modelVisible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <p>点击确定跳转回列表页面</p>
      </Modal>
    </>
  )

}

export default CodeCreate;