import React, { useEffect, useState, useRef } from 'react';
import { Button, Descriptions, Modal } from 'antd';
import { useParams } from 'umi';
import { message, Form, Input, Tooltip, Pagination } from 'antd';
import { LoadingOutlined, DownOutlined } from '@ant-design/icons';
import 'react-virtualized/styles.css';
import List from 'react-virtualized/dist/es/List';
import moment from 'moment';
import { history } from 'umi';
import { fetchTrainingDetail, removeTrainings, fetchTrainingLog, saveTrainingParams } from '@/services/modelTraning';
import styles from './index.less';
import { getJobStatus, formatParams } from '@/utils/utils';
import { modelTrainingType } from '@/utils/const';
import { jobNameReg, getNameFromDockerImage } from '@/utils/reg';
import useInterval from '@/hooks/useInterval';
import { connect } from 'dva';

const { useForm } = Form;
const FormItem = Form.Item;

const Detail = (props) => {  
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
      if('visualPath' in data.params){
      data.visualPath = data.params.visualPath;
      delete data.params['visualPath'];
      }
      setJobDetail(res.data)
      const status = res.data.status;
      if (!['unapproved', 'queued', 'scheduling'].includes(status)) {
        getTrainingLogs(id, { page: options.page })
      }
    }
  }
  useEffect(() => {
    getTrainingDetail({ page: logCurrentPage });
    return () => {
      fetchTrainingDetail.cancel && fetchTrainingDetail.cancel();
      fetchTrainingLog.cancel && fetchTrainingLog.cancel();
    }
  }, [])
  useInterval(() => {
    getTrainingDetail({ page: logCurrentPage })
  }, props.common.interval)
  const jobStarted = ['unapproved', 'queued', 'scheduling'].includes(jobDetail.status)
  const jobFailed = ['failed'].includes(jobDetail.status)

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
  }

  const handleFetchTrainingLogs = async () => {
    const cancel = message.loading('获取日志中')
    await getTrainingLogs(id)
    cancel();
    message.success('成功获取日志')
  } 

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
      message.success('保存成功');
      setModalVisible(false);
    }
  }

  const commonLayout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 15 }
  };

  const changeLogPage = (page) => {
    setLogCurrentPage(page);
    getTrainingLogs(id, { page });
  }

  let setTemplateButtonDisabled = /^\/data/.test(jobDetail.codePath) || Object.keys(jobDetail).length === 0
  return (
    <div className={styles.modelDetail}>
      <div className={styles.topButtons}>
        <div className="ant-descriptions-title" style={{ marginTop: '30px' }}>模型训练</div>
        <div>
          <Tooltip placement="bottomLeft" title={setTemplateButtonDisabled && "公有模板，不可保存"} arrowPointAtCenter>
            <Button type="primary" disabled={setTemplateButtonDisabled} onClick={() => setModalVisible(true)}>保存训练参数</Button>
          </Tooltip>
        </div>
      </div>
      <Descriptions bordered={true} column={1}>
        <Descriptions.Item label="作业名称">{jobDetail.name}</Descriptions.Item>
        <Descriptions.Item label="作业状态">{getJobStatus(jobDetail.status)}</Descriptions.Item>
        <Descriptions.Item label="引擎类型">{getNameFromDockerImage(jobDetail.engine)}</Descriptions.Item>
        <Descriptions.Item label="ID">{jobDetail.id}</Descriptions.Item>
        <Descriptions.Item label="创建时间">{moment(jobDetail.createTime).format('YYYY-MM-DD HH:mm:ss')}</Descriptions.Item>
        <Descriptions.Item label="运行参数">{jobDetail.params && formatParams(jobDetail.params).map(val => <div>{val}</div>)}</Descriptions.Item>
        <Descriptions.Item label="代码目录">{jobDetail.codePath}</Descriptions.Item>
        <Descriptions.Item label="计算节点个数">{jobDetail.deviceNum}</Descriptions.Item>
        <Descriptions.Item label="启动文件">{jobDetail.startupFile}</Descriptions.Item>
        <Descriptions.Item label="计算节点规格">{jobDetail.deviceType}</Descriptions.Item>
        <Descriptions.Item label="训练数据集">{jobDetail.datasetPath}</Descriptions.Item>
        <Descriptions.Item label="描述">{jobDetail.desc}</Descriptions.Item>
        {
          jobDetail.params?.visualPath && 
            <Descriptions.Item label="可视化路径">{jobDetail.params.visualPath}</Descriptions.Item>
        }
        <Descriptions.Item label="输出路径">{jobDetail.outputPath}</Descriptions.Item>
        {
          jobDetail.checkpoint && <Descriptions.Item label="checkpoint 文件">{jobDetail.checkpoint}</Descriptions.Item>
        }
      </Descriptions>
      <div className="ant-descriptions-title" style={{ marginTop: '30px' }}>训练日志</div>
      {!jobStarted && !jobFailed && <Button type="primary" onClick={handleFetchTrainingLogs} style={{marginBottom: '20px', marginTop: '16px'}}>获取训练日志</Button>}
      {typeof logs !== 'undefined' ? <div style={{paddingBottom: '25px'}}>
        <pre ref={logEl} className={styles.logs}>
          {logs}
        </pre>
        {
          logtotal && <Pagination showSizeChanger={false} defaultCurrent={1} defaultPageSize={1} total={logtotal} current={logCurrentPage} onChange={(page) => {changeLogPage(page)}} />
        }
      </div> : (<div>
        {
          jobStarted ?
            <div>训练任务尚未开始运行</div>
            :
            <LoadingOutlined />
        }
      </div>)
      }
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
            <FormItem
              {...commonLayout}
              name="name"
              label="配置名称"
              rules={[{ required: true }, {...jobNameReg}]}
            >
              <Input placeholder="请输入配置名称" />
            </FormItem>
            <FormItem
              {...commonLayout}
              name="jobType"
              label="类型"
              initialValue="模型训练"
              rules={[{ required: true }]}
            >
              <Input disabled />
            </FormItem>
            <FormItem
              {...commonLayout}
              name="engine"
              label="引擎类型"
              initialValue={getNameFromDockerImage(jobDetail.engine)}
              rules={[{ required: true }]}
            >
              <Input disabled />
            </FormItem>
            <FormItem
              {...commonLayout}
              name="desc"
              label="描述"
              rules={[{ required: true }]}
            >
              <Input.TextArea />
            </FormItem>
          </Form>
        </Modal>
      }
    </div>

  )
}




export default connect(({ common }) => ({ common }))(Detail);




