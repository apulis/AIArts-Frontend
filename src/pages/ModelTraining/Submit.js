import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Divider, Select, Radio, message, PageHeader, Modal, Tabs, Col, Row, InputNumber } from 'antd';
import { history, useParams } from 'umi';
import { PauseOutlined, PlusSquareOutlined, DeleteOutlined, FolderOpenOutlined, CompassOutlined } from '@ant-design/icons';
import { useForm } from 'antd/lib/form/Form';
import FormItem from 'antd/lib/form/FormItem';
import { submitModelTraining, fetchAvilableResource, fetchTemplateById, fetchPresetTemplates, fetchPresetModel, updateParams } from '../../services/modelTraning';

import styles from './index.less';
import { getLabeledDatasets } from '../../services/datasets';
import { jobNameReg } from '@/utils/reg';
import { getDeviceNumPerNodeArrByNodeType, getDeviceNumArrByNodeType,formatParams } from '@/utils/utils';

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

export const subCodePathPrefix = (s) => {
  return s.replace(/\/home\/.+?\//, '')
}

let haveSetedParamsDetail = false;


const ModelTraining = (props) => {
  // 请求类型，根据参数创建作业，type为createJobWithParam；编辑参数type为editParam
  const requestType = props.match.params.type;
  const paramsId = props.match.params.id;
  let readParam, typeCreate, typeEdit;
  const isSubmitPage = '/model-training/submit' === props.location.pathname;
  if (requestType) {
    readParam = true;
  }
  if (requestType === 'createJobWithParam') {
    typeCreate = true;
  }
  if (requestType === 'editParam') {
    typeEdit = true;
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
  const [nodeInfo, setNofeInfo] = useState([]);
  const [currentDeviceType, setCurrentDeviceType] = useState('');
  const [paramsDetailedData, setParamsDetailedData] = useState({});
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
      const totalNodes = nodeInfo.length;
      if (totalNodes) {
        setTotalNodes(totalNodes);
      }
      setNofeInfo(nodeInfo);
    }
  };
  useEffect(() => {
    if (distributedJob) {
      if (!currentDeviceType) return;
      // const list = getDeviceNumPerNodeArrByNodeType(nodeInfo.find(node => node.gpuType === currentDeviceType));
      const list = getDeviceNumPerNodeArrByNodeType(nodeInfo, currentDeviceType);
      setAvailableDeviceNumList(list);
    } else {
      if (!currentDeviceType) return;
      const list = getDeviceNumArrByNodeType(nodeInfo, currentDeviceType);
      setAvailableDeviceNumList(list);
    }
  }, [distributedJob, nodeInfo, currentDeviceType]);

  useEffect(() => {
    if (codePathPrefix && Object.keys(paramsDetailedData).length > 0 && !haveSetedParamsDetail) {
      console.log(111, paramsDetailedData)
      haveSetedParamsDetail = true;
      const newParams = {
        ...paramsDetailedData.params,
        outputPath: subCodePathPrefix(paramsDetailedData.params.outputPath),
        codePath: subCodePathPrefix(paramsDetailedData.params.codePath),
        startupFile: subCodePathPrefix(paramsDetailedData.params.startupFile),
      }
      console.log('newParams', newParams)
      setParamsDetailedData({
        ...paramsDetailedData,
        params: newParams
      });
      setCurrentDeviceType(newParams.deviceType)
      setFieldsValue(newParams);
    }
  }, [codePathPrefix, paramsDetailedData])

  const fetchDataSets = async () => {
    const res = await getLabeledDatasets({ pageNum: 1, pageSize: 100 });
    if (res.code === 0) {
      let datasets = res.data.datasets;
      datasets = datasets.filter(d => d.convertStatus === 'finished');
      setDatasets(datasets);
    }
  };

  const fetchParams = async () => {
    let res = await fetchTemplateById(paramsId);
    if (res.code === 0) {
      const data = res.data;
      setParamsDetailedData(data);
      // check null 
      data.params.params = data.params.params || [];
      // replace path prefix
      data.params.codePath = data.params.codePath.replace(codePathPrefix, '');
      data.params.startupFile = data.params.startupFile.replace(codePathPrefix, '');
      data.params.outputPath = data.params.outputPath.replace(codePathPrefix, '');
      data.params.params = Object.entries(data.params.params).map(item => {
        var obj = {};
        obj['key'] = item[0];
        obj['value'] = item[1];
        return obj;
      });
      if (typeCreate) {
        data.params.name = '';
      }
      form.setFieldsValue(data.params);
      setRunningParams(data.params.params);
    }
  };

  const getPresetModel = async () => {
    const res = await fetchPresetModel(paramsId);
    if (res.code === 0) {
      const { model } = res.data;
      // check null
      model.arguments = model.arguments || [];
      const params = Object.entries(model.arguments || {}).map(item => {
        var obj = {};
        obj['key'] = item[0];
        obj['value'] = item[1];
        return obj;
      });
      if (params.length === 0) {
        params[0] = { key: '', value: '', createTime: generateKey() };
      }
      setRunningParams(params);
      setFieldsValue({
        params: params,
        datasetPath: model.datasetName,
        engine: model.engineType,
        name: model.name,
      });

    }
  };

  useEffect(() => {
    getAvailableResource();
    fetchDataSets();
    if (['createJobWithParam', 'editParam'].includes(requestType)) { fetchParams(); }
    if (['PretrainedModel'].includes(requestType)) {
      getPresetModel();
    }
  }, [codePathPrefix]);

  useEffect(() => {
    if (presetParamsVisible) {
      fetchPresetTemplates().then(res => {
        if (res.code === 0) {
          const template = res.data.Templates;
          setPresetRunningParams(template);
          // setCurrentDeviceType()
          if (template.length > 0) {
            setCurrentSelectedPresetParamsId(template[0].metaData?.id);
          }
        }
      });
    }
  }, [presetParamsVisible]);


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
    if (typeEdit) {
      console.log('params:', paramsDetailedData);
      let editParams = {
        ...paramsDetailedData.metaData,
        templateData: values
      };
      const res = await updateParams(editParams);
      if (res.code === 0) {
        message.success('保存成功');
        history.push(goBackPath);
      }
    } else {
      if (values.jobtrainingtype === 'PSDistJob') {
        values.numPs = 1;
      }
      const cancel = message.loading('正在提交');
      const res = await submitModelTraining(values);
      cancel();
      if (res.code === 0) {
        message.success('成功创建');
        history.push(goBackPath);
      }
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

  const commonLayout = {
    labelCol: { span: 4 },
    wrapperCol: { span: 8 }
  };

  const handleDistributedJob = (e) => {
    const type = e.target.value;
    setDistributedJob(type === 'PSDistJob');
  };

  const onDeviceTypeChange = (value) => {
    const deviceType = value;
    setCurrentDeviceType(deviceType);
  };
  const handleConfirmPresetParams = () => {
    const currentSelected = presetRunningParams.find(p => p.metaData.id == currentSelectedPresetParamsId);
    if (currentSelected) {
      setFieldsValue({
        ...currentSelected.params,
        codePath: subCodePathPrefix(currentSelected.params.codePath),
        startupFile: subCodePathPrefix(currentSelected.params.startupFile),
        outputPath: subCodePathPrefix(currentSelected.params.startupFile),
      });
      console.log('currentSelected.params.params', currentSelected.params)
      const params = Object.entries(currentSelected.params.params|| {}).map(item => {
        var obj = {};
        obj['key'] = item[0];
        obj['value'] = item[1];
        return obj;
      });
      setRunningParams(params)
      setFieldsValue({
        params: params
      })
      setPresetParamsVisible(false);
    }
  };

  const handleSelectPresetParams = (current) => {
    console.log(current);
    setCurrentSelectedPresetParamsId(current);
  };

  const handleClickDeviceNum = (e) => {
    if (!getFieldValue('deviceType')) {
      message.error('需要先选择设置类型');
    }
  };

  const handleDeviceChange = () => {
    const deviceTotal = (Number(getFieldValue('numPsWorker') || 0)) * (Number(getFieldValue('deviceNum') || 0));
    setFieldsValue({
      deviceTotal: deviceTotal || 0,
    });
    setDeviceTotal(deviceTotal);
  };

  return (
    <div className={styles.modelTraining}>
      <PageHeader
        className="site-page-header"
        onBack={() => history.push(goBackPath)}
        title={typeEdit ? '编辑训练参数' : '创建训练作业'}
      />
      <Form form={form}>
        <FormItem {...commonLayout} style={{ marginTop: '30px' }} name="name" label={typeEdit ? "参数配置名称" : "作业名称"} rules={[{ required: true }, { ...jobNameReg }]}>
          <Input style={{ width: 300 }} placeholder={typeEdit ? "请输入参数配置名称" : "请输入作业名称"} disabled={typeEdit} />
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
          <Radio.Button value={2} onClick={() => { setPresetParamsVisible(true); }}>导入训练参数</Radio.Button>
        </Radio.Group>
      </FormItem>}
      <Form form={form}>
        <FormItem {...commonLayout} name="engine" label="引擎" rules={[{ required: true }]}>
          <Select style={{ width: 300 }} disabled={typeCreate} >
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
          <Input addonBefore={codePathPrefix} style={{ width: 420 }} disabled={typeCreate} />
        </FormItem>
        <FormItem labelCol={{ span: 4 }} label="启动文件" name="startupFile" rules={[{ required: true }, { pattern: /\.py$/, message: '需要填写一个 python 文件' }]}>
          <Input addonBefore={codePathPrefix} style={{ width: 420 }} disabled={typeCreate} />
        </FormItem>
        <FormItem name="outputPath" labelCol={{ span: 4 }} label="输出路径" style={{ marginTop: '50px' }}>
          <Input addonBefore={codePathPrefix} style={{ width: 420 }} />
        </FormItem>
        <FormItem name="datasetPath" rules={[]} labelCol={{ span: 4 }} label="训练数据集">
          {/* <Input style={{ width: 300 }} /> */}
          <Select
            style={{ width: '300px' }}
          >
            {
              datasets.map(d => (
                <Option value={d.convertOutPath} key={d.dataSetId}>{d.name}</Option>
              ))
            }
          </Select>
        </FormItem>
        <FormItem label="运行参数" labelCol={{ span: 4 }} >
          {
            runningParams.map((param, index) => {
              return (
                <div key={param.createTime || param.key}>
                  <FormItem initialValue={runningParams[index].key} rules={[{ validator(...args) { validateRunningParams(index, 'key', ...args); } }]} name={['params', index, 'key']} wrapperCol={{ span: 24 }} style={{ display: 'inline-block' }}>
                    <Input style={{ width: 200 }} />
                  </FormItem>
                  <PauseOutlined rotate={90} style={{ marginTop: '8px', width: '30px' }} />
                  <FormItem initialValue={runningParams[index].value} rules={[{ validator(...args) { validateRunningParams(index, 'value', ...args); } }]} name={['params', index, 'value']} wrapperCol={{ span: 24 }} style={{ display: 'inline-block' }}>
                    <Input style={{ width: 200 }} />
                  </FormItem>
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
        </FormItem>
        <FormItem label="是否分布式训练" name="jobtrainingtype" {...commonLayout} rules={[{ required: true }]} initialValue="RegularJob" onChange={handleDistributedJob}>
          <Radio.Group style={{ width: '300px' }}>
            <Radio value={'PSDistJob'}>是</Radio>
            <Radio value={'RegularJob'}>否</Radio>
          </Radio.Group>
        </FormItem>
        {
          distributedJob && <FormItem
            label="节点数量"
            {...commonLayout}
            name="numPsWorker"
            rules={[
              { required: true },
              { type: 'number', message: '需要填写一个数字' },
              {
                validator(rule, value, callback) {
                  if (Number(value) > totalNodes) {
                    callback(`当前只有 ${totalNodes} 个节点`);
                    return;
                  }
                  if (Number(value) < 1) {
                    callback(`不能小于 1`);
                    return;
                  }
                  callback();
                }
              }
            ]}

            initialValue={1}
          >
            <InputNumber
              onChange={handleDeviceChange}
              min={1}
              max={totalNodes}
            />
          </FormItem>
        }
        <FormItem label="设备类型" name="deviceType" {...commonLayout} rules={[{ required: true }]}>
          <Select style={{ width: '300px' }} onChange={onDeviceTypeChange}>
            {
              deviceList.map(d => (
                <Option value={d.deviceType}>{d.deviceType}</Option>
              ))
            }
          </Select>
        </FormItem>
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
        width="80%"
      >
        <Form
          form={form}
        >
          {
            presetRunningParams.length > 0 ? <Tabs defaultActiveKey={presetRunningParams[0].metaData?.id} tabPosition="left" onChange={handleSelectPresetParams} style={{ height: 220 }}>
              {presetRunningParams.map((p, index) => (
                <TabPane tab={p.metaData.name} key={p.metaData.id}>
                  <Row>
                    <Col span={5}>
                      计算节点个数
                  </Col>
                    <Col span={19}>
                      {p.params.deviceNum}
                    </Col>
                  </Row>
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
                      {p.params.params && formatParams(p.params.params).map(val => (<div>{val}</div>))}
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
      <Button type="primary" style={{ float: 'right', marginBottom: '16px' }} onClick={handleSubmit}>{typeEdit ? '保存' : '立即创建'}</Button>
    </div>

  );
};


export default ModelTraining;