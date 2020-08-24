import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Divider, Select, message, PageHeader } from 'antd';
import { PauseOutlined, PlusSquareOutlined, DeleteOutlined, FolderOpenOutlined } from '@ant-design/icons';
import { useForm } from 'antd/lib/form/Form';
import FormItem from 'antd/lib/form/FormItem';
import { generateKey } from '../ModelTraining/Submit';
import { fetchAvilableResource } from '@/services/modelTraning';
import { createInference, getAllSupportInference, getAllComputedDevice } from '@/services/inferenceService';
import { history, withRouter } from 'umi';


import styles from './index.less'
import { jobNameReg, getNameFromDockerImage } from '@/utils/reg';


const { TextArea } = Input; 

const SubmitModelTraining = (props) => {
  const query = props.location.query;
  
  const [runningParams, setRunningParams] = useState([{ key: '', value: '', createTime: generateKey() }]);
  const [frameWorks, setFrameWorks] = useState([]);
  const [deviceList, setDeviceList] = useState([]);
  const [computedDeviceList, setComputedDeviceList] = useState([]);
  const [currentGpuType, setCurrentGpuType] = useState('');
  const [availImage, setAvailImage] = useState([]);
  const [allSupportInference, setAllSupportInference] = useState([]);
  const [form] = useForm();
  const { validateFields, getFieldValue, setFieldsValue } = form;

  const handleSubmit = async () => {
    const values = await validateFields();
    const cancel = message.loading('正在提交');
    const submitData = {};
    submitData.framework = values.frameWork;
    submitData.jobName = values.workName;
    submitData.model_base_path = values.modelName;
    submitData.device = getFieldValue('deviceType');
    submitData.desc = values.desc;
    submitData.params = {};
    submitData.gpuType = values.gpuType;
    submitData.resourcegpu = 1;
    values.runningParams && values.runningParams.forEach(p => {
      submitData.params[p.key] = p.value;
    });
    if (submitData.device === 'CPU') {
      submitData.image = availImage[0]
    } else if (submitData.device === 'GPU') {
      submitData.image = availImage[1]
    }
    const currentFramework = submitData.framework;
    const currentInference = allSupportInference.find(val => val.framework === currentFramework);
    submitData.image = availImage[currentInference?.device?.findIndex(val => val === submitData.device)];    
    const res = await createInference(submitData);
    if (res.code === 0) {
      cancel();
      message.success('成功提交');
      history.push('/Inference/central')
    }
  }

  const getAvailableResource = async () => {
    const res = await getAllSupportInference()
    if (res.code === 0) {
      const deviceList = res.data[0];
      setAllSupportInference(res.data);
      let { device } = deviceList;
      setFrameWorks(res.data.map(val => val.framework));
      if (device.length > 0) {
        setFieldsValue({
          deviceType: device[0]
        })
      }
      setDeviceList(device);
    }
  }

  const fetchComputedDevice = async () => {
    const res = await getAllComputedDevice();
    if (res.code === 0) {
      const computedDeviceList = Object.keys(res.data);
      if (computedDeviceList.length > 0) {
        setFieldsValue({
          gpuType: computedDeviceList[0]
        })
      }
      setComputedDeviceList(computedDeviceList)
    }
  }
  const initModelPath = () => {
    const initialModelPath = decodeURIComponent(query.modelPath || '').split('?')[0];
    if (initialModelPath) {
      setFieldsValue({
        modelName: initialModelPath,
      })
    }
  }
  useEffect(() => {
    getAvailableResource();
    fetchComputedDevice();
    initModelPath();
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
    setRunningParams(newRunningParams)
    setFieldsValue({
      runningParams: newRunningParams.map(params => ({ key: params.key, value: params.value }))
    })
  }

  const commonLayout = {
    labelCol: { span: 4 },
    wrapperCol: { span: 8 },
  }
  const handleSelectFramework = () => {
    const currentFramework = getFieldValue('frameWork');
    setAvailImage(allSupportInference.find(val => val.framework === currentFramework).image);
  }
  return (
    <PageHeader
      ghost={false}
      onBack={() => history.push('/Inference/central')}
      title="创建推理作业"
    >
    <div className={styles.modelTraining}>
      <Form form={form}>
        <FormItem {...commonLayout} name="workName" label="作业名称" rules={[{ required: true }, {...jobNameReg}]}>
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
          <Select placeholder="请选择" onChange={handleSelectFramework}>
            {
              frameWorks.map(f => (
                <Option value={f}>{getNameFromDockerImage(f)}</Option>
              ))
            }
          </Select>
        </FormItem>
        <FormItem {...commonLayout}  label="使用模型" name="modelName" rules={[{ required: true, message: '请输入模型' }]}>
          <Input placeholder="请输入使用模型" style={{width: '260px'}} />
        </FormItem>
        <FormItem label="作业参数" labelCol={{ span: 4 }} >
          {
            runningParams.map((param, index) => {
              return (
                <div>
                  <FormItem initialValue={runningParams[index].key} rules={[{ validator(...args) { validateRunningParams(index, 'key', ...args) } }]} name={['runningParams', index, 'key']} wrapperCol={{ span: 24 }} style={{ display: 'inline-block' }}>
                    <Input style={{width: '180px'}} />
                  </FormItem>
                  <PauseOutlined rotate={90} style={{ marginTop: '8px', width: '30px' }} />
                  <FormItem initialValue={runningParams[index].value} rules={[{ validator(...args) { validateRunningParams(index, 'value', ...args) } }]} name={['runningParams', index, 'value']} wrapperCol={{ span: 24 }} style={{ display: 'inline-block' }}>
                    <Input  style={{width: '180px'}}/>
                  </FormItem>
                  {
                    runningParams.length > 1 && <DeleteOutlined style={{ marginLeft: '10px', cursor: 'pointer' }} onClick={() => removeRuningParams(param.createTime)} />
                  }
                </div>
              )
            })
          }
          <div className={styles.addParams} onClick={addParams}>
            <PlusSquareOutlined fill="#1890ff" style={{ color: '#1890ff', marginRight: '10px' }} />
            <a>点击增加参数</a>
          </div>
        </FormItem>
        <FormItem label="设备类型" name="deviceType" {...commonLayout} rules={[{ required: false }]}>
          <Select placeholder="请选择" style={{ width: '260px' }} onChange={() => setCurrentGpuType(getFieldValue('deviceType'))}>
            {
              deviceList.map(d => (
                <Option value={d}>{d}</Option>
              ))
            }
          </Select>
        </FormItem>
        {
          currentGpuType === 'GPU' && (<FormItem label="GPU 类型" name="gpuType" {...commonLayout} rules={[{ required: false }]}>
            <Select placeholder="请选择" style={{ width: '260px' }}>
              {
                computedDeviceList.map(c => (
                  <Option value={c}>{c}</Option>
                ))
              }
            </Select>
          </FormItem>)
        }
        
      </Form>
      <Button type="primary" style={{ float: 'right' }} onClick={handleSubmit}>立即创建</Button>
    </div>
    </PageHeader>
  )
}


export default withRouter(SubmitModelTraining);