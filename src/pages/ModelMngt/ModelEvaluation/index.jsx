import { history } from 'umi';
import { message, Modal, Form, Input, Button, Card, PageHeader, Radio, Select, Tag } from 'antd';
import React, { useState, useEffect, useRef } from 'react';
import { FolderOpenOutlined } from '@ant-design/icons';
// import ModalForm from './components/ModalForm';
import { addModel } from '../ModelList/services';
import { fetchAvilableResource } from '@/services/modelTraning';

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

  const [form] = Form.useForm();

  useEffect(() => {
    getAvailableResource();
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

  const selectTrainingJob = () => {

  };

  const onFinish = async (values) => {
    const { name, description, path, jobId } = values;
    const data = {
      name,
      description,
      path: codePathPrefix + path,
      jobId: jobId || '',
    }
    
    const { code, msg } = await addModel(data);

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
          <Form.Item {...layout} name="datasetPath" rules={[{ required: true, message: '请选择测试数据集' }]} label="训练数据集">
            <Select>
              {
                datasets.map(d => (
                  <Option key={d.path} value={d.path}>{d.name}</Option>
                ))
              }
            </Select>
          </Form.Item>          
          <Form.Item
            {...layout}
            name="codePath"
            label="代码目录"
            rules={[{ required: true }]}
          >
            <Input addonBefore={codePathPrefix} />
          </Form.Item>
          <Form.Item {...layout} label="启动文件" name="startupFile" rules={[{ required: true }, { pattern: /\.py$/, message: '需要填写一个python 文件' }]}>
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
              <Select
              >
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
          <Form.Item name="status" {...layout} label="评估状态" >
            <Tag color="success">success</Tag>
            <Tag color="processing">processing</Tag>
            <Tag color="error">error</Tag>
          </Form.Item>
          <Form.Item
            style={{ float: 'right' }}
          >
            <Button type="primary" htmlType="submit">开始评估</Button>
          </Form.Item>
        </Form>
      </div>
    </PageHeader>
    {/* 选择训练作业弹框 */}
    {/* {
      visible && <ModalForm
      visible={visible}
      onCancel={handleCancel}
      onSubmit={handleSubmit}
    />
    } */}
    </>  
  );
};

export default ModelEvaluation;