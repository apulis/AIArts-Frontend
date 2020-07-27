import { message, Table, Modal, Form, Input, Button, Select } from 'antd';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import React, { useState, useEffect, useRef } from 'react';
import { getEdgeInferences, submit, getTypes, getFD, submitFD, push } from './service';
import { PAGEPARAMS } from '@/utils/const';
import styles from './index.less';
import moment from 'moment';
import { NameReg, NameErrorText, pollInterval } from '@/utils/const';
import useInterval from '../../hooks/useInterval';
import { CloudUploadOutlined } from '@ant-design/icons';

const { Option } = Select;
const { Search } = Input;

const EdgeInference = () => {
  const [form] = Form.useForm();
  const [jobs, setJobs] = useState([]);
  const [typesData, setTypesData] = useState([]);
  const [fdInfo, setFdInfo] = useState({ username: '', url: '', password: '' });
  const [pushId, setPushId] = useState('');
  const [modalFlag1, setModalFlag1] = useState(false);
  const [modalFlag2, setModalFlag2] = useState(false);
  const [pageParams, setPageParams] = useState(PAGEPARAMS);
  const [btnLoading, setBtnLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState('全部类型');
  const [total, setTotal] = useState(0);
  const typeText = {
    converting: '转换中',
    pushing: '推送中'
  }

  useEffect(() => {
    getData();
  }, [pageParams, name, type]);

  useEffect(() => {
    getFdInfo();
    getTypesData();
  }, []);

  // useInterval(() => {
  //   getData();
  // }, pollInterval);

  const getData = async () => {
    setLoading(true);
    const params = { ...pageParams, name: name, type: type === '全部类型' ? '' : type };
    const { code, data, msg } = await getEdgeInferences(params);
    if (code === 0 && data) {
      const { total, edgeInferences } = data;
      const temp1 = JSON.stringify(jobs.map(i => i.jobStatus));
      const temp2 = JSON.stringify(edgeInferences.map(i => i.jobStatus));
      const temp3 = JSON.stringify(jobs.map(i => i.modelconversionStatus));
      const temp4 = JSON.stringify(edgeInferences.map(i => i.modelconversionStatus));
      if (temp1 !== temp2 || temp3 !== temp4) setJobs(edgeInferences);
      setTotal(total);
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
      const { code, data, msg } = await submit(values);
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
      dataIndex: 'jobId',
      render: id => <p style={{fontFamily: 'Consolas'}}>{id}</p>
    },
    {
      title: '推理名称',
      dataIndex: 'jobName',
      sorter: (a, b) => a.jobName.length - b.jobName.length,
    },
    {
      title: '类型',
      dataIndex: 'modelconversionType',
    },
    {
      title: '时间',
      dataIndex: 'jobTime',
      render: text => moment(text).format('YYYY-MM-DD HH:mm:ss'),
      sorter: (a, b) => moment(a.jobTime) - moment(b.jobTime),
    },
    {
      title: '状态',
      render: item => {
        const { jobStatus, modelconversionStatus } = item;
        let status = modelconversionStatus;
        if (modelconversionStatus === 'converting') status = jobStatus === 'finished' ? '推理成功' : jobStatus === 'failed' ? '推理失败' : typeText[modelconversionStatus];
        return (<p>{status}</p>)
      }
    },
    {
      title: '操作',
      render: item => {
        const { jobStatus, modelconversionStatus, jobId } = item;
        const disabled = (!(modelconversionStatus === 'converting' && jobStatus === 'finished') || pushId === jobId);
        return (
          <CloudUploadOutlined style={{ fontSize: 22 }} disabled={disabled} onClick={() => onPush(jobId)} title="推理推送" />
        )
      },
    },
  ];

  const getFdInfo = async () => {
    let info = {};
    const { code, data, msg } = await getFD();
    if (code === 0) {
      info = data.fdinfo;
      setFdInfo(data.fdinfo);
    } else {
      message.error(msg);
    }
    return info;
  }

  const onPush = async (id) => {
    const info = await getFdInfo();
    if (info) {
      setPushId(id);
      const { code, data, msg } = await push({ jobId: id });
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

  const getTypesData = async () => {
    const { code, data, msg } = await getTypes();
    if (code === 0) {
      setTypesData(data.conversionTypes);
    } else {
      message.error(msg);
    }
  }

  const onSubmitFD = () => {
    setBtnLoading(true);
    form.validateFields().then(async (values) => {
      const { code, data, msg } = await submitFD(values);
      if (code === 0) {
        message.success('设置成功！');
        getFdInfo();
        setModalFlag2(false);
      } else {
        message.error(msg);
      }
    })
    setBtnLoading(false);
  }

  const getOptions = isFilter => {
    let data = isFilter ? ['全部类型'].concat(typesData) : typesData;
    return data.map(i => <Option value={i}>{i}</Option>);
  }

  return (
    <PageHeaderWrapper>
      <div className={styles.edgeInferences}>
        <Button type="primary" onClick={() => setModalFlag1(true)}>新建推理</Button>
        <Button type="primary" style={{ margin: '0 16px 16px' }} onClick={openSettings}>设置</Button>
        {fdInfo.url && <Button type="primary" onClick={() => window.open(fdInfo.url)}>FD服务器</Button>}
        <Search placeholder="请输入推理名称查询" enterButton onSearch={v => setName(v)} allowClear />
        <Select onChange={v => setType(v)} defaultValue={type}>{getOptions(true)}</Select>
        <Table
          columns={columns}
          dataSource={jobs}
          rowKey={r => r.jobId}
          pagination={{
            total: total,
            showQuickJumper: true,
            showTotal: total => `总共 ${total} 条`,
            showSizeChanger: true,
            onChange: pageParamsChange,
            onShowSizeChange: pageParamsChange,
            current: pageParams.pageNum,
            pageSize: pageParams.pageSize
          }}
          loading={loading}
        />
      </div>
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
              rules={[{ required: true, message: '请选择类型！' }]}
            >
                <Select placeholder="请选择类型">{getTypesData()}</Select>
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
