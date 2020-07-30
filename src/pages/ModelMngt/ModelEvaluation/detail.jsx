import { history } from 'umi';
import { PageHeader, Descriptions, Button, message } from 'antd';
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'umi';
import moment from 'moment';
import { fetchEvaluationDetail } from './services';
import { getJobStatus } from '@/utils/utils';

import styles from './index.less';

const EvaluationDetail = props => {
  const params = useParams();
  const modelId = params.id;

  const logEl = useRef(null);
  const [evaluationJob, setEvaluationJob] = useState(null);
  const [logs, setLogs] = useState('');
  const [indicator, setIndicator] = useState(null);

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
    const res = await fetchEvaluationDetail(modelId);
    const { code, msg, data: {evaluation, log, indicator } } = res;
    if (code === 0) {
      setEvaluationJob(evaluation);
      setLogs(log);
      setIndicator(indicator);
    }
  }

  const getLateastLogs = async () => {
    const cancel = message.loading('获取结果中');
    const res = await getEvaluationLog();
    cancel();
    if (res.code === 0) {
      message.success('成功获取结果');
    }
  }  

  useEffect(() => {
    getEvaluationDetail();
  }, []);

  return (
    <PageHeader
      ghost={false}
      onBack={() => history.push('/ModelManagement/MyModels')}
      title="评估详情"
    >
      <Descriptions style={{marginTop: '20px'}} bordered={true} column={2}>
        <Descriptions.Item label="模型名称">{evaluationJob?.name}</Descriptions.Item>
        <Descriptions.Item label="评估状态">{evaluationJob ? getJobStatus(evaluationJob.status) : ''}</Descriptions.Item>
        <Descriptions.Item label="引擎类型">{evaluationJob?.engine}</Descriptions.Item>
        <Descriptions.Item label="测试数据集">{evaluationJob?.desc}</Descriptions.Item>
        <Descriptions.Item label="创建时间">{(evaluationJob && evaluationJob.createTime) ? moment(evaluationJob.createTime).format('YYYY-MM-DD HH:mm:ss') : ''}</Descriptions.Item>
        <Descriptions.Item label="设备类型">{evaluationJob?.deviceType}</Descriptions.Item>
        <Descriptions.Item label="设备数量">{evaluationJob?.deviceNum}</Descriptions.Item>
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