import { message, Form, Input, Button, Select, Radio, Upload } from 'antd';
import React, { useState, useImperativeHandle, forwardRef } from 'react';
import { InboxOutlined } from '@ant-design/icons';
import styles from './index.less';

const { Dragger } = Upload;

const AddModalForm = (props, ref) => {
  const [form] = Form.useForm();
  const { modalType, editData, setBtn } = props;
  const [fileList, setFileList] = useState([]);
  const [sourceType, setSourceType] = useState(1);

  useImperativeHandle(ref, () => ({ 
    form: form
  }));

  const uploadProps = {
    name: 'data',
    multiple: true,
    action: '/ai_arts/api/files/upload/dataset',
    headers: {
      Authorization: 'Bearer ' + window.localStorage.token,
    },
    onChange(info) {
      const { status } = info.file;
      setBtn(true);
      if (status !== 'uploading') {
        console.log(info.file, info.fileList);
      }
      if (status === 'done') {
        setFileList(info.fileList);
        setBtn(false);
        message.success(`${info.file.name}文件上传成功！`);
      } else if (status === 'error') {
        message.error(`${info.file.name} 文件上传失败！`);
        setBtn(false);
      }
    },
    beforeUpload(file) {
      const { type, size } = file;
      // const isOverSize = size / 1024 / 1024 / 1024 > 2;
      return new Promise((resolve, reject) => {
        if (!fileList.length && (type === 'application/x-zip-compressed' || type === 'application/x-tar' || type === 'application/x-gzip')) {
          resolve(file);
        } else {
          message.warning(`只支持上传格式为 .zip, .tar 和 .tar.gz 的文件！`);
          reject(file);
        }
      });
    },
    onRemove(file) {
      if (fileList.length && file.uid === fileList[0].uid) setFileList([]);
    }
  };

  return (
    <Form form={form} className={styles.modalFormWrap} initialValues={modalType ? editData : { sourceType: sourceType }}>
      <Form.Item
        label="数据集名称"
        name="name"
        rules={[{ required: true, message: '请输入数据集名称！' }, { max: 25 }]}
      >
        <Input placeholder="请输入数据集名称" disabled={modalType} />
      </Form.Item>
      <Form.Item
        label="简介"
        name="description"
        rules={[{ required: true, message: '请输入简介！' }, { max: 50 }]} 
      >
        <Input.TextArea placeholder="请输入简介" autoSize={{ minRows: 4 }} />
      </Form.Item>
      {!modalType && <Form.Item label="数据源" rules={[{ required: true }]} name="sourceType">
        <Radio.Group onChange={e => setSourceType(e.target.value)}>
          <Radio value={1}>网页上传新数据源</Radio>
          <Radio value={2}>使用以其它方式上传的数据源</Radio>
        </Radio.Group>
      </Form.Item>}
      {!modalType && sourceType == 1 && <Form.Item
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
          <p className="ant-upload-hint">（只支持上传格式为 .zip, .tar 和 .tar.gz 的文件，且最大不能超过2GB）</p>
        </Dragger>
      </Form.Item>}
      {sourceType == 2 &&<Form.Item
        label="存储路径"
        name="path"
        rules={[{ required: true, message: '请输入存储路径！' }]}
      >
        <Input placeholder="请输入存储路径" />
      </Form.Item>}
    </Form>
  );
};

export default forwardRef(AddModalForm);