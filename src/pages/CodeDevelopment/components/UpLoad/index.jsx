import React, { useState, useEffect } from 'react';
import { Upload, message } from 'antd';
import { InboxOutlined } from '@ant-design/icons';

const { Dragger } = Upload;
const CodeUpload = (props) => {
  console.log(props);
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
    onChange(info) {
      const { status } = info.file;
      if (status !== 'uploading') {
      }
      if (status === 'done') {
        message.success(`${info.file.name}文件上传成功！`);
      } else if (status === 'error') {
        message.error(`${info.file.name} 文件上传失败！`);
      }
    },
    beforeUpload(file) {
      const { type, size } = file;
      return true
    },
    onRemove(file) {
      if (fileList.length && file.uid === fileList[0].uid) setFileList([]);
    }
  }
  return (
    <>
      <Dragger {...uploadProps}>
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">请点击或拖入文件上传（支持多文件）</p>
      </Dragger>
    </>
  )
}
export default CodeUpload