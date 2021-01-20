import { history } from 'umi';
import {
  message,
  Modal,
  Form,
  Input,
  Button,
  Card,
  PageHeader,
  Radio,
  Select,
  Tabs,
  Divider,
  Col,
  Row,
  Switch,
  Tooltip,
} from 'antd';
import React, { useState, useEffect, useRef } from 'react';
import { PlusSquareOutlined, PauseOutlined, DeleteOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { getModel } from '../ModelList/services';
import { addEvaluation, fetchPresetTemplates, getAllLabeledDatasets } from './services';
import { fetchAvilableResource } from '@/services/modelTraning';
import { getDeviceNumArrByNodeType, formatParams, formatParamsToFormValues } from '@/utils/utils';
import { generateKey } from '@/pages/ModelTraining/Submit';
import { jobNameReg, getNameFromDockerImage } from '@/utils/reg';

import styles from '@/pages/ModelTraining/index.less';
import curStyles from './index.less';
import { connect } from 'dva';
import { beforeSubmitJob } from '@/models/resource';
import { useIntl } from 'umi';
import { getAvailRegularDeviceNumber } from '@/utils/device-utils';
import PrivilegedLabel from '@/components/PrivilegeLabel';

const { Option } = Select;
const { TabPane } = Tabs;

const ModelEvaluation = (props) => {
  const intl = useIntl();
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
  const [isPublic, setIsPublic] = useState(false);
  const [iSPrivileged, setISPrivileged] = useState(false);
  const [frameworkMap, setFrameworkMap] = useState({});

  const [form] = Form.useForm();
  const { validateFields, getFieldValue, setFieldsValue } = form;

  const [form2] = Form.useForm();

  const { currentSelectedVC } = props.vc;
  const { presetImages, deviceForImages } = props.common;

  useEffect(() => {
    getAvailableResource();
    getTestDatasets();
    // getCurrentModel(modelId);
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

  useEffect(() => {
    getCurrentModel(modelId);
  }, [codePathPrefix]);

  const getAvailableResource = async () => {
    const res = await fetchAvilableResource(currentSelectedVC);
    if (res.code === 0) {
      let {
        data: { codePathPrefix, aiFrameworks, deviceList, nodeInfo },
      } = res;
      if (!/\/$/.test(codePathPrefix)) {
        codePathPrefix = codePathPrefix + '/';
      }
      setCodePathPrefix(codePathPrefix);
      setFrameworkMap(aiFrameworks);
      // 获取引擎
      let engineList = [];
      Object.keys(aiFrameworks).forEach((val) => {
        engineList = engineList.concat(aiFrameworks[val]);
      });
      setEngines(engineList);

      setDeviceList(deviceList);
      setNofeInfo(nodeInfo);

      // 设备类型
      let deviceTypes = deviceList.map((d) => d.deviceType);
      if (deviceTypes.length > 0) {
        setDeviceTypes(deviceTypes);
      }
    }
  };

  useEffect(() => {
    if (!currentDeviceType) return;
    const nums = getAvailRegularDeviceNumber(currentDeviceType, deviceList.find(val => val.deviceType === currentDeviceType)?.userQuota);
    console.log('nums', nums)
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
  };

  const getCurrentModel = async (modelId) => {
    const { code, data, msg } = await getModel(modelId);
    if (code === 0) {
      const { model, training } = data;

      let paramPathSuffix = model.paramPath?.substr(codePathPrefix.length) || '';
      let codePathSuffix = model.codePath?.substr(codePathPrefix.length) || '';
      let outputPathSuffix = model.outputPath?.substr(codePathPrefix.length) || '';
      let startupFileSuffix = model.startupFile?.substr(codePathPrefix.length) || '';

      const dataPreffix = model.codePath ? model.codePath.startsWith('/data') : false;
      setIsPublic(dataPreffix);
      let params = [];
      if (/^Avisualis/.test(model.use)) {
        setRunningParams(formatParamsToFormValues(model.params));
        params = formatParamsToFormValues(model.params);
      }
      form.setFieldsValue({
        name: model.name,
        argumentsFile: paramPathSuffix,
        codePath: dataPreffix ? model.codePath : codePathSuffix,
        outputPath: outputPathSuffix,
        startupFile: dataPreffix ? model.startupFile.replace('train', 'eval') : startupFileSuffix,
        engine: model.engine,
        params: params,
      });
    } else {
      message.error(msg);
    }
  };
  useEffect(() => {
    props.dispatch({
      type: 'resource/fetchResource',
    });
  }, []);
  const onFinish = async (values) => {
    let params = {};
    values.params &&
      values.params.forEach((p) => {
        //处理params存在空记录的问题
        if (p.key && p.value) {
          params[p.key] = p.value;
        }
      });

    const {
      name,
      engine,
      codePath,
      startupFile,
      outputPath,
      datasetPath,
      deviceType,
      deviceNum,
      argumentsFile,
      isPrivileged,
      bypassCode
    } = values;
    const evalParams = {
      id: modelId,
      name,
      engine,
      codePath: isPublic ? codePath : codePathPrefix + codePath,
      startupFile: isPublic ? startupFile : codePathPrefix + startupFile,
      outputPath: codePathPrefix + outputPath,
      datasetPath,
      params,
      datasetName,
      deviceType,
      deviceNum,
      paramPath: codePathPrefix + argumentsFile,
      isPrivileged,
      bypassCode,
    };
    Object.keys(frameworkMap).forEach(key => {
      if (Array.isArray(frameworkMap[key])) {
        frameworkMap[key].forEach(e => {
          if (e === values.engine) {
            evalParams.frameworkType = key;
          }
        })
      }
    })
    const submitJobInner = async () => {
      const { code, msg } = await addEvaluation({ ...evalParams, vcName: currentSelectedVC });
      if (code === 0) {
        message.success(`${intl.formatMessage({ id: 'modelEvaluation.create.success' })}`);
        history.push('/ModelManagement/ModelEvaluation/List');
      } else {
        msg &&
          message.error(`${intl.formatMessage({ id: 'modelEvaluation.create.error' })}:${msg}`);
      }
    };
    const currentVCAvailDevice = deviceList.find(val => val.deviceType === deviceType);
    let needConfirm = false;
    if (currentVCAvailDevice) {
      const currentAvail = currentVCAvailDevice.avail;
      if (deviceNum > currentAvail) {
        needConfirm = true;
      }
    }
    if (!beforeSubmitJob(false, deviceType, deviceNum) || needConfirm) {
      Modal.confirm({
        title: intl.formatMessage({ id: 'modelEvaluation.tips.noDeviceToWait' }),
        content: intl.formatMessage({ id: 'modelEvaluation.isContinue' }),
        onOk() {
          submitJobInner();
        },
        onCancel() {},
      });
    } else {
      submitJobInner();
    }
  };

  const handleDatasetChange = (value, option) => {
    setDatasetName(option.children);
  };

  const onDeviceTypeChange = (value) => {
    const deviceType = value;
    setCurrentDeviceType(deviceType);
    if (!(deviceForImages[deviceType] || []).includes(getFieldValue('engine'))) {
      setFieldsValue({
        engine: getNameFromDockerImage(deviceForImages[deviceType][0]) || undefined,
      });
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
        callback(intl.formatMessage({ id: 'modelEvaluation.notInputEqualParam' }));
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

  const onEngineChange = (engine) => {
    Object.keys(deviceForImages).forEach(device => {
      if (deviceForImages[device].includes(engine)) {
        setFieldsValue({
          deviceType: device || undefined,
        })
      }
    })
  }

  const handleConfirmPresetParams = () => {
    const currentSelected = presetRunningParams.find(
      (p) => p.metaData.id == currentSelectedPresetParamsId,
    );

    if (currentSelected) {
      // 防止name被覆盖
      if (currentSelected.params.name) {
        delete currentSelected.params.name;
      }

      const suffixParams = {
        codePath: currentSelected.params.codePath?.substr(codePathPrefix.length) || '',
        outputPath: currentSelected.params.outputPath?.substr(codePathPrefix.length) || '',
        startupFile: currentSelected.params.startupFile?.substr(codePathPrefix.length) || '',
        paramPath: currentSelected.params.argumentsFile?.substr(codePathPrefix.length) || '',
      };
      const deviceNum = currentSelected.params.deviceNum;

      setFieldsValue({ ...currentSelected.params, ...suffixParams, deviceNum: deviceNums.includes(deviceNums) ? deviceNum : 0 });
      // console.log('currentSelected.params.params', currentSelected.params.params)
      const params = Object.entries(currentSelected.params.params || {}).map((item) => {
        var obj = {};
        // console.log('item', item);
        obj['key'] = item[0];
        obj['value'] = item[1];
        return obj;
      });
      setRunningParams(params);
      setFieldsValue({
        params: params,
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
      message.error(intl.formatMessage({ id: 'modelEvaluation.needSelectDeviceType' }));
    }
  };

  const layout = {
    labelCol: { span: 3 },
    wrapperCol: { span: 12 },
  };

  const disablePrivileged = !props.common.enablePrivileged;
  const noPrivilegedJobPermission = !(props.currentUser.permissionList.includes('SUBMIT_PRIVILEGE_JOB'));
  const currentAvailPresetImage = presetImages.normal;
  return (
    <>
      <PageHeader
        ghost={false}
        onBack={() => history.push('/ModelManagement/MyModels')}
        title={intl.formatMessage({ id: 'modelEvaluation.evaluateModel' })}
      >
        <div
          style={{
            padding: '24px',
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
              label={intl.formatMessage({ id: 'modelEvaluation.modelName' })}
              rules={[
                { required: true, message: intl.formatMessage({ id: 'modelEvaluation.needName' }) },
                { ...jobNameReg },
              ]}
            >
              <Input
                placeholder={intl.formatMessage({ id: 'modelEvaluation.needInputModelName' })}
                disabled
              />
            </Form.Item>
            <Divider style={{ borderColor: '#cdcdcd' }} />
            {!isPublic ? (
              <Form.Item
                {...layout}
                label={intl.formatMessage({ id: 'modelEvaluation.paramSource' })}
              >
                <Radio.Group defaultValue={1} buttonStyle="solid">
                  <Radio.Button value={1}>
                    {intl.formatMessage({ id: 'modelEvaluation.manualParameterConfiguration' })}
                  </Radio.Button>
                  <Radio.Button
                    value={2}
                    onClick={() => {
                      setPresetParamsVisible(true);
                    }}
                  >
                    {intl.formatMessage({ id: 'modelEvaluation.importEvaluateParam' })}
                  </Radio.Button>
                </Radio.Group>
              </Form.Item>
            ) : null}
            <Form.Item
              {...layout}
              label={intl.formatMessage({ id: 'modelEvaluation.engine' })}
              name="engine"
              rules={[
                {
                  required: true,
                  message: intl.formatMessage({ id: 'modelEvaluation.needSelectEngine' }),
                },
              ]}
            >
              <Select onChange={onEngineChange}>
                {currentAvailPresetImage &&
                  currentAvailPresetImage.map((f) => (
                    <Option value={f} key={f}>
                      {getNameFromDockerImage(f)}
                    </Option>
                  ))}
              </Select>
            </Form.Item>
            {isPublic ? (
              <Form.Item
                {...layout}
                label={intl.formatMessage({ id: 'modelEvaluation.codePath' })}
                name="codePath"
                rules={[
                  {
                    required: true,
                    message: intl.formatMessage({ id: 'modelEvaluation.needInputCodePath' }),
                  },
                ]}
              >
                <Input disabled />
              </Form.Item>
            ) : (
              <Form.Item
                {...layout}
                label={intl.formatMessage({ id: 'modelEvaluation.codePath' })}
                name="codePath"
                rules={[
                  {
                    required: true,
                    message: intl.formatMessage({ id: 'modelEvaluation.needInputCodePath' }),
                  },
                ]}
              >
                <Input addonBefore={codePathPrefix} />
              </Form.Item>
            )}
            {isPublic ? (
              <Form.Item
                {...layout}
                label={intl.formatMessage({ id: 'modelEvaluation.startupFile' })}
                name="startupFile"
                rules={[
                  {
                    required: true,
                    message: intl.formatMessage({ id: 'modelEvaluation.needInputStartupFile' }),
                  },
                ]}
              >
                <Input disabled />
              </Form.Item>
            ) : (
              <Form.Item
                {...layout}
                label={intl.formatMessage({ id: 'modelEvaluation.startupFile' })}
                name="startupFile"
                rules={[
                  {
                    required: true,
                    message: intl.formatMessage({ id: 'modelEvaluation.needInputStartupFile' }),
                  },
                ]}
              >
                <Input addonBefore={codePathPrefix} />
              </Form.Item>
            )}
            <Form.Item
              {...layout}
              label={intl.formatMessage({ id: 'modelEvaluation.outputPath' })}
              name="outputPath"
              // rules={[{ required: true, message: '需要填写输出路径' }]}
            >
              <Input disabled addonBefore={codePathPrefix} />
            </Form.Item>
            <Form.Item
              {...layout}
              label={intl.formatMessage({ id: 'modelEvaluation.modelWeightFile' })}
              name="argumentsFile"
              rules={[
                {
                  required: true,
                  message: intl.formatMessage({ id: 'modelEvaluation.needInputWeightFile' }),
                },
              ]}
            >
              <Input addonBefore={codePathPrefix} />
            </Form.Item>
            <Form.Item
              {...layout}
              label={intl.formatMessage({ id: 'modelEvaluation.testDataSet' })}
              name="datasetPath"
              rules={[
                {
                  required: true,
                  message: intl.formatMessage({ id: 'modelEvaluation.needSelectTestDataSet' }),
                },
              ]}
            >
              <Select onChange={handleDatasetChange}>
                {datasets.map((d) => (
                  <Option key={d.path} value={d.path}>
                    {d.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              // {...layout}
              label={intl.formatMessage({ id: 'modelEvaluation.runningParam' })}
              labelCol={{ span: 3 }}
            >
              {runningParams.map((param, index) => {
                return (
                  <div>
                    <Form.Item
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
                    </Form.Item>
                    <PauseOutlined rotate={90} style={{ marginTop: '8px', width: '30px' }} />
                    <Form.Item
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
                    </Form.Item>
                    <DeleteOutlined
                      style={{ marginLeft: '10px', cursor: 'pointer' }}
                      onClick={() => removeRuningParams(param.createTime || param.key)}
                    />
                  </div>
                );
              })}
              <div className={styles.addParams} onClick={addParams}>
                <PlusSquareOutlined
                  fill="#1890ff"
                  style={{ color: '#1890ff', marginRight: '10px' }}
                />
                <a>{intl.formatMessage({ id: 'modelEvaluation.clickAddParam' })}</a>
              </div>
            </Form.Item>
            <Form.Item
              {...layout}
              label={intl.formatMessage({ id: 'modelEvaluation.deviceType' })}
              name="deviceType"
              rules={[
                {
                  required: true,
                  message: intl.formatMessage({ id: 'modelEvaluation.needSelectDeviceType' }),
                },
              ]}
            >
              <Select onChange={onDeviceTypeChange}>
                {deviceTypes.map((item) => (
                  <Option key={item} value={item}>
                    {item}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              {...layout}
              label={intl.formatMessage({ id: 'modelEvaluation.deviceNum' })}
              name="deviceNum"
              rules={[
                {
                  required: true,
                  message: intl.formatMessage({ id: 'modelEvaluation.needSelectDeviceNum' }),
                },
              ]}
            >
              <Select onClick={handleClickDeviceNum}>
                {deviceNums.map((item) => (
                  <Option key={item} value={item}>
                    {item}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              {...layout}
              label={PrivilegedLabel({ noPrivilegedJobPermission, disablePrivileged })}
              name="isPrivileged"
              initialValue={iSPrivileged}
            >
              <Switch
                disabled={disablePrivileged || noPrivilegedJobPermission}
                onChange={(checked) => setISPrivileged(checked)}
              />
            </Form.Item>
            {
              iSPrivileged && <Form.Item
              label={intl.formatMessage({ id: 'ManagePrivilegeJob.bypassCode.label' })}
              name="bypassCode"
              {...layout}
              rules={[
                { required: true }
              ]}
            >
              <Input style={{ width: '200px' }} />
            </Form.Item>
            }
            <Form.Item style={{ float: 'right' }}>
              <Button type="primary" htmlType="submit">
                {intl.formatMessage({ id: 'modelEvaluation.startEvaluate' })}
              </Button>
            </Form.Item>
          </Form>
        </div>
      </PageHeader>
      <Modal
        visible={presetParamsVisible}
        onCancel={() => setPresetParamsVisible(false)}
        onOk={handleConfirmPresetParams}
        title={intl.formatMessage({ id: 'modelEvaluation.importEvaluateParam' })}
        forceRender
        width="80%"
      >
        <Form form={form2}>
          {presetRunningParams.length > 0 ? (
            <Tabs
              defaultActiveKey={presetRunningParams[0].metaData?.id}
              tabPosition="left"
              onChange={handleSelectPresetParams}
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
                    <Col span={5}>{intl.formatMessage({ id: 'modelEvaluation.startupFile' })}</Col>
                    <Col span={19}>{p.params.startupFile}</Col>
                  </Row>
                  <Row>
                    <Col span={5}>{intl.formatMessage({ id: 'modelEvaluation.codePath' })}</Col>
                    <Col span={19}>{p.params.codePath}</Col>
                  </Row>
                  <Row>
                    <Col span={5}>
                      {intl.formatMessage({ id: 'modelEvaluation.trainingDataSet' })}
                    </Col>
                    <Col span={19}>{p.params.datasetPath}</Col>
                  </Row>
                  <Row>
                    <Col span={5}>{intl.formatMessage({ id: 'modelEvaluation.outputPath' })}</Col>
                    <Col span={19}>{p.params.outputPath}</Col>
                  </Row>
                  <Row>
                    <Col span={5}>{intl.formatMessage({ id: 'modelEvaluation.runningParam' })}</Col>
                    <Col span={19}>
                      {p.params.params && formatParams(p.params.params).map((p) => <div>{p}</div>)}
                    </Col>
                  </Row>
                  <Row>
                    <Col span={5}>
                      {intl.formatMessage({ id: 'modelEvaluation.computeNodeSpecification' })}
                    </Col>
                    <Col span={19}>{p.params.deviceType}</Col>
                  </Row>
                  <Row>
                    <Col span={5}>{intl.formatMessage({ id: 'modelEvaluation.engineType' })}</Col>
                    <Col span={19}>{getNameFromDockerImage(p.params.engine)}</Col>
                  </Row>
                </TabPane>
              ))}
            </Tabs>
          ) : (
            <div>{intl.formatMessage({ id: 'modelEvaluation.noData' })}</div>
          )}
        </Form>
      </Modal>
    </>
  );
};

export default connect(({ vc, common, user }) => ({ vc, common, currentUser: user.currentUser }))(ModelEvaluation);
