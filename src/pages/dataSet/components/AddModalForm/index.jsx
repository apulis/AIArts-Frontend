import { message, Form, Input, Button, Select, Radio, Upload } from 'antd';
import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { InboxOutlined } from '@ant-design/icons';
import styles from './index.less';

const { Dragger } = Upload;

const AddModalForm = (props, ref) => {
  const [form] = Form.useForm();
  const { modalType, editData } = props;

  useImperativeHandle(ref, () => ({
    hello: () => console.log('hello world!'),
    form: form
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
    <Form form={form} className={styles.modalFormWrap} initialValues={modalType ? editData : {}}>
      <Form.Item
        label="DataSet Name"
        name="name"
        rules={[{ required: true, message: '请填写数据集名称！' }]}
      >
        <Input placeholder="please enter dataSet Name" disabled={modalType} />
      </Form.Item>
      <Form.Item
        label="Description"
        name="desc"
        rules={[{ required: true, message: 'DataSet Name is requi red！' }]} 
      >
        <Input.TextArea placeholder="please enter description" autoSize={{ minRows: 4 }} />
      </Form.Item>
      {!modalType && <Form.Item
        label="Upload File"
        name="file"
        rules={[{ required: true, message: 'please upload file！' }]}
      >
        <Dragger {...uploadProps}>
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">Click or drag file to this area to upload</p>
        </Dragger>
      </Form.Item>}
    </Form>
  );
};

export default forwardRef(AddModalForm);