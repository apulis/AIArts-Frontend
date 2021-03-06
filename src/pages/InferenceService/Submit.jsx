import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Divider, Select, message, PageHeader, Alert } from 'antd';
import {
  PauseOutlined,
  PlusSquareOutlined,
  DeleteOutlined,
  FolderOpenOutlined,
} from '@ant-design/icons';
import { useForm } from 'antd/lib/form/Form';
import FormItem from 'antd/lib/form/FormItem';
import { generateKey } from '../ModelTraining/Submit';
import { fetchAvilableResource } from '@/services/modelTraning';
import {
  createInference,
  getAllSupportInference,
  getAllComputedDevice,
} from '@/services/inferenceService';
import { history, withRouter } from 'umi';
// import { beforeSubmitJob } from '@/models/resource';

import styles from './index.less';
import { jobNameReg, getNameFromDockerImage } from '@/utils/reg';
import SelectModelPath from '@/components/BizComponent/SelectModelPath';
import { useIntl } from 'umi';

const { TextArea } = Input;

const SubmitModelTraining = (props) => {
  const intl = useIntl();
  const query = props.location.query;

  const [runningParams, setRunningParams] = useState([
    { key: '', value: '', createTime: generateKey() },
  ]);
  const [deviceList, setDeviceList] = useState([]);
  const [currentDeviceType, setCurrentDeviceType] = useState('');
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [currentEngineName, setCurrentEngineName] = useState('');
  const [supportedInference, setSupportedInference] = useState({});
  const [currentVersion, setCurrentVersion] = useState('');
  const [selectModelPathModalVisible, setSelectModelPathVisible] = useState(false);
  const [currentModelUsedEngine, setCurrentModelUsedEngine] = useState('');

  const [form] = useForm();
  const { validateFields, getFieldValue, setFieldsValue } = form;

  //
  const engineNameList = Object.keys(supportedInference);

  const [engineVersionList, setEngineVersionList] = useState([]);

  const handleSubmit = async () => {
    const values = await validateFields();
    setButtonDisabled(true);
    const cancel = message.loading(intl.formatMessage({ id: 'centerInference.create.submit.ing' }));
    const submitData = {};
    submitData.framework = values.engineName;
    submitData.version = values.engineVersion;
    submitData.jobName = values.workName;
    submitData.model_base_path = values.modelPath;
    submitData.desc = values.desc;
    submitData.params = {};
    submitData.gpuType = values.deviceType;
    submitData.resourcegpu = values.resourcegpu;
    values.runningParams &&
      values.runningParams.forEach((p) => {
        if (!p.key) return;
        submitData.params[p.key] = p.value;
      });
    const res = await createInference(submitData);
    setButtonDisabled(false);
    if (res.code === 0) {
      cancel();
      message.success(intl.formatMessage({ id: 'centerInference.create.submit.success' }));
      history.push('/Inference/central');
    }
  };

  const getAvailableResource = async () => {
    const res = await getAllSupportInference();
    if (res.code === 0) {
      const supportedInference = res.data;
      setSupportedInference(supportedInference);
      const engineNameList = Object.keys(supportedInference);
      if (engineNameList.length) {
        // 初始化表单内容
        const firstEngineName = engineNameList[0];
        const engineVersionList = Object.keys(supportedInference[firstEngineName]);
        const firstEngineVersion = engineVersionList[0];
        setEngineVersionList(engineVersionList);
        setFieldsValue({
          engineName: firstEngineName,
          engineVersion: firstEngineVersion,
        });
        const deviceList = Object.keys(supportedInference[firstEngineName][firstEngineVersion]);
        setDeviceList(deviceList);
        setFieldsValue({
          deviceType: deviceList[0],
        });
      }
    }
  };

  useEffect(() => {
    if (currentEngineName) {
      console.log(
        'supportedInference[currentEngineName]',
        supportedInference[currentEngineName],
        supportedInference,
        currentEngineName,
      );
      const currentEngineVersionList = Object.keys(supportedInference[currentEngineName]);
      setEngineVersionList(currentEngineVersionList);
      setFieldsValue({
        engineVersion: currentEngineVersionList[0],
      });
      setCurrentVersion(currentEngineVersionList[0]);
    }
  }, [currentEngineName]);

  const fetchComputedDevice = async () => {
    const res = await getAllComputedDevice();
    if (res.code === 0) {
      const computedDeviceList = Object.keys(res.data);
      if (computedDeviceList.length > 0) {
        setFieldsValue({
          gpuType: computedDeviceList[0],
        });
      }
    }
  };
  const initModelPath = () => {
    const initialModelPath = decodeURIComponent(query.modelPath || '').split('?')[0];
    if (initialModelPath) {
      setFieldsValue({
        modelPath: initialModelPath,
      });
    }
  };
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
  };

  const validateRunningParams = async (index, propertyName, ...args) => {
    const [rule, value, callback] = [...args];
    const runningParams = await getFieldValue('runningParams');
    runningParams.forEach((r, i) => {
      if (r[propertyName] === value && index !== i) {
        callback(intl.formatMessage({ id: 'centerInference.create.tips.repetParams' }));
      }
    });
    callback();
  };

  const removeRuningParams = async (key) => {
    const values = await getFieldValue('runningParams');
    [...runningParams].forEach((param, index) => {
      param.key = values[index].key;
      param.value = values[index].value;
    });
    const newRunningParams = [...runningParams].filter((param) => param.createTime !== key);
    setRunningParams(newRunningParams);
    setFieldsValue({
      runningParams: newRunningParams.map((params) => ({ key: params.key, value: params.value })),
    });
  };

  const commonLayout = {
    labelCol: { span: 4 },
    wrapperCol: { span: 8 },
  };

  const handleEngineChange = (type, val) => {
    if (type === 'name') {
      setCurrentEngineName(val);
    } else if (type === 'version') {
      setCurrentVersion(val);
    }
  };

  const handleSelectModelPath = (row) => {
    setSelectModelPathVisible(false);
    if (!row) return;
    setFieldsValue({
      modelPath: row.outputPath,
    });
    setCurrentModelUsedEngine(
      `${intl.formatMessage({
        id: 'centerInference.create.curTrainingEngine',
      })}${getNameFromDockerImage(row.engine)}`,
    );
  };

  useEffect(() => {
    if (currentEngineName && currentVersion) {
      const deviceList = Object.keys(supportedInference[currentEngineName][currentVersion]);
      setDeviceList(deviceList);
      setFieldsValue({
        deviceType: deviceList[0],
      });
    }
  }, [currentEngineName, currentVersion]);

  return (
    <PageHeader
      ghost={false}
      onBack={() => history.push('/Inference/central')}
      title={intl.formatMessage({ id: 'centerInference.create.job' })}
    >
      <div className={styles.modelTraining}>
        <Form form={form}>
          <FormItem
            {...commonLayout}
            name="workName"
            label={intl.formatMessage({ id: 'inferenceJobCreate.label.workName' })}
            rules={[{ required: true }, { ...jobNameReg }]}
          >
            <Input
              placeholder={intl.formatMessage({
                id: 'inferenceJobCreate.placeholder.inputJobName',
              })}
            />
          </FormItem>
          <FormItem
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 14 }}
            name="desc"
            label={intl.formatMessage({ id: 'inferenceJobCreate.label.desc' })}
            rules={[{ max: 191 }]}
          >
            <TextArea
              placeholder={intl.formatMessage({
                id: 'inferenceJobCreate.placeholder.inputDescription',
              })}
            />
          </FormItem>
        </Form>
        <Divider style={{ borderColor: '#cdcdcd' }} />
        <h2 style={{ marginLeft: '38px', marginBottom: '20px' }}>
          {intl.formatMessage({ id: 'centerInference.create.paramsConfig' })}
        </h2>
        <Form form={form}>
          <FormItem
            labelCol={commonLayout.labelCol}
            label={intl.formatMessage({ id: 'inferenceJobCreate.label.modelPath' })}
            required
          >
            <FormItem
              name="modelPath"
              rules={[
                {
                  required: true,
                  message: intl.formatMessage({ id: 'inferenceJobCreate.rule.needModelPath' }),
                },
              ]}
              style={{ display: 'inline-block', width: '250px' }}
            >
              <Input
                placeholder={intl.formatMessage({
                  id: 'inferenceJobCreate.placeholder.inputModelPath',
                })}
                style={{ width: '230px' }}
              />
            </FormItem>
            <FormItem style={{ display: 'inline-block', width: '36px' }}>
              <Button
                icon={<FolderOpenOutlined />}
                onClick={() => setSelectModelPathVisible(true)}
              ></Button>
            </FormItem>
            {currentModelUsedEngine && (
              <FormItem style={{ width: '290px' }}>
                <Alert message={currentModelUsedEngine} type="success" />
              </FormItem>
            )}
          </FormItem>
          <FormItem
            {...commonLayout}
            label={intl.formatMessage({ id: 'inferenceJobCreate.label.engineName' })}
            required
          >
            <FormItem
              name="engineName"
              style={{ display: 'inline-block', width: 'calc(50% - 8px)' }}
            >
              <Select
                placeholder={intl.formatMessage({
                  id: 'inferenceJobCreate.placeholder.engineName',
                })}
                onChange={(name) => handleEngineChange('name', name)}
              >
                {engineNameList.map((val) => (
                  <Option value={val}>{getNameFromDockerImage(val)}</Option>
                ))}
              </Select>
            </FormItem>
            <FormItem
              name="engineVersion"
              style={{ display: 'inline-block', width: 'cal(50% - 8px)', marginLeft: '10px' }}
            >
              <Select
                placeholder={intl.formatMessage({
                  id: 'inferenceJobCreate.placeholder.engineVersion',
                })}
                onChange={(version) => handleEngineChange('version', version)}
              >
                {engineVersionList.map((val) => (
                  <Option value={val}>{val}</Option>
                ))}
              </Select>
            </FormItem>
          </FormItem>
          <FormItem
            label={intl.formatMessage({ id: 'inferenceJobCreate.label.runningParams' })}
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
                    name={['runningParams', index, 'key']}
                    wrapperCol={{ span: 24 }}
                    style={{ display: 'inline-block' }}
                  >
                    <Input style={{ width: '180px' }} />
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
                    name={['runningParams', index, 'value']}
                    wrapperCol={{ span: 24 }}
                    style={{ display: 'inline-block' }}
                  >
                    <Input style={{ width: '180px' }} />
                  </FormItem>
                  {runningParams.length > 1 && (
                    <DeleteOutlined
                      style={{ marginLeft: '10px', cursor: 'pointer' }}
                      onClick={() => removeRuningParams(param.createTime)}
                    />
                  )}
                </div>
              );
            })}
            <div className={styles.addParams} onClick={addParams}>
              <PlusSquareOutlined
                fill="#1890ff"
                style={{ color: '#1890ff', marginRight: '10px' }}
              />
              <a>{intl.formatMessage({ id: 'centerInference.create.addParams' })}</a>
            </div>
          </FormItem>
          <FormItem
            label={intl.formatMessage({ id: 'inferenceJobCreate.label.deviceType' })}
            name="deviceType"
            {...commonLayout}
            rules={[{ required: false }]}
          >
            <Select
              placeholder={intl.formatMessage({ id: 'inferenceJobCreate.placeholder.select' })}
              style={{ width: '260px' }}
              onChange={() => setCurrentDeviceType(getFieldValue('deviceType'))}
            >
              {deviceList.map((d) => (
                <Option value={d}>{d}</Option>
              ))}
            </Select>
          </FormItem>
          <FormItem
            label={intl.formatMessage({ id: 'inferenceJobCreate.label.resourcegpu' })}
            name="resourcegpu"
            {...commonLayout}
            initialValue={0}
          >
            <Select
              placeholder={intl.formatMessage({ id: 'inferenceJobCreate.placeholder.select' })}
              style={{ width: '260px' }}
            >
              {[0, 1].map((val) => (
                <Option value={val}>{val}</Option>
              ))}
            </Select>
          </FormItem>
        </Form>
        <Button
          disabled={buttonDisabled}
          type="primary"
          style={{ float: 'right' }}
          onClick={handleSubmit}
        >
          {intl.formatMessage({ id: 'inferenceJobCreate.submit' })}
        </Button>
      </div>
      {selectModelPathModalVisible && (
        <SelectModelPath
          visible={selectModelPathModalVisible}
          onOk={handleSelectModelPath}
          onCancel={() => setSelectModelPathVisible(false)}
        />
      )}
    </PageHeader>
  );
};

export default withRouter(SubmitModelTraining);
