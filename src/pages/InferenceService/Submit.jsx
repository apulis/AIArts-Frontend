import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Divider, Select, message, PageHeader } from 'antd';
import { PauseOutlined, PlusSquareOutlined, DeleteOutlined, FolderOpenOutlined } from '@ant-design/icons';
import { useForm } from 'antd/lib/form/Form';
import FormItem from 'antd/lib/form/FormItem';
import { generateKey } from '../ModelTraining/Submit';
import { fetchAvilableResource } from '@/services/modelTraning';
import { createInference, getAllSupportInference, getAllComputedDevice } from '@/services/inferenceService';
import { history, withRouter } from 'umi';
// import { beforeSubmitJob } from '@/models/resource';

import styles from './index.less'
import { jobNameReg, getNameFromDockerImage } from '@/utils/reg';
import SelectModelPath from '@/components/BizComponent/SelectModelPath';


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
  //
  const [currentEngineName, setCurrentEngineName] = useState('');
  const [supportedInference, setSupportedInference] = useState({});
  const [currentVersion, setCurrentVersion] = useState('');
  const [selectModalPathModalVisible, setSelectModalPathVisible] = useState(false);
  const [form] = useForm();
  const { validateFields, getFieldValue, setFieldsValue } = form;

  //
  const engineNameList = Object.keys(supportedInference);

  const [engineVersionList, setEngineVersionList] = useState([]);

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
      submitData.params[p.key] = p. value;
    });
    if (submitData.device === 'CPU') {
      submitData.image = availImage[0];
    } else if (submitData.device === 'GPU') {
      submitData.image = availImage[1];
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
      const supportedInference = res.data;
      setSupportedInference(supportedInference);
      const engineNameList = Object.keys(supportedInference);
      if (engineNameList.length) {
        // 初始化表单内容
        const firstEngineName = engineNameList[0];
        const engineVersionList = Object.keys(supportedInference[firstEngineName]);
        const firstEngineVersion = engineVersionList[0];
        setEngineVersionList(engineVersionList)
        setFieldsValue({
          engineName: firstEngineName,
          engineVersion: firstEngineVersion,
        })
        setDeviceList(Object.keys(supportedInference[firstEngineName][firstEngineVersion]))
      }
    }
  }

  useEffect(() => {
    if (currentEngineName) {
      const currentEngineVersionList = Object.keys(supportedInference[currentEngineName])
      setEngineVersionList(currentEngineVersionList);
      setFieldsValue({
        engineVersion: currentEngineVersionList[0],
      })
      setCurrentVersion(currentEngineVersionList[0])
    }
    
  }, [currentEngineName])


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
  }, []);

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

  const handleEngineChange = (type, val) => {
    if (type === 'name') {
      setCurrentEngineName(val);
    } else if (type === 'version') {
      setCurrentVersion(val);
    }
  }

  const handleSelectModelPath = (row) => {
    setSelectModalPathVisible(false);
    if (!row) return
    setFieldsValue({
      modelName: row.outputPath,
    })
  }

  useEffect(() => {
    if (currentEngineName && currentVersion) {
      const deviceList = Object.keys(supportedInference[currentEngineName][currentVersion]);
      setDeviceList(deviceList)
      setFieldsValue({
        deviceType: deviceList[0],
      })
    }
  }, [currentEngineName, currentVersion])

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
        <FormItem labelCol={commonLayout.labelCol} label="推理模型路径" required>
          <FormItem
            name="modelName"
            rules={[{ required: true }]}
            style={{ display: 'inline-block', width: '250px' }}
          >
            <Input placeholder="请输入推理模型路径" style={{ width: '230px' }} />
          </FormItem>
          <FormItem style={{ display: 'inline-block', width: '36px' }}>
            <Button icon={<FolderOpenOutlined />} onClick={() => setSelectModalPathVisible(true)}></Button>
          </FormItem>
        </FormItem>
        <FormItem {...commonLayout} label="引擎" required>
          <FormItem
            name="engineName"
            style={{ display: 'inline-block', width: 'calc(50% - 8px)' }}
          >
            <Select placeholder="引擎名称" onChange={(name) => handleEngineChange('name', name)}>
              {
                engineNameList.map(val => (
                  <Option value={val}>{getNameFromDockerImage(val)}</Option>
                ))
              }
            </Select>
          </FormItem>
          <FormItem name="engineVersion" style={{ display: 'inline-block', width: 'cal(50% - 8px)', marginLeft: '10px'}}>
            <Select placeholder="引擎版本" onChange={(version) => handleEngineChange('version', version)}>
              {
                engineVersionList.map(val => (
                  <Option value={val}>{val}</Option>
                ))
              }
            </Select>
          </FormItem>
        </FormItem>
        <FormItem label="作业参数" labelCol={{ span: 4 }}>
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
                <Option value={d}>{d.toUpperCase()}</Option>
              ))
            }
          </Select>
        </FormItem>
        <FormItem label="GPU 类型" name="gpuType" {...commonLayout} rules={[{ required: false }]}>
          <Select placeholder="请选择" style={{ width: '260px' }}>
            {
              computedDeviceList.map(c => (
                <Option value={c}>{c}</Option>
              ))
            }
          </Select>
        </FormItem>
        
      </Form>
      <Button type="primary" style={{ float: 'right' }} onClick={handleSubmit}>立即创建</Button>
    </div>
    {
      selectModalPathModalVisible && <SelectModelPath
        visible={selectModalPathModalVisible}
        onOk={handleSelectModelPath}
        onCancel={() => setSelectModalPathVisible(false)}
      />
    }
    </PageHeader>
  )
}


export default withRouter(SubmitModelTraining);