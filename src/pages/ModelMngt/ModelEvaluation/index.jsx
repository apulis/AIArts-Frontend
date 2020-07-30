import { history } from 'umi';
import { message, Modal, Form, Input, Button, Card, PageHeader, Radio, Select, Tag } from 'antd';
import React, { useState, useEffect, useRef } from 'react';
import { PlusSquareOutlined, PauseOutlined, DeleteOutlined } from '@ant-design/icons';
// import ModalForm from './components/ModalForm';
import { getModel } from '../ModelList/services';
import { addEvaluation } from './services';
import { fetchAvilableResource } from '@/services/modelTraning';
import { getLabeledDatasets } from '@/services/datasets';
import { getDeviceNumArrByNodeType } from '@/utils/utils';
import { generateKey } from '@/pages/ModelTraining/Submit';
import { jobNameReg } from '@/utils/reg';

import styles from '@/pages/ModelTraining/index.less';

const { Option } = Select;

const ModelEvaluation = props => {
  const query = props.location.query;
  const modelId = decodeURIComponent(query.modelId);

  const [codePathPrefix, setCodePathPrefix] = useState('');
  const [visible, setVisible] = useState(false);
  const [engines, setEngines] = useState([]);
  const [datasets, setDatasets] = useState([]);
  const [deviceTypes, setDeviceTypes] = useState([]);
  const [deviceNums, setDeviceNums] = useState([]);
  const [deviceList, setDeviceList] = useState([]);
  const [datasetName, setDatasetName] = useState('');
  const [nodeInfo, setNofeInfo] = useState([]);
  const [runningParams, setRunningParams] = useState([{ key: '', value: '', createTime: generateKey() }]);

  const [form] = Form.useForm();
  const { validateFields, getFieldValue, setFieldsValue } = form;
  
  useEffect(() => {
    getAvailableResource();
    getTestDatasets();
    getCurrentModel(modelId);
  }, []);

  const getAvailableResource = async () => {
    const res = await fetchAvilableResource();
    if (res.code === 0) {
      let { data: { codePathPrefix, aiFrameworks, deviceList, nodeInfo } } = res;
      if (!/\/$/.test(codePathPrefix)) {
        codePathPrefix = codePathPrefix + '/'
      }
      setCodePathPrefix(codePathPrefix);

      // 获取引擎
      let engineList = [];
      Object.keys(aiFrameworks).forEach(val => {
        engineList = engineList.concat(aiFrameworks[val]);
      });
      setEngines(engineList);

      setDeviceList(deviceList);
      setNofeInfo(nodeInfo);

      // 设备类型
      let deviceTypes = deviceList.map(d => d.deviceType);
      if (deviceTypes.length > 0) {
        setDeviceTypes(deviceTypes);
      }
    }
  }

  const getTestDatasets = async () => {
    const params = { 
      pageNum: 1, 
      pageSize: 9999,
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

  const getCurrentModel = async (modelId) => {
    const { code, data, msg } = await getModel(modelId);
    if (code === 0) {
      const { model } = data;
      // console.log(666, model)
      form.setFieldsValue({
        name: model.name,
        // engine: model.engineType,
        // startupFile: model.startupFile,
        // outputPath: model.outputPath,
        // datasetPath: model.datasetPath,
        argumentsFile: model.argumentPath,
        // codePath: model.codePath,
        // deviceType: model.deviceType,
        // deviceNum: model.deviceNum,
      });
    } else {
      message.error(msg);
    }
  }

  const onFinish = async (values) => {
    let params = {};
    values.params && values.params.forEach(p => {
      params[p.key] = p.value;
    });
    // values.params = params;
    const { name, engine, codePath, startupFile, outputPath, datasetPath, deviceType, deviceNum, argumentsFile } = values;
    const data = {
      id: modelId,
      name,
      engine,
      codePath,
      startupFile,
      outputPath,
      datasetPath,
      params,
      desc: datasetName,
      deviceType,
      deviceNum,
      argumentPath: argumentsFile,
    };
    const { code, msg } = await addEvaluation(data);

    if (code === 0) {
      message.success(`创建评估成功`);
      history.push('/ModelManagement/MyModels');
    } else {
      msg && message.error(`创建评估失败:${msg}`);
    }
  };

  const handleDatasetChange = (value, option) => {
    setDatasetName(option.children);
  };

  const handleDeviceTypeChange = value => {
    const selected = deviceList.find(item => item.deviceType === value); 
    const nums = getDeviceNumArrByNodeType(nodeInfo.find(node => node.gpuType === selected.deviceType));
    
    setDeviceNums(nums);
  };

  const addParams = () => {
    const newRunningParams = runningParams.concat({
      key: '',
      value: '',
      createTime: generateKey(),
    });
    setRunningParams(newRunningParams);
  };

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
    });
    callback();
  };

  const removeRuningParams = async (key) => {
    const values = await getFieldValue('params');
    // console.log('values', values);
    [...runningParams].forEach((param, index) => {
      param.key = values[index].key;
      param.value = values[index].value;
    });
    const newRunningParams = [...runningParams].filter((param) => param.createTime !== key);
    setRunningParams(newRunningParams);
    setFieldsValue({
      runningParams: newRunningParams.map(params => ({ key: params.key, value: params.value }))
    });
  };

  const layout = {
    labelCol: { span: 3 },
    wrapperCol: { span: 12 },
  };

  return (
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
        >
          <Form.Item
            {...layout}
            name="name"
            label="模型名称"
            rules={[{ required: true, message: '名称不能为空!' }, { ...jobNameReg }]}
          >
            <Input placeholder="请输入模型名称" disabled/>
          </Form.Item>
          <Form.Item
            {...layout}
            label="引擎"
            name="engine"
            required
          >
            <Select>
              {
                engines && engines.map(f => (
                  <Option value={f} key={f}>{f}</Option>
                ))
              }
            </Select>
          </Form.Item>
          <Form.Item {...layout} label="代码目录" name="codePath">
            <Input/>
          </Form.Item>
          <Form.Item {...layout} label="启动文件" name="startupFile" rules={[{ required: true }, { message: '需要填写启动文件' }]}>
            <Input/>
          </Form.Item>
          <Form.Item 
            {...layout} 
            label="输出路径"
            name="outputPath"
          >
            <Input/>            
          </Form.Item> 
         <Form.Item {...layout} label="模型参数文件" name="argumentsFile" rules={[{ required: true }, { message: '需要填写模型参数文件' }]}>
            <Input/>
          </Form.Item>                                             
          <Form.Item {...layout}  label="测试数据集" name="datasetPath" rules={[{ required: false, message: '请选择测试数据集' }]}>
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
          <Form.Item 
            // {...layout}
            label="运行参数"
            labelCol={{ span: 3 }}
          >
            {
              runningParams.map((param, index) => {
                return (
                  <div>
                    <Form.Item initialValue={runningParams[index].key} rules={[{ validator(...args) { validateRunningParams(index, 'key', ...args); } }]} name={['params', index, 'key']} wrapperCol={{ span: 24 }} style={{ display: 'inline-block' }}>
                      <Input style={{ width: 200 }} />
                    </Form.Item>
                    <PauseOutlined rotate={90} style={{ marginTop: '8px', width: '30px' }} />
                    <Form.Item initialValue={runningParams[index].value} rules={[{ validator(...args) { validateRunningParams(index, 'value', ...args); } }]} name={['params', index, 'value']} wrapperCol={{ span: 24 }} style={{ display: 'inline-block' }}>
                      <Input style={{ width: 200 }} />
                    </Form.Item>
                    {
                      runningParams.length > 1 && <DeleteOutlined style={{ marginLeft: '10px', cursor: 'pointer' }} onClick={() => removeRuningParams(param.createTime)} />
                    }
                  </div>
                );
              })
            }
            <div className={styles.addParams} onClick={addParams}>
              <PlusSquareOutlined fill="#1890ff" style={{ color: '#1890ff', marginRight: '10px' }} />
              <a>点击增加参数</a>
            </div>
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
  );
};

export default ModelEvaluation;