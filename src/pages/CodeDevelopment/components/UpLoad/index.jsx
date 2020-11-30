import React, { useState, useEffect } from 'react';
import { Upload, message } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { useIntl } from 'umi';

const { Dragger } = Upload;
const CodeUpload = (props) => {
  const { formatMessage } = useIntl();
  const modalData = props.modalData;
  const { codePath } = modalData;
  const [fileList, setFileList] = useState([]);
  const uploadProps = {
    name: 'file',
    multiple: true,
    data: { codePath },
    action: '/ai_arts/api/codes/upload',
    headers: {
      Authorization: 'Bearer ' + window.localStorage.token,
    },
    directory: !!props.directory,
    onChange(info) {
      const { status } = info.file;
      if (status !== 'uploading') {
      }
      if (status === 'done') {
        message.success(
          `${info.file.name} ${formatMessage({
            id: 'codeList.modal.upload.tips.uploadSuccess',
          })}`,
        );
      } else if (status === 'error') {
        message.error(
          `${info.file.name} ${formatMessage({
            id: 'codeList.modal.upload.tips.uploadError',
          })}`,
        );
      }
    },
    beforeUpload(file) {
      const { type, size } = file;
      return true;
    },
    onRemove(file) {
      if (fileList.length && file.uid === fileList[0].uid) setFileList([]);
    },
  };
  return (
    <>
      <Dragger {...uploadProps}>
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">
          {
            props.directory ? formatMessage({ id: 'codeList.modal.upload.content.uploadTips.directory' })
             : formatMessage({ id: 'codeList.modal.upload.content.uploadTips' })
          }
        </p>
      </Dragger>
    </>
  );
};
export default CodeUpload;
