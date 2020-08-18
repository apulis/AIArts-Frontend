import React, { useEffect, useState, useRef } from 'react';
import { Button, Descriptions, Modal } from 'antd';
import { useParams } from 'umi';
import { message, Form, Input, Tooltip } from 'antd';
import { LoadingOutlined, DownOutlined } from '@ant-design/icons';
import 'react-virtualized/styles.css';
import List from 'react-virtualized/dist/es/List';
import moment from 'moment';

import { fetchTrainingDetail, removeTrainings, fetchTrainingLog, saveTrainingParams } from '@/services/modelTraning';
import styles from './index.less';
import { getJobStatus, formatParams } from '@/utils/utils';
import { modelTrainingType } from '@/utils/const';
import { jobNameReg } from '@/utils/reg';

const { useForm } = Form;
const FormItem = Form.Item;

const Detail = () => {
  const params = useParams();
  const logEl = useRef(null);
  const [form] = useForm();
  const { validateFields } = form;
  const id = params.id;
  const [logs, setLogs] = useState(undefined);
  const [jobDetail, setJobDetail] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
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
    let timer = setInterval(() => {
      getTrainingDetail()
    }, 3000);
    return () => {
      clearInterval(timer)
    }
  }, [])
  const jobStarted = ['unapproved', 'queued', 'scheduling'].includes(jobDetail.status)
  const jobFailed = ['failed'].includes(jobDetail.status)
  const getTrainingLogs = async () => {
    const res = await fetchTrainingLog(id);
    const l = logEl.current;
    if (res.code === 0) {
      setLogs(res.data.log || '');
    }
  }

  const handleFetchTrainingLogs = async () => {
    const cancel = message.loading('获取日志中')
    await getTrainingLogs()
    cancel();
    message.success('成功获取日志')
  }

  const saveTrainingDetail = async () => {
    const values = await validateFields(['name', 'desc', 'scope']);
    const submitData = {};
    // submitData.scope = values.scope;
    submitData.scope = 2; // save as private
    submitData.jobType = modelTrainingType;
    submitData.templateData = {};
    submitData.templateData = Object.assign({}, jobDetail, values);
    delete submitData.templateData.id;
    console.log('submitData', submitData)
    const res = await saveTrainingParams(submitData);
    if (res.code === 0) {
      message.success('保存成功');
      setModalVisible(false);
    }
  }


  const stopTraining = () => {
    //
  }

  const commonLayout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 15 }
  };

  const removeTraining = async () => {
    const res = await removeTrainings(id);
    if (res.code === 0) {
      message.success('成功删除');
    }
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
        <Descriptions.Item label="引擎类型">{jobDetail.engine}</Descriptions.Item>
        <Descriptions.Item label="ID">{jobDetail.id}</Descriptions.Item>
        <Descriptions.Item label="创建时间">{moment(jobDetail.createTime).format('YYYY-MM-DD HH:mm:ss')}</Descriptions.Item>
        <Descriptions.Item label="运行参数">{jobDetail.params && formatParams(jobDetail.params).map(val => <div>{val}</div>)}</Descriptions.Item>
        <Descriptions.Item label="代码目录">{jobDetail.codePath}</Descriptions.Item>
        <Descriptions.Item label="计算节点个数">{jobDetail.deviceNum}</Descriptions.Item>
        <Descriptions.Item label="启动文件">{jobDetail.startupFile}</Descriptions.Item>
        <Descriptions.Item label="计算节点规格">{jobDetail.deviceType}</Descriptions.Item>
        <Descriptions.Item label="训练数据集">{jobDetail.datasetPath}</Descriptions.Item>
        <Descriptions.Item label="描述">{jobDetail.desc}</Descriptions.Item>
        <Descriptions.Item label="输出路径">{jobDetail.outputPath}</Descriptions.Item>
        {
          jobDetail.checkpoint && <Descriptions.Item label="checkpoint 文件">{jobDetail.checkpoint}</Descriptions.Item>
        }
      </Descriptions>
      <div className="ant-descriptions-title" style={{ marginTop: '30px' }}>训练日志</div>
      {!jobStarted && !jobFailed && <Button type="primary" onClick={handleFetchTrainingLogs} style={{marginBottom: '20px', marginTop: '16px'}}>获取训练日志</Button>}
      {typeof logs !== 'undefined' ? <pre ref={logEl} className={styles.logs}>
        {logs}
      </pre> : (<div>
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
              initialValue={jobDetail.engine}
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
            {/* <FormItem
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
            </FormItem> */}
          </Form>
        </Modal>
      }
    </div>

  )
}




export default Detail;




