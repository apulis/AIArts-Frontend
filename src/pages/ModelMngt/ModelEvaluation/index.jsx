import { history } from 'umi';
import { message, Modal, Form, Input, Button, Card, PageHeader, Radio, Select, Tag } from 'antd';
import React, { useState, useEffect, useRef } from 'react';
import { FolderOpenOutlined } from '@ant-design/icons';
// import ModalForm from './components/ModalForm';
import { addModel } from '../ModelList/services';
import { addEvaluation } from './services';
import { fetchAvilableResource } from '@/services/modelTraning';
import { getLabeledDatasets } from '@/services/datasets';
import {utilGetDeviceNumArr,utilGetDeviceNumPerNodeArr} from '@/utils/utils'

const { TextArea } = Input;
const { Option } = Select;

const ModelEvaluation = props => {
  const query = props.location.query;
  const modelName = decodeURIComponent(query.modelName);
  const modelId = decodeURIComponent(query.modelId);

  const [codePathPrefix, setCodePathPrefix] = useState('');
  const [visible, setVisible] = useState(false);
  const [frameWorks, setFrameWorks] = useState(null);
  const [engineTypes, setEngineTypes] = useState([]);
  const [engines, setEngines] = useState([]);
  const [datasets, setDatasets] = useState([]);
  const [deviceTypes, setDeviceTypes] = useState([]);
  const [deviceNums, setDeviceNums] = useState([]);
  const [deviceList, setDeviceList] = useState([]);
  const [datasetName, setDatasetName] = useState('');

  const [form] = Form.useForm();

  useEffect(() => {
    getAvailableResource();
    getTestDatasets();
  }, []);

  // useEffect(() => {
  //   let nums = getDeviceNums(form.deviceType);
  //   console.log(111, nums, form.deviceType)
  //   form.setFieldsValue({
  //     deviceNum: nums.length > 0 ? nums[0] : 0,
  //   });
  // }, [form.deviceType]);

  const getAvailableResource = async () => {
    const res = await fetchAvilableResource();
    if (res.code === 0) {
      let { data: { codePathPrefix, aiFrameworks, deviceList } } = res;
      if (!/\/$/.test(codePathPrefix)) {
        codePathPrefix = codePathPrefix + '/'
      }
      setCodePathPrefix(codePathPrefix);
      setFrameWorks(aiFrameworks);
      setDeviceList(deviceList);

      // 获取引擎类型
      let types = Object.keys(aiFrameworks);      
      if (types.length > 0) {
        setEngineTypes(types);
        let defaultType = types[0];
        form.setFieldsValue({
          engineType: defaultType,
          engine: aiFrameworks[defaultType].length > 0 ? aiFrameworks[defaultType][0] : ''
        });
      }
      // 设备类型
      let deviceTypes = deviceList.map(d => d.deviceType);
      if (deviceTypes.length > 0) {
        setDeviceTypes(deviceTypes);
        // let defaultDeviceType = deviceTypes[0];
        // handleDeviceTypeChange(defaultDeviceType);
        // let firstDevice = deviceList.find(item => item.deviceType === defaultDeviceType);

        // form.setFieldsValue({
        //   deviceType: defaultDeviceType,
        //   // deviceNum: firstDevice ?.avail || 0,
        // });
      }

    }
  }

  const getTestDatasets = async () => {
    const params = { 
      pageNum: 1, 
      pageSize: 999,
    }; 
    const { code, data, msg } = await getLabeledDatasets(params);
    if (code === 0 && data) {
      const { datasets } = data;
      const finishedDs = datasets.filter(d => d.convertStatus === 'finished');
      setDatasets(finishedDs);
    } else {
      message.error(msg);
    }
  }

  const selectTrainingJob = () => {

  };

  const onFinish = async (values) => {
    // const { name, jobId, engine, codePath, startupFile, outputPath, datasetPath } = values;
    const { name, engine, startupFile, outputPath, datasetPath, deviceType, deviceNum, argumentsFile } = values;
    const data = {
      name,
      // codePath: codePathPrefix + codePath,
      // jobId: jobId || '',
      engine,
      startupFile: codePathPrefix + startupFile,
      outputPath: codePathPrefix + outputPath,
      datasetPath: codePathPrefix + datasetPath,
      datasetName,
      deviceType,
      deviceNum,
      argumentPath: codePathPrefix + argumentsFile,
    }
    
    const { code, msg } = await addEvaluation(modelId, data);

    if (code === 0) {
      message.success(`创建评估成功`);
      history.push('/ModelManagement/MyModels');
    } else {
      msg && message.error(`创建评估失败:${msg}`);
    }
  };

  const showJobModal = () => {
    setVisible(true);
  };

  const onReset = () => {
    form.resetFields();
  };

  const handleCancel = () => {
    setVisible(false);
  };

  const handleSubmit = item => {
    form.setFieldsValue({job: item.name, jobId: item.id});
    setVisible(false);
  };

  const handleEngineTypeChange = value => {
    let selectedType = frameWorks[value];
    setEngines(selectedType);
    form.setFieldsValue({engine: selectedType.length > 0 ? selectedType[0] : ''});
  }

  const handleDatasetChange = (value, option) => {
    setDatasetName(option.children);
  }  

  const handleDeviceTypeChange = value => {
    const selected = deviceList.find(item => item.deviceType === value);
    const avail = selected ?.avail || 0;

    // let nums = getDeviceNums(value);
    let nums = [];

    if (avail >= 2){
      nums = [0, 1, 2];
    }else if (avail === 1 ){
      nums = [0, 1];
    }else{
      nums = [0];
    }
    setDeviceNums(nums);
  }

  const getDeviceNums = value => {
    const selected = deviceList.find(item => item.deviceType === value);
    const avail = selected ?.avail || 0;

    let nums = [];

    if (avail >= 2){
      nums = [0, 1, 2];
    }else if (avail === 1 ){
      nums = [0, 1];
    }else{
      nums = [0];
    }
    
    return nums;
  }

  const layout = {
    labelCol: { span: 3 },
    wrapperCol: { span: 12 },
  };

  return (
    <>
    <PageHeader
      ghost={false}
      onBack={() => history.push('/ModelManagement/MyModels')}
      title="模型评估"
    >
      <div
        style={{
          padding: '24px'
        }}
      >
        <Form
          form={form}
          onFinish={onFinish}
          autoComplete="off"
          initialValues={{name: modelName}}
        >
          <Form.Item
            {...layout}
            name="name"
            label="名称"
            rules={[{ required: true, message: '名称不能为空!' }]}
          >
            <Input placeholder="请输入模型名称" disabled/>
          </Form.Item>
          <Form.Item {...layout} name="datasetPath" rules={[{ required: true, message: '请选择测试数据集' }]} label="测试数据集">
            <Select
              onChange={handleDatasetChange}
            >
              {
                datasets.map(d => (
                  <Option key={d.dataSetPath} value={d.dataSetPath}>{d.name}</Option>
                ))
              }
            </Select>
          </Form.Item>          
          {/* <Form.Item
            {...layout}
            name="codePath"
            label="代码目录"
            rules={[{ required: true }]}
          >
            <Input addonBefore={codePathPrefix} />
          </Form.Item> */}
          <Form.Item {...layout} label="启动文件" name="startupFile" rules={[{ required: true }, { message: '需要填写启动文件' }]}>
            <Input addonBefore={codePathPrefix} />
          </Form.Item>
          <Form.Item {...layout} label="模型参数文件" name="argumentsFile" rules={[{ required: true }, { message: '需要填写模型参数文件' }]}>
            <Input addonBefore={codePathPrefix} />
          </Form.Item>
          <Form.Item 
            {...layout} 
            label="输出路径"
            name="outputPath"
            rules={[{ required: true }]}
          >
            <Input addonBefore={codePathPrefix} />
          </Form.Item>
          <Form.Item
            {...layout}
            label="引擎"
            required
          >
            <Form.Item name="engineType" 
              rules={[{ required: true }]}
              style={{ display: 'inline-block', width: 'calc(35% - 4px)' }}
            >
              <Select
                onChange={handleEngineTypeChange}
              >
                {
                  engineTypes && engineTypes.map(f => (
                    <Option value={f} key={f}>{f}</Option>
                  ))
                }
              </Select>
            </Form.Item>
            <Form.Item name="engine" 
              rules={[{ required: true }]}
              style={{ display: 'inline-block', width: 'calc(65% - 4px)', marginLeft: '8px' }}
            >
              <Select>
                {
                  engines && engines.map(f => (
                    <Option value={f} key={f}>{f}</Option>
                  ))
                }
              </Select>
            </Form.Item>
          </Form.Item>
          <Form.Item
            {...layout}
            label="设备类型"
            name="deviceType"
            rules={[{ required: true }]}
          >
            <Select onChange={handleDeviceTypeChange}>
              {
                deviceTypes.map((item) => (
                  <Option key={item} value={item}>{item}</Option>
                ))
              }
            </Select>
          </Form.Item>
          <Form.Item
            {...layout}
            label="设备数量"
            name="deviceNum"
            rules={[{ required: true }]}
          >
            <Select>
              {
                deviceNums.map((item) => (
                  <Option key={item} value={item}>{item}</Option>
                ))
              }
            </Select>
          </Form.Item>                 
          <Form.Item
            style={{ float: 'right' }}
          >
            <Button type="primary" htmlType="submit">开始评估</Button>
          </Form.Item>
        </Form>
      </div>
    </PageHeader>
    </>  
  );
};

export default ModelEvaluation;