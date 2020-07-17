import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Divider, Select, Col, Row, message, PageHeader, Modal } from 'antd';
import { history } from 'umi';
import { PauseOutlined, PlusSquareOutlined, DeleteOutlined, FolderOpenOutlined } from '@ant-design/icons';
import { useForm } from 'antd/lib/form/Form';
import FormItem from 'antd/lib/form/FormItem';

import { submitModelTraining, fetchAvilableResource } from '../../services/modelTraning';

import styles from './index.less';
import { getDatasets } from '../DataSet/service';
import { jobNameReg } from '@/utils/reg';

const { TextArea } = Input;
const { Option } = Select;

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

export const generateKey = () => {
  return new Date().getTime();
}

const ModelTraining = () => {
  const [runningParams, setRunningParams] = useState([{key: '', value: '', createTime: generateKey()}]);
  const [form] = useForm();
  const [frameWorks, setFrameWorks] = useState([]);
  const [codePathPrefix, setCodePathPrefix] = useState('');
  const [codeDirModalVisible, setCodeDirModalVisible] = useState(false);
  const [bootFileModalVisible, setBootFileModalVisible] = useState(false);
  const [outputPathModalVisible, setOutputPathModalVisible] = useState(false);
  const [trainingDataSetModalVisible, setTrainingDataSetModalVisible] = useState(false);
  const [deviceList, setDeviceList] = useState([]);
  const [availableDeviceNumList, setAvailableDeviceNumList] = useState([]);
  const [datasets, setDatasets] = useState([]);
  const { validateFields, getFieldValue, setFieldsValue } = form;
  const getAvailableResource = async () => {
    const res = await fetchAvilableResource();
    if (res.code === 0) {
      let { data: { aiFrameworks, deviceList, codePathPrefix } } = res;
      if (!/\/$/.test(codePathPrefix)) {
        codePathPrefix = codePathPrefix + '/' 
      }
      
      setCodePathPrefix(codePathPrefix);
      let aiFrameworkList = []
      Object.keys(aiFrameworks).forEach(val => {
        aiFrameworkList = aiFrameworkList.concat(aiFrameworks[val])
      })
      setFrameWorks(aiFrameworkList);
      setDeviceList(deviceList);
    }
  }

  const fetchDataSets = async () => {
    console.log(123123)
    const res = await getDatasets({pageNum: 1, pageSize: 100});
    if (res.code === 0) {
      console.log(res)
      const datasets = res.data.datasets;
      setDatasets(datasets)
    }
  }

  useEffect(() => {
    getAvailableResource()
    fetchDataSets()
  }, [])
  const handleSubmit = async () => {
    const values = await validateFields();
    let params = {}
    values.params && values.params.forEach(p => {
      params[p.key] = p.value;
    })
    values.codePath = codePathPrefix + (values.codePath || '');
    values.startupFile = codePathPrefix + values.startupFile;
    values.outputPath = codePathPrefix + (values.outputPath || '');
    values.params = params;
    const cancel = message.loading('正在提交');
    const res = await submitModelTraining(values);
    cancel();
    if (res.code === 0) {
      message.success('成功创建');
      history.push('/model-training/list')
    }
  }
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
    if (propertyName === 'value') {
      callback();
      return;
    }
    if (!value) {
      callback();
      return;
    }
    const runningParams = await getFieldValue('params');
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
      runningParams: newRunningParams.map(params => ({key: params.key, value: params.value}))
    })
  }

  const commonLayout = {
    labelCol: { span: 3 }, 
    wrapperCol: { span: 8 }
  }
  const onDeviceTypeChange = (value) => {
    const deviceType = value;
    const selectedDevice = deviceList.find(d => d.deviceType === deviceType);
    const deviceNumMax = selectedDevice ? selectedDevice.avail : 0;
    if (deviceNumMax >= 0) {
      const list = [0];
      let current = 1;
      while (current <= deviceNumMax) {
        list.push(current);
        current = current * 2
      }
      setAvailableDeviceNumList(list);
    }
  }
  return (
    <div className={styles.modelTraining}>
      <PageHeader
        className="site-page-header"
        onBack={() => history.push('/model-training/list')}
        title='创建训练作业'
        subTitle={<Button onClick={() => history.push('/model-training/list')}>返回训练作业列表</Button>}
      />
      <Form form={form}>
        <FormItem {...commonLayout} style={{marginTop: '30px'}} name="name" label="作业名称" rules={[{ required: true }, {...jobNameReg}]}>
          <Input style={{ width: 300 }}  placeholder="请输入作业名称" />
        </FormItem>
        <FormItem labelCol={{ span: 3 }} wrapperCol={{ span: 14 }} name="desc" label="描述" rules={[{ max: 191 }]}>
          <TextArea placeholder="请输入描述信息" />
        </FormItem>
      </Form>
      <Divider style={{borderColor: '#cdcdcd'}} />
      <div className="ant-page-header-heading-title" style={{marginLeft: '38px', marginBottom: '20px'}}>参数配置</div>
      <Form form={form}>
        <FormItem {...commonLayout} name="engine" label="引擎" rules={[{ required: true }]}>
          <Select style={{ width: 300 }} >
            {
              frameWorks.map(f => (
                <Option value={f}>{f}</Option>
              ))
            }
          </Select>
        </FormItem>
        <FormItem 
          labelCol={{ span: 3 }}
          name="codePath"
          label="代码目录"
        >
          <Input addonBefore={codePathPrefix} style={{ width: 420 }} />
        </FormItem>
        <FormItem labelCol={{ span: 3 }} label="启动文件"  name="startupFile" rules={[{required: true}, {pattern: /\.py$/, message: '需要填写一个python 文件'}]}>
          <Input  addonBefore={codePathPrefix} style={{ width: 420 }} />
        </FormItem>
        <FormItem name="outputPath" labelCol={{ span: 3 }} label="输出路径" style={{marginTop: '50px'}}>
          <Input addonBefore={codePathPrefix}  style={{ width: 420 }} />
        </FormItem>
        <FormItem name="datasetPath" rules={[{ required: true, message: '请输入训练数据集' }]} labelCol={{ span: 3 }} label="训练数据集">
          {/* <Input style={{ width: 300 }} /> */}
          <Select
            style={{width: '300px'}}
          >
            {
              datasets.map(d => (
                <Option value={d.path}>{d.name}</Option>
              ))
            }
          </Select>
        </FormItem>
        <FormItem label="运行参数" labelCol={{ span: 3 }} >
          {
            runningParams.map((param, index) => {
              return (
                <div>
                  <FormItem initialValue={runningParams[index].key} rules={[{validator(...args) {validateRunningParams(index, 'key', ...args)}}]} name={['params', index, 'key']} wrapperCol={{ span: 24 }} style={{ display: 'inline-block' }}>
                    <Input style={{ width: 200 }} />
                  </FormItem>
                  <PauseOutlined rotate={90} style={{marginTop: '8px', width: '30px'}} />
                  <FormItem initialValue={runningParams[index].value} rules={[{validator(...args) {validateRunningParams(index, 'value', ...args)}}]} name={['params', index, 'value']}  wrapperCol={{ span: 24 }} style={{ display: 'inline-block' }}>
                    <Input style={{ width: 200 }} />
                  </FormItem>
                  {
                    runningParams.length > 1 && <DeleteOutlined style={{marginLeft: '10px', cursor: 'pointer'}} onClick={() => removeRuningParams(param.createTime)} />
                  }
                </div>
              )
            })
          }
          <div className={styles.addParams} onClick={addParams}>
            <PlusSquareOutlined fill="#1890ff" style={{color: '#1890ff', marginRight: '10px'}} />
            <a>点击增加参数</a>
          </div>
        </FormItem>
        <FormItem label="设备类型" name="deviceType" {...commonLayout} rules={[{ required: true }]}>
          <Select style={{width: '300px'}} onChange={onDeviceTypeChange}>
            {
              deviceList.map(d => (
                <Option value={d.deviceType}>{d.deviceType}</Option>
              ))
            }
          </Select>
        </FormItem>
        <FormItem
          label="设备数量"
          name="deviceNum"
          {...commonLayout}
          rules={[{ required: true }]}
        >
          <Select style={{width: '300px'}} >
            {
              availableDeviceNumList.map(avail => (
                <Option value={avail}>{avail}</Option>
              ))
            }
          </Select>
        </FormItem>
      </Form>
      <Modal
        visible={bootFileModalVisible}
        forceRender
        onCancel={() => setBootFileModalVisible(false)}
      >

      </Modal>
      <Modal
        visible={codeDirModalVisible}
        forceRender
        onCancel={() => setCodeDirModalVisible(false)}
      >

      </Modal>
      <Modal
        visible={outputPathModalVisible}
        forceRender
        onCancel={() => setOutputPathModalVisible(false)}
      >

      </Modal>
      <Modal
        visible={trainingDataSetModalVisible}
        forceRender
        onCancel={() => setTrainingDataSetModalVisible(false)}
      >

      </Modal>
      <Button type="primary" style={{float: 'right'}} onClick={handleSubmit}>立即创建</Button>
    </div>
    
  )
}


export default ModelTraining;