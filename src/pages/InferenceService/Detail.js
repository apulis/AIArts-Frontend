import React, { useState, useRef, useEffect } from 'react'
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { Descriptions, message, Upload, Button } from 'antd';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { useParams } from 'umi';
import moment from 'moment';

import { fetchInferenceList, fetchInferenceDetail, createInference, startRecognition, fetchInferenceLog } from '../../services/inferenceService';

import styles from './index.less';
import { getJobStatus } from '@/utils/utils';

export function getBase64(img, callback) {
  const reader = new FileReader();
  reader.addEventListener('load', () => callback(reader.result));
  reader.readAsDataURL(img);
}

const InferenceDetail = () => {
  const [imageUrl, setImageUrl] = useState('');
  const [tempImageUrl, setTempImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [jobDetail, setJobDetail] = useState({});
  const logEl = useRef(null);
  const [beginAnalizeLoading, setBeginAnalizeLoading] = useState(false);
  const params = useParams()
  const id = params.id;
  const [logs, setLogs] = useState('');
  const getInferenceLog = async () => {
    const res = await fetchInferenceLog(id);
    const l = logEl.current;
    if (res.code === 0) {
      let log = res.data.log;
      if (typeof log === 'object') {
        log = '';
      }
      setLogs(log);
      setTimeout(() => {
        l && l.scrollTo(0, 100000000);
      }, 120);
    }
    return res;
  }
  const getInferenceDetail = async () => {
    const res = await fetchInferenceDetail(id)
    if (res.code === 0) {
      setJobDetail(res.data);
    }
  }
  useEffect(() => {
    getInferenceDetail();
    getInferenceLog();
    let timer = setInterval(() => {
      getInferenceDetail();
      getInferenceLog();
    }, 3000)
    return () => {
      clearInterval(timer);
    }
  }, [])
  const handleChange = info => {
    if (info.file.status === 'uploading') {
      setLoading(true);
      return;
    }
    if (info.file.status === 'done') {
      getBase64(info.file.originFileObj, imageUrl => {
        setImageUrl(imageUrl);
        setLoading(false);
      });
      // Get this url from response in real world.
      let imageBase64 = info.file.response.data
      if (typeof imageBase64 !== 'string') {
        getBase64(info.file.originFileObj, imageUrl => {
          setTempImageUrl(imageUrl);
          setLoading(false);
        });
      } else {
        setTempImageUrl(imageBase64);
        setLoading(false);
      }
      
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
    setBeginAnalizeLoading(true);
    setTimeout(() => {
      setImageUrl('data:image/jpg;base64,' + tempImageUrl)
      setBeginAnalizeLoading(false)
    }, 1000);
  }
  const getLateastLogs = async () => {
    const cancel = message.loading('获取日志中')
    const res = await getInferenceLog()
    cancel();
    if (res.code === 0) {
      message.success('成功获取日志')
    }
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
        headers={{
          Authorization: `Bearer ${localStorage.token}`
        }}
        name="image"
        listType="picture-card"
        className="avatar-uploader"
        showUploadList={false}
        action={`/ai_arts/api/inferences/Infer?jobId=${id}`}
        beforeUpload={beforeUpload}
        style={{position: 'relative'}}
        onChange={handleChange}
      >
        {(imageUrl) ? <img src={imageUrl} alt="avatar" style={{ width: '620px' }} /> : uploadButton}
      </Upload>
      <Button disabled={tempImageUrl.length === 0} loading={beginAnalizeLoading} onClick={beginAnalyze}>开始识别</Button>
      <Descriptions style={{marginTop: '20px'}} bordered={true} column={2}>
        <Descriptions.Item label="作业名称">{jobDetail.jobName}</Descriptions.Item>
        <Descriptions.Item label="作业状态">{getJobStatus(jobDetail.jobStatus)}</Descriptions.Item>
        <Descriptions.Item label="引擎类型">{jobDetail.jobParams?.image}</Descriptions.Item>
        <Descriptions.Item label="ID">{jobDetail.jobId}</Descriptions.Item>
        <Descriptions.Item label="创建时间">{moment(jobDetail.jobTime).format('YYYY-MM-DD HH:mm')}</Descriptions.Item>
        <Descriptions.Item label="计算节点规格">{jobDetail.jobParams?.gpuType}</Descriptions.Item>
        <Descriptions.Item label="使用模型">{jobDetail.jobParams?.model_base_path}</Descriptions.Item>
        <Descriptions.Item label="计算节点个数">{jobDetail.jobParams?.resourcegpu}</Descriptions.Item>
        {/* <Descriptions.Item label="作业参数"></Descriptions.Item> */}
        {/* <Descriptions.Item label="服务地址">test</Descriptions.Item> */}
        <Descriptions.Item label="描述">{jobDetail.desc}</Descriptions.Item>
      </Descriptions>
      <div className="ant-descriptions-title" style={{marginTop: '30px'}}>训练日志</div>
      {!['unapproved', 'queued', 'scheduling'].includes(jobDetail.jobStatus) &&<Button onClick={getLateastLogs}>点击获取最新日志</Button>}
      <div>
        {logs ? <pre ref={logEl} style={{marginTop: '20px'}} className={styles.logs}>
          {logs}
        </pre> : (
          ['unapproved', 'queued', 'scheduling'].includes(jobDetail.jobStatus) && <div>训练任务尚未开始</div>
        )}
        {
          ['failed'].includes(jobDetail.jobStatus) && <div style={{marginTop: '20px'}} >当前训练任务已失败</div>
        }
      </div>


    </PageHeaderWrapper>
  )
}




export default InferenceDetail;