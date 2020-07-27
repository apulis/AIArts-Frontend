import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Divider, Select, Radio, message, PageHeader, Modal, Tabs, Col, Row, InputNumber  } from 'antd';
import { history, useParams } from 'umi';
import { PauseOutlined, PlusSquareOutlined, DeleteOutlined, FolderOpenOutlined } from '@ant-design/icons';
import { useForm } from 'antd/lib/form/Form';
import FormItem from 'antd/lib/form/FormItem';

import { submitModelTraining, fetchAvilableResource } from '../../services/modelTraning';

import styles from './index.less';
import { getLabeledDatasets } from '../../services/datasets';
import { jobNameReg } from '@/utils/reg';

const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

export const generateKey = () => {
  return new Date().getTime();
};



const ModelTraining = (props) => {
  // 请求类型，根据参数创建作业，type为createWithParam；编辑参数type为editParam
  const requestType = props.match.params.type;
  const paramsId = props.match.params.id;
  let readParam, createDisable, editDisable, params;
  const isSubmitPage = '/model-training/submit' === props.location.pathname;
  if (requestType) {
    readParam = true;
  }
  if (requestType === 'createJobWithParam') {
    createDisable = true;
  }
  if (requestType === 'editParam') {
    editDisable = true;
  }
  const goBackPath = readParam ? '/model-training/paramsManage' : '/model-training/modelTraining';

  const [runningParams, setRunningParams] = useState([{ key: '', value: '', createTime: generateKey() }]);
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
  const [presetParamsVisible, setPresetParamsVisible] = useState(false);
  const [deviceTotal, setDeviceTotal] = useState(0);
  const [presetRunningParams, setPresetRunningParams] = useState([]);
  const { validateFields, getFieldValue, setFieldsValue } = form;
  const [distributedJob, setDistributedJob] = useState(false);
  const [currentSelectedPresetParamsId, setCurrentSelectedPresetParamsId] = useState('');
  const [totalNodes, setTotalNodes] = useState(0);
  const getAvailableResource = async () => {
    const res = await fetchAvilableResource();
    if (res.code === 0) {
      let { data: { aiFrameworks, deviceList, codePathPrefix, nodeInfo } } = res;
      if (!/\/$/.test(codePathPrefix)) {
        codePathPrefix = codePathPrefix + '/';
      }
      setCodePathPrefix(codePathPrefix);
      let aiFrameworkList = [];
      Object.keys(aiFrameworks).forEach(val => {
        aiFrameworkList = aiFrameworkList.concat(aiFrameworks[val]);
      });
      setFrameWorks(aiFrameworkList);
      setDeviceList(deviceList);
      const { totalNodes } = nodeInfo;
      if (totalNodes) {
        setTotalNodes(totalNodes);
      }
    }
  };

  const fetchDataSets = async () => {
    const res = await getLabeledDatasets({ pageNum: 1, pageSize: 100 });
    if (res.code === 0) {
      const datasets = res.data.datasets;
      setDatasets(datasets);
    }
  };

  const fetchParams = async () => {
    let data;
    await setTimeout(() => {
      data = {
        key: 1,
        id: 1,
        configName: 'train_job_config_001',
        type: '训练',
        engine: 'tensorflow , tf-1.8.0-py2.7',
        createTime: 'Aug 5, 2017 7:20:57 AM GMT+08:00',
        description: 'My name is John Brown, I am 32 years old, living in New York No. 1 Lake Park.',
        startupFile: '/start.sh',
        deviceNum: 3,
        datasetPath: 'train.csv',
        params: [
          {
            key: 'learning_rate',
            value: 0.01,
            createTime: 2323233
          },
          {
            key: 'epoch',
            value: 20,
            createTime: 4242442
          },
          {
            key: 'dropout',
            value: 0.5,
            createTime: 4242443
          },
        ],
        engine: 'tensorflow',
        codePath: '/home/code/',
        deviceType: '1核 | 16GB | 1*AI加速卡	'
      };
      setRunningParams(data.params);
      form.setFieldsValue(data);
    }, 0);

  };

  useEffect(() => {
    getAvailableResource();
    fetchDataSets();
    // set default value
    if (readParam) { fetchParams(); }
  }, []);

  useEffect(() => {
    if (presetParamsVisible) {
      setPresetRunningParams([{
        name: 'test',
        deviceNum: 10,
        startupFile: 'aaa.py',
        codePath: '/adsf/',
        datasetPath: '/afd/',
        outputPath: '/asdf',
        params: 'aaa=1',
        deviceType: 'device',
        engine: 'tensor',
        id: '23312-123123-41224',
      }])
    }
  }, [presetParamsVisible])

  const handleSubmit = async () => {
    const values = await validateFields();
    let params = {};
    values.params && values.params.forEach(p => {
      params[p.key] = p.value;
    });
    values.codePath = codePathPrefix + (values.codePath || '');
    values.startupFile = codePathPrefix + values.startupFile;
    values.outputPath = codePathPrefix + (values.outputPath || '');
    values.params = params;
    if (distributedJob) {
      values.deviceNum = values.deviceTotal;
    }
    const cancel = message.loading('正在提交');
    const res = await submitModelTraining(values);
    cancel();
    if (res.code === 0) {
      message.success('成功创建');
      history.push(goBackPath);
    }
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
    console.log('values', values);
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

  const commonLayout = {
    labelCol: { span: 4 },
    wrapperCol: { span: 8 }
  };

  const handleDistributedJob = (e) => {
    const type = e.target.value;
    setDistributedJob(type);
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
        current = current * 2;
      }
      setAvailableDeviceNumList(list);
    }
  };
  const handleConfirmPresetParams = () => {
    const currentSelected = presetRunningParams.find(p => p.id === currentSelectedPresetParamsId);
    if (currentSelected) {
      setFieldsValue(currentSelected);
      setPresetParamsVisible(false)
    }
  }

  const handleSelectPresetParams = (current) => {
    setCurrentSelectedPresetParamsId(current);
  }

  const handleClickDeviceNum = (e) => {h
    if (!getFieldValue('deviceType')) {
      message.error('需要先选择设置类型');
    }
  }

  const handleDeviceChange = () => {
    setDeviceTotal((Number(getFieldValue('nodeNum') || 0)) * (Number(getFieldValue('deviceNum') || 0)))
  }

  return (
    <div className={styles.modelTraining}>
      <PageHeader
        className="site-page-header"
        onBack={() => history.push(goBackPath)}
        title={editDisable ? '编辑训练参数' : '创建训练作业'}
      />
      <Form form={form}>
        <FormItem {...commonLayout} style={{ marginTop: '30px' }} name="name" label={editDisable ? "参数配置名称" : "作业名称"} rules={[{ required: true }, { ...jobNameReg }]}>
          <Input style={{ width: 300 }} placeholder={editDisable ? "请输入参数配置名称" : "请输入作业名称"} disabled={editDisable} />
        </FormItem>
        <FormItem labelCol={{ span: 4 }} wrapperCol={{ span: 14 }} name="desc" label="描述" rules={[{ max: 191 }]}>
          <TextArea placeholder="请输入描述信息" />
        </FormItem>
      </Form>
      <Divider style={{ borderColor: '#cdcdcd' }} />
      <div className="ant-page-header-heading-title" style={{ marginLeft: '38px', marginBottom: '20px' }}>参数配置</div>
      {isSubmitPage && <FormItem {...commonLayout} label="参数来源">
        <Radio.Group defaultValue={1} buttonStyle="solid">
          <Radio.Button value={1}>手动参数配置</Radio.Button>
          <Radio.Button value={2} onClick={() => { setPresetParamsVisible(true) }}>导入参数配置</Radio.Button>
        </Radio.Group>
      </FormItem>}
      <Form form={form}>
        <FormItem {...commonLayout} name="engine" label="引擎" rules={[{ required: true }]}>
          <Select style={{ width: 300 }} disabled={createDisable} >
            {
              frameWorks.map(f => (
                <Option value={f} key={f}>{f}</Option>
              ))
            }
          </Select>
        </FormItem>
        <FormItem
          labelCol={{ span: 4 }}
          name="codePath"
          label="代码目录"
        >
          <Input addonBefore={codePathPrefix} style={{ width: 420 }} disabled={createDisable} />
        </FormItem>
        <FormItem labelCol={{ span: 4 }} label="启动文件" name="startupFile" rules={[{ required: true }, { pattern: /\.py$/, message: '需要填写一个 python 文件' }]}>
          <Input addonBefore={codePathPrefix} style={{ width: 420 }} disabled={createDisable} />
        </FormItem>
        <FormItem name="outputPath" labelCol={{ span: 4 }} label="输出路径" style={{ marginTop: '50px' }}>
          <Input addonBefore={codePathPrefix} style={{ width: 420 }} />
        </FormItem>
        <FormItem name="datasetPath" rules={[{ required: true, message: '请输入训练数据集' }]} labelCol={{ span: 4 }} label="训练数据集">
          {/* <Input style={{ width: 300 }} /> */}
          <Select
            style={{ width: '300px' }}
          >
            {
              datasets.map(d => (
                <Option value={d.dataSetPath}>{d.name}</Option>
              ))
            }
          </Select>
        </FormItem>
        <FormItem label="运行参数" labelCol={{ span: 4 }} >
          {
            runningParams.map((param, index) => {
              return (
                <div>
                  <FormItem initialValue={runningParams[index].key} rules={[{ validator(...args) { validateRunningParams(index, 'key', ...args); } }]} name={['params', index, 'key']} wrapperCol={{ span: 24 }} style={{ display: 'inline-block' }}>
                    <Input style={{ width: 200 }} />
                  </FormItem>
                  <PauseOutlined rotate={90} style={{ marginTop: '8px', width: '30px' }} />
                  <FormItem initialValue={runningParams[index].value} rules={[{ validator(...args) { validateRunningParams(index, 'value', ...args); } }]} name={['params', index, 'value']} wrapperCol={{ span: 24 }} style={{ display: 'inline-block' }}>
                    <Input style={{ width: 200 }} />
                  </FormItem>
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
        </FormItem>
        <FormItem label="是否分布式训练" name="distributed" {...commonLayout} rules={[{ required: true }]}>
          <Radio.Group style={{ width: '300px' }} defaultValue={distributedJob} onChange={handleDistributedJob}>
            <Radio value={true}>是</Radio>
            <Radio value={false}>否</Radio>
          </Radio.Group>
        </FormItem>
        <FormItem label="设备类型" name="deviceType" {...commonLayout} rules={[{ required: true }]}>
          <Select style={{ width: '300px' }} onChange={onDeviceTypeChange}>
            {
              deviceList.map(d => (
                <Option value={d.deviceType}>{d.deviceType}</Option>
              ))
            }
          </Select>
        </FormItem>
        {
          distributedJob && <FormItem
            labelCol={{ span: 4 }}
            label="节点数量"
            {...commonLayout}
            name="nodeNum"
            rules={[
              {type: 'number', message: '需要填写一个数字'},
              {validator(rule, value, callback) {
                if (Number(value) > totalNodes) {
                  callback(`不能大于 ${totalNodes}`)
                }
              }}
            ]}
            
            defaultValue={1}
          >
            <InputNumber
              onChange={handleDeviceChange}
              min={1}
              max={totalNodes}
            />
          </FormItem>
        }
        <FormItem
          label={distributedJob ? "每个节点设备数量" : "设备数量"}
          name="deviceNum"
          {...commonLayout}
          rules={[{ required: true }]}
        >
          <Select style={{ width: '300px' }}
            onChange={handleDeviceChange}
            onClick={handleClickDeviceNum} >
            {
              availableDeviceNumList.map(avail => (
                <Option value={avail}>{avail}</Option>
              ))
            }
          </Select>
        </FormItem>
        {
          distributedJob && <FormItem
            {...commonLayout}
            label="设备总数"
            name="deviceTotal"
            disabled
          >
            <Input value={deviceTotal} style={{ width: '300px' }} disabled />
          </FormItem>
        }
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
      <Modal
        visible={presetParamsVisible}
        onCancel={() => setPresetParamsVisible(false)}
        onOk={handleConfirmPresetParams}
        title="导入训练参数配置"
        forceRender
      >
        <Form
          form={form}
        >
          <Tabs defaultActiveKey={presetRunningParams[0] && presetRunningParams[0].id} tabPosition="left" onChange={handleSelectPresetParams} style={{ height: 220 }}>
            {presetRunningParams.map(p => (
              <TabPane tab={p.name} key={p.id}>
                <Row>
                  <Col span={8}>
                    计算节点个数
                  </Col>
                  <Col span={16}>
                    {p.deviceNum}
                  </Col>
                </Row>
                <Row>
                  <Col span={8}>
                    启动文件
                  </Col>
                  <Col span={16}>
                    {p.startupFile}
                  </Col>
                </Row>
                <Row>
                  <Col span={8}>
                    代码目录
                  </Col>
                  <Col span={16}>
                    {p.codePath}
                  </Col>
                </Row>
                <Row>
                  <Col span={8}>
                    训练数据集
                  </Col>
                  <Col span={16}>
                    {p.datasetPath}
                  </Col>
                </Row>
                <Row>
                  <Col span={8}>
                    输出路径
                  </Col>
                  <Col span={16}>
                    {p.outputPath}
                  </Col>
                </Row>
                <Row>
                  <Col span={8}>
                    运行参数
                  </Col>
                  <Col span={16}>
                    {p.params}
                  </Col>
                </Row>
                <Row>
                  <Col span={8}>
                    计算节点规格
                  </Col>
                  <Col span={16}>
                    {p.deviceType}
                  </Col>
                </Row>
                <Row>
                  <Col span={8}>
                    引擎类型
                  </Col>
                  <Col span={16}>
                    {p.engine}
                  </Col>
                </Row>
              </TabPane>
            ))}
          </Tabs>
        </Form>

      </Modal>
      <Button type="primary" style={{ float: 'right' }} onClick={handleSubmit}>立即创建</Button>
    </div>

  );
};


export default ModelTraining;