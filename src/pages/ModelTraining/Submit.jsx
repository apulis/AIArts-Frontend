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
  InputNumber,
  Tooltip,
  Switch,
} from 'antd';
import { history, useIntl } from 'umi';
import {
  PauseOutlined,
  PlusSquareOutlined,
  DeleteOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import { useForm } from 'antd/lib/form/Form';
import FormItem from 'antd/lib/form/FormItem';
import { jobNameReg, getNameFromDockerImage, startUpFileReg, getUserPathPrefixReg } from '@/utils/reg';
import { formatParams } from '@/utils/utils';
import { beforeSubmitJob } from '@/models/resource';
import { connect } from 'dva';
import { getAvailPSDDeviceNumber, getAvailRegularDeviceNumber } from '@/utils/device-utils';
import { getLabeledDatasets } from '../../services/datasets';
import styles from './index.less';
import {
  submitModelTraining,
  fetchAvilableResource,
  fetchTemplateById,
  fetchPresetTemplates,
  fetchPresetModel,
  updateParams,
  getUserDockerImages,
  getImages,
} from '../../services/modelTraning';

const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

export const generateKey = () => {
  return new Date().getTime();
};

export const subCodePathPrefix = (s = '') => {
  return s.replace(/\/home\/.+?\//, '');
};

const ModelTraining = (props) => {
  const intl = useIntl();
  const { formatMessage } = intl;
  const { currentSelectedVC } = props.vc;
  // 请求类型，根据参数创建作业，type为createJobWithParam；编辑参数type为editParam
  const requestType = props.match.params.type;
  const paramsId = props.match.params.id;
  let readParam; let typeCreate; let typeEdit; let isFromPresetModel;
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
  // 从'预置模型页面'跳转过来
  if (requestType === 'PretrainedModel') {
    isFromPresetModel = true;
  }
  const goBackPath = isFromPresetModel
    ? '/model-training/PretrainedModels'
    : readParam
      ? '/model-training/paramsManage'
      : '/model-training/modelTraining';
  const [runningParams, setRunningParams] = useState([
    { key: '', value: '', createTime: generateKey() },
  ]);
  const [form] = useForm();
  const [frameWorks, setFrameWorks] = useState([]);
  const [userFrameWorks, setUserFrameWorks] = useState([]);
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
  const [importedTrainingParams, setImportedTrainingParams] = useState(false);
  const [engineSource, setEngineSource] = useState(1);
  const [algorithmSource, setAlgorithm] = useState(1);
  const [presetImageDescMap, setPresetImageDescMap] = useState({});
  const [savedImageDescMap, setSavedImageDescMap] = useState({});
  const [frameworkMap, setFrameworkMap] = useState({});
  const [iSPrivileged, setISPrivileged] = useState(false);
  const [engineTip, setEngineTip] = useState('');

  const getImageDescMap = async () => {
    const res = await getImages();
    const { code, data } = res;
    const obj = {};
    if (code === 0) {
      data.forEach((item) => {
        obj[item.image] = item.desc;
      })
      setPresetImageDescMap(obj);
      setEngineTip(obj[getFieldValue('engine')]);
    }
  }

  const getAvailableResource = async () => {
    const res = await fetchAvilableResource(currentSelectedVC);
    if (res.code === 0) {
      let {
        data: { aiFrameworks, deviceList, codePathPrefix, nodeInfo },
      } = res;
      if (!/\/$/.test(codePathPrefix)) {
        codePathPrefix = codePathPrefix + '/';
      }
      setCodePathPrefix(codePathPrefix);
      let aiFrameworkList = [];
      setFrameworkMap(aiFrameworks);
      Object.keys(aiFrameworks).forEach((val) => {
        aiFrameworkList = aiFrameworkList.concat(aiFrameworks[val]);
      });
      setFieldsValue({
        engine: aiFrameworkList[0],
      })
      setFrameWorks(aiFrameworkList);
      setDeviceList(deviceList);
      const totalNodes = nodeInfo.length;
      if (totalNodes) {
        setTotalNodes(totalNodes);
      }
      setNofeInfo(nodeInfo);
    }
  };

  const fetchUserDockerImages = async () => {
    const res = await getUserDockerImages();
    if (res.code === 0) {
      const images = res.data.savedImages?.map((val) => {
        const param = val.param ? JSON.parse(val.param) : {};
        return { fullName: val.fullName, id: val.id, frameworkType: param.frameworkType };
      });
      setUserFrameWorks(images);
      const savedImageDescArr = res.data.savedImages?.map((val) => {
        return { image: val.fullName, desc: val.description };
      });
      if (savedImageDescArr.length > 0) {
        const obj = {};
        savedImageDescArr.forEach((item) => {
          obj[item.image] = item.desc;
        })
        setSavedImageDescMap(obj);
      }
    }
  };
  useEffect(() => {
    if (!currentDeviceType) return;
    if (distributedJob) {
      const list = getAvailPSDDeviceNumber(currentDeviceType, deviceList.find(val => val.deviceType === currentDeviceType)?.userQuota, getFieldValue('numPsWorker'));
      setAvailableDeviceNumList(list);
    } else {
      const list = getAvailRegularDeviceNumber(currentDeviceType, deviceList.find(val => val.deviceType === currentDeviceType)?.userQuota);
      setAvailableDeviceNumList(list);
    }
  }, [distributedJob, deviceList, currentDeviceType,]);

  useEffect(() => {
    if (codePathPrefix && Object.keys(paramsDetailedData).length > 0) {
      const newParams = {
        ...paramsDetailedData.params,
        outputPath: subCodePathPrefix(paramsDetailedData.params.outputPath),
        codePath: subCodePathPrefix(paramsDetailedData.params.codePath),
        startupFile: subCodePathPrefix(paramsDetailedData.params.startupFile),
      };
      setParamsDetailedData({
        ...paramsDetailedData,
        params: newParams,
      });
      setCurrentDeviceType(newParams.deviceType);
      setFieldsValue({
        ...newParams,
        deviceNum: availableDeviceNumList.includes(newParams.deviceNum) ? newParams.deviceNum : 0,
      });
    }
  }, [codePathPrefix]);

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
      setCodePathPrefix(codePathPrefix);
      // check null
      data.params.params = data.params.params || [];
      // replace path prefix
      data.params.codePath = (data.params.codePath || '').replace(codePathPrefix, '');
      data.params.startupFile = (data.params.startupFile || '').replace(codePathPrefix, '');
      data.params.outputPath = (data.params.outputPath || '').replace(codePathPrefix, '');
      data.params.params = Object.entries(data.params.params).map((item) => {
        var obj = {};
        obj['key'] = item[0];
        obj['value'] = item[1];
        return obj;
      });
      if (typeCreate) {
        data.params.name = '';
      }
      const { deviceType, deviceNum } = data.params;
      form.setFieldsValue({
        ...data.params,
        deviceNum: availableDeviceNumList.includes(deviceNum) ? deviceNum : 0,
      });
      if (deviceType) {
        setCurrentDeviceType(data.params.deviceType);
      }
      setRunningParams(data.params.params);
    }
  };

  const getPresetModel = async () => {
    const res = await fetchPresetModel(paramsId);
    if (res.code === 0) {
      const { model } = res.data;
      // check null
      model.arguments = model.params || [];
      const params = Object.entries(model.arguments || {}).map((item) => {
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
        // datasetPath: model.datasetName,
        datasetPath: model.datasetPath,
        codePath: model.codePath,
        startupFile: model.startupFile,
        outputPath: model.outputPath,
        name: model.name,
        engine: model.engine,
      });
    }
  };
  const isPretrainedModel = ['PretrainedModel'].includes(requestType);
  const needCodePathPrefix = isPretrainedModel || importedTrainingParams;
  useEffect(() => {
    if (['createJobWithParam', 'editParam'].includes(requestType)) {
      fetchParams().then(() => {
        getAvailableResource().then(() => {
          getImageDescMap();;
        })
      })
    } else {
      getAvailableResource().then(() => {
        getImageDescMap();;
      });
    }
    fetchDataSets();
    if (isPretrainedModel) {
      getPresetModel();
    }
    if (isSubmitPage) {
      fetchUserDockerImages();
    }
  }, []);

  useEffect(() => {
    if (presetParamsVisible) {
      fetchPresetTemplates().then((res) => {
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

  useEffect(() => {
    props.dispatch({
      type: 'resource/fetchResource',
    });
  }, []);

  const handleSubmit = async () => {
    const values = await validateFields();
    let params = {};
    values.params &&
      values.params.forEach((p) => {
        if (!p.key) return;
        params[p.key] = p.value;
      });
    if (isPretrainedModel) {
      values.outputPath = codePathPrefix + values.outputPath;
      values.visualPath = values.visualPath ? codePathPrefix + values.visualPath : undefined;
    } else if (importedTrainingParams) {
      //
    } else {
      values.codePath = values.codePath ? codePathPrefix + values.codePath : undefined;
      values.startupFile = values.startupFile ? codePathPrefix + values.startupFile : undefined;
      values.outputPath = values.outputPath ? codePathPrefix + values.outputPath : undefined;
      values.visualPath = values.visualPath ? codePathPrefix + values.visualPath : undefined;
    }
    values.params = params;
    values.private = [1, 2].includes(engineSource);
    if (engineSource === 1) {
      Object.keys(frameworkMap).forEach(key => {
        if (Array.isArray(frameworkMap[key])) {
          frameworkMap[key].forEach(engine => {
            if (engine === values.engine) {
              values.frameworkType = key;
            }
          })
        }
      })
    } else if (engineSource === 2) {
      const f = userFrameWorks.find(val => val.fullName === values.engine);
      if (f) {
        values.frameworkType = f.frameworkType;
      }
    }
    if (typeEdit) {
      let editParams = {
        ...paramsDetailedData.metaData,
        templateData: values,
      };
      const res = await updateParams(editParams);
      if (res.code === 0) {
        message.success(formatMessage({ id: 'model.submit.message.save.success' }));
        history.push(goBackPath);
      }
    } else {
      if (values.jobTrainingType === 'PSDistJob') {
        values.numPs = 1;
      }
      const submitJobInner = async () => {
        const cancel = message.loading(formatMessage({ id: 'model.submit.message.uploading' }));
        const res = await submitModelTraining({ ...values, vcName: currentSelectedVC });
        cancel();
        if (res.code === 0) {
          message.success(formatMessage({ id: 'model.submit.message.create.success' }));
          history.push('/model-training/modelTraining');
        }
      };
      const currentVCAvailDevice = deviceList.find(val => val.deviceType === values.deviceType);
      let needConfirm = false;
      if (currentVCAvailDevice) {
        const currentAvail = currentVCAvailDevice.avail;
        if (values.jobTrainingType === 'PSDistJob') {
          if (values.numPsWorker * values.deviceNum > avail) {
            needConfirm = true;
          }
        } else {
          if (values.deviceNum > currentAvail) {
            needConfirm = true;
          }
        }
      }
      if (
        !beforeSubmitJob(
          values.jobTrainingType === 'PSDistJob',
          values.deviceType,
          values.deviceNum,
          { nodeNum: values.numPsWorker },
        ) || needConfirm
      ) {
        Modal.confirm({
          title: formatMessage({ id: 'model.submit.resource.not.enough.title' }),
          content: formatMessage({ id: 'model.submit.resource.not.enough.content' }),
          onOk() {
            submitJobInner();
          },
          onCancel() { },
        });
      } else {
        submitJobInner();
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
        callback(formatMessage({ id: 'model.submit.validate.running.params.validator.same.name' }));
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
    wrapperCol: { span: 12 },
  };

  const handleDistributedJob = (e) => {
    const type = e.target.value;
    setDistributedJob(type === 'PSDistJob');
  };

  const onDeviceTypeChange = (value) => {
    const deviceType = value;
    setCurrentDeviceType(deviceType);
    setTotalNodes(props.resource.devices[deviceType]?.detail?.length);
  };

  const handleConfirmPresetParams = () => {
    const currentSelected = presetRunningParams.find(
      (p) => p.metaData.id == currentSelectedPresetParamsId,
    );
    if (currentSelected) {
      setFieldsValue({
        ...currentSelected.params,
        codePath: currentSelected.params.codePath,
        startupFile: currentSelected.params.startupFile,
        outputPath: currentSelected.params.outputPath,
        deviceNum: availableDeviceNumList.includes(currentSelected.params.deviceNum) ? currentSelected.params?.deviceNum : 0,
        engine: frameWorks.includes(currentSelected.params.engine) ? currentSelected.params?.engine : undefined,
      });
      const params = Object.entries(currentSelected.params.params || {}).map((item) => {
        var obj = {};
        obj['key'] = item[0];
        obj['value'] = item[1];
        return obj;
      });
      setRunningParams(params);
      setFieldsValue({
        params: params,
      });
      const { deviceType, engine } = currentSelected.params;
      if (frameWorks.includes(engine)) {
        setEngineSource(1);
      } else if (userFrameWorks.includes(engine)) {
        setEngineSource(2);
      }
      setCurrentDeviceType(deviceType);
      setTotalNodes(props.resource.devices[deviceType]?.detail?.length);
      setImportedTrainingParams(true);
    }
    setPresetParamsVisible(false);
  };

  const handleSelectPresetParams = (current) => {
    setCurrentSelectedPresetParamsId(current);
  };

  const handleClickDeviceNum = (e) => {
    if (!getFieldValue('deviceType')) {
      message.error(formatMessage({ id: 'model.submit.message.device.error' }));
    }
  };

  const onEngineChange = (engine) => {
    setEngineTip(presetImageDescMap[engine]);
  }

  const handleDeviceChange = () => {
    const deviceTotal =
      Number(getFieldValue('numPsWorker') || 0) * Number(getFieldValue('deviceNum') || 0);
    setFieldsValue({
      deviceTotal: deviceTotal || 0,
    });
    setDeviceTotal(deviceTotal);
  };


  let needOutputPathCodePrefix = true;
  if (isPretrainedModel) {
    needOutputPathCodePrefix = true;
  } else if (importedTrainingParams) {
    needOutputPathCodePrefix = false;
  } else {
    needOutputPathCodePrefix = true;
  }

  const disablePrivileged = !props.common.enablePrivileged || (!props.currentUser.permissionList.includes('SUBMIT_PRIVILEGE_JOB'));
  return (
    <div className={styles.modelTraining}>
      <PageHeader
        className="site-page-header"
        onBack={() => history.push(goBackPath)}
        title={
          typeEdit
            ? formatMessage({ id: 'model.submit.pageTitle.edit' })
            : formatMessage({ id: 'model.submit.pageTitle.submit' })
        }
      />
      <Form form={form}>
        <FormItem
          {...commonLayout}
          style={{ marginTop: '30px' }}
          name="name"
          label={
            typeEdit
              ? formatMessage({ id: 'trainingCreate.label.paramConfigName' })
              : formatMessage({ id: 'trainingCreate.label.jobName' })
          }
          rules={[{ required: true }, { ...jobNameReg }]}
        >
          <Input
            style={{ width: 300 }}
            placeholder={
              typeEdit
                ? formatMessage({ id: 'trainingCreate.placeholder.inputParamsConfigName' })
                : formatMessage({ id: 'trainingCreate.placeholder.inputJobName' })
            }
          />
        </FormItem>
        <FormItem
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 14 }}
          name="desc"
          label={formatMessage({ id: 'trainingCreate.label.desc' })}
          rules={[{ max: 191 }]}
        >
          <TextArea
            placeholder={formatMessage({ id: 'trainingCreate.placeholder.inputDescription' })}
          />
        </FormItem>
      </Form>
      <Divider style={{ borderColor: '#cdcdcd' }} />
      <div
        className="ant-page-header-heading-title"
        style={{ marginLeft: '38px', marginBottom: '20px' }}
      >
        {formatMessage({ id: 'model.submit.params.config' })}
      </div>
      {isSubmitPage && (
        <FormItem
          {...commonLayout}
          preserve={false}
          label={formatMessage({ id: 'trainingCreate.label.paramsSource' })}
        >
          <Radio.Group defaultValue={1} buttonStyle="solid">
            <Radio.Button value={1}>
              {formatMessage({ id: 'trainingCreate.value.manualParameterConfiguration' })}
            </Radio.Button>
            <Radio.Button
              value={2}
              onClick={() => {
                setPresetParamsVisible(true);
              }}
            >
              {formatMessage({ id: 'trainingCreate.value.importTrainingParams' })}
            </Radio.Button>
          </Radio.Group>
        </FormItem>
      )}
      {/* {isSubmitPage && <FormItem
        {...commonLayout}
        label={formatMessage({ id: 'modelTraing.submit.algorithmSource' })}
      >
        <Radio.Group defaultValue={1} buttonStyle="solid" onChange={(e) => setAlgorithm(e.target.value)}>
          <Radio.Button value={1}>
            {formatMessage({ id: 'modelTraing.submit.classicMode' })}
          </Radio.Button>
          <Radio.Button
            value={2}
          >
            {formatMessage({ id: 'modelTraing.submit.commandLineMode' })}
          </Radio.Button>
        </Radio.Group>

      </FormItem>} */}
      <Form form={form}>
        {isSubmitPage && (
          <FormItem
            {...commonLayout}
            label={formatMessage({ id: 'trainingCreate.label.engineSource' })}
          >
            <Radio.Group
              value={engineSource}
              onChange={(e) => {
                setEngineSource(e.target.value);
              }}
              style={{ width: '360px' }}
            >
              <Radio value={1}>{formatMessage({ id: 'trainingCreate.value.presetEngine' })}</Radio>
              <Radio value={2}>{formatMessage({ id: 'trainingCreate.value.savedEngine' })}</Radio>
              <Radio value={3}>{formatMessage({ id: 'trainingCreate.value.customEngine' })}</Radio>
            </Radio.Group>
          </FormItem>
        )}
        {
          engineSource === 1 &&
          <FormItem
            {...commonLayout}
            label={formatMessage({ id: 'trainingCreate.label.engine' })}
            required
          >
            <FormItem
              name="engine"
              rules={[{ required: true }]}
              preserve={false}
              style={{ display: 'inline-block' }}
            >
              <Select style={{ width: 300 }} disabled={typeCreate} onChange={onEngineChange}>
                {engineSource === 1 &&
                frameWorks.map((f) => (
                  <Option value={f} key={f}>
                    {/* <Tooltip title={presetImageDescMap[getNameFromDockerImage(f)]}> */}
                    <Tooltip title={presetImageDescMap[f]}>
                      {getNameFromDockerImage(f)}
                    </Tooltip>
                  </Option>
                ))}
              </Select>
            </FormItem>
            <FormItem style={{ display: 'inline-block' }}>
              <Tooltip visible={engineTip} placement="right" title={engineTip} />
            </FormItem>
          </FormItem>
          
        }
        {
          engineSource === 2 && 
          <FormItem
            {...commonLayout}
            name="engine"
            label={formatMessage({ id: 'trainingCreate.label.engine' })}
            rules={[{ required: true }]}
            preserve={false}
          >
            <Select style={{ width: 300 }} disabled={typeCreate} showSearch>
              {userFrameWorks.map((f) => (
                <Option value={f.fullName} key={f.id}>
                  <Tooltip title={savedImageDescMap[f]}>
                    {getNameFromDockerImage(f.fullName)}
                  </Tooltip>
                </Option>
              ))}
            </Select>
          </FormItem>
        }
        {
          engineSource === 3 && 
          <FormItem
            {...commonLayout}
            name="engine"
            label={formatMessage({ id: 'trainingCreate.label.engine' })}
            rules={[{ required: true }]}
            preserve={false}
          >
            <Input style={{ width: '300px' }} placeholder={formatMessage({ id: 'trainingCreate.engine.input.placeholder' })} />
          </FormItem>
        }
        <FormItem
          labelCol={{ span: 4 }}
          name="codePath"
          label={formatMessage({ id: 'trainingCreate.label.codePath' })}
          rules={[{ required: isPretrainedModel }]}
        >
          {isPretrainedModel || importedTrainingParams ? (
            <Input style={{ width: 420 }} disabled={isPretrainedModel} />
          ) : (
              <Input addonBefore={codePathPrefix} style={{ width: 420 }} disabled={typeCreate} />
            )}
        </FormItem>
        {
          algorithmSource === 1 && <FormItem
            labelCol={{ span: 4 }}
            label={formatMessage({ id: 'trainingCreate.label.startupFile' })}
            name="startupFile"
            preserve={false}
            rules={[{ required: true }, startUpFileReg]}
          >
            {isPretrainedModel || importedTrainingParams ? (
              <Input style={{ width: 420 }} disabled={isPretrainedModel} />
            ) : (
                <Input addonBefore={codePathPrefix} style={{ width: 420 }} disabled={typeCreate} />
              )}
          </FormItem>
        }
        {
          algorithmSource === 1 && <FormItem
            name="visualPath"
            preserve={false}
            labelCol={{ span: 4 }}
            label={formatMessage({ id: 'trainingCreate.label.visualPath' })}
            style={{ marginTop: '50px' }}
            rules={[
              { whitespace: true },
              { pattern: needOutputPathCodePrefix ? undefined : getUserPathPrefixReg(codePathPrefix).pattern }
            ]}
          >
            <Input
              addonBefore={needOutputPathCodePrefix ? codePathPrefix : null}
              style={{ width: 420 }}
            />
          </FormItem>
        }

        <FormItem
          name="outputPath"
          labelCol={{ span: 4 }}
          label={formatMessage({ id: 'trainingCreate.label.outputPath' })}
          rules={[{ required: isPretrainedModel }, { pattern: needOutputPathCodePrefix ? undefined : getUserPathPrefixReg(codePathPrefix).pattern }]}
        >
          <Input
              addonBefore={needOutputPathCodePrefix ? codePathPrefix : null}
              style={{ width: 420 }}
            />
        </FormItem>
        <FormItem
          name="datasetPath"
          rules={[{ required: true }]}
          labelCol={{ span: 4 }}
          label={formatMessage({ id: 'trainingCreate.label.datasetPath' })}
        >
          {/* <Input style={{ width: 300 }} /> */}
          <Select style={{ width: '300px' }}>
            {datasets.map((d) => (
              <Option value={d.path} key={d.dataSetId}>
                {d.name}
              </Option>
            ))}
          </Select>
        </FormItem>

        {
          algorithmSource === 2 && <FormItem
            label={formatMessage({ id: 'modelTraing.submit.commandLine' })}
            preserve={false}
            name="command"
            {...commonLayout}
            rules={[{
              required: true,
            }]}
          >
            <TextArea style={{ width: '500px', fontFamily: 'Consolas,Monaco,Lucida Console,Liberation Mono,DejaVu Sans Mono,Bitstream Vera Sans Mono,Courier New, monospace' }} rows={4} />
          </FormItem>
        }
        {
          algorithmSource === 1 && <FormItem
            label={formatMessage({ id: 'trainingCreate.label.runningParams' })}
            labelCol={{ span: 4 }}
          >
            {runningParams.map((param, index) => {
              return (
                <div key={param.createTime || param.key}>
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
                  {
                    <DeleteOutlined
                      style={{ marginLeft: '10px', cursor: 'pointer' }}
                      onClick={() => removeRuningParams(param.createTime || param.key)}
                    />
                  }
                </div>
              );
            })}
            <div className={styles.addParams} onClick={addParams}>
              <PlusSquareOutlined fill="#1890ff" style={{ color: '#1890ff', marginRight: '10px' }} />
              <a>{formatMessage({ id: 'model.submit.button.create.params' })}</a>
            </div>
          </FormItem>
        }

        <FormItem
          label={formatMessage({ id: 'trainingCreate.label.jobTrainingType' })}
          name="jobTrainingType"
          {...commonLayout}
          rules={[{ required: true }]}
          initialValue="RegularJob"
          onChange={handleDistributedJob}
        >
          <Radio.Group style={{ width: '300px' }}>
            <Radio value={'PSDistJob'}>{formatMessage({ id: 'trainingCreate.value.yes' })}</Radio>
            <Radio value={'RegularJob'}>{formatMessage({ id: 'trainingCreate.value.no' })}</Radio>
          </Radio.Group>
        </FormItem>
        {distributedJob && (
          <FormItem
            label={formatMessage({ id: 'trainingCreate.label.numPsWorker' })}
            {...commonLayout}
            name="numPsWorker"
            rules={[
              { required: true },
              {
                type: 'number',
                message: formatMessage({ id: 'trainingCreate.rule.needANumber' }),
              },
              {
                validator(rule, value, callback) {
                  if (Number(value) > totalNodes) {
                    callback(
                      formatMessage(
                        { id: 'trainingCreate.npmPsWorker.validator.max' },
                      ).replace(
                        /\{num\}/,
                        totalNodes,
                      ),
                    );
                    return;
                  }
                  if (Number(value) < 1) {
                    callback(formatMessage({ id: 'trainingCreate.npmPsWorker.validator.min' }));
                    return;
                  }
                  callback();
                },
              },
            ]}
            initialValue={1}
          >
            <InputNumber onChange={handleDeviceChange} min={1} max={totalNodes} />
          </FormItem>
        )}
        <FormItem
          label={formatMessage({ id: 'trainingCreate.label.deviceType' })}
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
          label={
            distributedJob
              ? formatMessage({ id: 'trainingCreate.label.perNodeDeviceNum' })
              : formatMessage({ id: 'trainingCreate.label.deviceNum' })
          }
          name="deviceNum"
          {...commonLayout}
          rules={[{ required: true }]}
        >
          <Select
            style={{ width: '300px' }}
            onChange={handleDeviceChange}
            onClick={handleClickDeviceNum}
          >
            {availableDeviceNumList.map((avail) => (
              <Option value={avail}>{avail}</Option>
            ))}
          </Select>
        </FormItem>
        
        {distributedJob && (
          <FormItem
            {...commonLayout}
            label={formatMessage({ id: 'trainingCreate.label.deviceTotal' })}
            name="deviceTotal"
            disabled
          >
            <Input value={deviceTotal} style={{ width: '300px' }} disabled />
          </FormItem>
        )}
        <Form.Item
          label={
            !disablePrivileged ? 
              <div>使用 Privilege Job</div>
              :
              <Tooltip title="平台目前没有开启 Privilege， 如有需要请联系管理员">
                使用 Privilege Job
                <QuestionCircleOutlined style={{ marginLeft: '6px'}} />
              </Tooltip>
          }
          name="isPrivileged"
          initialValue={iSPrivileged}
        >
          <Switch
            disabled={disablePrivileged}
            onChange={(checked) => setISPrivileged(checked)}
          />
        </Form.Item>
          {
            iSPrivileged && <FormItem
            label="校验码"
            name="bypassCode"
            {...commonLayout}
            rules={[
              { required: true }
            ]}
          >
            <Input style={{ width: '200px' }} />
          </FormItem>
          }
      </Form>
      <Modal
        visible={presetParamsVisible}
        onCancel={() => setPresetParamsVisible(false)}
        onOk={handleConfirmPresetParams}
        title={formatMessage({ id: 'model.submit.import.training.params' })}
        forceRender
        width="80%"
      >
        <Form form={form}>
          {presetRunningParams.length > 0 ? (
            <Tabs
              defaultActiveKey={presetRunningParams[0].metaData?.id}
              tabPosition="left"
              onChange={handleSelectPresetParams}
              style={{ maxHeight: '500px' }}
            >
              {presetRunningParams.map((p, index) => (
                <TabPane tab={p.metaData.name} key={p.metaData.id}>
                  <Row>
                    <Col span={5}>
                      {formatMessage({ id: 'model.submit.modal.save.params.deviceNum' })}
                    </Col>
                    <Col span={19}>{p.params.deviceNum}</Col>
                  </Row>
                  <Row>
                    <Col span={5}>{formatMessage({ id: 'model.params.item.startupFile' })}</Col>
                    <Col span={19}>{p.params.startupFile}</Col>
                  </Row>
                  <Row>
                    <Col span={5}>{formatMessage({ id: 'model.params.item.codePath' })}</Col>
                    <Col span={19}>{p.params.codePath}</Col>
                  </Row>
                  <Row>
                    <Col span={5}>{formatMessage({ id: 'model.params.item.datasetPath' })}</Col>
                    <Col span={19}>{p.params.datasetPath}</Col>
                  </Row>
                  <Row>
                    <Col span={5}>{formatMessage({ id: 'model.params.item.outputPath' })}</Col>
                    <Col span={19}>{p.params.outputPath}</Col>
                  </Row>
                  <Row>
                    <Col span={5}>{formatMessage({ id: 'model.params.item.runningParams' })}</Col>
                    <Col span={19}>
                      {p.params.params &&
                        formatParams(p.params.params).map((val) => <div>{val}</div>)}
                    </Col>
                  </Row>
                  <Row>
                    <Col span={5}>{formatMessage({ id: 'model.params.item.deviceType' })}</Col>
                    <Col span={19}>{p.params.deviceType}</Col>
                  </Row>
                  <Row>
                    <Col span={5}>{formatMessage({ id: 'model.params.item.engine' })}</Col>
                    <Col span={19}>{getNameFromDockerImage(p.params.engine)}</Col>
                  </Row>
                </TabPane>
              ))}
            </Tabs>
          ) : (
              <div>{formatMessage({ id: 'model.submit.modal.save.params.none' })}</div>
            )}
        </Form>
      </Modal>
      <Button
        type="primary"
        style={{ float: 'right', marginBottom: '16px' }}
        onClick={handleSubmit}
      >
        {typeEdit
          ? formatMessage({ id: 'trainingCreate.save' })
          : formatMessage({ id: 'trainingCreate.submit' })}
      </Button>
    </div>
  );
};

export default connect(({ resource, vc, common, user }) => ({ resource, vc, common, currentUser: user.currentUser }))(ModelTraining);
