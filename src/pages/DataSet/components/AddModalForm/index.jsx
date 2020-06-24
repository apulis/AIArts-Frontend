import { message, Form, Input, Button, Select, Radio, Upload } from 'antd';
import React, { useState, useImperativeHandle, forwardRef } from 'react';
import { InboxOutlined } from '@ant-design/icons';
import styles from './index.less';

const { Dragger } = Upload;

const AddModalForm = (props, ref) => {
  const [form] = Form.useForm();
  const { modalType, editData } = props;
  const [fileList, setFileList] = useState([]);

  useImperativeHandle(ref, () => ({ 
    form: form
  }));

  const uploadProps = {
    name: 'data',
    multiple: true,
    action: '/api/dataset/upload',
    onChange(info) {
      const { status } = info.file;
      if (status !== 'uploading') {
        console.log(info.file, info.fileList);
      }
      if (status === 'done') {
        setFileList(info.fileList);
        message.success(`${info.file.name} file uploaded successfully.`);
      } else if (status === 'error') {
        message.error(`${info.file.name} file upload failed.`);
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
          text = isOverSize ? 'files within 2GB' : `${fileList.length ?  'one file' : '.zip, .tar and .tar.gz file format'}`;
          message.warning(`Only supports uploading ${text}！`);
          reject(file);
        }
      });
    }
  };

  return (
    <Form form={form} className={styles.modalFormWrap} initialValues={modalType ? editData : {}}>
      <Form.Item
        label="DataSet Name"
        name="name"
        rules={[{ required: true, message: 'DataSet Name is required！' }, { max: 25 }]}
      >
        <Input placeholder="please enter dataSet Name" disabled={modalType} />
      </Form.Item>
      <Form.Item
        label="Description"
        name="description"
        rules={[{ required: true, message: 'Description is required！' }, { max: 50 }]} 
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
          <p className="ant-upload-hint">（Only supports uploading .zip, .tar and .tar.gz file format and within 2GB）</p>
        </Dragger>
      </Form.Item>}
    </Form>
  );
};

export default forwardRef(AddModalForm);