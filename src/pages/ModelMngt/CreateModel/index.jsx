import { Link, history } from 'umi';
import { message, Modal, Form, Input, Button, Card, PageHeader, Tooltip, Radio, Upload } from 'antd';
import React, { useState, useEffect, useRef } from 'react';
import { FolderOpenOutlined, InboxOutlined } from '@ant-design/icons';
import ModalForm from './components/ModalForm';
import { addModel } from '../ModelList/services';
import { fetchAvilableResource } from '@/services/modelTraning';
import { modelNameReg, jobNameReg } from '@/utils/reg';

const { TextArea } = Input;
const { Dragger } = Upload;

const CreateModel = props => {
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
      let { data: { codePathPrefix } } = res;
      if (!/\/$/.test(codePathPrefix)) {
        codePathPrefix = codePathPrefix + '/' 
      }
      
      setCodePathPrefix(codePathPrefix);
    }
  }

  const onFinish = async (values) => {
    // console.log(values);
    const { name, description, argumentPath, jobId, modelPath } = values;
    const data = {
      name,
      description,
      paramPath: codePathPrefix + argumentPath,
      jobId: jobId || '',
      codePath: modelPath || '',
      isAdvance: false,
    }

    const { code, msg } = await addModel(data);

    if (code === 0) {
      message.success(`创建成功`);
      history.push('/ModelManagement/MyModels');
    } else {
      msg && message.error(`创建失败:${msg}`);
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

  const handleSubmit = item => {
    // console.log(item)
    form.setFieldsValue({job: item.name, jobId: item.id});
    setVisible(false);
  };

  const uploadProps = {
    name: 'data',
    data: {
      dir: new Date().valueOf()
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
        console.log(111, info.fileList)
        setFileList(info.fileList);
        setBtnDisabled(false);
        message.success(`${info.file.name}文件上传成功！`);

        // 获取上传路径
        const { data: { path }} = info.fileList[0].response;
        form.setFieldsValue({modelPath: path});

      } else if (status === 'error') {
        message.error(`${info.file.name} 文件上传失败！`);
        setBtnDisabled(false);
      }
    },
    beforeUpload(file) {
      const { type, size } = file;
      return new Promise((resolve, reject) => {
        if (fileList.length && fileList.findIndex(i => i.name === name && i.type === type) > -1) {
          message.warning(`不能上传相同的文件！`);
          reject(file);
        }
        if (!(type === 'application/x-zip-compressed' || type === 'application/x-tar' || type === 'application/x-gzip' || type === 'application/zip' || type === 'application/gzip')) {
          message.warning(`只支持上传格式为 .zip, .tar 和 .tar.gz 的文件！`);
          reject(file);
        }
        resolve(file);
      });      
    },
    onRemove(file) {
      if (fileList.length && file.uid === fileList[0].uid) setFileList([]);
    }
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
        title="创建模型"
      >
        <div
          style={{
            padding: '24px'
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
              label="名称"
              rules={[{ required: true, message: '名称不能为空!' }, { ...modelNameReg }, { ...jobNameReg }]}
            >
              <Input placeholder="请输入模型名称" />
            </Form.Item>
            <Form.Item
              {...layout}     
              name="description"
              label="描述"
              rules={[{ max: 256 }]}
            >
              <TextArea rows={4} placeholder="请输入描述信息" />
            </Form.Item>          
            <Form.Item
              {...layout}
              label="模型文件"
              name="modelFileType"
              rules={[{ required: true }]} 
            >
              <Radio.Group onChange={e => setModelFileType(e.target.value)}>
                <Radio value={'1'}>选择模型文件</Radio>
                <Radio value={'2'}>上传模型文件</Radio>
              </Radio.Group>
            </Form.Item>
            {modelFileType == '1' && <Form.Item
                {...layout}
                label="训练作业"
                required
              >
                <Form.Item
                  name="job"
                  rules={[{ required: true, message: '训练作业不能为空!' }]}
                  style={{ display: 'inline-block', width: 'calc(90% - 4px)' }}              
                >
                  <Input placeholder="请选择训练作业名称" disabled/>
                </Form.Item>
                <Form.Item
                  style={{ display: 'inline-block', width: 'calc(10% - 4px)', margin: '0 0 0 8px' }}
                >
                  <Button icon={<FolderOpenOutlined />} onClick={showJobModal}></Button>
                </Form.Item>
            </Form.Item>}       
            {modelFileType == '2' && <Form.Item
              labelCol={{ span: 3 }}
              wrapperCol={{ span: 14 }}
              label="上传文件"
              name="file"
              rules={[{ required: true, message: '请上传文件！' }]}
              valuePropName="file"
            >
              <Dragger {...uploadProps}>
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p className="ant-upload-text">请点击或拖入文件上传</p>
                <p className="ant-upload-hint">（只支持上传格式为 .zip, .tar 和 .tar.gz 的文件）</p>
              </Dragger>
            </Form.Item>}
            <Form.Item
              {...layout}
              name="argumentPath"
              label="模型参数文件"
              rules={[{ required: true, message: '模型参数文件不能为空!' }]}
            >
              <Input addonBefore={codePathPrefix} placeholder="请输入模型参数文件" />
            </Form.Item>            
            <Form.Item
                name="jobId"
                hidden            
              >
                <Input type="hidden"/>
            </Form.Item>          
            <Form.Item
                name="modelPath"
                hidden            
              >
                <Input type="hidden"/>
            </Form.Item>         
            <Form.Item
              style={{ float: 'right' }}
            >
              <Button type="primary" htmlType="submit" disabled={btnDisabled}>立即创建</Button>
            </Form.Item>
          </Form>
        </div>
      </PageHeader>
      {/* 选择训练作业弹框 */}
      {
        visible && <ModalForm
        visible={visible}
        onCancel={handleCancel}
        onSubmit={handleSubmit}
      />
      }
    </>  
  );
};

export default CreateModel;