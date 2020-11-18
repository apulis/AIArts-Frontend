import { Link, history } from 'umi';
import { message, Table, Modal, Form, Input, Button, Space, Card, Select } from 'antd';
import React, { useState, useEffect, useRef } from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { stopInference, deleteInference } from './services';
import { PAGEPARAMS, sortText } from '@/utils/const';
import { connect } from 'umi';
import moment from 'moment';
import { getJobStatus } from '@/utils/utils';
import { formatDuration } from '@/utils/time';
import { fetchJobStatusSumary } from './services';
import { getStatusList } from '@/utils/utils';
import { ExclamationCircleOutlined, SyncOutlined } from '@ant-design/icons';
import { getNameFromDockerImage } from '@/utils/reg';
import useInterval from '@/hooks/useInterval';
import { useIntl } from 'umi';

const { Option } = Select;
const { Search } = Input;
const { confirm } = Modal;

const InferenceList = (props) => {
  const intl = useIntl();
  const {
    dispatch,
    inferenceList: { data },
    vc,
  } = props;
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [current, setCurrent] = useState(undefined);
  const [pageParams, setPageParams] = useState(PAGEPARAMS);
  const [formValues, setFormValues] = useState({});
  const [sortedInfo, setSortedInfo] = useState({
    orderBy: '',
    order: '',
  });
  const [jobSumary, setJobSumary] = useState([]);
  const [currentStatus, setCurrentStatus] = useState('all');

  const getJobStatusSumary = async () => {
    const res = await fetchJobStatusSumary({ vcName: vc.currentSelectedVC });
    if (res.code === 0) {
      const jobSumary = [
        { value: 'all', label: intl.formatMessage({ id: 'centerInference.list.all' }) },
      ];
      let total = 0;
      Object.keys(res.data).forEach((k) => {
        let count = res.data[k];
        total += count;
        jobSumary.push({
          label: getStatusList().find((status) => status.value === k)?.label + `（${count}）`,
          value: k,
        });
      });
      jobSumary[0].label = jobSumary[0].label + `（${total}）`;
      setJobSumary(jobSumary);
    }
  };

  useEffect(() => {
    getJobStatusSumary();
    return () => {
      fetchJobStatusSumary.cancel && fetchJobStatusSumary.cancel();
    };
  }, []);

  useInterval(() => {
    getJobStatusSumary();
    handleSearch(false);
  }, props.common.interval);

  useEffect(() => {
    handleSearch();
  }, [pageParams, formValues, sortedInfo]);

  useEffect(() => {
    setLoading(false);
  }, [data]);

  const pageParamsChange = (page, size) => {
    setPageParams({ pageNum: page, pageSize: size });
  };

  const onSortChange = (pagination, filters, sorter) => {
    if (sorter.order !== false) {
      setSortedInfo(sorter);
    }
  };

  const columns = [
    {
      title: intl.formatMessage({ id: 'centerInferenceList.table.column.jobName' }),
      dataIndex: 'jobName',
      key: 'jobName',
      render(_text, item) {
        return <Link to={`/Inference/${item.jobId}/detail`}>{item.jobName}</Link>;
      },
      sorter: true,
      sortOrder: sortedInfo.columnKey === 'jobName' && sortedInfo.order,
    },
    {
      title: intl.formatMessage({ id: 'centerInferenceList.table.column.useModel' }),
      render: (text, item) => item.jobParams?.model_base_path,
    },
    {
      title: intl.formatMessage({ id: 'centerInferenceList.table.column.status' }),
      render: (text, item) => getJobStatus(item.jobStatus),
    },
    {
      title: intl.formatMessage({ id: 'centerInferenceList.table.column.engineType' }),
      render: (text, item) => getNameFromDockerImage(item?.jobParams?.framework) + ':' + item?.jobParams?.version,
    },
    {
      title: intl.formatMessage({ id: 'centerInferenceList.table.column.createTime' }),
      dataIndex: 'jobTime',
      key: 'jobTime',
      render: (text) => moment(text).format('YYYY-MM-DD HH:mm:ss'),
      sorter: true,
      sortOrder: sortedInfo.columnKey === 'jobTime' && sortedInfo.order,
    },
    {
      title: intl.formatMessage({ id: 'centerInferenceList.table.column.runningTime' }),
      align: 'center',
      render: (text, item) =>
        item.duration ? formatDuration(moment.duration(item.duration)) : '-',
    },
    {
      title: intl.formatMessage({ id: 'centerInferenceList.table.column.serviceAddr' }),
      ellipsis: true,
      render: (text, item) => (item['inference-url'] ? item['inference-url'] : ''),
    },
    {
      title: intl.formatMessage({ id: 'centerInferenceList.table.column.description' }),
      dataIndex: 'desc',
      render: (text, item) => item.jobParams?.desc,
    },
    {
      title: intl.formatMessage({ id: 'centerInferenceList.table.column.action' }),
      align: 'center',
      render: (item) => {
        return (
          <>
            <Button type="link" onClick={() => stopJob(item)} disabled={isStopDisabled(item)}>
              {intl.formatMessage({ id: 'centerInferenceList.table.column.action.stop' })}
            </Button>
            <Button
              type="link"
              danger
              onClick={() => deleteJob(item)}
              disabled={isDeleteDisabled(item)}
            >
              {intl.formatMessage({ id: 'centerInferenceList.table.column.action.delete' })}
            </Button>
          </>
        );
      },
    },
  ];

  const showEditModal = (item) => {
    setVisible(true);
    setCurrent(item);
  };

  const onSearchName = (name) => {
    setPageParams({ ...pageParams, ...{ pageNum: 1 } });
    setFormValues({ ...formValues, ...{ name } });
  };

  const handleCancel = () => {
    setVisible(false);
  };

  const handleSubmit = (values) => {
    const id = current ? current.id : '';
    const params = { id, ...values };
    dispatch({
      type: 'inferenceList/update',
      payload: params,
    });
  };

  const handleSearch = (withLoading = true) => {
    if (withLoading) {
      setLoading(true);
    }
    const params = {
      ...pageParams,
      orderBy: sortedInfo.columnKey,
      order: sortText[sortedInfo.order],
      vcName: vc.currentSelectedVC,
    };

    if (formValues.status && formValues.status !== 'all') {
      params.status = formValues.status;
    }

    if (formValues.name) {
      params.name = formValues.name;
    }

    dispatch({
      type: 'inferenceList/fetch',
      payload: params,
    });
  };

  const isStopDisabled = (item) => {
    // TODO
    if (
      item.jobStatus === 'running' ||
      item.jobStatus === 'queued' ||
      item.jobStatus === 'scheduling' ||
      item.jobStatus === 'unapproved'
    ) {
      return false;
    } else {
      return true;
    }
  };

  const isDeleteDisabled = (item) => {
    if (['failed', 'error', 'unapproved', 'finished', 'killed', 'paused', 'Killed'].includes(item.status)) {
      return false;
    } else {
      return true;
    }
  };

  const stopJob = async (item) => {
    const params = { jobId: item.jobId };
    const { code, msg, data } = await stopInference(params);

    if (code === 0) {
      message.success(`${intl.formatMessage({ id: 'centerInference.list.stopJob.success' })}`);
      handleSearch();
    } else {
      message.error(`${intl.formatMessage({ id: 'centerInference.list.stopJob.error' })}${msg}`);
    }
  };

  const deleteJob = async (item) => {
    confirm({
      title: intl.formatMessage({ id: 'centerInference.list.deleteJob.title' }),
      icon: <ExclamationCircleOutlined />,
      content: intl.formatMessage({ id: 'centerInference.list.deleteJob.content' }),
      okText: intl.formatMessage({ id: 'centerInference.list.deleteJob.okText' }),
      okType: 'danger',
      cancelText: intl.formatMessage({ id: 'centerInference.list.deleteJob.cancelText' }),
      onOk: async () => {
        const { code, msg } = await deleteInference(item.jobId);

        if (code === 0) {
          // 若删除的是当前页最后一项，且页数不是第一页，则将页数减一
          if (data.list.length === 1 && pageParams.pageNum > 1) {
            setPageParams({ ...pageParams, pageNum: pageParams.pageNum - 1 });
          } else {
            handleSearch();
          }
          getJobStatusSumary();
          message.success(
            `${intl.formatMessage({ id: 'centerInference.list.deleteJob.tips.suucess' })}`,
          );
        } else {
          message.error(
            `${intl.formatMessage({ id: 'centerInference.list.deleteJob.tips.error' })}${msg}`,
          );
        }
      },
      onCancel() {},
    });
  };

  const CreateJob = (item) => {
    history.push('/Inference/submit');
  };

  const handleStatusChange = (status) => {
    // setCurrentStatus(status);
    setPageParams({ ...pageParams, ...{ pageNum: 1 } });
    setFormValues({ ...formValues, ...{ status } });
  };

  return (
    <PageHeaderWrapper>
      <Card
        bordered={false}
        bodyStyle={{
          padding: '0',
        }}
      >
        <div
          style={{
            padding: '24px 0 24px 24px',
          }}
        >
          <Button type="primary" onClick={CreateJob}>
            {intl.formatMessage({ id: 'centerInference.list.add.inferenceJob' })}
          </Button>
          <div
            style={{
              float: 'right',
              paddingRight: '20px',
            }}
          >
            <Select
              style={{ width: 180, marginRight: '20px' }}
              defaultValue={currentStatus}
              onChange={handleStatusChange}
            >
              {jobSumary.map((item) => (
                <Option key={item.value} value={item.value}>
                  {item.label}
                </Option>
              ))}
            </Select>
            <Search
              style={{ width: '200px', marginRight: '20px' }}
              placeholder={intl.formatMessage({ id: 'centerInference.list.placeholder.search' })}
              onSearch={onSearchName}
              enterButton
            />
            <Button icon={<SyncOutlined />} onClick={() => handleSearch()}></Button>
          </div>
        </div>
        <Table
          columns={columns}
          dataSource={data.list}
          rowKey={(r) => r.jobId}
          onChange={onSortChange}
          pagination={{
            total: data.pagination.total,
            showQuickJumper: true,
            showTotal: (total) =>
              `${intl.formatMessage({
                id: 'centerInferenceList.table.pagination.showTotal.prefix',
              })} ${total} ${intl.formatMessage({
                id: 'centerInferenceList.table.pagination.showTotal.suffix',
              })}`,
            showSizeChanger: true,
            onChange: pageParamsChange,
            onShowSizeChange: pageParamsChange,
            current: pageParams.pageNum,
            pageSize: pageParams.pageSize,
          }}
          loading={loading}
        />
      </Card>
    </PageHeaderWrapper>
  );
};

export default connect(({ inferenceList, loading, common, vc }) => ({
  inferenceList,
  common,
  vc,
}))(InferenceList);
