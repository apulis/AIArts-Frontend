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

  const { currentSelectedVC } = props.vc;

  const getImageDescMap = async () => {
    const res = await getImages();
    const { code, data } = res;
    const obj = {};
    if (code === 0) {
      data.forEach((item) => {
        obj[item.image] = item.desc;
      });
      setPresetImageDescMap(obj);
    }
  }

  useEffect(() => {
    getImageDescMap();
  }, [])

  const renderInitForm = async () => {
    const result = await apiGetResource();
    if (result) {
      setResource(result);
      const engineNameArrData = Object.keys(result.aiFrameworks || {}).reduce((temp, frameworkName) => {
        return temp.concat((result.aiFrameworks || {})[frameworkName])
      }, []);
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
      setFieldsValue({
        engine: engineNameArrData[0],
        deviceType: deviceTypeArrData[0],
      });
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

  const renderInitPSDistJobForm = (numPs, numPsWorker, deviceNum) => {
    setFieldsValue({ numPs, numPsWorker, deviceNum });
  };

  const apiPostCode = async (values) => {
    const obj = await postCode1({ ...values, vcName: currentSelectedVC  });
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
      values.frameworkType = values.engineType;
    } else if (engineSource === 2) {
      const f = userFrameWorks.find(val => val.fullName === values.engine);
      if (f) {
        values.frameworkType = f.frameworkType;
      }
    }
    delete values.engineType;
    values.codePath = algorithmSource === 1 ? (codePathPrefix + values.codePath) : undefined;
    values.private = [1, 2].includes(engineSource);
    setSubmitButtonLoading(true);
    const currentVCAvailDevice = deviceList.find(val => val.deviceType === values.deviceType);
    let needConfirm = false;
    if (currentVCAvailDevice) {
      const currentAvail = currentVCAvailDevice.avail;
      const deviceNum = values.jobTrainingType === 'PSDistJob' ? values.numPsWorker : values.deviceNum;
      if (deviceNum > currentAvail) {
        needConfirm = true;
      }
    }
    if (
      !beforeSubmitJob(
        values.jobTrainingType === 'PSDistJob',
        values.deviceType,
        values.jobTrainingType === 'PSDistJob' ? values.numPsWorker : values.deviceNum,
        { nodeNum: values.numPs },
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
        arr = getAvailPSDDeviceNumber(deviceType, deviceList.find(val => val.deviceType === deviceType).userQuota, getFieldValue('numPs'));
        setDeviceNumPerNodeArr(arr);
        setTimeout(() => {
          setFieldsValue({ numPsWorker: arr[0] });
        }, 0);
      }
    }
  }, [jobTrainingType, currentDeviceType])

  const handleCaclTotalDeviceNum = (nodeNum, perNodeDeviceNum) => {
    setFieldsValue({ deviceNum: nodeNum * perNodeDeviceNum });
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
    renderInitForm();
  }, []); // 更新处理

  useEffect(() => {
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
    // 初始化处理deviceNum
    if (jobTrainingType == 'RegularJob') {
      renderInitRegularForm(deviceNumArr[0]);
    } else if (jobTrainingType == 'PSDistJob') {
      renderInitPSDistJobForm(1, deviceNumPerNodeArr[0], deviceNumPerNodeArr[0] * 1);
    }
  }, [jobTrainingType]); // 更新处理
  const disablePrivileged = !props.common.enablePrivileged || (!props.currentUser.permissionList.includes('SUBMIT_PRIVILEGE_JOB'));
  return (
    <>
      <PageHeader
        ghost={false}
        onBack={() => history.push('/codeDevelopment')}
        title={formatMessage({ id: 'codeCreate.pageHeader.backCodeCreate' })}
      ></PageHeader>
      <Card>
        <Form
          {...formItemLayout}
          labelAlign="right"
          onFinish={handleSubmit}
          validateMessages={validateMessages}
          initialValues={{ jobTrainingType: 'RegularJob' }}
          form={form}
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
          <Form.Item label={formatMessage({ id: 'codeCreate.label.engineSource' })}>
            <Radio.Group
              value={engineSource}
              onChange={(e) => {
                setEngineSource(e.target.value);
              }}
              style={{ width: '420px' }}
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
          {engineSource === 1 && (
            <Form.Item label={formatMessage({ id: 'codeCreate.label.engineType' })} required>
              <Form.Item
                name="engine"
                rules={[
                  {
                    required: true,
                    message: formatMessage({ id: 'codeCreate.rule.selectEngineName' }),
                  },
                ]}
                preserve={false}
                style={{ display: 'inline-block', width: 'calc(50%)', margin: '0 0 0 8px' }}
              >
                <Select>
                  {engineNameArr.map((engine) => (
                    <Option key={engine} value={engine}>
                      <Tooltip title={presetImageDescMap[engine]}>
                        {getNameFromDockerImage(engine)}
                      </Tooltip>
                    </Option>
                  ))}
                </Select>
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
          {jobTrainingType == 'RegularJob' && (
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
          {jobTrainingType == 'PSDistJob' && (
            <Form.Item
              label={formatMessage({ id: 'codeCreate.label.nodeNum' })}
              name="numPs"
              rules={[{ required: true }]}
            >
              <InputNumber
                style={{ width: '50%' }}
                min={1}
                max={maxNodeNum}
                placeholder={formatMessage({ id: 'codeCreate.placeholder.nodeNum' })}
                onChange={() =>
                  handleCaclTotalDeviceNum(getFieldValue('numPs'), getFieldValue('numPsWorker'))
                }
              ></InputNumber>
            </Form.Item>
          )}
          {jobTrainingType == 'PSDistJob' && (
            <Form.Item
              label={formatMessage({ id: 'codeCreate.label.perNodeNum' })}
              name="numPsWorker"
              rules={[{ required: true }]}
            >
              <Select
                style={{ width: '50%' }}
                onChange={() =>
                  handleCaclTotalDeviceNum(getFieldValue('numPs'), getFieldValue('numPsWorker'))
                }
              >
                {deviceNumPerNodeArr.map((item, key) => (
                  <Option key={key} value={item}>
                    {item}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          )}
          {jobTrainingType == 'PSDistJob' && (
            <Form.Item
              label={formatMessage({ id: 'codeCreate.label.totalDeviceNum' })}
              name="deviceNum"
            >
              <Input style={{ width: '50%' }} disabled></Input>
            </Form.Item>
          )}
          <Form.Item
            label={
              !disablePrivileged ? 
                <div>使用 Privilege Job</div>
                :
                <Tooltip title="目前没有开启 Privilege， 如有需要请联系管理员">
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
            iSPrivileged && <Form.Item
            label="校验码"
            name="bypassCode"
            rules={[
              { required: true }
            ]}
          >
            <Input style={{ width: '200px' }}/>
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
