import React, { useEffect, useState, useRef } from 'react';
import { Button, Descriptions, Divider } from 'antd';
import { useParams } from 'umi';
import { message } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import 'react-virtualized/styles.css';
import List from 'react-virtualized/dist/es/List';
import moment from 'moment';

import { fetchTrainingDetail, removeTrainings, fetchTrainingLog } from '@/services/modelTraning';
import styles from './index.less';
import { getJobStatus } from '@/utils/utils';


const Detail = () => {
  const params = useParams();
  const logEl = useRef(null);
  const id = params.id;
  const [logs, setLogs] = useState('');
  const [jobDetail, setJobDetail] = useState({});
  const getTrainingDetail = async () => {
    const res = await fetchTrainingDetail(id);
    if (res.code === 0) {
      setJobDetail(res.data)
      const status = res.data.status;
      if (!['unapproved', 'queued', 'scheduling'].includes(status)) {
        getTrainingLogs(id)
      }
    }
  }
  useEffect(() => {
    getTrainingDetail();
  }, [])

  const getTrainingLogs = async () => {
    const res = await fetchTrainingLog(id);
    const l = logEl.current;
    if (res.code === 0) {
      setLogs(res.data.log);
      setTimeout(() => {
        l && l.scrollTo(0, 100000000);
      }, 120);
    }
  }

  const handleFetchTrainingLogs = async () => {
    const cancel = message.loading('获取日志中')
    await getTrainingLogs()
    cancel();
    message.success('成功获取日志')
  }


  const stopTraining = () => {
    //
  }

  const removeTraining = async () => {
    const res = await removeTrainings(id);
    if (res.code === 0) {
      message.success('成功删除');
    }
  }
  return (
    <div className={styles.modelDetail}>
      <div className={styles.topButtons}>
        <div className="ant-descriptions-title" style={{ marginTop: '30px' }}>模型训练</div>
        <div>
          <Button onClick={removeTraining}>删除训练</Button>
        </div>
      </div>
      <Descriptions bordered={true} column={2}>
        <Descriptions.Item label="作业名称">{jobDetail.name}</Descriptions.Item>
        <Descriptions.Item label="作业状态">{getJobStatus(jobDetail.status)}</Descriptions.Item>
        <Descriptions.Item label="引擎类型">{jobDetail.engine}</Descriptions.Item>
        <Descriptions.Item label="ID">{jobDetail.id}</Descriptions.Item>
        <Descriptions.Item label="创建时间">{moment(jobDetail.createTime).format('YYYY-MM-DD HH:mm:ss')}</Descriptions.Item>
        <Descriptions.Item label="运行参数">{jobDetail.params}</Descriptions.Item>
        <Descriptions.Item label="代码目录">{jobDetail.codePath}</Descriptions.Item>
        <Descriptions.Item label="计算节点个数">{jobDetail.deviceNum}</Descriptions.Item>
        <Descriptions.Item label="启动文件">{jobDetail.startupFile}</Descriptions.Item>
        <Descriptions.Item label="计算节点规格">{jobDetail.deviceType}</Descriptions.Item>
        <Descriptions.Item label="训练数据集">{jobDetail.datasetPath}</Descriptions.Item>
        <Descriptions.Item label="描述">{jobDetail.desc}</Descriptions.Item>
        <Descriptions.Item label="输出路径">{jobDetail.outputPath}</Descriptions.Item>
        <Descriptions.Item label="checkpoint 文件">{jobDetail.checkpoint}</Descriptions.Item>
      </Descriptions>
      <div className="ant-descriptions-title" style={{ marginTop: '30px' }}>训练日志</div>
      {!['unapproved', 'queued', 'scheduling'].includes(jobDetail.status) && <Button onClick={handleFetchTrainingLogs} style={{marginBottom: '20px'}}>获取训练日志</Button>}
      {logs ? <pre ref={logEl} className={styles.logs}>
        {logs}
      </pre> : (<div>
        {
          ['unapproved', 'queued', 'scheduling'].includes(jobDetail.status) ?
            <div>训练任务尚未开始运行</div>
            :
            <LoadingOutlined />
        }
      </div>)
      }
    </div>

  )
}




export default Detail;




