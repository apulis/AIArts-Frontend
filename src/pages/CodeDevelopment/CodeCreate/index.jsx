import React, { useState, useEffect, useRef, forwardRef } from 'react';
import {
  Form,
  Input,
  Button,
  Select,
  Tooltip,
  PageHeader,
  message,
  Modal,
  InputNumber,
  Card,
  Radio,
  Switch,
  Popover,
} from 'antd';
import { history, connect } from 'umi';
import { postCode1, getResource } from '../service.js';
import { utilGetDeviceNumArr, utilGetDeviceNumPerNodeArr } from '../serviceController.js';
import { jobNameReg, getNameFromDockerImage } from '@/utils/reg.js';
import { beforeSubmitJob } from '@/models/resource';
import { fetchAvilableResource, getImages, getUserDockerImages } from '@/services/modelTraning.js';
import { useIntl } from 'umi';
import { getAvailPSDDeviceNumber, getAvailRegularDeviceNumber } from '@/utils/device-utils';
import Ribbon from 'antd/lib/badge/Ribbon';
import { QuestionCircleOutlined } from '@ant-design/icons';
import PrivilegedLabel from '@/components/PrivilegeLabel/index';
import { EnumImageCategorys } from '@/models/common'; 
import { arrayCommon } from '@/utils/utils.js';

const { Option } = Select;
const { TextArea } = Input;


const CodeCreate = (props) => {
  useEffect(() => {
    props.dispatch({
      type: 'resource/fetchResource',
    });
  }, []);
  const { formatMessage } = useIntl();
  const [form] = Form.useForm();
  const { validateFields, setFieldsValue, getFieldValue } = form;
  const [resource, setResource] = useState(null);
  const [deviceTypeArr, setDeviceTypeArr] = useState([]); // 更新状态是异步的
  const [deviceNumArr, setDeviceNumArr] = useState([]);
  const [jobTrainingType, setJobTrainingType] = useState('RegularJob');
  const [engineNameArr, setEngineNameArr] = useState([]);
  const [codePathPrefix, setCodePathPrefix] = useState('');
  const [deviceNumPerNodeArr, setDeviceNumPerNodeArr] = useState([]);
  const [maxNodeNum, setMaxNodeNum] = useState(1);
  const [engineSource, setEngineSource] = useState(1);
  const [deviceList, setDeviceList] = useState([]);
  const [presetImageDescMap, setPresetImageDescMap] = useState({});
  const [userFrameWorks, setUserFrameWorks] = useState([]);
  const [currentDeviceType, setCurrentDeviceType] = useState('');
  const [algorithmSource, setAlgorithmSource] = useState(1);
  const [submitButtonLoading, setSubmitButtonLoading] = useState(false);
  const [iSPrivileged, setISPrivileged] = useState(false);
  const [engineTip, setEngineTip] = useState('');
  const [isHyperparamImage, setIsHyperparamImage] = useState(false);
  const [frameworkMap, setFrameworkMap] = useState({});
  const [nodeNum, setNodeNum] = useState(0);

  const { currentSelectedVC } = props.vc;
  const { presetImages, deviceForImages } = props.common;
  const getImageDescMap = async () => {
    const res = await getImages();
    const { code, data } = res;
    const obj = {};
    
    if (code === 0) {
      data.forEach((item) => {
        obj[item.image] = item.desc;
      });
      setPresetImageDescMap(obj);
      setEngineTip(obj[getFieldValue('engine')] || '');
    }
  }

  const renderInitForm = async () => {
    const result = await apiGetResource();
    if (result) {
      setResource(result);
      const engineNameArrData = Object.keys(result.aiFrameworks || {}).reduce((temp, frameworkName) => {
        return temp.concat((result.aiFrameworks || {})[frameworkName])
      }, []);
      setFrameworkMap(result.aiFrameworks);
      const deviceList = result.deviceList;
      const deviceTypeArrData = deviceList.map((item) => item.deviceType);
      setDeviceList(deviceList);
      const deviceNumArrData = getAvailRegularDeviceNumber(deviceTypeArrData[0], deviceList[0].userQuota);
      const deviceNumPerNodeArrData = deviceNumArrData;
      const maxNodeNumData = result.nodeCountByDeviceType[deviceTypeArrData[0]]; // todo 静态数据
      setCodePathPrefix(result.codePathPrefix);
      setEngineNameArr(engineNameArrData);
      setDeviceTypeArr(deviceTypeArrData);
      setDeviceNumPerNodeArr(deviceNumPerNodeArrData);
      setMaxNodeNum(maxNodeNumData);
      setDeviceNumArr(deviceNumArrData);
      if (Object.keys(presetImageDescMap)) {
        setEngineTip(presetImageDescMap[engineNameArrData[0]]);
      }
      renderInitRegularForm(deviceNumArrData[0]);
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
    }
  };

  useEffect(() => {
    fetchUserDockerImages();
  }, []);

  const renderInitRegularForm = (deviceNum) => {
    setFieldsValue({ deviceNum: deviceNum });
  };

  const renderInitPSDistJobForm = (numPsWorker, deviceNum) => {
    setFieldsValue({ numPsWorker, deviceNum });
  };


  const apiPostCode = async (values) => {
    const obj = await postCode1({ ...values, vcName: currentSelectedVC });
    const { code, data, msg } = obj;
    if (code === 0) {
      message.success(formatMessage({ id: 'codeCreate.tips.submit.success' }));
      history.push('/codeDevelopment');
    }
  };
  const apiGetResource = async () => {
    const obj = await fetchAvilableResource(currentSelectedVC);
    const { code, data, msg } = obj;
    if (code === 0) {
      return data;
    } else {
      return null;
    }
  };

  const handleSubmit = async () => {
    // todo 提取数据映射
    const values = await validateFields();
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
    values.codePath = algorithmSource === 1 ? (codePathPrefix + values.codePath) : undefined;
    values.private = [1, 2].includes(engineSource);
    setSubmitButtonLoading(true);
    const currentVCAvailDevice = deviceList.find(val => val.deviceType === values.deviceType);
    let needConfirm = false;
    if (currentVCAvailDevice) {
      const currentAvail = currentVCAvailDevice.avail;
      const deviceNum = values.deviceNum;
      if (deviceNum > currentAvail) {
        needConfirm = true;
      }
    }
    if (values.jobTrainingType === 'PSDistJob') {
      values.numPs = 1;
    }
    delete values.deviceTotal;
    if (
      !beforeSubmitJob(
        values.jobTrainingType === 'PSDistJob',
        values.deviceType,
        values.deviceNum,
        { nodeNum: values.numPsWorker },
      ) || needConfirm
    ) {
      Modal.confirm({
        title: formatMessage({ id: 'codeCreate.modal.noDevice.title' }),
        content: formatMessage({ id: 'codeCreate.modal.noDevice.content' }),
        async onOk() {
          await apiPostCode(values);
          setSubmitButtonLoading(false);
        },
        onCancel() {
          setSubmitButtonLoading(false);
        },
      });
    } else {
      await apiPostCode(values);
      setSubmitButtonLoading(false);
    }
  };

  useEffect(() => {
    const deviceType = getFieldValue('deviceType');
    if (deviceType) {
      let arr = [];
      if (jobTrainingType === 'RegularJob') {
        arr = getAvailRegularDeviceNumber(deviceType, deviceList.find(val => val.deviceType === deviceType).userQuota);
        setFieldsValue({ deviceNum: arr[0] });
        setDeviceNumArr(arr);
      } else if (jobTrainingType === 'PSDistJob') {
        arr = getAvailPSDDeviceNumber(deviceType, deviceList.find(val => val.deviceType === deviceType).userQuota, getFieldValue('numPsWorker'));
        setDeviceNumPerNodeArr(arr);
      }
    }
  }, [jobTrainingType, currentDeviceType, nodeNum])

  useEffect(() => {
    if (engineSource === 1) {
      const deviceType = getFieldValue('deviceType');
      if (!deviceType) return;
      const currentDeviceEngine = deviceForImages[deviceType];
      let tempEngineList = [];
      if (isHyperparamImage) {
        tempEngineList = arrayCommon(currentDeviceEngine, presetImages.hyperparameters);
      } else {
        tempEngineList = arrayCommon(currentDeviceEngine, presetImages.normal);
      }
      if (!tempEngineList.includes(getFieldValue('engine'))) {
        setFieldsValue({
          engine: tempEngineList[0] || undefined,
        });
      }
    }
  }, [currentDeviceType])

  const onEngineChange = (engine) => {
    const engineTip = presetImageDescMap[engine] || '';
    if (engineSource === 1) {
      Object.keys(deviceForImages).forEach(device => {
        if (deviceForImages[device].includes(engine)) {
          setFieldsValue({
            deviceType: device || undefined,
          })
        }
      })
    }
    setEngineTip(engineTip);
  }
  const handleCalcTotalDeviceNum = (nodeNum, deviceNum) => {
    setFieldsValue({ deviceTotal: ((nodeNum || getFieldValue('numPsWorker')) || 0) * (deviceNum || 0) });
    setNodeNum(nodeNum);
  };

  const validateMessages = {
    required: '${label} ' + formatMessage({ id: 'codeCreate.rule.needInput' }),
    types: {},
  };

  const formItemLayout = {
    labelCol: {
      span: 4,
    },
    wrapperCol: {
      span: 12,
    },
  };

  const buttonItemLayout = {
    wrapperCol: {
      span: 2,
      offset: 22,
    },
  };

  useEffect(() => {
    // 初始化处理
    renderInitForm().then(() => {
      getImageDescMap();
    });
  }, []); // 更新处理

  useEffect(() => {
    setIsHyperparamImage(false);
    if (engineSource === 2) {
      if (userFrameWorks.length) {
        setFieldsValue({
          engine: userFrameWorks[0].fullName || '',
        });
      } else {
        setFieldsValue({
          engine: '',
        });
      }
    } else if (engineSource === 1) {
      setFieldsValue({
        engine: engineNameArr[0] || '',
      });
    } else if (engineSource === 3) {
      //
    }
  }, [engineSource]);

  useEffect(() => {
    if (isHyperparamImage) {
      setEngineTip(presetImageDescMap[presetImages.hyperparameters[0]] || '');
    } else {
      setEngineTip(presetImageDescMap[presetImages.normal[0]] || '');
    }
  }, [isHyperparamImage]);
  useEffect(() => {
    if (jobTrainingType === 'RegularJob') {
      renderInitRegularForm(deviceNumArr[0] || undefined);
    } else if (jobTrainingType === 'PSDistJob') {
      handleCalcTotalDeviceNum(1, deviceNumPerNodeArr[0] || 0);
      renderInitPSDistJobForm(1, deviceNumPerNodeArr[0] || undefined);
    }
  }, [jobTrainingType]);

  const disablePrivileged = !props.common.enablePrivileged;
  const noPrivilegedJobPermission = !(props.currentUser.permissionList.includes('SUBMIT_PRIVILEGE_JOB'));
  
  let currentAvailPresetImage = [];
  if (isHyperparamImage) {
    currentAvailPresetImage = presetImages.hyperparameters;
  } else {
    currentAvailPresetImage = presetImages.normal;
  }

  const handleNumPsWorkerChange = () => {

  }

  useEffect(() => {
    if (engineSource === 1) {
      setFieldsValue({
        engine: currentAvailPresetImage[0] || undefined,
      });
    }
  }, [isHyperparamImage])
  return (
    <>
      <PageHeader
        ghost={false}
        onBack={() => history.push('/codeDevelopment')}
        title={formatMessage({ id: 'codeCreate.pageHeader.backCodeCreate' })}
      />
      <Card>
        <Form
          {...formItemLayout}
          labelAlign="right"
          onFinish={handleSubmit}
          validateMessages={validateMessages}
          initialValues={{ jobTrainingType: 'RegularJob' }}
          form={form}
          style={{ minWidth: '880px', overflow: 'auto' }}
        >
          <Form.Item
            label={formatMessage({ id: 'codeCreate.label.devEnvName' })}
            name="name"
            rules={[{ required: true }, jobNameReg]}
          >
            <Input placeholder={formatMessage({ id: 'codeCreate.placeholder.devEnvName' })} />
          </Form.Item>
          <Form.Item label={formatMessage({ id: 'codeCreate.label.description' })} name="desc">
            <TextArea
              placeholder={formatMessage({ id: 'codeCreate.placeholder.description' })}
              autoSize={{ minRows: 2, maxRows: 6 }}
              maxLength={256}
            />
          </Form.Item>
          {/* <Form.Item
            label={formatMessage({ id: 'modelTraing.submit.algorithmSource' })}
          >
            <Radio.Group defaultValue={1} buttonStyle="solid" onChange={(e) => setAlgorithmSource(e.target.value)}>
              <Radio.Button value={1}>
                {formatMessage({ id: 'modelTraing.submit.classicMode' })}
              </Radio.Button>
              <Radio.Button
                value={2}
              >
                {formatMessage({ id: 'modelTraing.submit.commandLineMode' })}
              </Radio.Button>
            </Radio.Group>

          </Form.Item> */}
          {
            algorithmSource === 1 && <Form.Item
              label={formatMessage({ id: 'codeCreate.label.storePath' })}
              name="codePath"
              rules={[{ required: true }]}
            >
              <Input
                addonBefore={codePathPrefix}
                placeholder={formatMessage({ id: 'codeCreate.placeholder.storePath' })}
              />
            </Form.Item>
          }

          {
            algorithmSource === 2 && <Form.Item
              label={formatMessage({ id: 'modelTraing.submit.commandLine' })}
              preserve={false}
              name="cmd"
              rules={[{
                required: true,
              }]}
            >
              <TextArea
                style={{ width: '500px', fontFamily: 'Consolas,Monaco,Lucida Console,Liberation Mono,DejaVu Sans Mono,Bitstream Vera Sans Mono,Courier New, monospace' }}
                rows={4}
              />
            </Form.Item>
          }
          <Form.Item
            label={formatMessage({ id: 'codeCreate.label.engineSource' })}
            style={{ height: '32px' }}
            {...formItemLayout}
            required
          >
            <Form.Item
              style={{ display: 'inline-block' }} 
              >
              <Radio.Group
                value={engineSource}
                onChange={(e) => {
                  setEngineSource(e.target.value);
                }}
              >
                <Radio value={1}>{formatMessage({ id: 'codeCreate.value.presetEngine' })}</Radio>
                <Radio value={2}>{formatMessage({ id: 'codeCreate.value.savedEngine' })}</Radio>
                <Radio value={3}>
                  <Tooltip title={formatMessage({ id: 'codeCreate.custom.engine.title' })}>
                    {formatMessage({ id: 'codeCreate.custom.engine' })}
                  </Tooltip>
                </Radio>
              </Radio.Group>
            </Form.Item>
            {
              engineSource === 1 && <Form.Item style={{ display: 'inline-block', width: '100px', marginLeft: '30px' }}>
                <Popover
                  content={<div>{formatMessage({ id: 'codeCreate.label.hyperparam' })}</div>}
                  visible={engineSource === 1}
                  placement="topLeft"
                >
                  <Switch value={isHyperparamImage} onChange={(checked) => setIsHyperparamImage(checked)} />
                </Popover>
              </Form.Item>
            }
          </Form.Item>
          {(engineSource === 1) && (
            <Form.Item
              label={formatMessage({ id: 'codeCreate.label.engineType' })}
              style={{ height: '32px' }}
              required
            >
              <Form.Item
                name="engine"
                rules={[
                  {
                    required: true,
                    message: formatMessage({ id: 'codeCreate.rule.selectEngineName' }),
                  },
                ]}
                style={{ display: 'inline-block', width: 'calc(70%)' }}
                preserve={false}
              >
                <Select
                  onChange={onEngineChange}
                >
                  {currentAvailPresetImage.map((engine) => (
                    <Option key={engine} value={engine}>
                      <Tooltip title={presetImageDescMap[engine]}>
                        {getNameFromDockerImage(engine)}
                      </Tooltip>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                style={{ display: 'inline-block', width: '10px', height: '0' }}
              >
                <div>
                  <Popover content={engineTip} placement="right" visible={!!engineTip}><div>{null}</div></Popover>
                </div>
              </Form.Item>
            </Form.Item>
          )}

          {engineSource === 2 && (
            <Form.Item
              name="engine"
              label={formatMessage({ id: 'codeCreate.label.engineType' })}
              preserve={false}
              rules={[
                {
                  required: true,
                  message: formatMessage({ id: 'codeCreate.rule.selectEngineName' }),
                },
              ]}
            >
              <Select showSearch>
                {userFrameWorks.map((item, key) => (
                  <Option key={item.id} value={item.fullName}>
                    {getNameFromDockerImage(item.fullName)}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          )}
          {engineSource === 3 && (
            <Form.Item
              name="engine"
              label={formatMessage({ id: 'codeCreate.label.engineType' })}
              preserve={false}
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <Input placeholder={formatMessage({ id: 'codeCreate.input.placeholder.engine' })} />
            </Form.Item>
          )}

          <Form.Item
            label={formatMessage({ id: 'codeCreate.label.jobType' })}
            name="jobTrainingType"
            rules={[{ required: true }]}
          >
            <Radio.Group onChange={(e) => setJobTrainingType(e.target.value)}>
              <Radio value="RegularJob">
                {formatMessage({ id: 'codeCreate.value.regularJob' })}
              </Radio>
              <Radio value="PSDistJob">
                {formatMessage({ id: 'codeCreate.value.PSDistJob' })}
              </Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item
            label={formatMessage({ id: 'codeCreate.label.deviceType' })}
            name="deviceType"
            rules={[{ required: true }]}
          >
            <Select style={{ width: '50%' }} onChange={(type) => setCurrentDeviceType(type)}>
              {deviceTypeArr.map((item, index) => (
                <Option key={index} value={item} index={index}>
                  {item}
                </Option>
              ))}
            </Select>
          </Form.Item>
          {jobTrainingType === 'RegularJob' && (
            <Form.Item
              label={formatMessage({ id: 'codeCreate.label.deviceNum' })}
              name="deviceNum"
              rules={[{ required: true }]}
            >
              <Select style={{ width: '50%' }}>
                {deviceNumArr.map((item, key) => (
                  <Option key={key} value={item}>
                    {item}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          )}
          {jobTrainingType === 'PSDistJob' && (
            <Form.Item
              label={formatMessage({ id: 'codeCreate.label.nodeNum' })}
              name="numPsWorker"
              rules={[{ required: true }]}
              initialValue={1}
            >
              <InputNumber
                style={{ width: '50%' }}
                min={1}
                max={maxNodeNum}
                placeholder={formatMessage({ id: 'codeCreate.placeholder.nodeNum' })}
                onChange={(nodeNum) =>
                  handleCalcTotalDeviceNum(nodeNum, getFieldValue('deviceNum'))
                }
              />
            </Form.Item>
          )}
          {jobTrainingType === 'PSDistJob' && (
            <Form.Item
              label={formatMessage({ id: 'codeCreate.label.perNodeNum' })}
              name="deviceNum"
              rules={[{ required: true }]}
            >
              <Select
                style={{ width: '50%' }}
                onChange={(deviceNum) => {
                  handleCalcTotalDeviceNum(getFieldValue('numPsWorker'), deviceNum)
                }}
              >
                {deviceNumPerNodeArr.map((item, key) => (
                  <Option key={key} value={item}>
                    {item}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          )}
          {jobTrainingType === 'PSDistJob' && (
            <Form.Item
              label={formatMessage({ id: 'codeCreate.label.totalDeviceNum' })}
              name="deviceTotal"
            >
              <Input style={{ width: '50%' }} disabled />
            </Form.Item>
          )}
          <Form.Item
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
              label={formatMessage({ id: 'ManagePrivilegeJob.bypassCode.label' })}
              name="bypassCode"
              rules={[
                { required: true }
              ]}
            >
              <Input style={{ width: '200px' }} />
            </Form.Item>
          }

          <Form.Item {...buttonItemLayout}>
            <Button type="primary" htmlType="submit" loading={submitButtonLoading}>
              {formatMessage({ id: 'codeCreate.submit' })}
            </Button>
          </Form.Item>

        </Form>
      </Card>
    </>
  );
};

export default connect(({ resource, vc, common, user }) => ({
  devices: resource.devices,
  vc,
  common,
  currentUser: user.currentUser
}))(CodeCreate);
