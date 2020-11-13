import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Button,
  Divider,
  Select,
  Radio,
  message,
  PageHeader,
  Modal,
  Tabs,
  Col,
  Row,
} from 'antd';
import { history } from 'umi';
import { PauseOutlined, PlusSquareOutlined, DeleteOutlined } from '@ant-design/icons';
import { useForm } from 'antd/lib/form/Form';
import FormItem from 'antd/lib/form/FormItem';
import {
  fetchAvilableResource,
  fetchTemplateById,
  fetchPresetTemplates,
  updateParams,
} from '@/services/modelTraning';

import styles from './index.less';
import { getLabeledDatasets } from '@/services/datasets';
import { jobNameReg, getNameFromDockerImage, startUpFileReg } from '@/utils/reg';
import { getDeviceNumArrByNodeType, formatParams } from '@/utils/utils';
import { useIntl } from 'umi';
import { getAvailRegularDeviceNumber } from '@/utils/device-utils';

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

let haveSetedParamsDetail = false;

const EditMetrics = (props) => {
  const intl = useIntl();
  // 请求类型，根据参数创建作业，type为createJobWithParam；编辑参数type为editParam
  const paramsId = props.match.params.id;
  const goBackPath = '/ModelManagement/EvaluationMetricsManage/';

  const [runningParams, setRunningParams] = useState([
    { key: '', value: '', createTime: generateKey() },
  ]);
  const [form] = useForm();
  const [frameWorks, setFrameWorks] = useState([]);
  const [codeDirModalVisible, setCodeDirModalVisible] = useState(false);
  const [bootFileModalVisible, setBootFileModalVisible] = useState(false);
  const [outputPathModalVisible, setOutputPathModalVisible] = useState(false);
  const [trainingDataSetModalVisible, setTrainingDataSetModalVisible] = useState(false);
  const [deviceList, setDeviceList] = useState([]);
  const [availableDeviceNumList, setAvailableDeviceNumList] = useState([]);
  const [datasets, setDatasets] = useState([]);
  const [presetParamsVisible, setPresetParamsVisible] = useState(false);
  const [presetRunningParams, setPresetRunningParams] = useState([]);
  const { validateFields, getFieldValue, setFieldsValue } = form;
  const [currentSelectedPresetParamsId, setCurrentSelectedPresetParamsId] = useState('');
  const [nodeInfo, setNofeInfo] = useState([]);
  const [currentDeviceType, setCurrentDeviceType] = useState('');
  const [paramsDetailedData, setParamsDetailedData] = useState({});

  const getAvailableResource = async () => {
    const res = await fetchAvilableResource();
    if (res.code === 0) {
      let {
        data: { aiFrameworks, deviceList, codePathPrefix, nodeInfo },
      } = res;
      // if (!/\/$/.test(codePathPrefix)) {
      //   codePathPrefix = codePathPrefix + '/';
      // }
      // setCodePathPrefix(codePathPrefix);
      let aiFrameworkList = [];
      Object.keys(aiFrameworks).forEach((val) => {
        aiFrameworkList = aiFrameworkList.concat(aiFrameworks[val]);
      });
      setFrameWorks(aiFrameworkList);
      setDeviceList(deviceList);
      setNofeInfo(nodeInfo);
    }
  };

  useEffect(() => {
    if (!currentDeviceType) return;
    const list =  getAvailRegularDeviceNumber(currentDeviceType, deviceList.find(val => val.deviceType === currentDeviceType)?.userQuota);
    setAvailableDeviceNumList(list);
  }, [deviceList, currentDeviceType]);

  useEffect(() => {
    if (Object.keys(paramsDetailedData).length > 0 && !haveSetedParamsDetail) {
      haveSetedParamsDetail = true;
      const newParams = {
        ...paramsDetailedData.params,
        outputPath: paramsDetailedData.params.outputPath,
        codePath: paramsDetailedData.params.codePath,
        startupFile: paramsDetailedData.params.startupFile,
      };
      setParamsDetailedData({
        ...paramsDetailedData,
        params: newParams,
      });
      setFieldsValue(newParams);
    }
  }, [paramsDetailedData]);

  const fetchDataSets = async () => {
    const res = await getLabeledDatasets({ pageNum: 1, pageSize: 9999 });
    if (res.code === 0) {
      let datasets = res.data.datasets;
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
      data.params.codePath = data.params.codePath;
      data.params.startupFile = data.params.startupFile;
      data.params.outputPath = data.params.outputPath;
      if (data.params.params?.paramPath) {
        data.params.paramPath = data.params.params.paramPath;
        delete data.params.params.paramPath;
      }
      data.params.params = Object.entries(data.params.params).map((item) => {
        var obj = {};
        obj['key'] = item[0];
        obj['value'] = item[1];
        return obj;
      });
      form.setFieldsValue(data.params);
      setRunningParams(data.params.params);
    }
  };

  useEffect(() => {
    getAvailableResource();
    fetchDataSets();
    fetchParams();
  }, []);

  useEffect(() => {
    if (presetParamsVisible) {
      fetchPresetTemplates().then((res) => {
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

  const handleSubmit = async () => {
    const values = await validateFields();
    let params = {};
    params.paramPath = values.paramPath;
    delete values.paramPath;
    values.params &&
      values.params.forEach((p) => {
        if (!params[p.key]) return;
        params[p.key] = p.value;
      });
    // values.codePath = codePathPrefix + (values.codePath || '');
    // values.startupFile = codePathPrefix + values.startupFile;
    // values.outputPath = codePathPrefix + (values.outputPath || '');
    values.params = params;

    let editParams = {
      ...paramsDetailedData.metaData,
      templateData: values,
    };
    const res = await updateParams(editParams);
    if (res.code === 0) {
      message.success(intl.formatMessage({ id: 'editMetrics.save.success' }));
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
        callback(intl.formatMessage({ id: 'editMetrics.inputLimitEqualParamName' }));
      }
    });
    callback();
  };
  const removeRuningParams = async (key) => {
    const values = await getFieldValue('params');
    if (values.length === 1) {
      setFieldsValue({
        params: [{ key: '', value: '' }],
      });
    } else {
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
        params: newRunningParams.map((params) => ({ key: params.key, value: params.value })),
      });
    }
  };

  const commonLayout = {
    labelCol: { span: 4 },
    wrapperCol: { span: 8 },
  };

  const onDeviceTypeChange = (value) => {
    const deviceType = value;
    setCurrentDeviceType(deviceType);
  };

  const handleConfirmPresetParams = () => {
    const currentSelected = presetRunningParams.find(
      (p) => p.metaData.id == currentSelectedPresetParamsId,
    );
    if (currentSelected) {
      setFieldsValue({
        ...currentSelected.params,
      });
      console.log('currentSelected.params.params', currentSelected.params.params);
      const params = Object.entries(currentSelected.params.params || {}).map((item) => {
        var obj = {};
        console.log('item', item);
        obj['key'] = item[0];
        obj['value'] = item[1];
        return obj;
      });
      setRunningParams(params);
      setFieldsValue({
        params: params,
      });
    }
    setPresetParamsVisible(false);
  };

  const handleSelectPresetParams = (current) => {
    console.log(current);
    setCurrentSelectedPresetParamsId(current);
  };

  const handleClickDeviceNum = (e) => {
    if (!getFieldValue('deviceType')) {
      message.error(intl.formatMessage({ id: 'editMetrics.needSelectSettingType' }));
    }
  };

  return (
    <div className={styles.modelTraining}>
      <PageHeader
        className="site-page-header"
        onBack={() => history.push(goBackPath)}
        title={intl.formatMessage({ id: 'editMetrics.editEvaluationParam' })}
      />
      <Form form={form}>
        <FormItem
          {...commonLayout}
          style={{ marginTop: '30px' }}
          name="name"
          label={intl.formatMessage({ id: 'editMetrics.label.evaluationParamName' })}
          rules={[{ required: true }, { ...jobNameReg }]}
        >
          <Input
            style={{ width: 300 }}
            placeholder={intl.formatMessage({
              id: 'editMetrics.placeholder.needEvaluationParamName',
            })}
          />
        </FormItem>
        <FormItem
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 14 }}
          name="desc"
          label={intl.formatMessage({ id: 'editMetrics.label.description' })}
          rules={[{ max: 191 }]}
        >
          <TextArea
            placeholder={intl.formatMessage({ id: 'editMetrics.placeholder.needDescription' })}
          />
        </FormItem>
      </Form>
      <Divider style={{ borderColor: '#cdcdcd' }} />
      <div
        className="ant-page-header-heading-title"
        style={{ marginLeft: '38px', marginBottom: '20px' }}
      >
        {intl.formatMessage({ id: 'editMetrics.paramConfig' })}
      </div>
      {/* <FormItem {...commonLayout} label="参数来源">
        <Radio.Group defaultValue={1} buttonStyle="solid">
          <Radio.Button value={1}>手动参数配置</Radio.Button>
          <Radio.Button value={2} onClick={() => { setPresetParamsVisible(true); }}>导入训练参数</Radio.Button>
        </Radio.Group>
      </FormItem> */}
      <Form form={form}>
        <FormItem
          {...commonLayout}
          name="engine"
          label={intl.formatMessage({ id: 'editMetrics.label.engine' })}
          rules={[{ required: true }]}
        >
          <Select style={{ width: 300 }}>
            {frameWorks.map((f) => (
              <Option value={f} key={f}>
                {getNameFromDockerImage(f)}
              </Option>
            ))}
          </Select>
        </FormItem>
        <FormItem
          labelCol={{ span: 4 }}
          name="codePath"
          label={intl.formatMessage({ id: 'editMetrics.codePath' })}
        >
          <Input style={{ width: 420 }} />
        </FormItem>
        <FormItem
          labelCol={{ span: 4 }}
          label={intl.formatMessage({ id: 'editMetrics.label.startupFile' })}
          name="startupFile"
          rules={[{ required: true }, startUpFileReg]}
        >
          <Input style={{ width: 420 }} />
        </FormItem>
        <FormItem
          name="outputPath"
          labelCol={{ span: 4 }}
          label={intl.formatMessage({ id: 'editMetrics.label.outputPath' })}
        >
          <Input disabled style={{ width: 420 }} />
        </FormItem>
        <FormItem
          name="paramPath"
          labelCol={{ span: 4 }}
          label={intl.formatMessage({ id: 'editMetrics.label.modelParamPath' })}
        >
          <Input style={{ width: 420 }} />
        </FormItem>
        <FormItem
          name="datasetPath"
          rules={[]}
          labelCol={{ span: 4 }}
          label={intl.formatMessage({ id: 'editMetrics.label.trainingDataSet' })}
        >
          <Select style={{ width: '300px' }}>
            {datasets.map((d) => (
              <Option value={d.path} key={d.id}>
                {d.name}
              </Option>
            ))}
          </Select>
        </FormItem>
        <FormItem
          label={intl.formatMessage({ id: 'editMetrics.label.runningParam' })}
          labelCol={{ span: 4 }}
        >
          {runningParams.map((param, index) => {
            return (
              <div>
                <FormItem
                  initialValue={runningParams[index].key}
                  rules={[
                    {
                      validator(...args) {
                        validateRunningParams(index, 'key', ...args);
                      },
                    },
                  ]}
                  name={['params', index, 'key']}
                  wrapperCol={{ span: 24 }}
                  style={{ display: 'inline-block' }}
                >
                  <Input style={{ width: 200 }} />
                </FormItem>
                <PauseOutlined rotate={90} style={{ marginTop: '8px', width: '30px' }} />
                <FormItem
                  initialValue={runningParams[index].value}
                  rules={[
                    {
                      validator(...args) {
                        validateRunningParams(index, 'value', ...args);
                      },
                    },
                  ]}
                  name={['params', index, 'value']}
                  wrapperCol={{ span: 24 }}
                  style={{ display: 'inline-block' }}
                >
                  <Input style={{ width: 200 }} />
                </FormItem>
                <DeleteOutlined
                  style={{ marginLeft: '10px', cursor: 'pointer' }}
                  onClick={() => removeRuningParams(param.createTime || param.key)}
                />
              </div>
            );
          })}
          <div className={styles.addParams} onClick={addParams}>
            <PlusSquareOutlined fill="#1890ff" style={{ color: '#1890ff', marginRight: '10px' }} />
            <a>{intl.formatMessage({ id: 'editMetrics.clickAddParam' })}</a>
          </div>
        </FormItem>
        <FormItem
          label={intl.formatMessage({ id: 'editMetrics.label.deviceType' })}
          name="deviceType"
          {...commonLayout}
          rules={[{ required: true }]}
        >
          <Select style={{ width: '300px' }} onChange={onDeviceTypeChange}>
            {deviceList.map((d) => (
              <Option value={d.deviceType}>{d.deviceType}</Option>
            ))}
          </Select>
        </FormItem>
        <FormItem
          label={intl.formatMessage({ id: 'editMetrics.label.deviceNum' })}
          name="deviceNum"
          {...commonLayout}
          rules={[{ required: true }]}
        >
          <Select style={{ width: '300px' }} onClick={handleClickDeviceNum}>
            {availableDeviceNumList.map((avail) => (
              <Option value={avail}>{avail}</Option>
            ))}
          </Select>
        </FormItem>
      </Form>
      <Modal
        visible={bootFileModalVisible}
        forceRender
        onCancel={() => setBootFileModalVisible(false)}
      ></Modal>
      <Modal
        visible={codeDirModalVisible}
        forceRender
        onCancel={() => setCodeDirModalVisible(false)}
      ></Modal>
      <Modal
        visible={outputPathModalVisible}
        forceRender
        onCancel={() => setOutputPathModalVisible(false)}
      ></Modal>
      <Modal
        visible={trainingDataSetModalVisible}
        forceRender
        onCancel={() => setTrainingDataSetModalVisible(false)}
      ></Modal>
      <Modal
        visible={presetParamsVisible}
        onCancel={() => setPresetParamsVisible(false)}
        onOk={handleConfirmPresetParams}
        title={intl.formatMessage({ id: 'editMetrics.importTrainingParamConfig' })}
        forceRender
        width="80%"
      >
        <Form form={form}>
          {presetRunningParams.length > 0 ? (
            <Tabs
              defaultActiveKey={presetRunningParams[0].metaData?.id}
              tabPosition="left"
              onChange={handleSelectPresetParams}
              style={{ height: 220 }}
            >
              {presetRunningParams.map((p, index) => (
                <TabPane tab={p.metaData.name} key={p.metaData.id}>
                  <Row>
                    <Col span={5}>{intl.formatMessage({ id: 'editMetrics.computeNodeCount' })}</Col>
                    <Col span={19}>{p.params.deviceNum}</Col>
                  </Row>
                  <Row>
                    <Col span={5}>{intl.formatMessage({ id: 'editMetrics.startupFile' })}</Col>
                    <Col span={19}>{p.params.startupFile}</Col>
                  </Row>
                  <Row>
                    <Col span={5}>{intl.formatMessage({ id: 'editMetrics.codePath' })}</Col>
                    <Col span={19}>{p.params.codePath}</Col>
                  </Row>
                  <Row>
                    <Col span={5}>{intl.formatMessage({ id: 'editMetrics.trainingDataSet' })}</Col>
                    <Col span={19}>{p.params.datasetPath}</Col>
                  </Row>
                  <Row>
                    <Col span={5}>{intl.formatMessage({ id: 'editMetrics.outputPath' })}</Col>
                    <Col span={19}>{p.params.outputPath}</Col>
                  </Row>
                  <Row>
                    <Col span={5}>{intl.formatMessage({ id: 'editMetrics.runningParam' })}</Col>
                    <Col span={19}>{p.params.params && formatParams(p.params.params)}</Col>
                  </Row>
                  <Row>
                    <Col span={5}>
                      {intl.formatMessage({ id: 'editMetrics.computeNodeSpecifications' })}
                    </Col>
                    <Col span={19}>{p.params.deviceType}</Col>
                  </Row>
                  <Row>
                    <Col span={5}>{intl.formatMessage({ id: 'editMetrics.engineType' })}</Col>
                    <Col span={19}>{getNameFromDockerImage(p.params.engine)}</Col>
                  </Row>
                </TabPane>
              ))}
            </Tabs>
          ) : (
            <div>{intl.formatMessage({ id: 'editMetrics.noData' })}</div>
          )}
        </Form>
      </Modal>
      <Button
        type="primary"
        style={{ float: 'right', marginBottom: '16px' }}
        onClick={handleSubmit}
      >
        {intl.formatMessage({ id: 'editMetrics.save' })}
      </Button>
    </div>
  );
};

export default EditMetrics;
