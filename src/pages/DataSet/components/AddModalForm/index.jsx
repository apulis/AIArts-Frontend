import { message, Form, Input, Button, Select, Radio, Upload } from 'antd';
import React, { useState, useImperativeHandle, forwardRef } from 'react';
import { InboxOutlined, DeleteOutlined } from '@ant-design/icons';
import { FilePathReg, FilePathErrorText } from '@/utils/const';
import { useIntl } from 'umi';
import moment from 'moment';

const { Dragger } = Upload;

const AddModalForm = (props, ref) => {
  const intl = useIntl();
  const [form] = Form.useForm();
  const { modalType, editData, setBtn, pathId } = props;
  const [fileLists, setFileLists] = useState([]);
  const [sourceType, setSourceType] = useState(1);
  const [isPrivate, setIsPrivate] = useState(true);
  const [fileUploadRestTimeMap, setFileUploadRestTimeMap] = useState({});
  const [fileStatusGreenMap, setFileStatusGreenMap] = useState({});

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
    progress: {
      format: percent => `${parseFloat(percent.toFixed(2))}%`
    },
    itemRender: (originNode, file, fileList) => {
      return (
        <div> {originNode}
          <div style={{ position: 'relative', textAlign: 'right', marginTop: 8 }}>
            {fileUploadRestTimeMap[file.uid] !== '00:00' &&
              <p>{`(${intl.formatMessage({ id: 'dataSet.addFormModel.restTime' })}${fileUploadRestTimeMap[file.uid] ? fileUploadRestTimeMap[file.uid] : ''})`}</p>}
            {fileStatusGreenMap[file.uid] &&
              <p>{intl.formatMessage({ id: 'dataSet.addFormModel.processing' })}</p>}
          </div>
        </div>)
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
        fileUploadRestTimeMap[file.uid] = undefined;
        fileStatusGreenMap[file.uid] = false;
        resolve(file);
      });
    },
    onChange(info) {
      const { file } = info;
      const { status, name, time, percent, restTime } = file;
      setBtn(true);
      if (percent === 100) {
        fileStatusGreenMap[file.uid] = true;
        setFileStatusGreenMap(fileStatusGreenMap);
      }
      if (status === 'uploading') {
        // 剩余进度
        const restPercent = 100 - percent;
        // 当前花费时间
        const timeDiff = Date.now() - time;
        // 当前速度
        const v = percent / timeDiff;
        // 使用剩余进度 / 速度 得到估计的剩余时间
        const restTime = restPercent / v;
        const formatTime = moment(restTime).format('mm:ss');
        // debugger
        fileUploadRestTimeMap[file.uid] = formatTime
        setFileUploadRestTimeMap(fileUploadRestTimeMap)
        // console.log(fileUploadRestTimeMap);
        // file.restTime = 'invalid date';
        // console.log(name + '上传剩余时间：', moment(restTime).format('mm:ss'));
        // 转换时间
      } else {
        console.log('uploading else');
        setBtn(false);
      }
      if (status === 'done') {
        fileStatusGreenMap[file.uid] = false;
        setFileStatusGreenMap(fileStatusGreenMap);
        console.log('done');
        setBtn(false);
        message.success(
          `${name} ${intl.formatMessage({ id: 'dataSet.create.tips.upload.success' })}！`,
        );
      } else if (status === 'error') {
        fileStatusGreenMap[file.uid] = false;
        setFileStatusGreenMap(fileStatusGreenMap);
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
          { pattern: /^[A-Za-z0-9\u4e00-\u9fa5]+$/, message: intl.formatMessage({ id: 'dataSetCreate.rule.needName.pattern' }) },
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
