import { history } from 'umi';
import { PageHeader, Descriptions, Button, message, Modal, Form, Input, Tooltip } from 'antd';
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'umi';
import moment from 'moment';
import { fetchEvaluationDetail, saveEvaluationParams } from './services';
import { getJobStatus, formatParams } from '@/utils/utils';
import { modelEvaluationType, REFRESH_INTERVAL } from '@/utils/const';

import styles from './index.less';
import { getNameFromDockerImage } from '@/utils/reg';
import { useIntl } from 'umi';

const EvaluationDetail = (props) => {
  const intl = useIntl();
  const params = useParams();
  const modelId = params.id;

  const logEl = useRef(null);
  const [evaluationJob, setEvaluationJob] = useState(null);
  const [logs, setLogs] = useState('');
  const [indicator, setIndicator] = useState(null);
  const [confusion, setConfusion] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isPublic, setIsPublic] = useState(false);

  const [form] = Form.useForm();
  const { validateFields } = form;

  const getEvaluationDetail = async () => {
    // const cancel = message.loading('获取结果中');
    const res = await fetchEvaluationDetail(modelId);
    // cancel();
    const { code, msg } = res;
    if (code === 0) {
      // message.success('成功获取结果');
      const {
        data: { evaluation, log, indicator, confusion },
      } = res;
      if (evaluation.params && 'visualPath' in evaluation.params) {
        evaluation.visualPath = evaluation.params?.visualPath;
        delete evaluation.params['visualPath'];
      }
      setEvaluationJob(evaluation);
      setLogs(log);
      setIndicator(indicator);
      setConfusion(confusion);

      // console.log(111, evaluation.status)
      // //  作业已经完成，不再刷新请求
      // if(isFinished(evaluation.status)){
      //   console.log('finished...')
      //   clearInterval(timer);
      //   return;
      // }

      // 判断是否/data开头
      const dataPreffix = evaluation.codePath ? evaluation.codePath.startsWith('/data') : false;
      setIsPublic(dataPreffix);
    }
  };

  const isFinished = (status) => {
    // let status = evaluationJob.status;

    if (
      ['finished', 'failed', 'pausing', 'paused', 'killing', 'killed', 'error'].includes(status)
    ) {
      return true;
    } else {
      return false;
    }
  };

  const getLateastLogs = async () => {
    const cancel = message.loading(
      intl.formatMessage({ id: 'modelMngt.detail.getLateastLogs.tips.loading' }),
    );
    const res = await fetchEvaluationDetail(modelId);
    cancel();
    const { code, msg } = res;
    if (code === 0) {
      const {
        data: { evaluation, log, indicator, confusion },
      } = res;
      message.success(intl.formatMessage({ id: 'modelMngt.detail.getLateastLogs.tips.success' }));
      if ('visualPath' in evaluation.params) {
        evaluation.visualPath = evaluation.params?.visualPath;
        delete evaluation.params['visualPath'];
      }
      setEvaluationJob(evaluation);
      setLogs(log);
      setIndicator(indicator);
      setConfusion(confusion);
    }
  };

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
      message.success(
        intl.formatMessage({ id: 'modelMngt.detail.saveTrainingDetail.tips.success' }),
      );
      setModalVisible(false);
    }
  };

  useEffect(() => {
    getEvaluationDetail();
    let timer = setInterval(() => {
      getEvaluationDetail();
    }, REFRESH_INTERVAL);
    return () => {
      clearInterval(timer);
    };
  }, []);

  const commonLayout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 15 },
  };

  return (
    <>
      <PageHeader
        ghost={false}
        onBack={() => history.push('/ModelManagement/ModelEvaluation/List')}
        title={intl.formatMessage({ id: 'modelMngt.detail.evaluation.detail' })}
      >
        <div className={styles.saveEvalParams}>
          {isPublic ? (
            <Tooltip
              placement="bottomLeft"
              title={intl.formatMessage({ id: 'modelMngt.detail.template' })}
              arrowPointAtCenter
            >
              <Button type="primary" disabled onClick={() => setModalVisible(true)}>
                {intl.formatMessage({ id: 'modelMngt.detail.evaluation.saveParam' })}
              </Button>
            </Tooltip>
          ) : (
            <Button type="primary" onClick={() => setModalVisible(true)}>
              {intl.formatMessage({ id: 'modelMngt.detail.evaluation.saveParam' })}
            </Button>
          )}
        </div>
        <Descriptions style={{ marginTop: '20px' }} bordered={true} column={2}>
          <Descriptions.Item label={intl.formatMessage({ id: 'modelMngt.detail.modelName' })}>
            {evaluationJob?.name}
          </Descriptions.Item>
          <Descriptions.Item label={intl.formatMessage({ id: 'modelMngt.detail.createTime' })}>
            {evaluationJob && evaluationJob.createTime
              ? moment(evaluationJob.createTime).format('YYYY-MM-DD HH:mm:ss')
              : ''}
          </Descriptions.Item>
          <Descriptions.Item
            label={intl.formatMessage({ id: 'modelMngt.detail.evaluationStatus' })}
          >
            {evaluationJob ? getJobStatus(evaluationJob.status) : ''}
          </Descriptions.Item>
          <Descriptions.Item label={intl.formatMessage({ id: 'modelMngt.detail.engineType' })}>
            {getNameFromDockerImage(evaluationJob?.engine)}
          </Descriptions.Item>
          <Descriptions.Item label={intl.formatMessage({ id: 'modelMngt.detail.testDataSet' })}>
            {evaluationJob &&
              (evaluationJob.datasetName ? evaluationJob.datasetName : evaluationJob.datasetPath)}
          </Descriptions.Item>
          <Descriptions.Item label={intl.formatMessage({ id: 'modelMngt.detail.codePath' })}>
            {evaluationJob?.codePath}
          </Descriptions.Item>
          <Descriptions.Item label={intl.formatMessage({ id: 'modelMngt.detail.startupFile' })}>
            {evaluationJob?.startupFile}
          </Descriptions.Item>
          <Descriptions.Item label={intl.formatMessage({ id: 'modelMngt.detail.visualPath' })}>
            {evaluationJob?.visualPath}
          </Descriptions.Item>
          <Descriptions.Item label={intl.formatMessage({ id: 'modelMngt.detail.outputPath' })}>
            {evaluationJob?.outputPath}
          </Descriptions.Item>
          {evaluationJob && evaluationJob.paramPath ? (
            <Descriptions.Item
              label={intl.formatMessage({ id: 'modelMngt.detail.modelWeightFile' })}
            >
              {evaluationJob?.paramPath}
            </Descriptions.Item>
          ) : null}
          <Descriptions.Item label={intl.formatMessage({ id: 'modelMngt.detail.deviceType' })}>
            {evaluationJob?.deviceType}
          </Descriptions.Item>
          <Descriptions.Item label={intl.formatMessage({ id: 'modelMngt.detail.deviceNum' })}>
            {evaluationJob?.deviceNum}
          </Descriptions.Item>
          <Descriptions.Item label={intl.formatMessage({ id: 'modelMngt.detail.runningParam' })}>
            {evaluationJob &&
              evaluationJob.params &&
              formatParams(evaluationJob.params).map((p) => <div>{p}</div>)}
          </Descriptions.Item>
        </Descriptions>
        {['finished', 'running'].includes(evaluationJob?.status) && (
          <>
            <div className="ant-descriptions-title" style={{ marginTop: '30px' }}>
              {intl.formatMessage({ id: 'modelMngt.detail.evaluationResult' })}
            </div>
            <Button type="primary" onClick={getLateastLogs} style={{ marginTop: '16px' }}>
              {intl.formatMessage({ id: 'modelMngt.detail.getEvaluationResult' })}
            </Button>
          </>
        )}
        {confusion && JSON.stringify(confusion) != '{}' && (
          <table border={1} className={styles.confusionTable}>
            <tr>
              <th></th>
              <th className={styles.title}>{confusion.y1}</th>
              <th className={styles.title}>{confusion.y2}</th>
              <th className={styles.title}>Recall</th>
            </tr>
            <tr>
              <td className={styles.title}>{confusion.x1}</td>
              <td>{confusion.TP}</td>
              <td>{confusion.FN}</td>
              <td>{confusion.Recall1}</td>
            </tr>
            <tr>
              <td className={styles.title}>{confusion.x2}</td>
              <td>{confusion.FP}</td>
              <td>{confusion.TN}</td>
              <td>{confusion.Recall2}</td>
            </tr>
            <tr>
              <td className={styles.title}> Precision</td>
              <td>{confusion.Precision1}</td>
              <td>{confusion.Precision2}</td>
              <td></td>
            </tr>
          </table>
        )}
        {indicator && (
          <Descriptions style={{ marginTop: '20px' }} bordered={true} column={2}>
            {Object.keys(indicator).map((key) => (
              <Descriptions.Item label={key}>{indicator[key]}</Descriptions.Item>
            ))}
          </Descriptions>
        )}
        {logs && (
          <pre ref={logEl} style={{ marginTop: '20px' }} className={styles.logs}>
            {logs}
          </pre>
        )}
      </PageHeader>
      {modalVisible && (
        <Modal
          visible={modalVisible}
          onCancel={() => setModalVisible(false)}
          onOk={saveTrainingDetail}
          title={intl.formatMessage({ id: 'modelMngt.detail.save' })}
        >
          <Form form={form}>
            <Form.Item
              {...commonLayout}
              name="name"
              label={intl.formatMessage({ id: 'modelMngt.detail.configName' })}
              rules={[{ required: true }]}
            >
              <Input
                placeholder={intl.formatMessage({
                  id: 'modelMngt.detail.placeholder.needConfigName',
                })}
              />
            </Form.Item>
            <Form.Item
              {...commonLayout}
              name="jobType"
              label={intl.formatMessage({ id: 'modelMngt.detail.type' })}
              initialValue={intl.formatMessage({ id: 'modelMngt.detail.modelEvaluation' })}
              rules={[{ required: true }]}
            >
              <Input disabled />
            </Form.Item>
            <Form.Item
              {...commonLayout}
              name="engine"
              label={intl.formatMessage({ id: 'modelMngt.detail.engineType' })}
              initialValue={evaluationJob.engine}
              rules={[{ required: true }]}
            >
              <Input disabled />
            </Form.Item>
            <Form.Item
              {...commonLayout}
              name="desc"
              label={intl.formatMessage({ id: 'modelMngt.detail.description' })}
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
      )}
    </>
  );
};

export default EvaluationDetail;
