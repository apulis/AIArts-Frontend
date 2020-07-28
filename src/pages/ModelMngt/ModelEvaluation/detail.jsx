import { history } from 'umi';
import { PageHeader, Descriptions, Button, message } from 'antd';
import React, { useState, useEffect, useRef } from 'react';
// import { getEvaluationStatus } from '@/utils/utils';
import { useParams } from 'umi';
import moment from 'moment';
import { fetchEvaluationLog, fetchEvaluationDetail } from './services';
import styles from './index.less';

const EvaluationDetail = props => {
  const params = useParams();
  const modelId = params.id;

  const logEl = useRef(null);
  // const [evaluationDetail, setEvaluationDetail] = useState(null);
  const [logs, setLogs] = useState('');

  const getEvaluationLog = async () => {
    const res = await fetchEvaluationDetail(modelId);
    if (res.code === 0) {
      let log = res.data.log;
      if (typeof log === 'object') {
        log = '';
      }
      setLogs(log);
    }
    return res;
  }
  const getEvaluationDetail = async () => {
    const res = await fetchEvaluationDetail(id)
    if (res.code === 0) {
      setEvaluationDetail(res.data.job);
    }
  }

  const getLateastLogs = async () => {
    const cancel = message.loading('获取结果中');
    const res = await getEvaluationLog();
    cancel();
    if (res.code === 0) {
      message.success('成功获取日志');
    }
  }  

  const evaluationDetail = {
    modelName: 'hanjf-test2',
    status: 'running',
    engineType: 'apulistech/pytorch:2.0',
    dataset: 'coco',
    createAt: new Date().valueOf(),
    deviceType: 'nvidia_gpu_amd64',
    deviceNum: '2',
  };

  useEffect(() => {
    // getMockEvaluationDetail();
    // getEvaluationDetail();
  }, []);

  return (
    <PageHeader
      ghost={false}
      onBack={() => history.push('/ModelManagement/MyModels')}
      title="评估详情"
    >
      <Descriptions style={{marginTop: '20px'}} bordered={true} column={2}>
        <Descriptions.Item label="模型名称">{evaluationDetail.modelName}</Descriptions.Item>
        {/* <Descriptions.Item label="评估状态">{getEvaluationStatus(evaluationDetail.status)}</Descriptions.Item> */}
        <Descriptions.Item label="评估状态">{evaluationDetail.status}</Descriptions.Item>
        <Descriptions.Item label="引擎类型">{evaluationDetail.engine}</Descriptions.Item>
        <Descriptions.Item label="测试数据集">{evaluationDetail.datasetPath}</Descriptions.Item>
        {/* <Descriptions.Item label="创建时间">{moment(evaluationDetail.createAt).format('YYYY-MM-DD HH:mm')}</Descriptions.Item> */}
        <Descriptions.Item label="创建时间">{evaluationDetail.createTime}</Descriptions.Item>
        <Descriptions.Item label="设备类型">{evaluationDetail.deviceType}</Descriptions.Item>
        <Descriptions.Item label="设备数量">{evaluationDetail.deviceNum}</Descriptions.Item>
      </Descriptions>
      <div className="ant-descriptions-title" style={{marginTop: '30px'}}>评估结果</div>
      <Button onClick={getLateastLogs}>点击获取评估结果</Button>
      <div>
        {logs && <pre ref={logEl} style={{marginTop: '20px'}} className={styles.logs}>
          {logs}
        </pre>}
      </div>
    </PageHeader>
  );
};

export default EvaluationDetail;