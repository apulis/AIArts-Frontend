import React, { useState, useRef, useEffect } from 'react'
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { Descriptions, message, Upload, Button } from 'antd';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { useParams } from 'umi';

import { fetchInferenceList, fetchInferenceDetail, createInference, startRecognition, fetchInferenceLog } from '../../services/inferenceService';

import styles from './index.less';

export function getBase64(img, callback) {
  const reader = new FileReader();
  reader.addEventListener('load', () => callback(reader.result));
  reader.readAsDataURL(img);
}
const testLog = `
[I 11:41:59.446 NotebookApp] [nb_conda_kernels] enabled, 2 kernels foundenabled, 2 kernels foundenabled, 2 kernels foundenabled, 2 kernels foundenabled, 2 kernels foundenabled, 2 kernels foundenabled, 2 kernels foundenabled, 2 kernels foundenabled, 2 kernels foundenabled, 2 kernels found
[W 11:42:00.091 NotebookApp] WARNING: The notebook server is listening on all IP addresses and not using encryption. This is not recommended.
[I 11:42:00.157 NotebookApp] ✓ nbpresent HTML export ENABLED
[W 11:42:00.157 NotebookApp] ✗ nbpresent PDF export DISABLED: No module named nbbrowserpdf.exporters.pdf
[I 11:42:00.217 NotebookApp] [nb_anacondacloud] enabled
[I 11:42:00.222 NotebookApp] Serving notebooks from local directory: /run/user/0/.jupyter
[I 11:42:00.222 NotebookApp] Serving notebooks from local directory: /run/user/0/.jupyter
[I 11:42:00.223 NotebookApp] The Jupyter Notebook is running at: http://[all ip addresses on your system]:10055/
[I 11:42:00.223 NotebookApp] Use Control-C to stop this server and shut down all kernels (twice to skip confirmation).
[W 11:42:14.721 NotebookApp] 401 POST /login?next=%2F (10.177.22.82) 1.86ms referer=http://10.186.61.102:10055/login[I 11:41:59.446 NotebookApp] [nb_conda_kernels] enabled, 2 kernels foundenabled, 2 kernels foundenabled, 2 kernels foundenabled, 2 kernels foundenabled, 2 kernels foundenabled, 2 kernels foundenabled, 2 kernels foundenabled, 2 kernels foundenabled, 2 kernels foundenabled, 2 kernels found
[W 11:42:00.091 NotebookApp] WARNING: The notebook server is listening on all IP addresses and not using encryption. This is not recommended.
[I 11:42:00.157 NotebookApp] ✓ nbpresent HTML export ENABLED
[W 11:42:00.157 NotebookApp] ✗ nbpresent PDF export DISABLED: No module named nbbrowserpdf.exporters.pdf
[I 11:42:00.217 NotebookApp] [nb_anacondacloud] enabled
[I 11:42:00.222 NotebookApp] Serving notebooks from local directory: /run/user/0/.jupyter
[I 11:42:00.222 NotebookApp] Serving notebooks from local directory: /run/user/0/.jupyter
[I 11:42:00.223 NotebookApp] The Jupyter Notebook is running at: http://[all ip addresses on your system]:10055/
[I 11:42:00.223 NotebookApp] Use Control-C to stop this server and shut down all kernels (twice to skip confirmation).
[W 11:42:14.721 NotebookApp] 401 POST /login?next=%2F (10.177.22.82) 1.86ms referer=http://10.186.61.102:10055/login
[I 11:41:59.446 NotebookApp] [nb_conda_kernels] enabled, 2 kernels foundenabled, 2 kernels foundenabled, 2 kernels foundenabled, 2 kernels foundenabled, 2 kernels foundenabled, 2 kernels foundenabled, 2 kernels foundenabled, 2 kernels foundenabled, 2 kernels foundenabled, 2 kernels found
[W 11:42:00.091 NotebookApp] WARNING: The notebook server is listening on all IP addresses and not using encryption. This is not recommended.
[I 11:42:00.157 NotebookApp] ✓ nbpresent HTML export ENABLED
[W 11:42:00.157 NotebookApp] ✗ nbpresent PDF export DISABLED: No module named nbbrowserpdf.exporters.pdf
[I 11:42:00.217 NotebookApp] [nb_anacondacloud] enabled
[I 11:42:00.222 NotebookApp] Serving notebooks from local directory: /run/user/0/.jupyter
[I 11:42:00.222 NotebookApp] Serving notebooks from local directory: /run/user/0/.jupyter
[I 11:42:00.223 NotebookApp] The Jupyter Notebook is running at: http://[all ip addresses on your system]:10055/
[I 11:42:00.223 NotebookApp] Use Control-C to stop this server and shut down all kernels (twice to skip confirmation).
[W 11:42:14.721 NotebookApp] 401 POST /login?next=%2F (10.177.22.82) 1.86ms referer=http://10.186.61.102:10055/login[I 11:41:59.446 NotebookApp] [nb_conda_kernels] enabled, 2 kernels foundenabled, 2 kernels foundenabled, 2 kernels foundenabled, 2 kernels foundenabled, 2 kernels foundenabled, 2 kernels foundenabled, 2 kernels foundenabled, 2 kernels foundenabled, 2 kernels foundenabled, 2 kernels found
[W 11:42:00.091 NotebookApp] WARNING: The notebook server is listening on all IP addresses and not using encryption. This is not recommended.
[I 11:42:00.157 NotebookApp] ✓ nbpresent HTML export ENABLED
[W 11:42:00.157 NotebookApp] ✗ nbpresent PDF export DISABLED: No module named nbbrowserpdf.exporters.pdf
[I 11:42:00.217 NotebookApp] [nb_anacondacloud] enabled
[I 11:42:00.222 NotebookApp] Serving notebooks from local directory: /run/user/0/.jupyter
[I 11:42:00.222 NotebookApp] Serving notebooks from local directory: /run/user/0/.jupyter
[I 11:42:00.223 NotebookApp] The Jupyter Notebook is running at: http://[all ip addresses on your system]:10055/
[I 11:42:00.223 NotebookApp] Use Control-C to stop this server and shut down all kernels (twice to skip confirmation).
[W 11:42:14.721 NotebookApp] 401 POST /login?next=%2F (10.177.22.82) 1.86ms referer=http://10.186.61.102:10055/login

`

const InferenceDetail = () => {
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const logEl = useRef(null);
  const [beginAnalizeLoading, setBeginAnalizeLoading] = useState(false);
  const params = useParams()
  const id = params.id;
  const [logs, setLogs] = useState(testLog);
  const getInferenceLog = async () => {
    const res = await fetchInferenceLog(id);
    const l = logEl.current;
    if (res.code === 0) {
      setLogs(res.data.log);
      setTimeout(() => {
        l && l.scrollTo(0, 100000000);
      }, 120);
    }
  }
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
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('图片不能大于5M');
    }
    return isJpgOrPng && isLt5M;
  }
  const beginAnalyze = () => {
    setBeginAnalizeLoading(true)
  }
  const getLateastLogs = async () => {
    const cancel = message.loading('获取日志中')
    await getInferenceLog()
    cancel();
    message.success('成功获取日志')
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
        action={`/inferences/${id}/upload_image`}
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
      {logs ? <pre ref={logEl} style={{marginTop: '20px'}} className={styles.logs}>
        {logs}
      </pre> : <LoadingOutlined />}

    </PageHeaderWrapper>
  )
}




export default InferenceDetail;