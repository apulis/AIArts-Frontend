import React, { useState } from 'react'
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { Descriptions, message, Upload, Button } from 'antd';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';

import { fetchInferenceList, fetchInferenceDetail, createInference, startRecognition } from '../../services/inferenceService';


export function getBase64(img, callback) {
  const reader = new FileReader();
  reader.addEventListener('load', () => callback(reader.result));
  reader.readAsDataURL(img);
}


const InferenceDetail = () => {
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [beginAnalizeLoading, setBeginAnalizeLoading] = useState(false);
  const [logs, setLogs] = useState('');
  const handleChange = info => {
    if (info.file.status === 'uploading') {
      setLoading(true);
      return;
    }
    if (info.file.status === 'done') {
      // Get this url from response in real world.
      getBase64(info.file.originFileObj, imageUrl => {
        setImageUrl(imageUrl);
        setLoading(false);
      });
    }
  }
  const beforeUpload = (file) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('You can only upload JPG/PNG file!');
    }
    const isLt2M = file.size / 1024 / 1024 < 5;
    if (!isLt2M) {
      message.error('Image must smaller than 5MB!');
    }
    return isJpgOrPng && isLt2M;
  }
  const beginAnalyze = () => {
    setBeginAnalizeLoading(true)
  }
  const getLateastLogs = () => {
    //
  }
  const uploadButton = (
    <div>
      {loading ? <LoadingOutlined /> : <PlusOutlined />}
      <div className="ant-upload-text">上传图片</div>
    </div>
  );
  return (
    <PageHeaderWrapper>
      <Upload
        name="avatar"
        listType="picture-card"
        className="avatar-uploader"
        showUploadList={false}
        action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
        beforeUpload={beforeUpload}
        onChange={handleChange}
      >
        {imageUrl ? <img src={imageUrl} alt="avatar" style={{ width: '100%' }} /> : uploadButton}
      </Upload>
      <Button loading={beginAnalizeLoading} onClick={beginAnalyze}>开始识别</Button>
      <Descriptions style={{marginTop: '20px'}} bordered={true} column={2}>
        <Descriptions.Item label="作业名称">Zhou Maomao</Descriptions.Item>
        <Descriptions.Item label="作业状态">运行中</Descriptions.Item>
        <Descriptions.Item label="引擎类型">Hangzhou, Zhejiang</Descriptions.Item>
        <Descriptions.Item label="ID">empty</Descriptions.Item>
        <Descriptions.Item label="创建时间">test</Descriptions.Item>
        <Descriptions.Item label="运行时长">test</Descriptions.Item>
        <Descriptions.Item label="计算节点规格">test</Descriptions.Item>
        <Descriptions.Item label="使用模型">test</Descriptions.Item>
        <Descriptions.Item label="计算节点个数">test</Descriptions.Item>
        <Descriptions.Item label="作业参数">test</Descriptions.Item>
        <Descriptions.Item label="服务地址">test</Descriptions.Item>
        <Descriptions.Item label="描述">test</Descriptions.Item>
      </Descriptions>
      <div className="ant-descriptions-title" style={{marginTop: '30px'}}>训练日志</div>
      <Button onClick={getLateastLogs}>点击获取最新日志</Button>
      <pre>
        {logs}
      </pre>

    </PageHeaderWrapper>
  )
}




export default InferenceDetail;