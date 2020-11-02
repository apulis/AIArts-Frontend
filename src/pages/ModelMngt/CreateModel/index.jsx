import { Link, history } from 'umi';
import {
  message,
  Modal,
  Form,
  Input,
  Button,
  Card,
  PageHeader,
  Tooltip,
  Radio,
  Upload,
} from 'antd';
import React, { useState, useEffect, useRef } from 'react';
import { FolderOpenOutlined, InboxOutlined } from '@ant-design/icons';
import ModalForm from './components/ModalForm';
import { addModel } from '../ModelList/services';
import { fetchAvilableResource } from '@/services/modelTraning';
import { modelNameReg, jobNameReg } from '@/utils/reg';
import { useIntl } from 'umi';

const { TextArea } = Input;
const { Dragger } = Upload;

const CreateModel = (props) => {
  const { formatMessage } = useIntl();
  const [codePathPrefix, setCodePathPrefix] = useState('');
  const [visible, setVisible] = useState(false);
  const [form] = Form.useForm();
  const [modelFileType, setModelFileType] = useState('1');
  const [btnDisabled, setBtnDisabled] = useState(false);
  const [fileList, setFileList] = useState([]);

  useEffect(() => {
    getAvailableResource();
  }, []);

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

  const onFinish = async (values) => {
    // console.log(values);
    const { name, description, argumentPath, jobId, modelPath } = values;
    const data = {
      name,
      description,
      paramPath: argumentPath ? codePathPrefix + argumentPath : undefined,
      jobId: jobId || '',
      codePath: modelPath || '',
      isAdvance: false,
    };

    const { code, msg } = await addModel(data);

    if (code === 0) {
      message.success(formatMessage({ id: `createModel.onFinish.success` }));
      history.push('/ModelManagement/MyModels');
    } else {
      msg && message.error(formatMessage({ id: `createModel.onFinish.error ` }) + msg);
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
    if (!!item) {
      const outPath = item.outputPath.substr(codePathPrefix.length);
      form.setFieldsValue({ job: item.name, jobId: item.id, argumentPath: outPath });
    }
    setVisible(false);
  };

  const uploadProps = {
    name: 'data',
    data: {
      dir: new Date().valueOf(),
    },
    multiple: false,
    action: '/ai_arts/api/files/upload/model',
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
        console.log(111, info.fileList);
        setFileList(info.fileList);
        setBtnDisabled(false);
        message.success(`${info.file.name}${formatMessage({ id: 'createModel.upload.success' })}`);

        // 获取上传路径
        const {
          data: { path },
        } = info.fileList[0].response;
        form.setFieldsValue({ modelPath: path });
      } else if (status === 'error') {
        message.error(`${info.file.name} ${formatMessage({ id: 'createModel.upload.error' })}`);
        setBtnDisabled(false);
      }
    },
    beforeUpload(file) {
      const { type, size } = file;
      return new Promise((resolve, reject) => {
        if (fileList.length && fileList.findIndex((i) => i.name === name && i.type === type) > -1) {
          message.warning(`${formatMessage({ id: 'createModel.upload.tips.desc' })}`);
          reject(file);
        }
        if (
          !(
            type === 'application/x-zip-compressed' ||
            type === 'application/x-tar' ||
            type === 'application/x-gzip' ||
            type === 'application/zip' ||
            type === 'application/gzip'
          )
        ) {
          message.warning(`${formatMessage({ id: 'createModel.upload.tips' })}`);
          reject(file);
        }
        resolve(file);
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
        onBack={() => history.push('/ModelManagement/MyModels')}
        title={formatMessage({ id: 'createModel.model.create' })}
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
            initialValues={{ modelFileType: modelFileType }}
          >
            <Form.Item
              {...layout}
              name="name"
              label={formatMessage({ id: 'modelCreate.label.name' })}
              rules={[
                {
                  required: true,
                  message: formatMessage({ id: 'modelCreate.rule.needName' }),
                },
                { ...modelNameReg },
                { ...jobNameReg },
              ]}
            >
              <Input
                placeholder={formatMessage({ id: 'modelCreate.placeholder.inputModelName' })}
              />
            </Form.Item>
            <Form.Item
              {...layout}
              name="description"
              label={formatMessage({ id: 'modelCreate.label.description' })}
              rules={[{ max: 256 }]}
            >
              <TextArea
                rows={4}
                placeholder={formatMessage({ id: 'modelCreate.placeholder.inputDescription' })}
              />
            </Form.Item>
            <Form.Item
              {...layout}
              label={formatMessage({ id: 'modelCreate.label.modelFileType' })}
              name="modelFileType"
              rules={[{ required: true }]}
            >
              <Radio.Group onChange={(e) => setModelFileType(e.target.value)}>
                <Radio value={'1'}>
                  {formatMessage({ id: 'modelCreate.value.selectModelFile' })}
                </Radio>
                <Radio value={'2'}>
                  {formatMessage({ id: 'modelCreate.value.uploadModelFile' })}
                </Radio>
              </Radio.Group>
            </Form.Item>
            {modelFileType == '1' && (
              <Form.Item
                {...layout}
                label={formatMessage({ id: 'modelCreate.label.job' })}
                required
              >
                <Form.Item
                  name="job"
                  rules={[
                    {
                      required: true,
                      message: formatMessage({ id: 'modelCreate.rule.needJob' }),
                    },
                  ]}
                  style={{ display: 'inline-block', width: 'calc(90% - 4px)' }}
                >
                  <Input
                    placeholder={formatMessage({
                      id: 'modelCreate.placeholder.selectTrainingJobName',
                    })}
                    disabled
                  />
                </Form.Item>
                <Form.Item
                  style={{ display: 'inline-block', width: 'calc(10% - 4px)', margin: '0 0 0 8px' }}
                >
                  <Button icon={<FolderOpenOutlined />} onClick={showJobModal}></Button>
                </Form.Item>
              </Form.Item>
            )}
            {modelFileType == '2' && (
              <Form.Item
                labelCol={{ span: 3 }}
                wrapperCol={{ span: 14 }}
                label={formatMessage({ id: 'modelCreate.label.file' })}
                name="file"
                rules={[
                  {
                    required: true,
                    message: formatMessage({ id: 'modelCreate.rule.needFile' }),
                  },
                ]}
                valuePropName="file"
              >
                <Dragger {...uploadProps}>
                  <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                  </p>
                  <p className="ant-upload-text">
                    {formatMessage({ id: 'modelCreate.value.upload.tips' })}
                  </p>
                  <p className="ant-upload-hint">
                    {formatMessage({ id: 'modelCreate.value.upload.tips.desc' })}
                  </p>
                </Dragger>
              </Form.Item>
            )}
            {modelFileType === '1' && (
              <Form.Item
                {...layout}
                name="argumentPath"
                label={formatMessage({ id: 'modelCreate.label.argumentPath' })}
                rules={[
                  {
                    required: true,
                    message: formatMessage({ id: 'modelCreate.rule.needWeight' }),
                  },
                ]}
              >
                <Input
                  addonBefore={codePathPrefix}
                  placeholder={formatMessage({
                    id: 'modelCreate.placeholder.inputArgumentPath',
                  })}
                />
              </Form.Item>
            )}
            <Form.Item name="jobId" hidden>
              <Input type="hidden" />
            </Form.Item>
            <Form.Item name="modelPath" hidden>
              <Input type="hidden" />
            </Form.Item>
            <Form.Item style={{ float: 'right' }}>
              <Button type="primary" htmlType="submit" disabled={btnDisabled}>
                {formatMessage({ id: 'modelCreate.submit' })}
              </Button>
            </Form.Item>
          </Form>
        </div>
      </PageHeader>
      {/* 选择训练作业弹框 */}
      {visible && <ModalForm visible={visible} onCancel={handleCancel} onSubmit={handleSubmit} />}
    </>
  );
};

export default CreateModel;
