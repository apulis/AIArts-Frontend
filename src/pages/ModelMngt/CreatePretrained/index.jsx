import { Link, history } from 'umi';
import { message, Modal, Form, Input, Button, Card, PageHeader, Tooltip, Select, Upload } from 'antd';
import React, { useState, useEffect, useRef } from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { connect } from 'umi';
import { formatDate } from '@/utils/time';
import { FolderOpenOutlined, InboxOutlined } from '@ant-design/icons';
import ModalForm from './components/ModalForm';
import { addModel } from '../ModelList/services';
import { fetchAvilableResource } from '@/services/modelTraning';

const { TextArea } = Input;
const { Dragger } = Upload;
const { Option } = Select;

const CreatePretrained = props => {
  const [codePathPrefix, setCodePathPrefix] = useState('');
  const [visible, setVisible] = useState(false);
  const [form] = Form.useForm();
  const [sourceType, setSourceType] = useState(1);
  const [btnDisabled, setBtnDisabled] = useState(false);
  const [fileList, setFileList] = useState([]);

  const usages = [
    { key: 'ImageClassification',label: '图像分类' }, 
    { key: 'ObjectDetection',label: '物体检测' }, 
  ];

  const engineTypes = [
    { key: '1',label: 'tensorflow , tf-1.8.0-py2.7' }, 
    { key: '2',label: 'tensorflow , tf-1.8.0-py2.7' }, 
  ];

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

  const selectTrainingJob = () => {

  };

  const onFinish = async (values) => {
    // console.log(values);
    const { name, description, path, dataFormat, engineType, precision, use, modelArgumentPath, modelPath } = values;
    const data = {
      name,
      description,
      path: codePathPrefix + path,
      isAdvance: true,
      dataFormat,
      engineType,
      use,
      modelArgumentPath,
      codePath,
      precision,
    }
    
    const { code, msg } = await addModel(data);

    if (code === 0) {
      message.success(`创建成功`);
      history.push('/ModelList');
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
    form.setFieldsValue({job: item.name});
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
        message.success(`${info.file.name}文件上传成功！`);
      } else if (status === 'error') {
        message.error(`${info.file.name} 文件上传失败！`);
        setBtnDisabled(false);
      }
    },
    beforeUpload(file) {
      const { type, size } = file;
      const isOverSize = size / 1024 / 1024 / 1024 > 2; 
      return new Promise((resolve, reject) => {
        if (!fileList.length && (type === 'application/x-zip-compressed' || type === 'application/x-tar' || type === 'application/x-gzip') && !isOverSize) {
          resolve(file);
        } else {
          let text = '';
          text = isOverSize ? '2GB以内的文件' : `${fileList.length ?  '一个文件' : '格式为 .zip, .tar 和 .tar.gz 的文件'}`;
          message.warning(`只支持上传 ${text}！`);
          reject(file);
        }
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
        onBack={() => history.push('/ModelManagement/PretrainedModels')}
        title="录入预置模型"
      >
        <div
          style={{
            padding: '24px'
          }}
        >
          <Form
            form={form}
            onFinish={onFinish}
            autoComplete="off"
            initialValues={{ sourceType: sourceType }}
          >
            <Form.Item
              {...layout}
              name="name"
              label="模型名称"
              rules={[{ required: true, message: '名称不能为空!' }]}
            >
              <Input placeholder="请输入模型名称" />
            </Form.Item>
            <Form.Item
              {...layout}
              name="usage"
              label="模型用途"
              rules={[{ required: true, message: '用途不能为空!' }]}
            >
              <Select>
                {
                  usages.map(u => (
                    <Option key={u.key} value={u.key}>{u.label}</Option>
                  ))
                }
              </Select>
            </Form.Item>
            <Form.Item
              {...layout} 
              label="引擎类型"
              name="engineType" 
              rules={[{ required: true, message: '请选择引擎类型' }]} 
            >
              <Select>
                {
                  engineTypes.map(type => (
                    <Option key={type.key} value={type.key}>{type.label}</Option>
                  ))
                }
              </Select>
            </Form.Item>
            <Form.Item
              {...layout}
              name="precision"
              label="模型精度"
              rules={[{ required: true, message: '模型精度为空!' }]}
            >
              <Input placeholder="请输入模型精度" />
            </Form.Item>                     
            <Form.Item
              {...layout}
              name="size"
              label="模型大小"
              rules={[{ required: true, message: '模型大小不能为空!' }]}
            >
              <Input placeholder="请输入模型大小" />
            </Form.Item>                     
            <Form.Item
              {...layout}
              name="dataset"
              label="训练数据集"
              rules={[{ required: true, message: '训练数据集不能为空!' }]}
            >
              <Input placeholder="请输入训练数据集" />
            </Form.Item>                     
            <Form.Item
              {...layout}
              name="dataFormat"
              label="数据格式"
              rules={[{ required: true, message: '数据格式不能为空!' }]}
            >
              <Input placeholder="请输入数据格式" />
            </Form.Item>                     
            <Form.Item
              {...layout}
              name="modelPath"
              label="模型路径"
              rules={[{ required: true, message: '模型路径不能为空!' }]}
            >
              <Input placeholder="请输入模型路径" />
            </Form.Item>                     
            <Form.Item
              {...layout}
              name="modelArgumentPath"
              label="模型参数文件"
              rules={[{ required: true, message: '模型参数文件不能为空!' }]}
            >
              <Input placeholder="请输入模型参数文件路径" />
            </Form.Item>                     
            <Form.Item
              style={{ float: 'right' }}
            >
              <Button type="primary" htmlType="submit" disabled={btnDisabled}>立即创建</Button>
            </Form.Item>
          </Form>
        </div>
      </PageHeader>
      {/* 选择训练数据集弹框 */}
      {
        visible && <ModalForm
        // current={current}
        visible={visible}
        onCancel={handleCancel}
        onSubmit={handleSubmit}
      />
      }
    </>  
  );
};

export default CreatePretrained;