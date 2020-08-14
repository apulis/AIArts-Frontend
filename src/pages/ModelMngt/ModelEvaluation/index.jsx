import { history } from 'umi';
import { message, Modal, Form, Input, Button, Card, PageHeader, Radio, Select, Tabs, Divider, Col, Row } from 'antd';
import React, { useState, useEffect, useRef } from 'react';
import { PlusSquareOutlined, PauseOutlined, DeleteOutlined } from '@ant-design/icons';
import { getModel } from '../ModelList/services';
import { addEvaluation, fetchPresetTemplates, getAllLabeledDatasets } from './services';
import { fetchAvilableResource } from '@/services/modelTraning';
import { getDeviceNumArrByNodeType, formatParams } from '@/utils/utils';
import { generateKey } from '@/pages/ModelTraining/Submit';
import { jobNameReg } from '@/utils/reg';

import styles from '@/pages/ModelTraining/index.less';
import curStyles from './index.less';

const { Option } = Select;
const { TabPane } = Tabs;

const ModelEvaluation = props => {
  const query = props.location.query;
  const modelId = decodeURIComponent(query.modelId);

  const [codePathPrefix, setCodePathPrefix] = useState('');
  const [engines, setEngines] = useState([]);
  const [datasets, setDatasets] = useState([]);
  const [deviceTypes, setDeviceTypes] = useState([]);
  const [deviceNums, setDeviceNums] = useState([]);
  const [deviceList, setDeviceList] = useState([]);
  const [datasetName, setDatasetName] = useState('');
  const [nodeInfo, setNofeInfo] = useState([]);
  const [currentDeviceType, setCurrentDeviceType] = useState('');
  // const [runningParams, setRunningParams] = useState([{ key: '', value: '', createTime: generateKey() }]);
  const [runningParams, setRunningParams] = useState([]);
  const [presetParamsVisible, setPresetParamsVisible] = useState(false);
  const [presetRunningParams, setPresetRunningParams] = useState([]);
  const [currentSelectedPresetParamsId, setCurrentSelectedPresetParamsId] = useState('');

  const [form] = Form.useForm();
  const { validateFields, getFieldValue, setFieldsValue } = form;
  
  const [form2] = Form.useForm();

  useEffect(() => {
    getAvailableResource();
    getTestDatasets();
    // getCurrentModel(modelId);
  }, []);

  useEffect(() => {
    if (presetParamsVisible) {
      fetchPresetTemplates().then(res => {
        if (res.code === 0) {
          const template = res.data.Templates;
          setPresetRunningParams(template);
          if (template.length > 0) {
            setCurrentSelectedPresetParamsId(template[0].metaData?.id);
          }
        }
      });
    }
  }, [presetParamsVisible]);

  useEffect(() => {
    getCurrentModel(modelId);
  }, [codePathPrefix]);

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

  useEffect(() => {
    if (!currentDeviceType) return;
    const nums = getDeviceNumArrByNodeType(nodeInfo, currentDeviceType);
    setDeviceNums(nums);
  }, [nodeInfo, currentDeviceType]);

  const getTestDatasets = async () => {
    const { code, data, msg } = await getAllLabeledDatasets();
    if (code === 0 && data) {
      const { datasets } = data;
      setDatasets(datasets);
    } else {
      message.error(msg);
    }
  }

  const getCurrentModel = async (modelId) => {
    const { code, data, msg } = await getModel(modelId);
    if (code === 0) {
      const { model } = data;

      let paramPathSuffix = model.paramPath?.substr(codePathPrefix.length) || '';
      let codePathSuffix = model.codePath?.substr(codePathPrefix.length) || '';
      let outputPathSuffix = model.outputPath?.substr(codePathPrefix.length) || '';
      let startupFileSuffix = model.startupFile?.substr(codePathPrefix.length) || '';

      form.setFieldsValue({
        name: model.name,
        argumentsFile: paramPathSuffix,
        codePath: codePathSuffix,
        outputPath: outputPathSuffix,
        startupFile: startupFileSuffix,
      });
    } else {
      message.error(msg);
    }
  }

  const onFinish = async (values) => {
    let params = {};
    values.params && values.params.forEach(p => {
      //处理params存在空记录的问题
      if (p.key && p.value) {
        params[p.key] = p.value;
      }
    });

    const { name, engine, codePath, startupFile, outputPath, datasetPath, deviceType, deviceNum, argumentsFile } = values;
    const evalParams = {
      id: modelId,
      name,
      engine,
      codePath: codePathPrefix + codePath,
      startupFile: codePathPrefix + startupFile,
      outputPath: codePathPrefix + outputPath,
      datasetPath,
      params,
      datasetName,
      deviceType,
      deviceNum,
      paramPath: codePathPrefix + argumentsFile,
    };
    const { code, msg } = await addEvaluation(evalParams);

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

  const onDeviceTypeChange = (value) => {
    const deviceType = value;
    setCurrentDeviceType(deviceType);
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
    console.log('values', values, key);
    [...runningParams].forEach((param, index) => {
      param.key = values[index].key;
      param.value = values[index].value;
    });
    const newRunningParams = [...runningParams].filter((param) => {
      if (param.createTime) {
        return param.createTime !== key;
      } else {
        return param.key !== key;
      }
    });
    setRunningParams(newRunningParams);
    setFieldsValue({
      params: newRunningParams.map(params => ({ key: params.key, value: params.value }))
    });
  };

  const handleConfirmPresetParams = () => {
    const currentSelected = presetRunningParams.find(p => p.metaData.id == currentSelectedPresetParamsId);
    
    if (currentSelected) {
      // 防止name被覆盖
      if (currentSelected.params.name) {
        delete currentSelected.params.name
      }

      const suffixParams = {
        codePath: currentSelected.params.codePath?.substr(codePathPrefix.length) || '',
        outputPath: currentSelected.params.outputPath?.substr(codePathPrefix.length) || '',
        startupFile: currentSelected.params.startupFile?.substr(codePathPrefix.length) || '',
        paramPath: currentSelected.params.argumentsFile?.substr(codePathPrefix.length) || '',
      }
      setFieldsValue({...currentSelected.params, ...suffixParams});
      // console.log('currentSelected.params.params', currentSelected.params.params)
      const params = Object.entries(currentSelected.params.params|| {}).map(item => {
        var obj = {};
        // console.log('item', item);
        obj['key'] = item[0];
        obj['value'] = item[1];
        return obj;
      });
      setRunningParams(params);
      setFieldsValue({
        params: params
      });
      setCurrentDeviceType(currentSelected.params.deviceType);
    }
    setPresetParamsVisible(false);
  };

  const handleSelectPresetParams = (current) => {
    // console.log(current);
    setCurrentSelectedPresetParamsId(current);
  };

  const handleClickDeviceNum = (e) => {
    if (!getFieldValue('deviceType')) {
      message.error('需要先选择设备类型');
    }
  };

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
            // autoComplete="off"
          >
            <Form.Item
              {...layout}
              name="name"
              label="模型名称"
              rules={[{ required: true, message: '名称不能为空!' }, { ...jobNameReg }]}
            >
              <Input placeholder="请输入模型名称" disabled/>
            </Form.Item>
            <Divider style={{ borderColor: '#cdcdcd' }} />
            <Form.Item {...layout} label="参数来源">
              <Radio.Group defaultValue={1} buttonStyle="solid">
                <Radio.Button value={1}>手动参数配置</Radio.Button>
                <Radio.Button value={2} onClick={() => { setPresetParamsVisible(true); }}>导入评估参数</Radio.Button>
              </Radio.Group>
            </Form.Item>
            <Form.Item
              {...layout}
              label="引擎"
              name="engine"
              rules={[{ required: true, message: '请选择引擎' }]}
            >
              <Select>
                {
                  engines && engines.map(f => (
                    <Option value={f} key={f}>{f}</Option>
                  ))
                }
              </Select>
            </Form.Item>
            <Form.Item {...layout} label="代码目录" name="codePath" rules={[{ required: true, message: '需要填写代码目录' }]}>
              <Input addonBefore={codePathPrefix} />
            </Form.Item>
            <Form.Item {...layout} label="启动文件" name="startupFile" rules={[{ required: true, message: '需要填写启动文件' }]}>
              <Input addonBefore={codePathPrefix} />
            </Form.Item>
            <Form.Item 
              {...layout} 
              label="输出路径"
              name="outputPath"
              rules={[{ required: true, message: '需要填写输出路径' }]}
            >
              <Input addonBefore={codePathPrefix} />
            </Form.Item> 
            <Form.Item {...layout} label="模型参数文件" name="argumentsFile" rules={[{ required: true, message: '需要填写模型参数文件' }]}>
              <Input addonBefore={codePathPrefix} />
            </Form.Item>                                             
            <Form.Item {...layout}  label="测试数据集" name="datasetPath" rules={[{ required: true, message: '请选择测试数据集' }]}>
              <Select
                onChange={handleDatasetChange}
              >
                {
                  datasets.map(d => (
                    <Option key={d.path} value={d.path}>{d.name}</Option>
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
                        runningParams.length > 1 && <DeleteOutlined style={{ marginLeft: '10px', cursor: 'pointer' }} onClick={() => removeRuningParams(param.createTime || param.key)} />
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
              rules={[{ required: true, message: '请选择设备类型' }]}
            >
              <Select onChange={onDeviceTypeChange}>
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
              rules={[{ required: true, message: '请选择设备数量' }]}
            >
              <Select
                onClick={handleClickDeviceNum}
              >
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
      <Modal
        visible={presetParamsVisible}
        onCancel={() => setPresetParamsVisible(false)}
        onOk={handleConfirmPresetParams}
        title="导入评估参数"
        forceRender
        width="80%"
      >
        <Form
          form={form2}
        >
          {
            presetRunningParams.length > 0 ? 
            <Tabs defaultActiveKey={presetRunningParams[0].metaData?.id} tabPosition="left" onChange={handleSelectPresetParams} 
              // style={{ height: 220 }} 
              className={curStyles.paramsTabs}
            >
              {presetRunningParams.map((p, index) => (
                <TabPane tab={p.metaData.name} key={p.metaData.id}>
                  {/* <Row>
                    <Col span={5}>
                      计算节点个数
                  </Col>
                    <Col span={19}>
                      {p.params.deviceNum}
                    </Col>
                  </Row> */}
                  <Row>
                    <Col span={5}>
                      启动文件
                  </Col>
                    <Col span={19}>
                      {p.params.startupFile}
                    </Col>
                  </Row>
                  <Row>
                    <Col span={5}>
                      代码目录
                  </Col>
                    <Col span={19}>
                      {p.params.codePath}
                    </Col>
                  </Row>
                  <Row>
                    <Col span={5}>
                      训练数据集
                  </Col>
                    <Col span={19}>
                      {p.params.datasetPath}
                    </Col>
                  </Row>
                  <Row>
                    <Col span={5}>
                      输出路径
                  </Col>
                    <Col span={19}>
                      {p.params.outputPath}
                    </Col>
                  </Row>
                  <Row>
                    <Col span={5}>
                      运行参数
                  </Col>
                    <Col span={19}>
                      {p.params.params && formatParams(p.params.params).map(p => <div>{p}</div>)}
                    </Col>
                  </Row>
                  <Row>
                    <Col span={5}>
                      计算节点规格
                  </Col>
                    <Col span={19}>
                      {p.params.deviceType}
                    </Col>
                  </Row>
                  <Row>
                    <Col span={5}>
                      引擎类型
                  </Col>
                    <Col span={19}>
                      {p.params.engine}
                    </Col>
                  </Row>
                </TabPane>
              ))}
            </Tabs>
              : <div>暂无</div>
          }
        </Form>
    </Modal>
    </>   
  );
};

export default ModelEvaluation;