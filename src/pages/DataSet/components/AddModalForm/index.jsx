import { message, Form, Input, Button, Select, Radio, Upload } from 'antd';
import React, { useState, useImperativeHandle, forwardRef } from 'react';
import { InboxOutlined } from '@ant-design/icons';
import styles from './index.less';
import { FilePathReg, FilePathErrorText } from '@/utils/const';

const { Dragger } = Upload;

const AddModalForm = (props, ref) => {
  const [form] = Form.useForm();
  const { modalType, editData, setBtn, pathId } = props;
  const [fileLists, setFileLists] = useState([]);
  const [sourceType, setSourceType] = useState(1);
  const [isPrivate, setIsPrivate] = useState(true);
  useImperativeHandle(ref, () => ({ 
    form: form
  }));

  const uploadProps = {
    name: 'data',
    data: {
      dir: pathId,
      isPrivate: isPrivate
    },
    multiple: true,
    fileList: fileLists,
    action: '/ai_arts/api/files/upload/dataset',
    headers: {
      Authorization: 'Bearer ' + window.localStorage.token
    },
    onChange(info) {
      const { status, name } = info.file;
      console.log('----', info.fileList)
      setBtn(true);
      if (status !== 'uploading') {
        setBtn(false);
      }
      if (status === 'done') {
        setBtn(false);
        message.success(`${name}文件上传成功！`);
      } else if (status === 'error') {
        message.error(`${name} 文件上传失败！`);
        setBtn(false);
      }
      form.setFieldsValue({ fileLists: info.fileList });
      setFileLists(info.fileList);
    },
    beforeUpload(file, fileList) {
      const { type, size, name } = file;
      const typeReg = /\.(zip|tar|gz)$/;
      // const isOverSize = size / 1024 / 1024 / 1024 > 2;
      return new Promise((resolve, reject) => {
        // if (fileLists.length && fileLists.findIndex(i => i.name === name && i.type === type) > -1) {
        //   message.warning(`不能上传相同的文件！`);
        //   reject(file);
        // }
        // if (!(type === 'application/x-zip-compressed' || type === 'application/x-tar' || type === 'application/x-gzip' || type === 'application/zip' || type === 'application/gzip')) {
        //   message.warning(`只支持上传格式为 .zip, .tar 和 .tar.gz 的文件！`);
        //   reject(file);
        // }

        if (fileLists.length && fileLists.findIndex(i => i.name === name) > -1) {
          message.warning(`不能上传相同的文件！`);
          reject(file);
        }
        if (!typeReg.test(name)) {
          message.warning(`只支持上传格式为 .zip, .tar 和 .tar.gz 的文件！`);
          reject(file);
        }
        resolve(file);
      });
    },
    onRemove(file) {
      let newFileList = fileLists;
      newFileList.splice(fileLists.findIndex(i => i.uid === file.uid), 1);
      form.setFieldsValue({ fileLists: [...newFileList] });
      setFileLists([...newFileList]);
    }
  };
  console.log('fileLists', fileLists)

  return (
    <Form form={form} className={styles.modalFormWrap} 
      initialValues={modalType ? editData : { sourceType: sourceType, isPrivate: isPrivate, isTranslated: false }}>
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
      {!modalType && <>
        <Form.Item label="是否已标注" rules={[{ required: true }]} name="isTranslated">
          <Radio.Group>
            <Radio value={false}>否</Radio>
            <Radio value={true}>是</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item label="数据权限" rules={[{ required: true }]} name="isPrivate">
          <Radio.Group onChange={e => setIsPrivate(e.target.value)} disabled={fileLists.length > 0}>
            <Radio value={true}>私有</Radio>
            <Radio value={false}>公有</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item label="数据源" rules={[{ required: true }]} name="sourceType">
          <Radio.Group onChange={e => setSourceType(e.target.value)}>
            <Radio value={1}>网页上传新数据源</Radio>
            <Radio value={2}>使用以其它方式上传的数据源</Radio>
          </Radio.Group>
        </Form.Item>
      </>}
      {!modalType && sourceType == 1 && <Form.Item
        label="上传文件"
        name="fileLists"
        rules={[{ required: true, message: '请上传文件！' }]}
        valuePropName="fileLists"
      >
        <Dragger {...uploadProps}>
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">请点击或拖入文件上传</p>
          <p className="ant-upload-hint">（只支持上传格式为 .zip, .tar 和 .tar.gz 的文件）</p>
        </Dragger>
      </Form.Item>}
      {sourceType == 2 &&<Form.Item
        label="存储路径"
        name="path"
        rules={[
          { required: true, message: '请输入存储路径！' },
          { pattern: FilePathReg, message: FilePathErrorText },
        ]}
      >
        <Input placeholder="请输入存储路径" />
      </Form.Item>}
    </Form>
  );
};

export default forwardRef(AddModalForm);