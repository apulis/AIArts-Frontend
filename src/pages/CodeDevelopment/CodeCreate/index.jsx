import React, { useState, useEffect, useRef } from 'react';
import { Form, Input, Button, Select, Tooltip, Row, Col, PageHeader, message, Modal,InputNumber,Card,Radio } from 'antd';
import { history } from 'umi';
import { postCode1,postCode2, getResource } from '../service.js'
import {utilGetDeviceNumArr,utilGetDeviceNumPerNodeArr} from '../const.js'
const CodeCreate = () => {
  const [form] = Form.useForm();
  const { validateFields, setFieldsValue,getFieldValue } = form;
  const { Option } = Select;
  const { TextArea } = Input;
  let [data, setData] = useState(null)
  const [deviceTypeArr, setDeviceTypeArr] = useState([])// 更新状态是异步的
  const [deviceNumArr, setDeviceNumArr] = useState([])
  const [engineTypeArr, setEngineTypeArr] = useState([])
  const [jobTrainingType, setJobTrainingType] = useState('RegularJob');
  const [engineNameArr, setEngineNameArr] = useState([])
  const [codePathPrefix, setCodePathPrefix] = useState('')
  const [deviceNumPerNodeArr, setDeviceNumPerNodeArr] = useState([])
  useEffect(() => {// 初始化处理
    renderInitForm()
  }, [])// 更新处理
  useEffect(() => {// 初始化处理deviceNum
    if(jobTrainingType=='RegularJob'){  
      renderInitRegularForm(deviceNumArr[0])
    }else if(jobTrainingType=='PSDistJob'){
      renderInitPSDistJobForm(1, deviceNumPerNodeArr[0],deviceNumPerNodeArr[0] * 1)
    }
  }, [jobTrainingType])// 更新处理

  const renderInitForm = async () => {
    const result = await apiGetResource()
    if (result) {
      setData(result)
      const enginTypeArrData = Object.keys(result.aiFrameworks)
      const engineNameArrData = result.aiFrameworks[enginTypeArrData[0]]
      const deviceTypeArrData = result.deviceList.map((item) => (item.deviceType))
      const deviceNumPerNodeArrData = utilGetDeviceNumPerNodeArr(result.nodeInfo[0])
      const deviceNumArrData = utilGetDeviceNumArr(result.nodeInfo[0]) || [0]
      setCodePathPrefix(result.codePathPrefix)
      setEngineTypeArr(enginTypeArrData)
      setEngineNameArr(engineNameArrData)
      setDeviceTypeArr(deviceTypeArrData)
      setDeviceNumPerNodeArr(deviceNumPerNodeArrData)
      setDeviceNumArr(deviceNumArrData)
      setFieldsValue({'engineType': enginTypeArrData[0], 'engine': engineNameArrData[0], 'deviceType': deviceTypeArrData[0]})
      renderInitRegularForm(deviceNumArrData[0])
    }
  }
  const renderInitRegularForm = (deviceNum)=>{
    setFieldsValue({'deviceNum':deviceNum })
  }
  const renderInitPSDistJobForm = (numPs,numPsWorker,deviceNum)=>{
    setFieldsValue({numPs,numPsWorker,deviceNum})
  }
  const apiPostCode = async (values) => {
    const obj = await postCode1(values)
    const { code, data, msg } = obj
    if (code === 0) {
      message.success('创建成功')
      history.push('/codeDevelopment')
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
 
  const handleSubmit = async () => {
    // todo 提取数据映射
    const values = await validateFields();
    delete values["engineType"]
    values.codePath = codePathPrefix + values.codePath
    apiPostCode(values)
  }

  const handleEngineTypeChange = (engineType) => {
    const arr = data.aiFrameworks[engineType]
    setFieldsValue({ 'engine': arr[0]||''})
    setEngineNameArr(arr)
  }
  const handleDeviceTypeChange = (index) => {
    const type = data['nodeInfo'][index]
    let arr = []
    if(jobTrainingType=='RegularJob'){
      arr = utilGetDeviceNumArr(type)
      setFieldsValue({ 'deviceNum': arr[0]})
      setDeviceNumArr(arr)
    }else if(jobTrainingType=='PSDistJob'){
      arr = utilGetDeviceNumPerNodeArr(type)
      setFieldsValue({ 'numPsWorker': arr[0]})
      setDeviceNumPerNodeArr(arr)
    }
  }
  const handleCaclTotalDeviceNum = (nodeNum,perNodeDeviceNum)=>{
    setFieldsValue({'deviceNum':nodeNum * perNodeDeviceNum})
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
        onBack={() => history.push('/codeDevelopment')}
        title="返回代码开发">
      </PageHeader>
      <Card>
        <Form
          {...formItemLayout}
          labelAlign='right'
          onFinish={handleSubmit}
          validateMessages={validateMessages}
          initialValues = {{jobTrainingType:'RegularJob'}}
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
            required
          >
            <Form.Item name='engineType' rules={[{ required: true, message: '请选择 引擎类型' }]} style={{ display: 'inline-block', width: 'calc(50% - 8px)' }}>
              <Select onChange={()=>handleEngineTypeChange(getFieldValue('engineType'))}>
                {
                  engineTypeArr.map((item) => (
                    <Option value={item}>{item}</Option>
                  ))
                }
              </Select>
            </Form.Item>
            <Form.Item name="engine" rules={[{ required: true, message: '请选择 引擎名称' }]} style={{ display: 'inline-block', width: 'calc(50%)', margin: '0 0 0 8px' }}>
              <Select>
                {
                  engineNameArr.map((item) => (
                    <Option value={item}>{item}</Option>
                  ))
                }
              </Select>
            </Form.Item>
          </Form.Item>
          <Form.Item
              label="任务类型" 
              name="jobTrainingType"
              rules={[{ required: true }]} 
            >
              <Radio.Group onChange={e => setJobTrainingType(e.target.value)}>
                <Radio value='RegularJob'>常规任务</Radio>
                <Radio value='PSDistJob'>分布式任务</Radio>
              </Radio.Group>
            </Form.Item>
          <Form.Item
            label="设备类型"
            name="deviceType"
            rules={[{ required: true }]}
          >
            <Select style={{ width: "50%" }}  onChange={(item,option)=>handleDeviceTypeChange(option.index)}>
              {
                deviceTypeArr.map((item, index) => (<Option value={item} index={index}>{item}</Option>))
              }
            </Select>
          </Form.Item>
          {jobTrainingType == 'RegularJob' &&  <Form.Item
            label="设备数量"
            name="deviceNum"
            rules={[{ required: true }]}
          >
            <Select style={{ width: "50%" }}>
              {
                deviceNumArr.map((item) => (
                  <Option value={item}>{item}</Option>
                ))
              }
            </Select>
          </Form.Item>}
          {jobTrainingType == 'PSDistJob' &&<Form.Item
            label="节点数量"
            name="numPs"
            rules={[{ required: true }]}
            
          >
            <InputNumber  style={{ width: "50%" }} min={1} placeholder="请输入节点数量" onChange={()=>handleCaclTotalDeviceNum(getFieldValue('numPs'),getFieldValue('numPsWorker'))}>
            </InputNumber>
          </Form.Item>}
          {jobTrainingType == 'PSDistJob' &&<Form.Item
            label="单节点设备数量"
            name="numPsWorker"
            rules={[{ required: true }]}
            
          >
            <Select style={{ width: "50%" }} onChange={()=>handleCaclTotalDeviceNum(getFieldValue('numPs'),getFieldValue('numPsWorker'))}>
              {
                deviceNumPerNodeArr.map((item) => (
                  <Option value={item}>{item}</Option>
                ))
              }
            </Select>
          </Form.Item>}
          {jobTrainingType == 'PSDistJob' &&  <Form.Item
            label="全部设备数量"
            name="deviceNum"
          >
            <Input  style={{ width: "50%" }} disabled>
            </Input>
          </Form.Item>}
          <Form.Item {...buttonItemLayout}>
            <Button type="primary" htmlType="submit">立即创建</Button>
          </Form.Item>
        </Form>
      </Card>
    </>
  )

}

export default CodeCreate;