import React, { useState, useEffect, useRef } from 'react';
import { Button, Table, Input, message, Card, Select, Popover, Modal } from 'antd';
import { Link } from 'umi';
import moment from 'moment';
import { getJobStatus } from '@/utils/utils';
import { PAGEPARAMS, sortText } from '@/utils/const';
import { getEvaluations, stopEvaluation, fetchJobStatusSumary, deleteEvaluation } from './services';
import { SyncOutlined } from '@ant-design/icons';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { getNameFromDockerImage } from '@/utils/reg.js';
import { connect } from 'dva';
import useInterval from '@/hooks/useInterval';
import { useIntl, formatMessage } from 'umi';

export const statusList = [
  { value: 'all', label: formatMessage({ id: 'service.status.all' }) },
  { value: 'unapproved', label: formatMessage({ id: 'service.status.unapproved' }) },
  { value: 'queued', label: formatMessage({ id: 'service.status.queued' }) },
  { value: 'scheduling', label: formatMessage({ id: 'service.status.scheduling' }) },
  { value: 'running', label: formatMessage({ id: 'service.status.running' }) },
  { value: 'finished', label: formatMessage({ id: 'service.status.finished' }) },
  { value: 'failed', label: formatMessage({ id: 'service.status.failed' }) },
  { value: 'pausing', label: formatMessage({ id: 'service.status.pausing' }) },
  { value: 'paused', label: formatMessage({ id: 'service.status.paused' }) },
  { value: 'killing', label: formatMessage({ id: 'service.status.killing' }) },
  { value: 'killed', label: formatMessage({ id: 'service.status.killed' }) },
  { value: 'Killed', label: formatMessage({ id: 'service.status.killed' }) },
  { value: 'error', label: formatMessage({ id: 'service.status.error' }) },
];

const { Search } = Input;
const { Option } = Select;

const List = (props) => {
  const intl = useIntl();
  // eslint-disable-next-line no-shadow
  const { formatMessage } = intl;
  const [trainingWorkList, setTrainingWorkList] = useState([]);
  const [tableLoading, setTableLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [pageParams, setPageParams] = useState(PAGEPARAMS);
  const [formValues, setFormValues] = useState({ name: '', status: 'all' });
  const [currentStatus, setCurrentStatus] = useState('all');
  const [jobSumary, setJobSumary] = useState([]);
  const [sortedInfo, setSortedInfo] = useState({
    orderBy: '',
    order: '',
  });
  const searchEl = useRef(null);
  const { currentSelectedVC, jobMaxTimeSecond } = props.vc;
  const handleSearch = async (withLoading = true) => {
    const params = {
      ...pageParams,
      orderBy: sortedInfo.columnKey,
      order: sortText[sortedInfo.order],
    };

    if (formValues.status) {
      params.status = formValues.status;
    }

    if (formValues.name) {
      params.search = formValues.name;
    }

    if (withLoading) setTableLoading(true);
    const res = await getEvaluations({ ...params, vcName: currentSelectedVC });
    if (res.code === 0) {
      const trainings = (res.data && res.data.evaluations) || [];
      const total = res.data?.total;
      setTotal(total);
      setTrainingWorkList(trainings);
    }
    setTableLoading(false);
  };

  const handleStatusChange = async (status) => {
    setPageParams({ ...pageParams, ...{ pageNum: 1 } });
    setFormValues({ ...formValues, ...{ status } });
  };

  const getJobStatusSumary = async () => {
    const res = await fetchJobStatusSumary({ vcName: currentSelectedVC });
    if (res.code === 0) {
      const jobSumary = [{ value: 'all', label: intl.formatMessage({ id: 'list.all' }) }];
      let total = 0;
      Object.keys(res.data).forEach((k) => {
        let count = res.data[k];
        total += count;
        jobSumary.push({
          label: statusList.find((status) => status.value === k)?.label + `（${count}）`,
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
      getEvaluations.cancel && getEvaluations.cancel();
    };
  }, []);

  useEffect(() => {
    handleSearch();
  }, [pageParams, formValues, sortedInfo]);

  useInterval(() => {
    getJobStatusSumary();
    handleSearch(false);
  }, props.common.interval);

  const pageParamsChange = (page, size) => {
    setPageParams({ pageNum: page, pageSize: size });
  };

  const onSortChange = (pagination, filters, sorter) => {
    if (sorter.order !== false) {
      setSortedInfo(sorter);
    }
  };

  const stopEvaluationJob = async (id) => {
    const res = await stopEvaluation(id);
    if (res.code === 0) {
      message.success(intl.formatMessage({ id: 'list.stop.success' }));
      handleSearch();
    }
  };
  const deleteEvaluationJob = async (item) => {
    if (canStop(item)) {
      Modal.warning({
        title: intl.formatMessage({ id: 'list.stop.not' }),
        content: intl.formatMessage({ id: 'list.needStop' }),
        okText: intl.formatMessage({ id: 'list.ok' }),
      });
      return;
    }

    // const res = await deleteEvaluation(item.id);
    // if (res.code === 0) {
    //   message.success('已成功删除');
    //   handleSearch();
    //   getJobStatusSumary();
    // }
    Modal.warning({
      title: formatMessage({ id: 'delete.modal.title' }),
      content: formatMessage({ id: 'delete.modal.content' }),
      okText: formatMessage({ id: 'delete.modal.okText' }),
      async onOk() {
        const { code, msg } = await deleteEvaluation(item.id);
        if (code === 0) {
          // 若删除的是当前页最后一项，且页数不是第一页，则将页数减一
          if (trainingWorkList.length === 1 && pageParams.pageNum > 1) {
            setPageParams({ ...pageParams, pageNum: pageParams.pageNum - 1 });
          } else {
            handleSearch();
          }
          getJobStatusSumary();
          message.success(`${intl.formatMessage({ id: 'list.delete.success' })}`);
        } else {
          message.error(`${intl.formatMessage({ id: 'list.delete.error' })}${msg}。`);
        }
      }
    })
    
  };
  const onSearchName = (name) => {
    setPageParams({ ...pageParams, ...{ pageNum: 1 } });
    setFormValues({ ...formValues, ...{ name } });
  };

  const onRefresh = () => {
    setPageParams({ ...pageParams, ...{ pageNum: 1 } });
    const name = searchEl.current.value;
    setFormValues({ ...formValues, ...{ name } });
  };

  const canStop = (item) => {
    return ['unapproved', 'queued', 'scheduling', 'running'].includes(item.status);
  };

  const columns = [
    {
      dataIndex: 'name',
      title: formatMessage({ id: 'modelEvaluationList.table.column.name' }),
      width: '10%',
      key: 'jobName',
      render(_text, item) {
        return (
          <Popover content={intl.formatMessage({ id: 'list.delete.evaluation.detail.view' })}>
            <Link to={`/ModelManagement/ModelEvaluation/${item.id}/detail`}>{item.name}</Link>
          </Popover>
        );
      },
      sorter: true,
      sortOrder: sortedInfo.columnKey === 'jobName' && sortedInfo.order,
    },
    {
      dataIndex: 'status',
      width: '9%',
      title: formatMessage({ id: 'modelEvaluationList.table.column.status' }),
      render: (text, item) => getJobStatus(item.status),
    },
    {
      dataIndex: 'engine',
      width: '14%',
      title: formatMessage({ id: 'modelEvaluationList.table.column.engineType' }),
      render(value) {
        return <div>{getNameFromDockerImage(value)}</div>;
      },
    },
    {
      dataIndex: 'createTime',
      width: '12%',
      title: formatMessage({ id: 'modelEvaluationList.table.column.createTime' }),
      key: 'jobTime',
      render(_text, item) {
        return <div>{moment(item.createTime).format('YYYY-MM-DD HH:mm:ss')}</div>;
      },
      sorter: true,
      sortOrder: sortedInfo.columnKey === 'jobTime' && sortedInfo.order,
    },
    {
      title: formatMessage({ id: 'ManagePrivilegeJob.table.title.is.privilege' }),
      dataIndex: 'isPrivileged',
      width: '16%',
      align: 'center',
      render(isPrivileged) {
        return isPrivileged ? formatMessage({ id: 'ManagePrivilegeJob.table.title.is' }) : formatMessage({ id: 'ManagePrivilegeJob.table.title.not' })
      }
    },
    {
      title: formatMessage({ id: 'job.rest.time' }),
      width: '16%',
      render: (text, item) => {
        const status = item.status || item.jobStatus;
        const lastedTime = item.duration;
        if (status === 'running') {
          if (!jobMaxTimeSecond) {
            return '-';
          }
          const restTime = Math.floor((jobMaxTimeSecond - lastedTime) / 60);
          return restTime + formatMessage({ id: 'job.rest.minute' });
        }
        return '-';
      },
      ellipsis: true,
    },
    // {
    //   dataIndex: 'desc',
    //   title: '描述'
    // },
    {
      title: formatMessage({ id: 'modelEvaluationList.table.column.action' }),
      render(_text, item) {
        return (
          <>
            <Button
              type="link"
              onClick={() => stopEvaluationJob(item.id)}
              disabled={!canStop(item)}
            >
              {formatMessage({ id: 'modelEvaluationList.table.column.action.stop' })}
            </Button>
            <Button type="link" danger onClick={() => deleteEvaluationJob(item)}>
              {formatMessage({ id: 'modelEvaluationList.table.column.action.delete' })}
            </Button>
          </>
        );
      },
    },
  ];

  return (
    <PageHeaderWrapper>
      <Card
        bordered={false}
        bodyStyle={{
          padding: '8',
        }}
      >
        <div style={{ float: 'right', paddingRight: '20px' }}>
          <Select
            style={{ width: 120, marginRight: '20px' }}
            defaultValue={currentStatus}
            onChange={handleStatusChange}
          >
            {jobSumary.map((status) => (
              <Option key={status.value} value={status.value}>
                {status.label}
              </Option>
            ))}
          </Select>
          <Search
            ref={searchEl}
            style={{ width: '200px' }}
            placeholder={formatMessage({ id: 'modelEvaluation.list.placeholder.search' })}
            onSearch={onSearchName}
            enterButton
          />
          <Button style={{ left: '20px' }} icon={<SyncOutlined />} onClick={handleSearch}></Button>
        </div>
        <Table
          loading={tableLoading}
          style={{ marginTop: '30px' }}
          columns={columns}
          dataSource={trainingWorkList}
          rowKey={(record) => record.id}
          onChange={onSortChange}
          pagination={{
            total: total,
            showQuickJumper: true,
            showTotal: (total) =>
              `${formatMessage({
                id: 'modelEvaluationList.table.pagination.showTotal.prefix',
              })} ${total} ${formatMessage({
                id: 'modelEvaluationList.table.pagination.showTotal.suffix',
              })}`,
            showSizeChanger: true,
            onChange: pageParamsChange,
            onShowSizeChange: pageParamsChange,
            current: pageParams.pageNum,
            pageSize: pageParams.pageSize,
          }}
        />
      </Card>
    </PageHeaderWrapper>
  );
};

export default connect(({ common, vc }) => ({ common, vc }))(List);
