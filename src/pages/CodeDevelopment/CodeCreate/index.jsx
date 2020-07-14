import React, { useState, useEffect, useRef } from 'react';
import { Form, Input, Button, Select, Tooltip, Row, Col, PageHeader, message, Modal } from 'antd';
import { history } from 'umi';
import { postCode, getResource } from '../service.js'
const CodeCreate = () => {
  const [form] = Form.useForm();
  const { Option } = Select;
  const { TextArea } = Input;
  let [data, setData] = useState(null)
  const [deviceTypeArr, setDeviceTypeArr] = useState([])// 更新状态是异步的
  const [deviceNumArr, setDeviceNumArr] = useState([])
  const [engineTypeArr, setEngineTypeArr] = useState([])
  const [engineNameArr, setengineNameArr] = useState([])
  const [codePathPrefix, setCodePathPrefix] = useState('')
  useEffect(() => {// 初始化处理
    renderForm()
  }, [])// 更新处理
  const renderForm = async () => {
    const result = await apiGetResource()
    if(result){
      setData(result)
      setCodePathPrefix(result.codePathPrefix)
      setEngineTypeArr(Object.keys(result.aiFrameworks))
      setDeviceTypeArr(result.deviceList.map((item) => (item.deviceType)))
    }
  }
  const apiPostCode = async (values) => {
    const obj = await postCode(values)
    const {code,data,msg} = obj
    if(code===0){
      message.success('创建成功')
      history.push('/CodeList')
    } else {
      message.error(msg)
    }
  }
  const apiGetResource = async () => {
    const obj = await getResource()
    const { code, data, msg } = obj
    if (code === 0) {
      return data
    } else {
      message.error(msg)
      return null
    }
  }
  const { validateFields } = form;
  const handleSubmit = async () => {
    const values = await validateFields();
    values.codePath = codePathPrefix+values.codePath
    apiPostCode(values)
  }

  const handleEngineTypeChange = (item) => {
    setengineNameArr(data.aiFrameworks[item])
  }
  const handleDeviceTypeChange = (item,option) => {
    const avail = data['deviceList'][option.index].avail
    let arr = []
    if(avail>=2){
      arr = [0,1,2]
    }else if(avail==1){
      arr = [0,1]
    }else{
      message.info('该设备无可用资源')
    }
    setDeviceNumArr(arr)
  }
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
            label="引擎类型"
            >
            <Form.Item rules={[{ required: true, message: '请选择 引擎类型' }]} style={{ display: 'inline-block', width: 'calc(50% - 8px)' }}>
            <Select defaultValue={engineTypeArr[0] ? engineTypeArr[0] : ''}  onChange={handleEngineTypeChange}>
              {
                engineTypeArr.map((item) => (
                  <Option value={item}>{item}</Option>
                ))
              }
            </Select>
            </Form.Item>
            <Form.Item name="engine" rules={[{ required: true, message: '请选择 引擎名称' }]} style={{ display: 'inline-block', width: 'calc(50%)', margin: '0 0 0 8px' }}>
            <Select defaultValue={engineNameArr[0] ? engineNameArr[0] : ''}>
              {
                engineNameArr.map((item) => (
                  <Option value={item}>{item}</Option>
                ))
              }
            </Select>
            </Form.Item>
          </Form.Item>
          <Form.Item
            label="设备类型"
            name="deviceType"
            rules={[{ required: true }]}
          >
            <Select defaultValue={deviceTypeArr[0] ? deviceTypeArr[0] : ''} style={{ width: "50%" }} onChange={handleDeviceTypeChange}>
              {
                deviceTypeArr.map((item,index) => (<Option value={item} index={index}>{item}</Option>))
              }
            </Select>
          </Form.Item>
          <Form.Item
            label="设备数量"
            name="deviceNum"
            rules={[{ required: true }]}
          >
            <Select defaultValue={deviceNumArr[0] ? deviceNumArr[0] : ''} style={{ width: "50%" }}>
              {
                deviceNumArr.map((item) => (
                  <Option value={item}>{item}</Option>
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