import { message, Form, Input, Button, Select, Radio, Upload } from 'antd';
import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { InboxOutlined } from '@ant-design/icons';
import styles from './index.less';

const { Dragger } = Upload;

const ModalForm = (props, ref) => {
  const [form] = Form.useForm();
  const [uploadType, setUploadType] = useState(1);

  useImperativeHandle(ref, () => ({
    hello: () => console.log('hello world!'),
  }));

  const uploadProps = {
    name: 'file',
    multiple: true,
    action: 'https://www.mocky.io/v2/5cc8019d300000980a055e76',
    onChange(info) {
      const { status } = info.file;
      if (status !== 'uploading') {
        console.log(info.file, info.fileList);
      }
      if (status === 'done') {
        message.success(`${info.file.name} file uploaded successfully.`);
      } else if (status === 'error') {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
  };

  return (
    <Form form={form} className={styles.modalFormWrap}>
      <Form.Item
        label="数据集名称"
        name="Name"
        rules={[{ required: true, message: '请填写数据集名称！' }]}
      >
        <Input placeholder="请填写数据集名称" />
      </Form.Item>
      <Form.Item
        label="数据集简介"
        name="Info"
        rules={[{ required: true, message: '请填写数据集简介！' }]}
      >
        <Input.TextArea placeholder="请填写数据集简介" autoSize={{ minRows: 4 }} />
      </Form.Item>
      <Form.Item
        label="数据集类型"
        name="type"
        rules={[{ required: true, message: '请选择数据集类型！' }]}
      >
        <Select placeholder="请选择数据集类型" style={{ width: 180 }}>
          <Option value="image">图片</Option>
          <Option value="video">视频</Option>
          <Option value="text">文字</Option>
        </Select>
      </Form.Item>
      <Form.Item
        label="数据上传方式"
        name="uploadType"
        rules={[{ required: true, message: '请选择数据上传方式！' }]}
      >
        <Radio.Group onChange={(e) => setUploadType(e.target.value)} value={uploadType}>
          <Radio value={1}>网页上传</Radio>
          <Radio value={2}>FTP上传</Radio>
        </Radio.Group>
      </Form.Item>
      {uploadType === 1 ? (
        <Form.Item
          label="上传文件"
          name="file"
          rules={[{ required: true, message: '请上传文件！' }]}
        >
          <Dragger {...uploadProps}>
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">Click or drag file to this area to upload</p>
          </Dragger>
        </Form.Item>
      ) : (
        <>
          <Form.Item
            label="FTP服务器地址"
            name="adress"
            rules={[{ required: true, message: '请填写FTP服务器地址！' }]}
          >
            <Input placeholder="请填写FTP服务器地址" />
          </Form.Item>
          <Form.Item
            label="用户名"
            name="adress"
            rules={[{ required: true, message: '请填写用户名！' }]}
          >
            <Input placeholder="请填写用户名" />
          </Form.Item>
          <Form.Item
            label="密码"
            name="adress"
            rules={[{ required: true, message: '请填写密码！' }]}
          >
            <Input placeholder="请填写密码" />
          </Form.Item>
        </>
      )}
    </Form>
  );
};

export default forwardRef(ModalForm);
