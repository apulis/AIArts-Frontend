import React, { useState, useEffect, useRef } from 'react';
import { Form, Input, Button, Select, Tooltip, Row, Col, PageHeader, message, Modal, Tabs,InputNumber } from 'antd';
import { history } from 'umi';
import { postCode1,postCode2, getResource } from '../service.js'
const CodeCreate = () => {
  const [form1] = Form.useForm();
  const [form2] = Form.useForm();
  const {TabPane} = Tabs;
  const { validateFields: validateFields1, setFieldsValue: setFieldsValue1,getFieldValue:getFieldValue1 } = form1;
  const { validateFields: validateFields2, setFieldsValue: setFieldsValue2 ,getFieldValue:getFieldValue2} = form2;
  const { Option } = Select;
  const { TextArea } = Input;
  let [data, setData] = useState(null)
  const [deviceTypeArr1, setDeviceTypeArr1] = useState([])// 更新状态是异步的
  const [deviceNumArr1, setDeviceNumArr1] = useState([])
  const [engineTypeArr1, setEngineTypeArr1] = useState([])
  const [engineNameArr1, setEngineNameArr1] = useState([])
  const [codePathPrefix1, setCodePathPrefix1] = useState('')

  const [deviceTypeArr2, setDeviceTypeArr2] = useState([])// 更新状态是异步的
  const [deviceNumPerNodeArr2, setDeviceNumPerNodeArr2] = useState([])
  const [engineTypeArr2, setEngineTypeArr2] = useState([])
  const [engineNameArr2, setEngineNameArr2] = useState([])
  const [codePathPrefix2, setCodePathPrefix2] = useState('')
  const [maxNodeNum,setMaxNodeNum] = useState([1])
  useEffect(() => {// 初始化处理
    renderForm()
  }, [])// 更新处理
  const renderForm = async () => {
    const result = await apiGetResource()
    if (result) {
      setData(result)
      const enginTypeArrData = Object.keys(result.aiFrameworks)
      const deviceTypeArrData = result.deviceList.map((item) => (item.deviceType))
      setCodePathPrefix1(result.codePathPrefix)
      setEngineTypeArr1(enginTypeArrData)
      setDeviceTypeArr1(deviceTypeArrData)
      setFieldsValue1({ 'engineType': enginTypeArrData[0], 'engine': result.aiFrameworks[enginTypeArrData[0]][0], 'deviceType': deviceTypeArrData[0], 'deviceNum': result.deviceList[0] && result.deviceList[0].avail && canSelectUtil(result.deviceList[0].avail)[0] })
      
      setCodePathPrefix2(result.codePathPrefix)
      setEngineTypeArr2(enginTypeArrData)
      setDeviceTypeArr2(deviceTypeArrData)
      setDeviceNumPerNodeArr2([])
      setMaxNodeNum(10)
      setFieldsValue2({ 'engineType': enginTypeArrData[0], 'engine': result.aiFrameworks[enginTypeArrData[0]][0], 'deviceType': deviceTypeArrData[0] ,'nodeNum':7,'deviceNumPerNode':8,'totalDeviceNum':7*8})
    }
  }
  const apiPostCode1 = async (values) => {
    const obj = await postCode1(values)
    const { code, data, msg } = obj
    if (code === 0) {
      message.success('创建成功')
      history.push('/CodeList')
    } else {
      message.error(msg)
    }
  }
  const apiPostCode2 = async (values) => {
    const obj = await postCode2(values)
    const { code, data, msg } = obj
    if (code === 0) {
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
  const canSelectUtil = (avail) => {
    let arr = []
    if (avail >= 2) {
      arr = [0, 1, 2]
    } else if (avail == 1) {
      arr = [0, 1]
    } else {
      arr = [0]
    }
    return arr
  }
  const handleSubmit1 = async () => {
    // todo 提取数据映射
    const values = await validateFields1();
    values.codePath = codePathPrefix1 + values.codePath
    apiPostCode1(values)
  }

  const handleEngineTypeChange1 = (engineType) => {
    const arr = data.aiFrameworks[engineType]
    setFieldsValue1({ 'engine': arr[0]||''})
    setEngineNameArr1(arr)
  }
  const handleDeviceTypeChange1 = (index) => {
    const avail = data['deviceList'][index].avail
    const arr = canSelectUtil(avail)
    setFieldsValue1({ 'deviceNum': arr[0]})
    setDeviceNumArr1(arr)
  }
  const handleSubmit2 = async () => {
    // todo 提取数据映射
    const values = await validateFields2();
    values.codePath = codePathPrefix2 + values.codePath
    apiPostCode2(values)
  }

  const handleEngineTypeChange2 = (engineType) => {
    const arr = data.aiFrameworks[engineType]
    setFieldsValue2({ 'engine': arr[0]||'' })
    setEngineNameArr2(arr)
  }
  const handleDeviceTypeChange2 = (index) => {
    const avail = data['deviceList'][index].avail
    const arr = canSelectUtil(avail)
    // setFieldsValue2({ 'deviceNum': arr[0] })
    // setDeviceNumArr2(arr)
  }
  const handleCaclTotalDeviceNum2 = (nodeNum,perNodeDeviceNum)=>{
    setFieldsValue2({'totalDeviceNum':nodeNum * perNodeDeviceNum})
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
      <div style={{ margin: "20px 0 0 50px" }}>
      <Tabs defaultActiveKey="1" >
        <TabPane tab="常规任务" key="1">
        <Form
          {...formItemLayout}
          labelAlign='right'
          onFinish={handleSubmit1}
          validateMessages={validateMessages}
          form={form1}
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
            <Input addonBefore={codePathPrefix1} placeholder="代码存储路径" />
          </Form.Item>
          <Form.Item
            label="引擎类型"
            required
          >
            <Form.Item name='engineType' rules={[{ required: true, message: '请选择 引擎类型' }]} style={{ display: 'inline-block', width: 'calc(50% - 8px)' }}>
              <Select onChange={()=>handleEngineTypeChange1(getFieldValue1('engineType'))}>
                {
                  engineTypeArr1.map((item) => (
                    <Option value={item}>{item}</Option>
                  ))
                }
              </Select>
            </Form.Item>
            <Form.Item name="engine" rules={[{ required: true, message: '请选择 引擎名称' }]} style={{ display: 'inline-block', width: 'calc(50%)', margin: '0 0 0 8px' }}>
              <Select>
                {
                  engineNameArr1.map((item) => (
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
            <Select style={{ width: "50%" }}  onChange={(item,option)=>handleDeviceTypeChange1(option.index)}>
              {
                deviceTypeArr1.map((item, index) => (<Option value={item} index={index}>{item}</Option>))
              }
            </Select>
          </Form.Item>
          <Form.Item
            label="设备数量"
            name="deviceNum"
            rules={[{ required: true }]}
          >
            <Select style={{ width: "50%" }}>
              {
                deviceNumArr1.map((item) => (
                  <Option value={item}>{item}</Option>
                ))
              }
            </Select>
          </Form.Item>
          <Form.Item {...buttonItemLayout}>
            <Button type="primary" htmlType="submit">立即创建</Button>
          </Form.Item>
        </Form>
    </TabPane>
        <TabPane tab="分布式任务" key="2">
        <Form
          {...formItemLayout}
          labelAlign='right'
          onFinish={handleSubmit2}
          validateMessages={validateMessages}
          form={form2}
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
            <Input addonBefore={codePathPrefix2} placeholder="代码存储路径" />
          </Form.Item>
          <Form.Item
            label="引擎类型"
            required
          >
            <Form.Item name='engineType' rules={[{ required: true, message: '请选择 引擎类型' }]} style={{ display: 'inline-block', width: 'calc(50% - 8px)' }} >
              <Select onChange={()=>handleEngineTypeChange2(getFieldValue2('engineType'))}>
                {
                  engineTypeArr2.map((item) => (
                    <Option value={item}>{item}</Option>
                  ))
                }
              </Select>
            </Form.Item>
            <Form.Item name="engine" rules={[{ required: true, message: '请选择 引擎名称' }]} style={{ display: 'inline-block', width: 'calc(50%)', margin: '0 0 0 8px' }}>
              <Select>
                {
                  engineNameArr2.map((item) => (
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
            <Select style={{ width: "50%" }}  onChange={(item,option)=>handleDeviceTypeChange2(option.index)}>
              {
                deviceTypeArr2.map((item, index) => (<Option value={item} index={index}>{item}</Option>))
              }
            </Select>
          </Form.Item>
          <Form.Item
            label="节点数量"
            name="nodeNum"
            rules={[{ required: true }]}
            
          >
            <InputNumber  style={{ width: "50%" }} min={1} max={maxNodeNum} placeholder="请输入节点数量" onChange={()=>handleCaclTotalDeviceNum2(getFieldValue2('nodeNum'),getFieldValue2('deviceNumPerNode'))}>
            </InputNumber>
          </Form.Item>
          <Form.Item
            label="单节点设备数量"
            name="deviceNumPerNode"
            rules={[{ required: true }]}
            
          >
            <Select style={{ width: "50%" }} onChange={()=>handleCaclTotalDeviceNum2(getFieldValue2('nodeNum'),getFieldValue2('deviceNumPerNode'))}>
              {
                deviceNumPerNodeArr2.map((item) => (
                  <Option value={item}>{item}</Option>
                ))
              }
            </Select>
          </Form.Item>
          <Form.Item
            label="全部设备数量"
            name="totalDeviceNum"
          >
            <Input  style={{ width: "50%" }} disabled>
            </Input>
          </Form.Item>
          <Form.Item {...buttonItemLayout}>
            <Button type="primary" htmlType="submit">立即创建</Button>
          </Form.Item>
        </Form>
    </TabPane>
      </Tabs>
      </div>
    </>
  )

}

export default CodeCreate;