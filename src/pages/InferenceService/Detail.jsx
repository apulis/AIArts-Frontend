import React, { useState, useRef, useEffect } from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { Descriptions, message, Upload, Button, Table } from 'antd';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { useParams } from 'umi';
import moment from 'moment';

import { fetchInferenceDetail, fetchInferenceLog } from '../../services/inferenceService';

import styles from './index.less';
import { getJobStatus } from '@/utils/utils';
import useInterval from '@/hooks/useInterval';
import { connect } from 'dva';
import { useIntl } from 'umi';

export function getBase64(img, callback) {
  const reader = new FileReader();
  reader.addEventListener('load', () => callback(reader.result));
  reader.readAsDataURL(img);
}

const InferenceDetail = (props) => {
  const intl = useIntl();
  const [imageUrl, setImageUrl] = useState('');
  const [tempImageUrl, setTempImageUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const [jobDetail, setJobDetail] = useState({});
  const [recognizeResult, setRecognizeResult] = useState([]);
  const logEl = useRef(null);
  const [beginAnalizeLoading, setBeginAnalizeLoading] = useState(false);
  const params = useParams();
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
    }
    return res;
  };

  const columns = [
    {
      title: intl.formatMessage({id: 'centerInference.detail.recognition.result'}),
      dataIndex: 'key',
    },
    {
      title: intl.formatMessage({id: 'centerInference.detail.recognition.accuracy'}),
      dataIndex: 'value',
    },
  ];

  const getInferenceDetail = async () => {
    const res = await fetchInferenceDetail(id);
    if (res.code === 0) {
      setJobDetail(res.data);
    }
  };
  useEffect(() => {
    getInferenceDetail();
    getInferenceLog();
    return () => {
      fetchInferenceDetail.cancel && fetchInferenceDetail.cancel();
      fetchInferenceLog.cancel && fetchInferenceLog.cancel();
    };
  }, []);
  useInterval(() => {
    getInferenceDetail();
    getInferenceLog();
  }, props.common.interval);
  const handleChange = (info) => {
    if (info.file.status === 'uploading') {
      setImageUrl('');
      setLoading(true);
      return;
    }
    if (info.file.status === 'done') {
      const res = info.file.response;
      getBase64(info.file.originFileObj, (imageUrl) => {
        if (Array.isArray(res.data.data)) {
          setImageUrl(imageUrl);
        }
        setLoading(false);
      });
      if (res.code === 0) {
        const data = res.data?.data;
        const type = res.data?.type;
        if (type === 'classify') {
          const recognizeResult = [];
          data.forEach((val) => {
            const o = {};
            o.key = val[0];
            o.value = val[1];
            recognizeResult.push(o);
          });
          setRecognizeResult(recognizeResult);
        } else if (type === 'detection') {
          setImageUrl('data:image/jpg;base64,' + data);
        }
        setLoading(false);
      }
    }

    if (info.file.status === 'error') {
      setLoading(false);
      message.error(intl.formatMessage({id: 'centerInference.detail.dealwith.error'}));
    }
  };
  const beforeUpload = (file) => {
    const isImage = [
      'image/jpeg',
      'image/png',
      'image/png',
      'image/bmg',
      'image/tif',
      'image/gif',
    ].includes(file.type);
    if (!isImage) {
      message.error(intl.formatMessage({id: 'centerInference.detail.upload.mediaLimit'}));
    }
    const isLt100M = file.size / 1024 / 1024 < 100;
    if (!isLt100M) {
      message.error(intl.formatMessage({id: 'centerInference.detail.upload.sizeLimit'}));
    }
    return isImage && isLt100M;
  };
  const beginAnalyze = () => {
    setBeginAnalizeLoading(true);
    setTimeout(() => {
      setImageUrl('data:image/jpg;base64,' + tempImageUrl);
      setBeginAnalizeLoading(false);
    }, 1000);
  };
  const getLateastLogs = async () => {
    const cancel = message.loading(intl.formatMessage({id: 'centerInference.detail.getLogging'}));
    const res = await getInferenceLog();
    cancel();
    if (res.code === 0) {
      message.success(intl.formatMessage({id: 'centerInference.detail.getLog.success'}));
    }
  };
  const jobRunning = jobDetail.jobStatus === 'running';
  const uploadButton = (
    <div style={{ height: '104px', width: '104px', paddingTop: '30px' }}>
      {loading ? <LoadingOutlined /> : <PlusOutlined />}
      <div className="ant-upload-text">{loading ? intl.formatMessage({id: 'centerInference.detail.recognzing'}) : intl.formatMessage({id: 'centerInference.detail.upload.file'})}</div>
    </div>
  );

  const reUpload = () => {
    setRecognizeResult([]);
    setImageUrl('');
  };

  const jobEnded = ['finished', 'failed', 'killed', 'error'].includes(jobDetail.jobStatus);
  return (
    <PageHeaderWrapper>
      <main className={styles.topContainer}>
        <div className={styles.imageContainer}>
          {jobRunning && (
            <Upload
              headers={{
                Authorization: `Bearer ${localStorage.token}`,
              }}
              name="image"
              listType="picture-card"
              className="avatar-uploader"
              showUploadList={false}
              action={`/ai_arts/api/inferences/Infer?jobId=${id}`}
              beforeUpload={beforeUpload}
              style={{ position: 'relative' }}
              onChange={handleChange}
            >
              {imageUrl ? (
                <img src={imageUrl} alt="avatar" title={intl.formatMessage({id: 'centerInference.detail.upload.again'})} style={{ width: '620px' }} />
              ) : (
                uploadButton
              )}
            </Upload>
          )}
        </div>

        {recognizeResult.length > 0 && (
          <Table
            style={{ width: '320px' }}
            dataSource={recognizeResult}
            columns={columns}
            pagination={false}
            size="small"
          />
        )}
      </main>
      {recognizeResult.length !== 0 && (
        <Button type="primary" onClick={() => reUpload()} style={{ marginTop: '18px' }}>
          {intl.formatMessage({id: 'centerInference.detail.clearData'})}
        </Button>
      )}

      <Descriptions style={{ marginTop: '20px' }} bordered={true} column={1}>
        <Descriptions.Item label={intl.formatMessage({id: 'centerInference.detail.label.jobName'})}>{jobDetail.jobName}</Descriptions.Item>
        <Descriptions.Item label={intl.formatMessage({id: 'centerInference.detail.label.jobStatus'})}>{getJobStatus(jobDetail.jobStatus)}</Descriptions.Item>
        <Descriptions.Item label={intl.formatMessage({id: 'centerInference.detail.label.engineType'})}>{jobDetail.jobParams?.framework}</Descriptions.Item>
        <Descriptions.Item label={intl.formatMessage({id: 'centerInference.detail.label.id'})}>{jobDetail.jobId}</Descriptions.Item>
        <Descriptions.Item label={intl.formatMessage({id: 'centerInference.detail.label.createTime'})}>
          {moment(jobDetail.jobTime).format('YYYY-MM-DD HH:mm')}
        </Descriptions.Item>
        {jobDetail.jobParams?.device && (
          <Descriptions.Item label={intl.formatMessage({id: 'centerInference.detail.label.deviceType'})}>{jobDetail.jobParams?.device}</Descriptions.Item>
        )}
        {jobDetail.jobParams?.gpuType && (
          <Descriptions.Item label={intl.formatMessage({id: 'centerInference.detail.label.gpuType'})}>{jobDetail.jobParams?.gpuType}</Descriptions.Item>
        )}
        <Descriptions.Item label={intl.formatMessage({id: 'centerInference.detail.label.useModel'})}>
          {jobDetail.jobParams?.model_base_path}
        </Descriptions.Item>
        <Descriptions.Item label={intl.formatMessage({id: 'centerInference.detail.label.nodeCount'})}>
          {jobDetail.jobParams?.resourcegpu}
        </Descriptions.Item>
        {/* <Descriptions.Item label="作业参数"></Descriptions.Item> */}
        {/* <Descriptions.Item label="服务地址">test</Descriptions.Item> */}
        <Descriptions.Item label={intl.formatMessage({id: 'centerInference.detail.label.desc'})}>{jobDetail.jobParams?.desc}</Descriptions.Item>
      </Descriptions>
      {logs && (
        <div className="ant-descriptions-title" style={{ marginTop: '30px' }}>
          {intl.formatMessage({id: 'centerInference.detail.trainingLog'})}
        </div>
      )}
      {!(['unapproved', 'queued', 'scheduling'].includes(jobDetail.jobStatus) || jobEnded) && (
        <Button type="primary" style={{ marginTop: '20px' }} onClick={getLateastLogs}>
          {intl.formatMessage({id: 'centerInference.detail.clickGetLog'})}
        </Button>
      )}
      <div>
        {logs ? (
          <pre ref={logEl} style={{ marginTop: '20px' }} className={styles.logs}>
            {logs}
          </pre>
        ) : (
          ['unapproved', 'queued', 'scheduling'].includes(jobDetail.jobStatus) && (
            <div>{intl.formatMessage({id: 'centerInference.detail.notStart'})}</div>
          )
        )}
        {['failed'].includes(jobDetail.jobStatus) && (
          <div style={{ marginTop: '20px' }}>{intl.formatMessage({id: 'centerInference.detail.trainingError'})}</div>
        )}
      </div>
    </PageHeaderWrapper>
  );
};

export default connect(({ common }) => ({ common }))(InferenceDetail);
