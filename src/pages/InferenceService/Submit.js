import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Divider, Select, Col, Row, message, PageHeader } from 'antd';
import { PauseOutlined, PlusSquareOutlined, DeleteOutlined, FolderOpenOutlined } from '@ant-design/icons';
import { useForm } from 'antd/lib/form/Form';
import FormItem from 'antd/lib/form/FormItem';
import { generateKey } from '../ModelTraining/Submit';
import { fetchAvilableResource } from '@/services/modelTraning';
import { history } from 'umi';


import styles from './index.less'


const { TextArea } = Input; 

const SubmitModelTraining = () => {
  const [runningParams, setRunningParams] = useState([{ key: '', value: '', createTime: generateKey() }]);
  
  const [frameWorks, setFrameWorks] = useState([]);
  const [deviceList, setDeviceList] = useState([]);
  const [form] = useForm();
  const { validateFields, getFieldValue, setFieldsValue } = form;
  const handleSubmit = async () => {
    const values = await validateFields();
    const cancel = message.loading('正在提交');
    const res = await submitModelTraining(values);
    if (res.code === 0) {
      cancel();
    }
  }
  const getAvailableResource = async () => {
    const res = await fetchAvilableResource();
    if (res.code === 0) {
      let { data: { aiFrameworks, deviceList } } = res;
      let aiFrameworkList = []
      Object.keys(aiFrameworks).forEach(val => {
        aiFrameworkList = aiFrameworkList.concat(aiFrameworks[val])
      })
      console.log('aiFrameworkList', aiFrameworkList)
      setFrameWorks(aiFrameworkList);
      setDeviceList(deviceList);
    }
  }
  useEffect(() => {
    getAvailableResource();
  }, [])
  const addParams = () => {
    const newRunningParams = runningParams.concat({
      key: '',
      value: '',
      createTime: generateKey(),
    });
    setRunningParams(newRunningParams);
  }
  const validateRunningParams = async (index, propertyName, ...args) => {
    const [rule, value, callback] = [...args];
    const runningParams = await getFieldValue('runningParams');
    runningParams.forEach((r, i) => {
      if (r[propertyName] === value && index !== i) {
        callback('不能输入相同的参数名称');
      }
    })
    callback();
  }
  
  const removeRuningParams = async (key) => {
    const values = await getFieldValue('runningParams');
    [...runningParams].forEach((param, index) => {
      param.key = values[index].key;
      param.value = values[index].value;
    })
    const newRunningParams = [...runningParams].filter((param) => param.createTime !== key)
    console.log('newRunningParams', newRunningParams)
    setRunningParams(newRunningParams)
    setFieldsValue({
      runningParams: newRunningParams.map(params => ({ key: params.key, value: params.value }))
    })
  }

  const commonLayout = {
    labelCol: { span: 4 },
    wrapperCol: { span: 8 }
  }
  return (
    <PageHeader
      ghost={false}
      onBack={() => history.push('/Inference/list')}
      title="创建推理作业"
    >
    <div className={styles.modelTraining}>
      <Form form={form}>
        <FormItem {...commonLayout} name="workName" label="作业名称" rules={[{ required: true }]}>
          <Input placeholder="请输入作业名称" />
        </FormItem>
        <FormItem labelCol={{ span: 4 }} wrapperCol={{ span: 14 }} name="desc" label="描述" rules={[{ max: 191 }]}>
          <TextArea placeholder="请输入描述信息" />
        </FormItem>
      </Form>
      <Divider style={{ borderColor: '#cdcdcd' }} />
      <h2 style={{ marginLeft: '38px', marginBottom: '20px' }}>参数配置</h2>
      <Form form={form}>
        <FormItem {...commonLayout} name="frameWork" label="引擎" rules={[{ required: true }]}>
          <Select>
            {
              frameWorks.map(f => (
                <Option value={f}>{f}</Option>
              ))
            }
          </Select>
        </FormItem>
        <FormItem labelCol={{span: 4}} label="使用模型">
          <FormItem name="modelName" noStyle rules={[{ required: true }]}>
            
            <Input placeholder="请输入使用模型" style={{width: '260px'}} />
          </FormItem>
          <Button style={{marginLeft: '15px', display: 'inline-block'}} icon={<FolderOpenOutlined />}></Button>
        </FormItem>
        <FormItem label="作业参数" labelCol={{ span: 4 }} >
          {
            runningParams.map((param, index) => {
              return (
                <>
                  <FormItem initialValue={runningParams[index].key} rules={[{ validator(...args) { validateRunningParams(index, 'key', ...args) } }]} name={['runningParams', index, 'key']} wrapperCol={{ span: 24 }} style={{ display: 'inline-block' }}>
                    <Input  style={{width: '260px'}}/>
                  </FormItem>
                  <PauseOutlined rotate={90} style={{ marginTop: '8px', width: '30px' }} />
                  <FormItem initialValue={runningParams[index].value} rules={[{ validator(...args) { validateRunningParams(index, 'value', ...args) } }]} name={['runningParams', index, 'value']} wrapperCol={{ span: 24 }} style={{ display: 'inline-block' }}>
                    <Input  style={{width: '260px'}}/>
                  </FormItem>
                  {
                    runningParams.length > 1 && <DeleteOutlined style={{ marginLeft: '10px', cursor: 'pointer' }} onClick={() => removeRuningParams(param.createTime)} />
                  }
                </>
              )
            })
          }
          <div className={styles.addParams} onClick={addParams}>
            <PlusSquareOutlined fill="#1890ff" style={{ color: '#1890ff', marginRight: '10px' }} />
            <a>点击增加参数</a>
          </div>
        </FormItem>
        <FormItem label="计算节点规格" name="computingNode" {...commonLayout} rules={[{ required: true }]}>
          <Select style={{ width: '260px' }}>
            {
              deviceList.map(d => (
                <Option value={d.deviceType}>{d.deviceType}</Option>
              ))
            }
          </Select>
        </FormItem>
      </Form>
      <Button type="primary" style={{ float: 'right' }} onClick={handleSubmit}>立即创建</Button>
    </div>
    </PageHeader>
  )
}


export default SubmitModelTraining;