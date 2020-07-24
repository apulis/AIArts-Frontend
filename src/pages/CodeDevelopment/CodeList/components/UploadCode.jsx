import React, { useState, useEffect } from 'react';
import { Upload, message} from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { } from '@ant-design/icons';
const { Dragger } = Upload;
const UploadCode = (props) => {
  console.log(props)
  const { codePath } = props
  const [fileList, setFileList] = useState([]);
  const uploadProps = {
    name: 'file',
    multiple: true,
    action: 'https://www.mocky.io/v2/5cc8019d300000980a055e76',// 如何携带参数
    headers: {
      Authorization: 'Bearer ' + window.localStorage.token,
    },
    onChange(info) {
      debugger
      const { status } = info.file;
      if (status !== 'uploading') {
        console.log(info.file, info.fileList);
      }
      if (status === 'done') {
        message.success(`${info.file.name}文件上传成功！`);
      } else if (status === 'error') {
        message.error(`${info.file.name} 文件上传失败！`);
      }
    },
    beforeUpload(file){
      const { type, size } = file;
      return true
    },
    onRemove(file){
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
export default UploadCode