import { history } from 'umi';
import { PageHeader, Descriptions, Button, message, Modal, Form, Input, Radio } from 'antd';
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'umi';
import moment from 'moment';
import { fetchEvaluationDetail, saveEvaluationParams } from './services';
import { getJobStatus, formatParams } from '@/utils/utils';
import { modelEvaluationType, REFRESH_INTERVAL } from '@/utils/const';

import styles from './index.less';

const EvaluationDetail = props => {
  const params = useParams();
  const modelId = params.id;

  const logEl = useRef(null);
  const [evaluationJob, setEvaluationJob] = useState(null);
  const [logs, setLogs] = useState('');
  const [indicator, setIndicator] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  
  const [form] = Form.useForm();
  const { validateFields } = form;

  const getEvaluationDetail = async () => {
    // const cancel = message.loading('获取结果中');
    const res = await fetchEvaluationDetail(modelId);
    // cancel();
    const { code, msg, data: { evaluation, log, indicator } } = res;
    if (code === 0) {
      // message.success('成功获取结果');
      
      setEvaluationJob(evaluation);
      setLogs(log);
      setIndicator(indicator);

      // console.log(111, evaluation.status)
      // //  作业已经完成，不再刷新请求
      // if(isFinished(evaluation.status)){
      //   console.log('finished...')
      //   clearInterval(timer);
      //   return;
      // }
    }
  }

  const isFinished = (status) => {
    // let status = evaluationJob.status;

    if (['finished','failed','pausing','paused','killing','killed','error'].includes(status)) {
      return true;
    }else{
      return false;
    }
  }

  const getLateastLogs = async () => {
    const cancel = message.loading('获取结果中');
    const res = await fetchEvaluationDetail(modelId);
    cancel();
    const { code, msg, data: { evaluation, log, indicator } } = res;
    if (code === 0) {
      message.success('成功获取结果');

      setEvaluationJob(evaluation);
      setLogs(log);
      setIndicator(indicator);
    }
  }
  
  const saveTrainingDetail = async () => {
    // const values = await validateFields(['name', 'desc', 'scope']);
    const values = await validateFields(['name', 'desc']);
    const submitData = {};
    // submitData.scope = values.scope;
    submitData.scope = 2;
    submitData.jobType = modelEvaluationType;
    submitData.templateData = {};
    submitData.templateData = Object.assign({}, evaluationJob, values);
    delete submitData.templateData.id;
    const res = await saveEvaluationParams(submitData);
    if (res.code === 0) {
      message.success('保存成功');
      setModalVisible(false);
    }
  }  

  useEffect(() => {
    getEvaluationDetail();
    let timer = setInterval(() => {
      getEvaluationDetail()
    }, REFRESH_INTERVAL);
    return () => {
      clearInterval(timer)
    }
  }, []);

  const commonLayout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 15 }
  };

  return (
    <>
      <PageHeader
        ghost={false}
        onBack={() => history.push('/ModelManagement/ModelEvaluation/List')}
        title="评估详情"
      >
        <div className={styles.saveEvalParams}>
          <Button type="primary" onClick={() => setModalVisible(true)}>保存评估参数</Button>
        </div>
        <Descriptions style={{marginTop: '20px'}} bordered={true} column={2}>
          <Descriptions.Item label="模型名称">{evaluationJob?.name}</Descriptions.Item>
          <Descriptions.Item label="创建时间">{(evaluationJob && evaluationJob.createTime) ? moment(evaluationJob.createTime).format('YYYY-MM-DD HH:mm:ss') : ''}</Descriptions.Item>
          <Descriptions.Item label="评估状态">{evaluationJob ? getJobStatus(evaluationJob.status) : ''}</Descriptions.Item>
          <Descriptions.Item label="引擎类型">{evaluationJob?.engine}</Descriptions.Item>
          <Descriptions.Item label="测试数据集">{evaluationJob && (evaluationJob.datasetName ? evaluationJob.datasetName : evaluationJob.datasetPath)}</Descriptions.Item>
          <Descriptions.Item label="代码目录">{evaluationJob?.codePath}</Descriptions.Item>
          <Descriptions.Item label="启动文件">{evaluationJob?.startupFile}</Descriptions.Item>
          <Descriptions.Item label="输出路径">{evaluationJob?.outputPath}</Descriptions.Item>
          <Descriptions.Item label="设备类型">{evaluationJob?.deviceType}</Descriptions.Item>
          <Descriptions.Item label="设备数量">{evaluationJob?.deviceNum}</Descriptions.Item>
          <Descriptions.Item label="运行参数">{evaluationJob && evaluationJob.params && formatParams(evaluationJob.params).map(p => <div>{p}</div>)}</Descriptions.Item>
        </Descriptions>
        <div className="ant-descriptions-title" style={{marginTop: '30px'}}>评估结果</div>
        <Button type="primary" onClick={getLateastLogs}>获取评估结果</Button>
        {indicator && <Descriptions style={{marginTop: '20px'}} bordered={true} column={2}>
          {Object.keys(indicator).map(key => <Descriptions.Item label={key}>{indicator[key]}</Descriptions.Item>)}
        </Descriptions>}
        {logs && <pre ref={logEl} style={{marginTop: '20px'}} className={styles.logs}>
          {logs}
        </pre>}        
      </PageHeader>
      {modalVisible &&
        <Modal
          visible={modalVisible}
          onCancel={() => setModalVisible(false)}
          onOk={saveTrainingDetail}
          title="保存至"
        >
          <Form
            form={form}
          >
            <Form.Item
              {...commonLayout}
              name="name"
              label="配置名称"
              rules={[{ required: true }]}
            >
              <Input placeholder="请输入配置名称" />
            </Form.Item>
            <Form.Item
              {...commonLayout}
              name="jobType"
              label="类型"
              initialValue="模型评估"
              rules={[{ required: true }]}
            >
              <Input disabled />
            </Form.Item>
            <Form.Item
              {...commonLayout}
              name="engine"
              label="引擎类型"
              initialValue={evaluationJob.engine}
              rules={[{ required: true }]}
            >
              <Input disabled />
            </Form.Item>
            <Form.Item
              {...commonLayout}
              name="desc"
              label="描述"
              rules={[{ required: true }]}
            >
              <Input.TextArea />
            </Form.Item>
            {/* <Form.Item
              {...commonLayout}
              name="scope"
              label="是否为公开模板"
              rules={[{ required: true }]}
              initialValue={2}
            >
              <Radio.Group
                options={[
                  {value: 1, label: '是'},
                  {value: 2, label: '否'}
                ]}
              >

              </Radio.Group>
            </Form.Item> */}
          </Form>
        </Modal>
      }
    </>
  );
};

export default EvaluationDetail;