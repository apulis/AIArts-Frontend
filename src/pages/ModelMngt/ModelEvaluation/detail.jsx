import { history } from 'umi';
import { PageHeader, Descriptions, Button, message, Modal, Form, Input, Radio, Tabs } from 'antd';
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'umi';
import moment from 'moment';
import { fetchEvaluationDetail, saveEvaluationParams } from './services';
import { getJobStatus, formatParams } from '@/utils/utils';
import { modelEvaluationType } from '@/utils/const';

import styles from './index.less';

const { TabPane } = Tabs;

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
  
  const saveTrainingDetail = async () => {
    const values = await validateFields(['name', 'desc', 'scope']);
    const submitData = {};
    submitData.scope = values.scope;
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
  }, []);

  const commonLayout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 15 }
  };

  return (
    <>
      <PageHeader
        ghost={false}
        onBack={() => history.push('/ModelManagement/MyModels')}
        title="评估详情"
      >
        <div className={styles.saveEvalParams}>
          <Button onClick={() => setModalVisible(true)}>保存评估参数</Button>
        </div>
        <Descriptions style={{marginTop: '20px'}} bordered={true} column={2}>
          <Descriptions.Item label="模型名称">{evaluationJob?.name}</Descriptions.Item>
          <Descriptions.Item label="创建时间">{(evaluationJob && evaluationJob.createTime) ? moment(evaluationJob.createTime).format('YYYY-MM-DD HH:mm:ss') : ''}</Descriptions.Item>
          <Descriptions.Item label="评估状态">{evaluationJob ? getJobStatus(evaluationJob.status) : ''}</Descriptions.Item>
          <Descriptions.Item label="引擎类型">{evaluationJob?.engine}</Descriptions.Item>
          <Descriptions.Item label="测试数据集">{evaluationJob?.datasetName}</Descriptions.Item>
          <Descriptions.Item label="代码目录">{evaluationJob?.codePath}</Descriptions.Item>
          <Descriptions.Item label="启动文件">{evaluationJob?.startupFile}</Descriptions.Item>
          <Descriptions.Item label="输出路径">{evaluationJob?.outputPath}</Descriptions.Item>
          <Descriptions.Item label="设备类型">{evaluationJob?.deviceType}</Descriptions.Item>
          <Descriptions.Item label="设备数量">{evaluationJob?.deviceNum}</Descriptions.Item>
          <Descriptions.Item label="运行参数">{evaluationJob && evaluationJob.params && formatParams(evaluationJob.params).map(p => <div>{p}</div>)}</Descriptions.Item>
        </Descriptions>
        <div className="ant-descriptions-title" style={{marginTop: '30px'}}>评估结果</div>
        <Button onClick={getLateastLogs}>获取评估结果</Button>
        <Tabs defaultActiveKey="1">
          <TabPane tab="评估日志" key="1">
            {logs && <pre ref={logEl} style={{marginTop: '20px'}} className={styles.logs}>
              {logs}
            </pre>}
          </TabPane>
          <TabPane tab="评估结果" key="2">
            {logs && <pre ref={logEl} style={{marginTop: '20px'}} className={styles.logs}>
              {logs}
            </pre>}
          </TabPane>
        </Tabs>
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
            <Form.Item
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
            </Form.Item>
          </Form>
        </Modal>
      }
    </>
  );
};

export default EvaluationDetail;