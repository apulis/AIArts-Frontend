import { message, Table, Modal, Form, Input, Button, Select, Card } from 'antd';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import React, { useState, useEffect } from 'react';
import { Link } from 'umi';
import { getEdgeInferences, submit, getFD, submitFD, push, deleteEG } from './service';
import styles from './index.less';
import moment from 'moment';
import { PAGEPARAMS, sortText } from '@/utils/const';
import { SyncOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import _ from 'lodash';
import useInterval from '@/hooks/useInterval';
import { connect } from 'dva';

const { Option } = Select;
const { Search } = Input;
const { confirm } = Modal;
const typeText = {
  'converting': '转换中',
  'pushing': '推送中',
  'push success': '推送成功',
  'push failed': '推送失败'
}



const EdgeInference = (props) => {
  const [form] = Form.useForm();
  const [jobs, setJobs] = useState([]);
  const [fdInfo, setFdInfo] = useState({ username: '', url: '', password: '' });
  const [pushId, setPushId] = useState('');
  const [modalFlag2, setModalFlag2] = useState(false);
  const [pageParams, setPageParams] = useState(PAGEPARAMS);
  const [btnLoading, setBtnLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [statusType, setStatusType] = useState('');
  const [total, setTotal] = useState(0);
  const [sortedInfo, setSortedInfo] = useState({
    orderBy: '',
    order: ''
  });

  useEffect(() => {
    getData();
    return () => {
      getEdgeInferences.cancel && getEdgeInferences.cancel();
    }
  }, [pageParams, sortedInfo]);

  useInterval(() => {
    getData(null, true);
  }, props.common.interval);

  useEffect(() => {
    getFdInfo();
  }, []);

  const getData = async (text, isInterval) => {
    !isInterval && setLoading(true);
    const searchType = statusType && statusType.split('-') ? statusType.split('-') : [];
    const params = { 
      ...pageParams, 
      jobName: name, 
      jobStatus: searchType ? searchType[0] : '',
      modelconversionStatus: searchType ? searchType[1] : '',
      orderBy: sortedInfo.columnKey,
      order: sortText[sortedInfo.order]
    };
    const { code, data } = await getEdgeInferences(params);
    if (code === 0 && data) {
      const { total, edgeInferences } = data;
      setJobs(edgeInferences);
      setTotal(total);
      text && message.success(text);
    }
    setLoading(false);
  };

  const pageParamsChange = (page, count) => {
    setPageParams({ pageNum: page, pageSize: count });
  };

  

  const onDelete = id => {
    confirm({
      title: '确定要删除该推理吗？',
      icon: <ExclamationCircleOutlined />,
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        const { code } = await deleteEG(id);
        if (code === 0) {
          // 若删除的是当前页最后一项，且页数不是第一页，则将页数减一
          if (jobs.length == 1 && pageParams.pageNum > 1) {
            setPageParams({ ...pageParams, pageNum: pageParams.pageNum - 1 });
          } else {
            getData();
          }
          message.success('删除成功！');
        }
      },
      onCancel() {}
    });
  }

  const columns = [
    {
      title: 'ID',
      dataIndex: 'jobId',
      render: id => <span style={{fontFamily: 'Consolas'}}>{id}</span>
    },
    {
      title: '推理名称',
      dataIndex: 'jobName',
      key: 'jobName',
      sorter: true,
      sortOrder: sortedInfo.columnKey === 'jobName' && sortedInfo.order
    },
    {
      title: '类型',
      dataIndex: 'modelconversionType',
    },
    {
      title: '时间',
      dataIndex: 'jobTime',
      key: 'jobTime',
      sorter: true,
      render: text => moment(text).format('YYYY-MM-DD HH:mm:ss'),
      sortOrder: sortedInfo.columnKey === 'jobTime' && sortedInfo.order
    },
    {
      title: '状态',
      render: item => {
        const { jobStatus, modelconversionStatus } = item;
        let status = typeText[modelconversionStatus];
        if (modelconversionStatus === 'converting') status = jobStatus === 'finished' ? '转换成功' : jobStatus === 'failed' || jobStatus === 'error' ? '转换失败' : status;
        return (<span>{status}</span>)
      }
    },
    {
      title: '操作',
      render: item => {
        const { jobStatus, modelconversionStatus, jobId } = item;
        const disabled = (!(modelconversionStatus === 'converting' && jobStatus === 'finished') || pushId === jobId);
        return (
          <>
            <a onClick={() => onPush(jobId)} disabled={disabled}>推送</a>
            <a style={{ color: 'red', marginLeft: 16 }} onClick={() => onDelete(jobId)}>删除</a>
          </>
        )
      },
    },
  ];

  const getFdInfo = async () => {
    let info = {};
    const { code, data } = await getFD();
    if (code === 0) {
      info = data.fdinfo;
      setFdInfo(data.fdinfo);
    }
    return info;
  }

  const onPush = async (id) => {
    const info = await getFdInfo();
    if (info) {
      setPushId(id);
      const { code, data } = await push({ jobId: id });
      if (code === 0) {
        getData();
        message.success('推送成功！');
      } else {
        setPushId('');
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


  const onSubmitFD = () => {
    setBtnLoading(true);
    form.validateFields().then(async (values) => {
      const { code, data } = await submitFD(values);
      if (code === 0) {
        message.success('设置成功！');
        getFdInfo();
        setModalFlag2(false);
      }
    })
    setBtnLoading(false);
  }

  const onSortChange = (pagination, filters, sorter) => {
    if (sorter.order !== false) {
      setSortedInfo(sorter);
    }
  }

  const getOptions = () => {
    const statusMap = [
      {
        text: '全部',
        status: ''
      },
      {
        text: '推送中',
        status: 'finished-pushing'
      },
      {
        text: '推送成功',
        status: 'finished-push success'
      },
      {
        text: '推送失败',
        status: 'finished-push failed'
      },
      {
        text: '转换中',
        status: 'running,scheduling,queued,unapproved-converting'
      },
      {
        text: '转换成功',
        status: 'finished-converting'
      },
      {
        text: '转换失败',
        status: 'error,failed-converting'
      }
    ];
    return statusMap.map(i => <Option value={i.status}>{i.text}</Option>);
  }

  const onSearchChange = (v, type) => {
    type === 1 ? setStatusType(v) : setName(v)
    setPageParams({ ...pageParams, pageNum: 1 });
  }


  return (
    <PageHeaderWrapper>
      <Card>
        <div className={styles.edgeInferences}>
          <Link to="/Inference/EdgeInference/submit">
            <Button type="primary">新建推理</Button>
          </Link>
          <Button type="primary" style={{ margin: '0 16px 16px' }} onClick={openSettings}>设置</Button>
          {fdInfo.url && <Button type="primary" onClick={() => window.open(fdInfo.url)}>FD服务器</Button>}
          <div className={styles.searchWrap}>
            <Select onChange={v => onSearchChange(v, 1)} defaultValue={statusType}>{getOptions()}</Select>
            <Search placeholder="请输入推理名称查询" enterButton onChange={e => setName(e.target.value)} onSearch={v => onSearchChange(v, 2)} />
            <Button onClick={() => getData('刷新成功！')} icon={<SyncOutlined />} />
          </div>
          <Table
            columns={columns}
            dataSource={jobs}
            rowKey={r => r.jobId}
            onChange={onSortChange}
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
      </Card>
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

export default connect(({ common }) => ({ common }))(EdgeInference);
