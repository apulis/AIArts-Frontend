import { message, Form, Input, Button, Select, Radio, Upload } from 'antd';
import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { InboxOutlined } from '@ant-design/icons';
import styles from './index.less';

const { Dragger } = Upload;

const ModalForm = (props, ref) => {
  const [form] = Form.useForm();

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
        label="DataSet Name"
        name="Name"
        rules={[{ required: true, message: '请填写数据集名称！' }]}
      >
        <Input placeholder="please enter dataSet Name" />
      </Form.Item>
      <Form.Item
        label="Description"
        name="Info"
        rules={[{ required: true, message: 'DataSet Name is required！' }]}
      >
        <Input.TextArea placeholder="please enter description" autoSize={{ minRows: 4 }} />
      </Form.Item>
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
    </Form>
  );
};

export default forwardRef(ModalForm);