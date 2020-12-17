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
import { useIntl, formatMessage } from 'umi';

const { Option } = Select;
const { Search } = Input;
const { confirm } = Modal;
const typeText = {
  converting: formatMessage({ id: 'edgeInference.list.typeText.converting' }),
  pushing: formatMessage({ id: 'edgeInference.list.typeText.push' }),
  'push success': formatMessage({ id: 'edgeInference.list.typeText.push.success' }),
  'push failed': formatMessage({ id: 'edgeInference.list.typeText.push.failed' }),
};

const EdgeInference = (props) => {
  const intl = useIntl();
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
    order: '',
  });
  const { currentSelectedVC, jobMaxTimeSecond } = props.vc;

  useEffect(() => {
    getData();
    return () => {
      getEdgeInferences.cancel && getEdgeInferences.cancel();
    };
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
      order: sortText[sortedInfo.order],
    };
    const { code, data } = await getEdgeInferences({ ...params, vcName: currentSelectedVC });
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

  const onDelete = (id) => {
    confirm({
      title: intl.formatMessage({ id: 'edgeInference.list.onDelete.title' }),
      icon: <ExclamationCircleOutlined />,
      okText: intl.formatMessage({ id: 'edgeInference.list.onDelete.okText' }),
      okType: 'danger',
      cancelText: intl.formatMessage({ id: 'edgeInference.list.onDelete.cancelText' }),
      onOk: async () => {
        const { code } = await deleteEG(id);
        if (code === 0) {
          // 若删除的是当前页最后一项，且页数不是第一页，则将页数减一
          if (jobs.length == 1 && pageParams.pageNum > 1) {
            setPageParams({ ...pageParams, pageNum: pageParams.pageNum - 1 });
          } else {
            getData();
          }
          message.success(intl.formatMessage({ id: 'edgeInference.list.onDelete.ok.tips' }));
        }
      },
      onCancel() {},
    });
  };

  const columns = [
    {
      title: intl.formatMessage({ id: 'edgeInferenceList.table.column.id' }),
      dataIndex: 'jobId',
      render: (id) => <span style={{ fontFamily: 'Consolas' }}>{id}</span>,
    },
    {
      title: intl.formatMessage({ id: 'edgeInferenceList.table.column.name' }),
      dataIndex: 'jobName',
      key: 'jobName',
      sorter: true,
      sortOrder: sortedInfo.columnKey === 'jobName' && sortedInfo.order,
    },
    {
      title: formatMessage({ id: 'job.rest.time' }),
      render: (text, item) => {
        const status = item.status || item.jobStatus;
        const startTime = new Date(item.createTime || item.jobName).getTime();
        const currentTime = new Date().getTime();
        const lastedTime = currentTime - startTime;
        if (status === 'running') {
          if (!jobMaxTimeSecond) {
            return '-';
          }
          const restTime = Math.floor(jobMaxTimeSecond / 60  - (lastedTime / 60 / 1000));
          return restTime + formatMessage({ id: 'job.rest.minute' });
        }
        return '-';
      },
      ellipsis: true,
      width: '8%',
    },
    {
      title: intl.formatMessage({ id: 'edgeInferenceList.table.column.type' }),
      dataIndex: 'modelconversionType',
    },
    {
      title: intl.formatMessage({ id: 'edgeInferenceList.table.column.time' }),
      dataIndex: 'jobTime',
      key: 'jobTime',
      sorter: true,
      render: (text) => moment(text).format('YYYY-MM-DD HH:mm:ss'),
      sortOrder: sortedInfo.columnKey === 'jobTime' && sortedInfo.order,
    },
    {
      title: intl.formatMessage({ id: 'edgeInferenceList.table.column.status' }),
      render: (item) => {
        const { jobStatus, modelconversionStatus } = item;
        let status = typeText[modelconversionStatus];
        if (modelconversionStatus === 'converting')
          status =
            jobStatus === 'finished'
              ? intl.formatMessage({ id: 'edgeInference.list.converting.result.success' })
              : jobStatus === 'failed' || jobStatus === 'error'
              ? intl.formatMessage({ id: 'edgeInference.list.converting.result.error' })
              : status;
        return <span>{status}</span>;
      },
    },
    {
      title: intl.formatMessage({ id: 'edgeInferenceList.table.column.action' }),
      render: (item) => {
        const { jobStatus, modelconversionStatus, jobId } = item;
        const disabled =
          !(modelconversionStatus === 'converting' && jobStatus === 'finished') || pushId === jobId;
        return (
          <>
            <a onClick={() => onPush(jobId)} disabled={disabled}>
              {intl.formatMessage({ id: 'edgeInferenceList.table.column.action.push' })}
            </a>
            <a style={{ color: 'red', marginLeft: 16 }} onClick={() => onDelete(jobId)}>
              {intl.formatMessage({ id: 'edgeInferenceList.table.column.action.delete' })}
            </a>
          </>
        );
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
  };

  const onPush = async (id) => {
    const info = await getFdInfo();
    if (info) {
      setPushId(id);
      const { code, data } = await push({ jobId: id });
      if (code === 0) {
        getData();
        message.success(intl.formatMessage({ id: 'edgeInference.list.onPush.success' }));
      } else {
        setPushId('');
      }
    } else {
      message.warning(intl.formatMessage({ id: 'edgeInference.list.onPush.error' }));
      setModalFlag2(true);
    }
  };

  const openSettings = async () => {
    await getFdInfo();
    setModalFlag2(true);
  };

  const onSubmitFD = () => {
    setBtnLoading(true);
    form.validateFields().then(async (values) => {
      const { code, data } = await submitFD(values);
      if (code === 0) {
        message.success(intl.formatMessage({ id: 'edgeInference.list.onSubmitFD.success' }));
        getFdInfo();
        setModalFlag2(false);
      }
    });
    setBtnLoading(false);
  };

  const onSortChange = (pagination, filters, sorter) => {
    if (sorter.order !== false) {
      setSortedInfo(sorter);
    }
  };

  const getOptions = () => {
    const statusMap = [
      {
        text: intl.formatMessage({ id: 'edgeInference.list.statusMap.all' }),
        status: '',
      },
      {
        text: intl.formatMessage({ id: 'edgeInference.list.statusMap.push.ing' }),
        status: 'finished-pushing',
      },
      {
        text: intl.formatMessage({ id: 'edgeInference.list.statusMap.push.success' }),
        status: 'finished-push success',
      },
      {
        text: intl.formatMessage({ id: 'edgeInference.list.statusMap.push.error' }),
        status: 'finished-push failed',
      },
      {
        text: intl.formatMessage({ id: 'edgeInference.list.statusMap.converting.ing' }),
        status: 'running,scheduling,queued,unapproved-converting',
      },
      {
        text: intl.formatMessage({ id: 'edgeInference.list.statusMap.converting.success' }),
        status: 'finished-converting',
      },
      {
        text: intl.formatMessage({ id: 'edgeInference.list.statusMap.converting.error' }),
        status: 'error,failed-converting',
      },
    ];
    return statusMap.map((i) => <Option value={i.status}>{i.text}</Option>);
  };

  const onSearchChange = (v, type) => {
    type === 1 ? setStatusType(v) : setName(v);
    setPageParams({ ...pageParams, pageNum: 1 });
  };

  return (
    <PageHeaderWrapper>
      <Card>
        <div className={styles.edgeInferences}>
          <Link to="/Inference/EdgeInference/submit">
            <Button type="primary">
              {intl.formatMessage({ id: 'edgeInference.list.add.inference' })}
            </Button>
          </Link>
          <Button type="primary" style={{ margin: '0 16px 16px' }} onClick={openSettings}>
            {intl.formatMessage({ id: 'edgeInference.list.setting' })}
          </Button>
          {fdInfo.url && (
            <Button type="primary" onClick={() => window.open(fdInfo.url)}>
              {intl.formatMessage({ id: 'edgeInference.list.fdServer' })}
            </Button>
          )}
          <div className={styles.searchWrap}>
            <Select onChange={(v) => onSearchChange(v, 1)} defaultValue={statusType}>
              {getOptions()}
            </Select>
            <Search
              placeholder={intl.formatMessage({ id: 'edgeInference.list.placeholder.search' })}
              enterButton
              onChange={(e) => setName(e.target.value)}
              onSearch={(v) => onSearchChange(v, 2)}
            />
            <Button
              onClick={() =>
                getData(intl.formatMessage({ id: 'edgeInference.list.fresh.success' }))
              }
              icon={<SyncOutlined />}
            />
          </div>
          <Table
            columns={columns}
            dataSource={jobs}
            rowKey={(r) => r.jobId}
            onChange={onSortChange}
            pagination={{
              total: total,
              showQuickJumper: true,
              showTotal: (total) =>
                `${intl.formatMessage({
                  id: 'edgeInferenceList.table.pagination.showTotal.prefix',
                })} ${total} ${intl.formatMessage({
                  id: 'edgeInferenceList.table.pagination.showTotal.suffix',
                })}`,
              showSizeChanger: true,
              onChange: pageParamsChange,
              onShowSizeChange: pageParamsChange,
              current: pageParams.pageNum,
              pageSize: pageParams.pageSize,
            }}
            loading={loading}
          />
        </div>
      </Card>
      {modalFlag2 && (
        <Modal
          title={intl.formatMessage({ id: 'edgeInference.list.setting' })}
          visible={modalFlag2}
          onCancel={() => setModalFlag2(false)}
          destroyOnClose
          maskClosable={false}
          className="settingModal"
          footer={[
            <Button onClick={() => setModalFlag2(false)}>
              {intl.formatMessage({ id: 'edgeInference.list.cancel' })}
            </Button>,
            <Button type="primary" loading={btnLoading} onClick={onSubmitFD}>
              {intl.formatMessage({ id: 'edgeInference.list.save' })}
            </Button>,
          ]}
        >
          <Form form={form} initialValues={fdInfo}>
            <Form.Item
              label={intl.formatMessage({ id: 'confirmEdgeInferencePush.label.url' })}
              name="url"
              rules={[
                {
                  required: true,
                  message: intl.formatMessage({ id: 'confirmEdgeInferencePush.rule.needUrl' }),
                },
              ]}
            >
              <Input
                placeholder={intl.formatMessage({
                  id: 'confirmEdgeInferencePush.placeholder.inputUrl',
                })}
              />
            </Form.Item>
            <Form.Item
              label={intl.formatMessage({ id: 'confirmEdgeInferencePush.label.username' })}
              name="username"
              rules={[
                {
                  required: true,
                  message: intl.formatMessage({ id: 'confirmEdgeInferencePush.rule.needUsername' }),
                },
              ]}
            >
              <Input
                placeholder={intl.formatMessage({
                  id: 'confirmEdgeInferencePush.placeholder.inputUsername',
                })}
              />
            </Form.Item>
            <Form.Item
              label={intl.formatMessage({ id: 'confirmEdgeInferencePush.label.password' })}
              name="password"
              rules={[
                {
                  required: true,
                  message: intl.formatMessage({ id: 'confirmEdgeInferencePush.rule.needPassword' }),
                },
              ]}
            >
              <Input
                placeholder={intl.formatMessage({
                  id: 'confirmEdgeInferencePush.placeholder.inputPassword',
                })}
              />
            </Form.Item>
          </Form>
        </Modal>
      )}
    </PageHeaderWrapper>
  );
};

export default connect(({ common, vc }) => ({ common, vc }))(EdgeInference);
