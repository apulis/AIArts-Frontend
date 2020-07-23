import { message, Table, Modal, Form, Input, Button, Select } from 'antd';
import { PageHeaderWrapper, PageLoading } from '@ant-design/pro-layout';
import React, { useState, useEffect, useRef } from 'react';
import { getEdgeInferences, submit, getTypes, getFD, submitFD, push } from './service';
import { PAGEPARAMS } from '@/utils/const';
import styles from './index.less';
import moment from 'moment';
import { NameReg, NameErrorText, pollInterval } from '@/utils/const';
import useInterval from '../../hooks/useInterval';

const { Option } = Select;

const EdgeInference = () => {
  const [form] = Form.useForm();
  const [jobs, setJobs] = useState({ data: [], total: 0 });
  const [types, setTypes] = useState('');
  const [fdInfo, setFdInfo] = useState({ username: '', url: '', password: '' });
  const [pushId, setPushId] = useState('');
  const [modalFlag1, setModalFlag1] = useState(false);
  const [modalFlag2, setModalFlag2] = useState(false);
  const [pageParams, setPageParams] = useState(PAGEPARAMS);
  const [btnLoading, setBtnLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // getData();
  }, [pageParams]);

  // useInterval(() => {
  //   getData();
  // }, pollInterval);

  const getData = async () => {
    setLoading(true);
    const { code, data, msg } = await getEdgeInferences(pageParams);
    if (code === 0 && data) {
      const { total, datasets } = data;
      setJobs({
        data: datasets,
        total: total,
      });
    } else {
      message.error(msg);
    }
    setLoading(false);
  };

  const pageParamsChange = (page, count) => {
    setPageParams({ pageNum: page, pageSize: count });
  };

  const onSubmit = () => {
    setBtnLoading(true);
    form.validateFields().then(async (values) => {
      const { code, data, msg } = await submit();
      if (code === 0) {
        message.success('提交成功！');
        getData();
        setModalFlag1(false);
      } else {
        message.error(msg);
      }
    });
    setBtnLoading(false);
  };

  const columns = [
    {
      title: 'ID',
      key: 'jobId',
      render: id => <p style={{fontFamily: 'Consolas'}}>{id}</p>
    },
    {
      title: '推理名称',
      dataIndex: 'jobName',
    },
    {
      title: '类型',
      dataIndex: 'modelconversionType',
    },
    {
      title: '时间',
      dataIndex: 'jobTime',
      render: text => moment(text).format('YYYY-MM-DD HH:mm:ss')
    },
    {
      title: '状态',
      dataIndex: 'modelconversionStatus',
      render: item => {
        const { jobStatus, modelconversionStatus } = item;
        let status = modelconversionStatus;
        if (modelconversionStatus === 'converting') status = jobStatus === 'finished' ? '推理成功' : jobStatus === 'failed' ? '推理失败' : modelconversionStatus;
        return <p>{status}</p>
      }
    },
    {
      title: '操作',
      render: item => {
        const { jobStatus, modelconversionStatus, jobId } = item;
        const disabled = (!(modelconversionStatus === 'converting' && jobStatus === 'finished') || pushId === jobId);
        return (
          <CloudUploadOutlined disabled={disabled} onClick={() => onPush(jobId)} title="推理推送" />
        )
      },
    },
  ];

  const getFdInfo = async () => {
    let info = {};
    const { code, data, msg } = await getFD();
    if (code === 0) {
      info = data;
      setFdInfo(data);
    } else {
      message.error(msg);
    }
    return info;
  }

  const onPush = async (id) => {
    const info = await getFdInfo();
    if (info) {
      setPushId(id);
      const { code, data, msg } = await push({ id: id });
      if (code === 0) {
        getData();
        message.success('推送成功！');
      } else {
        setPushId('');
        message.error(msg);
      }
    } else {
      message.warning('请先填写设置！');
      setModalFlag2(true);
    }
  }

  const openSettings = async () => {
    await getFdInfo();
    setModalFlag2(true);
  }

  const openInference = async () => {
    setModalFlag1(true);
    const { code, data, msg } = await getTypes();
    if (code === 0) {
      setTypes(data);
    } else {
      message.error(msg);
    }
  }

  const onSubmitFD = () => {
    setBtnLoading(true);
    form.validateFields().then(async (values) => {
      const { code, data, msg } = await submitFD();
      if (code === 0) {
        message.success('设置成功！');
        setModalFlag2(false);
      } else {
        message.error(msg);
      }
    })
    setBtnLoading(false);
  }

  if (loading) return (<PageLoading />)

  return (
    <PageHeaderWrapper>
      <Button type="primary" onClick={openInference}>新建推理</Button>
      <Button type="primary" style={{ margin: '0 16px 16px' }} onClick={openSettings}>设置</Button>
      <Button type="primary" onClick={() => window.open(fdInfo.url)}>FD服务器</Button>
      <Table
        columns={columns}
        dataSource={jobs.data}
        rowKey={r => r.jobId}
        pagination={{
          total: jobs.total,
          showQuickJumper: true,
          showTotal: total => `总共 ${total} 条`,
          showSizeChanger: true,
          onChange: pageParamsChange,
          onShowSizeChange: pageParamsChange,
          current: pageParams.pageNum,
          pageSize: pageParams.pageSize
        }}
      />
      {modalFlag1 && (
        <Modal
          title="新建推理"
          visible={modalFlag1}
          onCancel={() => setModalFlag1(false)}
          destroyOnClose
          maskClosable={false}
          className="inferenceModal"
          footer={[
            <Button onClick={() => setModalFlag1(false)}>取消</Button>,
            <Button type="primary" loading={btnLoading} onClick={onSubmit}>提交</Button>,
          ]}
        >
          <Form form={form} initialValues={{}}>
            <Form.Item
              label="推理名称"
              name="jobName"
              rules={[
                { required: true, message: '请输入推理名称！' }, 
                { pattern: NameReg, message: NameErrorText },
                { max: 20 }
              ]}
            >
              <Input placeholder="请输入推理名称" />
            </Form.Item>
            <Form.Item
              label="类型"
              name="conversionType"
              rules={[{ required: true, message: '请选择类型！' }]}>
                <Select placeholder="请选择类型">
                  {types.map(i => <Option value={i}>{i}</Option>)}
                </Select>
            </Form.Item>
            <Form.Item
              label="输入路径"
              name="inputPath"
              rules={[{ required: true, message: '请填写输入路径！' }]}
            >
              <Input placeholder="请填写输入路径" />
            </Form.Item>
            <Form.Item
              label="输出路径"
              name="outputPath"
              rules={[{ required: true, message: '请填写输出路径！' }]}
            >
              <Input placeholder="请填写输出路径" />
            </Form.Item>
          </Form>
        </Modal>
      )}
      {modalFlag2 && (
        <Modal
          title="设置"
          visible={modalFlag2}
          onCancel={() => setModalFlag2(false)}
          destroyOnClose
          maskClosable={false}
          className="settingModal"
          footer={[
            <Button onClick={() => setModalFlag2(false)}>取消</Button>,
            <Button type="primary" loading={btnLoading} onClick={onSubmitFD}>保存</Button>,
          ]}
        >
          <Form form={form} initialValues={fdInfo}>
            <Form.Item
              label="URL"
              name="url"
              rules={[{ required: true, message: '请输入URL！' }]}
            >
              <Input placeholder="请输入推理名称" />
            </Form.Item>
            <Form.Item
              label="用户名"
              name="username"
              rules={[{ required: true, message: '请输入用户名！' }]}
            >
              <Input placeholder="请输入用户名" />
            </Form.Item>
            <Form.Item
              label="密码"
              name="password"
              rules={[{ required: true, message: '请输入密码！' }]}
            >
              <Input placeholder="请输入密码" />
            </Form.Item>
          </Form>
        </Modal>
      )}
    </PageHeaderWrapper>
  );
};

export default EdgeInference;
