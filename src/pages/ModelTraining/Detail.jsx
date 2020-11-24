import React, { useEffect, useState, useRef } from 'react';
import { Button, Descriptions, Modal } from 'antd';
import { useParams, useIntl } from 'umi';
import { message, Form, Input, Tooltip, Pagination } from 'antd';
import { LoadingOutlined, DownOutlined } from '@ant-design/icons';
import 'react-virtualized/styles.css';
import List from 'react-virtualized/dist/es/List';
import moment from 'moment';
import {
  fetchTrainingDetail,
  removeTrainings,
  fetchTrainingLog,
  saveTrainingParams,
} from '@/services/modelTraning';
import styles from './index.less';
import { getJobStatus, formatParams } from '@/utils/utils';
import { modelTrainingType } from '@/utils/const';
import { jobNameReg, getNameFromDockerImage } from '@/utils/reg';
import useInterval from '@/hooks/useInterval';
import { connect } from 'dva';
import JobDetail from '@/components/BizComponent/JodDetail';

const { useForm } = Form;
const FormItem = Form.Item;

const Detail = (props) => {
  const intl = useIntl();
  const { formatMessage } = intl;
  const params = useParams();
  const logEl = useRef(null);
  const [form] = useForm();
  const { validateFields } = form;
  const id = params.id;
  const [logs, setLogs] = useState(undefined);
  const [jobDetail, setJobDetail] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [logCurrentPage, setLogCurrentPage] = useState(1);
  const [logtotal, setLogTotal] = useState(1);
  const getTrainingDetail = async (options) => {
    const res = await fetchTrainingDetail(id);
    if (res.code === 0) {
      const data = res.data;
      if ('visualPath' in data.params) {
        data.visualPath = data.params.visualPath;
        delete data.params['visualPath'];
      }
      setJobDetail(res.data);
      const status = res.data.status;
      if (!['unapproved', 'queued', 'scheduling'].includes(status)) {
        getTrainingLogs(id, { page: options.page });
      }
    }
  };
  useEffect(() => {
    getTrainingDetail({ page: logCurrentPage });
    return () => {
      fetchTrainingDetail.cancel && fetchTrainingDetail.cancel();
      fetchTrainingLog.cancel && fetchTrainingLog.cancel();
    };
  }, []);
  useInterval(() => {
    getTrainingDetail({ page: logCurrentPage });
  }, props.common.interval);
  const jobStarted = ['unapproved', 'queued', 'scheduling'].includes(jobDetail.status);
  const jobFailed = ['failed'].includes(jobDetail.status);

  const getTrainingLogs = async (id, options) => {
    let page = logCurrentPage;
    if (options) {
      page = options.page;
    }
    const res = await fetchTrainingLog(id, page);
    const l = logEl.current;
    if (res.code === 0) {
      setLogs(res.data.log || '');
      setLogTotal(res.data.maxPage || 1);
    }
  };

  const handleFetchTrainingLogs = async () => {
    const cancel = message.loading(
      formatMessage({ id: 'model.training.detail.message.getting.log' }),
    );
    await getTrainingLogs(id);
    cancel();
    message.success(formatMessage({ id: 'model.training.detail.message.got.log' }));
  };

  const saveTrainingDetail = async () => {
    const values = await validateFields(['name', 'desc', 'scope']);
    const submitData = {};
    submitData.scope = 2; // save as private
    submitData.jobType = modelTrainingType;
    submitData.templateData = {};
    submitData.templateData = Object.assign({}, jobDetail, values);
    delete submitData.templateData.id;
    const res = await saveTrainingParams(submitData);
    if (res.code === 0) {
      message.success(formatMessage({ id: 'model.training.detail.message.save.success' }));
      setModalVisible(false);
    }
  };

  const commonLayout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 15 },
  };

  const changeLogPage = (page) => {
    setLogCurrentPage(page);
    getTrainingLogs(id, { page });
  };

  let setTemplateButtonDisabled =
    /^\/data/.test(jobDetail.codePath) || Object.keys(jobDetail).length === 0;
  return (
    <div className={styles.modelDetail}>
      <div className={styles.topButtons}>
        <div className="ant-descriptions-title" style={{ marginTop: '30px' }}>
          {formatMessage({ id: 'model.training.detail.title' })}
        </div>
        <div>
          <Tooltip
            placement="bottomLeft"
            title={
              setTemplateButtonDisabled &&
              formatMessage({ id: 'model.training.detail.tooltip.cannot.save' })
            }
            arrowPointAtCenter
          >
            <Button
              type="primary"
              disabled={setTemplateButtonDisabled}
              onClick={() => setModalVisible(true)}
            >
              {formatMessage({ id: 'model.training.detail.button.save.params' })}
            </Button>
          </Tooltip>
        </div>
      </div>
      <JobDetail jobDetail={jobDetail} />
      <div className="ant-descriptions-title" style={{ marginTop: '30px' }}>
        {formatMessage({ id: 'model.training.detail.log' })}
      </div>
      {!jobStarted && !jobFailed && (
        <Button
          type="primary"
          onClick={handleFetchTrainingLogs}
          style={{ marginBottom: '20px', marginTop: '16px' }}
        >
          {formatMessage({ id: 'model.training.detail.get.log' })}
        </Button>
      )}
      {typeof logs !== 'undefined' ? (
        <div style={{ paddingBottom: '25px' }}>
          <pre ref={logEl} className={styles.logs}>
            {logs}
          </pre>
          {logtotal && (
            <Pagination
              showSizeChanger={false}
              defaultCurrent={1}
              defaultPageSize={1}
              total={logtotal}
              current={logCurrentPage}
              onChange={(page) => {
                changeLogPage(page);
              }}
            />
          )}
        </div>
      ) : (
        <div>
          {jobStarted ? (
            <div>{formatMessage({ id: 'model.training.detail.job.not.started' })}</div>
          ) : (
            <LoadingOutlined />
          )}
        </div>
      )}
      {modalVisible && (
        <Modal
          visible={modalVisible}
          onCancel={() => setModalVisible(false)}
          onOk={saveTrainingDetail}
          title={formatMessage({ id: 'model.training.detail.title.save.to' })}
        >
          <Form form={form}>
            <FormItem
              {...commonLayout}
              name="name"
              label={formatMessage({ id: 'model.training.detail.form.name.label' })}
              rules={[{ required: true }, { ...jobNameReg }]}
            >
              <Input
                placeholder={formatMessage({ id: 'model.training.detail.form.name.placeholder' })}
              />
            </FormItem>
            <FormItem
              {...commonLayout}
              name="jobType"
              label={formatMessage({ id: 'model.training.detail.form.jobType.label' })}
              initialValue={formatMessage({ id: 'model.training.detail.form.jobType.initValue' })}
              rules={[{ required: true }]}
            >
              <Input disabled />
            </FormItem>
            <FormItem
              {...commonLayout}
              name="engine"
              label={formatMessage({ id: 'model.training.detail.engine' })}
              initialValue={getNameFromDockerImage(jobDetail.engine)}
              rules={[{ required: true }]}
            >
              <Input disabled />
            </FormItem>
            <FormItem
              {...commonLayout}
              name="desc"
              label={formatMessage({ id: 'model.training.detail.desc' })}
              rules={[{ required: true }]}
            >
              <Input.TextArea />
            </FormItem>
          </Form>
        </Modal>
      )}
    </div>
  );
};

export default connect(({ common }) => ({ common }))(Detail);
