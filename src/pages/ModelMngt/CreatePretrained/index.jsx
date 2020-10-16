import { Link, history } from 'umi';
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
  Upload,
  Divider,
  Tabs,
  Col,
  Row,
} from 'antd';
import React, { useState, useEffect, useRef } from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { connect } from 'umi';
import { formatDate } from '@/utils/time';
import { PlusSquareOutlined, PauseOutlined, DeleteOutlined } from '@ant-design/icons';
import ModalForm from './components/ModalForm';
import { addModel } from '../ModelList/services';
import { fetchAvilableResource } from '@/services/modelTraning';
import { jobNameReg, getNameFromDockerImage } from '@/utils/reg';
import { fetchPresetTemplates } from './services';
import { generateKey } from '@/pages/ModelTraining/Submit';
import { formatParams } from '@/utils/utils';
import { getAllLabeledDatasets } from '@/pages/ModelMngt/ModelEvaluation/services';
import styles from '@/pages/ModelTraining/index.less';
import { useIntl } from 'umi';

const { TextArea } = Input;
const { Dragger } = Upload;
const { Option } = Select;
const { TabPane } = Tabs;

const CreatePretrained = (props) => {
  const intl = useIntl();
  const [codePathPrefix, setCodePathPrefix] = useState('');
  const [visible, setVisible] = useState(false);
  const [form] = Form.useForm();
  const [form2] = Form.useForm();
  const { validateFields, getFieldValue, setFieldsValue } = form;
  // const [sourceType, setSourceType] = useState(1);
  const [btnDisabled, setBtnDisabled] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [runningParams, setRunningParams] = useState([
    { key: '', value: '', createTime: generateKey() },
  ]);
  const [presetParamsVisible, setPresetParamsVisible] = useState(false);
  const [presetRunningParams, setPresetRunningParams] = useState([]);
  const [currentSelectedPresetParamsId, setCurrentSelectedPresetParamsId] = useState('');
  const [datasets, setDatasets] = useState([]);

  const usages = [
    {
      key: 'ImageClassification',
      label: intl.formatMessage({ id: 'createPretrained.imageClassification' }),
    },
    {
      key: 'ObjectDetection',
      label: intl.formatMessage({ id: 'createPretrained.objectDetection' }),
    },
  ];

  const engineTypes = [
    { key: '1', label: 'tensorflow , tf-1.8.0-py2.7' },
    { key: '2', label: 'tensorflow , tf-1.8.0-py2.7' },
  ];

  useEffect(() => {
    // getAvailableResource();
    getTestDatasets();
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

  const getTestDatasets = async () => {
    const { code, data, msg } = await getAllLabeledDatasets();
    if (code === 0 && data) {
      const { datasets } = data;
      setDatasets(datasets);
    } else {
      message.error(msg);
    }
  };

  const getAvailableResource = async () => {
    const res = await fetchAvilableResource();
    if (res.code === 0) {
      let {
        data: { codePathPrefix },
      } = res;
      if (!/\/$/.test(codePathPrefix)) {
        codePathPrefix = codePathPrefix + '/';
      }

      setCodePathPrefix(codePathPrefix);
    }
  };

  const selectTrainingJob = () => {};

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
        callback(intl.formatMessage({ id: 'createPretrained.inputLimitEqualParamName' }));
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
      params: newRunningParams.map((params) => ({ key: params.key, value: params.value })),
    });
  };

  const handleConfirmPresetParams = () => {
    const currentSelected = presetRunningParams.find(
      (p) => p.metaData.id == currentSelectedPresetParamsId,
    );

    if (currentSelected) {
      // 防止name被覆盖
      if (currentSelected.params.name) {
        delete currentSelected.params.name;
      }

      setFieldsValue({
        ...currentSelected.params,
      });
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
    }
    setPresetParamsVisible(false);
  };

  const handleSelectPresetParams = (current) => {
    // console.log(current);
    setCurrentSelectedPresetParamsId(current);
  };

  const handleDatasetChange = (value, option) => {
    // setDatasetName(option.children);
    setFieldsValue({ datasetPath: option.key });
  };

  const onFinish = async (values) => {
    // console.log(values);
    let params = {};
    values.params &&
      values.params.forEach((p) => {
        params[p.key] = p.value;
      });
    const {
      name,
      use,
      engine,
      precision,
      size,
      datasetName,
      datasetPath,
      dataFormat,
      codePath,
      startupFile,
      outputPath,
      paramPath,
    } = values;
    const data = {
      name,
      use,
      engine,
      precision,
      size: parseInt(size),
      datasetName,
      datasetPath,
      params,
      dataFormat,
      codePath,
      startupFile,
      outputPath,
      paramPath,
      isAdvance: true,
    };

    const { code, msg } = await addModel(data);

    if (code === 0) {
      message.success(`${intl.formatMessage({ id: 'createPretrained.create.success' })}`);
      history.push('/model-training/PretrainedModels');
    } else {
      msg && message.error(`${intl.formatMessage({ id: 'createPretrained.create.error' })}${msg}`);
    }
  };

  const showJobModal = () => {
    setVisible(true);
    // setCurrent(item);
  };

  const onReset = () => {
    form.resetFields();
  };

  const handleCancel = () => {
    setVisible(false);
  };

  const handleSubmit = (item) => {
    // console.log(item)
    form.setFieldsValue({ job: item.name });
    setVisible(false);
  };

  const uploadProps = {
    name: 'data',
    multiple: false,
    action: '/ai_arts/api/files/upload/dataset',
    headers: {
      Authorization: 'Bearer ' + window.localStorage.token,
    },
    onChange(info) {
      const { status } = info.file;
      setBtnDisabled(true);
      if (status !== 'uploading') {
        console.log(info.file, info.fileList);
      }
      if (status === 'done') {
        setFileList(info.fileList);
        setBtnDisabled(false);
        message.success(
          `${info.file.name}${intl.formatMessage({ id: 'createPretrained.upload.success' })}`,
        );
      } else if (status === 'error') {
        message.error(
          `${info.file.name} ${intl.formatMessage({ id: 'createPretrained.upload.error' })}`,
        );
        setBtnDisabled(false);
      }
    },
    beforeUpload(file) {
      const { type, size } = file;
      const isOverSize = size / 1024 / 1024 / 1024 > 2;
      return new Promise((resolve, reject) => {
        if (
          !fileList.length &&
          (type === 'application/x-zip-compressed' ||
            type === 'application/x-tar' ||
            type === 'application/x-gzip') &&
          !isOverSize
        ) {
          resolve(file);
        } else {
          let text = '';
          text = isOverSize
            ? intl.formatMessage({ id: 'createPretrained.fileSizeLimit2GB' })
            : `${
                fileList.length
                  ? intl.formatMessage({ id: 'createPretrained.oneFile' })
                  : intl.formatMessage({ id: 'createPretrained.upload.tips.desc' })
              }`;
          message.warning(
            `${intl.formatMessage({ id: 'createPretrained.upload.support' })} ${text}！`,
          );
          reject(file);
        }
      });
    },
    onRemove(file) {
      if (fileList.length && file.uid === fileList[0].uid) setFileList([]);
    },
  };

  const layout = {
    labelCol: { span: 3 },
    wrapperCol: { span: 14 },
  };

  return (
    <>
      <PageHeader
        ghost={false}
        onBack={() => history.push('/model-training/PretrainedModels')}
        title={intl.formatMessage({ id: 'createPretrained.inputPresetModel' })}
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
            initialValues={{
              dataFormat: 'tfrecord',
              engine: 'apulistech/tensorflow:1.14.0-gpu-py3',
              precision: '0.99',
              size: '',
              use: intl.formatMessage({ id: 'createPretrained.imageClassification' }),
              size: 80 * 1024 * 1024,
            }}
          >
            <Form.Item
              {...layout}
              name="name"
              label={intl.formatMessage({ id: 'createPretrained.label.modelName' })}
              rules={[
                {
                  required: true,
                  message: intl.formatMessage({ id: 'createPretrained.rule.needModelName' }),
                },
                { ...jobNameReg },
              ]}
            >
              <Input
                placeholder={intl.formatMessage({
                  id: 'createPretrained.placeholder.inputModelName',
                })}
              />
            </Form.Item>
            <Form.Item
              {...layout}
              name="use"
              label={intl.formatMessage({ id: 'createPretrained.label.modelUseful' })}
              rules={[
                {
                  required: true,
                  message: intl.formatMessage({ id: 'createPretrained.rule.needModelUseful' }),
                },
              ]}
            >
              {/* <Select>
                {
                  usages.map(u => (
                    <Option key={u.key} value={u.key}>{u.label}</Option>
                  ))
                }
              </Select> */}
              <Input
                placeholder={intl.formatMessage({
                  id: 'createPretrained.placeholder.inputModelUse',
                })}
              />
            </Form.Item>
            <Divider style={{ borderColor: '#cdcdcd' }} />
            <Form.Item
              {...layout}
              label={intl.formatMessage({ id: 'createPretrained.label.paramsSource' })}
            >
              <Radio.Group defaultValue={1} buttonStyle="solid">
                <Radio.Button value={1}>
                  {intl.formatMessage({ id: 'createPretrained.value.conifg' })}
                </Radio.Button>
                <Radio.Button
                  value={2}
                  onClick={() => {
                    setPresetParamsVisible(true);
                  }}
                >
                  {intl.formatMessage({ id: 'createPretrained.value.importParams' })}
                </Radio.Button>
              </Radio.Group>
            </Form.Item>
            <Form.Item
              {...layout}
              label={intl.formatMessage({ id: 'createPretrained.label.engineType' })}
              name="engine"
              // rules={[{ required: true, message: '请选择引擎类型' }]}
              rules={[
                {
                  required: true,
                  message: intl.formatMessage({ id: 'createPretrained.rule.needEngineType' }),
                },
              ]}
            >
              {/* <Select>
                {
                  engineTypes.map(type => (
                    <Option key={type.key} value={type.key}>{type.label}</Option>
                  ))
                }
              </Select> */}
              <Input
                placeholder={intl.formatMessage({
                  id: 'createPretrained.placeholder.inputEngineType',
                })}
              />
            </Form.Item>
            <Form.Item
              {...layout}
              name="precision"
              label={intl.formatMessage({ id: 'createPretrained.label.precision' })}
              rules={[
                {
                  required: true,
                  message: intl.formatMessage({ id: 'createPretrained.rule.needPrecision' }),
                },
              ]}
            >
              <Input
                placeholder={intl.formatMessage({
                  id: 'createPretrained.placeholder.inputPrecision',
                })}
              />
            </Form.Item>
            <Form.Item
              {...layout}
              name="size"
              label={intl.formatMessage({ id: 'createPretrained.label.modelSize' })}
              rules={[
                {
                  required: true,
                  message: intl.formatMessage({ id: 'createPretrained.rule.needModelSize' }),
                },
              ]}
            >
              <Input
                placeholder={intl.formatMessage({
                  id: 'createPretrained.placeholder.inputModelSize',
                })}
              />
            </Form.Item>
            <Form.Item
              {...layout}
              name="datasetName"
              label={intl.formatMessage({ id: 'createPretrained.label.dataSetName' })}
              rules={[
                {
                  required: true,
                  message: intl.formatMessage({ id: 'createPretrained.rule.needDataSetName' }),
                },
              ]}
            >
              {/* <Input placeholder="请输入数据集名称" /> */}
              <Select onChange={handleDatasetChange}>
                {datasets.map((d) => (
                  <Option key={d.path} value={d.name}>
                    {d.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              {...layout}
              name="datasetPath"
              label={intl.formatMessage({ id: 'createPretrained.label.dataSetPath' })}
              rules={[
                {
                  required: true,
                  message: intl.formatMessage({ id: 'createPretrained.rule.needDataSetPath' }),
                },
              ]}
            >
              <Input
                placeholder={intl.formatMessage({
                  id: 'createPretrained.placeholder.inputDataSetPath',
                })}
              />
            </Form.Item>
            <Form.Item
              {...layout}
              name="dataFormat"
              label={intl.formatMessage({ id: 'createPretrained.label.dataSetFormat' })}
              rules={[
                {
                  required: true,
                  message: intl.formatMessage({ id: 'createPretrained.rule.needDataSetFormat' }),
                },
              ]}
            >
              <Input
                placeholder={intl.formatMessage({
                  id: 'createPretrained.placeholder.inputDataSetFormat',
                })}
              />
            </Form.Item>
            {/* <Form.Item
              {...layout}
              name="modelPath"
              label="模型路径"
              rules={[{ required: true, message: '模型路径不能为空!' }]}
            >
              <Input placeholder="请输入模型路径" />
            </Form.Item>                      */}
            {/* <Form.Item
              {...layout}
              name="modelArgumentPath"
              label="模型权重文件"
              rules={[{ required: true, message: '模型权重文件不能为空!' }]}
            >
              <Input placeholder="请输入模型权重文件路径" />
            </Form.Item>                      */}
            <Form.Item
              {...layout}
              name="codePath"
              label={intl.formatMessage({ id: 'createPretrained.label.codePath' })}
              rules={[
                {
                  required: true,
                  message: intl.formatMessage({ id: 'createPretrained.rule.needCodePath' }),
                },
              ]}
            >
              <Input
                placeholder={intl.formatMessage({
                  id: 'createPretrained.placeholder.inputCodePath',
                })}
              />
            </Form.Item>
            <Form.Item
              {...layout}
              name="startupFile"
              label={intl.formatMessage({ id: 'createPretrained.label.startupFile' })}
              rules={[
                {
                  required: true,
                  message: intl.formatMessage({ id: 'createPretrained.rule.needStartupFile' }),
                },
              ]}
            >
              <Input
                placeholder={intl.formatMessage({
                  id: 'createPretrained.placeholder.inputStartupFile',
                })}
              />
            </Form.Item>
            <Form.Item
              {...layout}
              name="outputPath"
              label={intl.formatMessage({ id: 'createPretrained.label.outputPath' })}
              rules={[
                {
                  required: true,
                  message: intl.formatMessage({ id: 'createPretrained.rule.needOutputPath' }),
                },
              ]}
            >
              <Input
                placeholder={intl.formatMessage({
                  id: 'createPretrained.placeholder.inputOutputPath',
                })}
              />
            </Form.Item>
            <Form.Item
              {...layout}
              name="paramPath"
              label={intl.formatMessage({ id: 'createPretrained.label.modelParamPath' })}
              rules={[
                {
                  required: true,
                  message: intl.formatMessage({ id: 'createPretrained.rule.needModelParamPath' }),
                },
              ]}
            >
              <Input
                placeholder={intl.formatMessage({
                  id: 'createPretrained.placeholder.inputModelParamPath',
                })}
              />
            </Form.Item>
            <Form.Item
              // {...layout}
              label={intl.formatMessage({ id: 'createPretrained.label.runningParam' })}
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
                <a>{intl.formatMessage({ id: 'createPretrained.clickAddParam' })}</a>
              </div>
            </Form.Item>
            <Form.Item style={{ float: 'right' }}>
              <Button type="primary" htmlType="submit" disabled={btnDisabled}>
                {intl.formatMessage({ id: 'createPretrained.Submit' })}
              </Button>
            </Form.Item>
          </Form>
        </div>
      </PageHeader>
      <Modal
        visible={presetParamsVisible}
        onCancel={() => setPresetParamsVisible(false)}
        onOk={handleConfirmPresetParams}
        title={intl.formatMessage({ id: 'createPretrained.importEvaluationParam' })}
        forceRender
        width="80%"
      >
        <Form form={form2}>
          {presetRunningParams.length > 0 ? (
            <Tabs
              defaultActiveKey={presetRunningParams[0].metaData?.id}
              tabPosition="left"
              onChange={handleSelectPresetParams}
              style={{ height: 220 }}
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
                      {intl.formatMessage({ id: 'createPretrained.tab.startUpFile' })}
                    </Col>
                    <Col span={19}>{p.params.startupFile}</Col>
                  </Row>
                  <Row>
                    <Col span={5}>
                      {intl.formatMessage({ id: 'createPretrained.tab.codePath' })}
                    </Col>
                    <Col span={19}>{p.params.codePath}</Col>
                  </Row>
                  <Row>
                    <Col span={5}>
                      {intl.formatMessage({ id: 'createPretrained.tab.trainingDataSet' })}
                    </Col>
                    <Col span={19}>{p.params.datasetPath}</Col>
                  </Row>
                  <Row>
                    <Col span={5}>
                      {intl.formatMessage({ id: 'createPretrained.tab.outputPath' })}
                    </Col>
                    <Col span={19}>{p.params.outputPath}</Col>
                  </Row>
                  <Row>
                    <Col span={5}>
                      {intl.formatMessage({ id: 'createPretrained.tab.runningPath' })}
                    </Col>
                    <Col span={19}>
                      {p.params.params && formatParams(p.params.params).map((p) => <div>{p}</div>)}
                    </Col>
                  </Row>
                  <Row>
                    <Col span={5}>
                      {intl.formatMessage({ id: 'createPretrained.tab.computeNodeSpecification' })}
                    </Col>
                    <Col span={19}>{p.params.deviceType}</Col>
                  </Row>
                  <Row>
                    <Col span={5}>
                      {intl.formatMessage({ id: 'createPretrained.tab.engineType' })}
                    </Col>
                    <Col span={19}>{getNameFromDockerImage(p.params.engine)}</Col>
                  </Row>
                </TabPane>
              ))}
            </Tabs>
          ) : (
            <div>{intl.formatMessage({ id: 'createPretrained.tab.noData' })}</div>
          )}
        </Form>
      </Modal>
    </>
  );
};

export default CreatePretrained;
