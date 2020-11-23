import { message, Form, Input, Button, Select, Radio, Upload } from 'antd';
import React, { useState, useImperativeHandle, forwardRef } from 'react';
import { InboxOutlined } from '@ant-design/icons';
import { FilePathReg, FilePathErrorText } from '@/utils/const';
import { useIntl } from 'umi';

const { Dragger } = Upload;

const AddModalForm = (props, ref) => {
  const intl = useIntl();
  const [form] = Form.useForm();
  const { modalType, editData, setBtn, pathId } = props;
  const [fileLists, setFileLists] = useState([]);
  const [sourceType, setSourceType] = useState(1);
  const [isPrivate, setIsPrivate] = useState(true);
  useImperativeHandle(ref, () => ({
    form: form,
  }));

  const uploadProps = {
    name: 'data',
    data: {
      dir: pathId,
      isPrivate: isPrivate,
    },
    multiple: true,
    fileList: fileLists,
    action: '/ai_arts/api/files/upload/dataset',
    headers: {
      Authorization: 'Bearer ' + window.localStorage.token,
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

        if (fileLists.length && fileLists.findIndex((i) => i.name === name) > -1) {
          message.warning(`${intl.formatMessage({ id: 'dataSet.create.tips.upload.equalFile' })}`);
          reject(file);
        }
        if (!typeReg.test(name)) {
          message.warning(
            `${intl.formatMessage({ id: 'dataSet.create.tips.upload.supportFile' })}`,
          );
          reject(file);
        }
        const time = Date.now();
        file.time = time;
        resolve(file);
      });
    },
    onChange(info) {
      const { status, name, time } = info.file;
      console.log('----', info.fileList);
      setBtn(true);
      if (status === 'uploading') {
        // 当前进度 与 剩余进度
        // const progress = ;
        console.log('文件', info.file);
        // 当前花费时间
        const timeDiff = Date.now() - time;
        console.log('时间差', timeDiff);
        // 当前速度
        //
      } else {
        setBtn(false);
      }
      if (status === 'done') {
        setBtn(false);
        message.success(
          `${name} ${intl.formatMessage({ id: 'dataSet.create.tips.upload.success' })}！`,
        );
      } else if (status === 'error') {
        message.error(`${name} ${intl.formatMessage({ id: 'dataSet.create.tips.upload.error' })}`);
        setBtn(false);
      }
      form.setFieldsValue({ fileLists: info.fileList });
      setFileLists(info.fileList);
    },
    onRemove(file) {
      let newFileList = fileLists;
      newFileList.splice(
        fileLists.findIndex((i) => i.uid === file.uid),
        1,
      );
      form.setFieldsValue({ fileLists: [...newFileList] });
      setFileLists([...newFileList]);
    },
  };

  return (
    <Form
      form={form}
      initialValues={
        modalType ? editData : { sourceType: sourceType, isPrivate: isPrivate, isTranslated: false }
      }
    >
      <Form.Item
        label={intl.formatMessage({ id: 'dataSetCreate.label.name' })}
        name="name"
        rules={[
          { required: true, message: intl.formatMessage({ id: 'dataSetCreate.rule.needName' }) },
          { max: 25 },
        ]}
      >
        <Input
          placeholder={intl.formatMessage({ id: 'dataSetCreate.placeholder.inputName' })}
          disabled={modalType}
        />
      </Form.Item>
      <Form.Item
        label={intl.formatMessage({ id: 'dataSetCreate.label.description' })}
        name="description"
        rules={[
          { required: true, message: intl.formatMessage({ id: 'dataSetCreate.rule.needDesc' }) },
          { max: 50 },
        ]}
      >
        <Input.TextArea
          placeholder={intl.formatMessage({ id: 'dataSetCreate.placeholder.inputDescription' })}
          autoSize={{ minRows: 4 }}
        />
      </Form.Item>
      {!modalType && (
        <>
          <Form.Item
            label={intl.formatMessage({ id: 'dataSetCreate.label.isTranslated' })}
            rules={[{ required: true }]}
            name="isTranslated"
          >
            <Radio.Group>
              <Radio value={false}>{intl.formatMessage({ id: 'dataSetCreate.value.no' })}</Radio>
              <Radio value={true}>{intl.formatMessage({ id: 'dataSetCreate.value.yes' })}</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item
            label={intl.formatMessage({ id: 'dataSetCreate.label.isPrivate' })}
            rules={[{ required: true }]}
            name="isPrivate"
          >
            <Radio.Group
              onChange={(e) => setIsPrivate(e.target.value)}
              disabled={fileLists.length > 0}
            >
              <Radio value={true}>
                {intl.formatMessage({ id: 'dataSetCreate.value.private' })}
              </Radio>
              <Radio value={false}>
                {intl.formatMessage({ id: 'dataSetCreate.value.public' })}
              </Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item
            label={intl.formatMessage({ id: 'dataSetCreate.label.sourceType' })}
            rules={[{ required: true }]}
            name="sourceType"
          >
            <Radio.Group onChange={(e) => setSourceType(e.target.value)}>
              <Radio value={1}>
                {intl.formatMessage({ id: 'dataSetCreate.value.uploadDataSource' })}
              </Radio>
              <Radio value={2}>
                {intl.formatMessage({ id: 'dataSetCreate.value.otherDataSource' })}
              </Radio>
            </Radio.Group>
          </Form.Item>
        </>
      )}
      {!modalType && sourceType == 1 && (
        <Form.Item
          label={intl.formatMessage({ id: 'dataSetCreate.label.fileLists' })}
          name="fileLists"
          rules={[
            { required: true, message: intl.formatMessage({ id: 'dataSetCreate.rule.needFile' }) },
          ]}
          valuePropName="fileLists"
        >
          <Dragger {...uploadProps}>
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">
              {intl.formatMessage({ id: 'dataSetCreate.value.tips' })}
            </p>
            <p className="ant-upload-hint">
              {intl.formatMessage({ id: 'dataSetCreate.value.tips.desc' })}
            </p>
          </Dragger>
        </Form.Item>
      )}
      {sourceType == 2 && (
        <Form.Item
          label={intl.formatMessage({ id: 'dataSetCreate.label.path' })}
          name="path"
          rules={[
            {
              required: true,
              message: intl.formatMessage({ id: 'dataSetCreate.rule.needStorePath' }),
            },
            { pattern: FilePathReg, message: FilePathErrorText },
          ]}
        >
          <Input
            placeholder={intl.formatMessage({ id: 'dataSetCreate.placeholder.inputStorePath' })}
          />
        </Form.Item>
      )}
    </Form>
  );
};

export default forwardRef(AddModalForm);
