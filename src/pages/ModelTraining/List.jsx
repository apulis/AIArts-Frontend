import React, { useState, useEffect } from 'react';
import { Button, Table, Input, message, Card, Select, Modal } from 'antd';
import { Link } from 'umi';
import moment from 'moment';
import { getJobStatus, checkIfCanStop, checkIfCanDelete, getStatusList } from '@/utils/utils';
import { sortText } from '@/utils/const';
import {
  fetchTrainingList,
  removeTrainings,
  fetchJobStatusSumary,
  deleteJob,
} from '@/services/modelTraning';
import { SyncOutlined } from '@ant-design/icons';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import style from './index.less';
import { getNameFromDockerImage } from '@/utils/reg';
import { connect } from 'dva';
import useInterval from '@/hooks/useInterval';
import { useIntl } from 'umi';
import JobStatusToolTip from '@/components/JobStatusToolTip';

const { Search } = Input;
const { Option } = Select;

const List = (props) => {
  const intl = useIntl();
  const { formatMessage } = intl;
  const [trainingWorkList, setTrainingWorkList] = useState([]);
  const [tableLoading, setTableLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [pageNum, setPageNum] = useState(1);
  const [currentStatus, setCurrentStatus] = useState('all');
  const [jobSumary, setJobSumary] = useState([]);
  const [sortedInfo, setSortedInfo] = useState({
    orderBy: '',
    order: '',
    columnKey: '',
  });

  useInterval(() => {
    getTrainingList(undefined, undefined, false);
    getJobStatusSumary();
  }, props.common.interval);

  const { currentSelectedVC, jobMaxTimeSecond } = props.vc;

  const getTrainingList = async (reloadPage, options = {}, withLoading = true) => {
    const { pageSize: size, status, pageNo } = options;
    let page = pageNo || pageNum;
    if (reloadPage) {
      page = 1;
    }
    if (withLoading) setTableLoading(true);
    const res = await fetchTrainingList({
      pageNum: page,
      pageSize: size || pageSize,
      search,
      sortedInfo,
      status: status || currentStatus,
      vcName: currentSelectedVC,
    });
    if (res.code === 0) {
      setPageNum(page);
      const trainings = (res.data && res.data.Trainings) || [];
      const total = res.data?.total;
      setTotal(total);
      setTrainingWorkList(trainings);
    }
    setTableLoading(false);
  };
  const handleChangeStatus = async (status) => {
    getTrainingList(true, { status: status });
    setCurrentStatus(status);
  };

  const getJobStatusSumary = async () => {
    const res = await fetchJobStatusSumary(currentSelectedVC);
    if (res.code === 0) {
      const jobSumary = [{ value: 'all', label: intl.formatMessage({ id: 'service.status.all' }) }];
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
    getTrainingList(true);
    getJobStatusSumary();
    return () => {
      fetchTrainingList.cancel && fetchTrainingList.cancel();
    };
  }, []);
  const onTableChange = async (pagination, filters, sorter) => {
    console.log('setSortedInfo', sorter);
    if (sorter.order !== false) {
      setSortedInfo(sorter);
    }
    console.log('sorter', sortText[sorter.order]);
    const { current } = pagination;
    setPageNum(current);
    const searchSorterInfo = {
      ...sorter,
      // 正序，倒序，取消排序
      orderBy: sortText[sorter.order] && sorter.columnKey,
      order: sortText[sorter.order],
    };
    setTableLoading(true);
    const res = await fetchTrainingList({
      pageNum: current,
      pageSize,
      search,
      status: currentStatus,
      sortedInfo: searchSorterInfo,
      vcName: currentSelectedVC,
    });
    if (res.code === 0) {
      setTableLoading(false);
      setTrainingWorkList(res.data.Trainings);
    }
  };
  const stopTraining = async (id) => {
    const res = await removeTrainings(id);
    if (res.code === 0) {
      message.success(formatMessage({ id: 'modelTraining.list.message.delete.success' }));
      getTrainingList();
    }
  };
  const searchList = async (s) => {
    setSearch(s);
    setTableLoading(true);
    const res = await fetchTrainingList({ pageNum: 1, pageSize, search: s, status: currentStatus, vcName: currentSelectedVC });
    if (res.code === 0) {
      setTrainingWorkList(res.data.Trainings);
      setTableLoading(false);
      setTotal(res.data.total);
    }
  };

  const handleDeleteJob = async (jobId, status) => {
    const handleDelete = async () => {
      const res = await deleteJob(jobId);
      if (res.code === 0) {
        message.success(formatMessage({ id: 'modelTraining.list.message.handle.success' }));
        if (trainingWorkList.length === 1) {
          setPageNum(pageNum - 1);
          getTrainingList(false, { pageNo: pageNum - 1 });
        } else {
          getTrainingList(false, { pageNo: pageNum });
        }
        getJobStatusSumary();
      }
    };
    if (['unapproved', 'queued', 'scheduling', 'running'].includes(status)) {
      Modal.confirm({
        title: formatMessage({ id: 'modelTraining.list.modal.title.current.task.dont.stopped' }),
        content: formatMessage({ id: 'modelTraining.list.modal.content.please.stop.task' }),
        cancelButtonProps: { hidden: true },
        onCancel() {},
        onOk() {},
      });
    } else {
      handleDelete();
    }
  };

  const onSearchInput = (e) => {
    setSearch(e.target.value);
  };
  const columns = [
    {
      dataIndex: 'name',
      title: intl.formatMessage({ id: 'modelList.table.column.name' }),
      key: 'jobName',
      render(_text, item) {
        return <Link to={`/model-training/${item.id}/detail`}>{item.name}</Link>;
      },
      width: '8%',
      sorter: true,
      sortOrder: sortedInfo.columnKey === 'jobName' && sortedInfo.order,
    },
    {
      dataIndex: 'status',
      title: intl.formatMessage({ id: 'modelList.table.column.status' }),
      width: '8%',
      render: (text, item) => {
        return <div style={{ display: 'flex', alignItems: 'center' }}>
          {getJobStatus(item.status)}
          {/* <JobStatusToolTip jobDetail={item} /> */}
        </div>
      },
    },
    {
      dataIndex: 'engine',
      title: intl.formatMessage({ id: 'modelList.table.column.engine' }),
      width: '8%',
      render(value) {
        return <div>{getNameFromDockerImage(value)}</div>;
      },
    },
    {
      dataIndex: 'createTime',
      title: intl.formatMessage({ id: 'modelList.table.column.createTime' }),
      key: 'jobTime',
      render(_text, item) {
        return <div>{moment(item.createTime).format('YYYY-MM-DD HH:mm:ss')}</div>;
      },
      sorter: true,
      sortOrder: sortedInfo.columnKey === 'jobTime' && sortedInfo.order,
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
          const restTime = Math.floor(jobMaxTimeSecond - (lastedTime / 60 / 1000));
          return restTime + formatMessage({ id: 'job.rest.minute' });
        }
        return '-';
      },
      ellipsis: true,
      width: '8%',
    },
    {
      dataIndex: 'desc',
      title: intl.formatMessage({ id: 'modelList.table.column.description' }),
      width: '100px',
      render(_text) {
        return (
          <div title={_text} className={style.overflow}>
            {_text}
          </div>
        );
      },
    },
    {
      title: intl.formatMessage({ id: 'modelList.table.column.action' }),
      render(_text, item) {
        return (
          <>
            {checkIfCanStop(item.status) ? (
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <a
                  style={{ marginRight: '16px', display: 'block' }}
                  onClick={() => stopTraining(item.id)}
                >
                  {intl.formatMessage({ id: 'modelList.table.column.action.stop' })}
                </a>
                <Button
                  type="link"
                  danger
                  disabled={!checkIfCanDelete(item.status)}
                  onClick={() => handleDeleteJob(item.id, item.status)}
                >
                  {intl.formatMessage({ id: 'modelList.table.column.action.delete' })}
                </Button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ marginRight: '16px' }} className="disabled">
                  {intl.formatMessage({ id: 'modelList.table.column.action.hasStopped' })}
                </div>
                <Button
                  danger
                  type="link"
                  disabled={!checkIfCanDelete(item.status)}
                  onClick={() => handleDeleteJob(item.id, item.status)}
                >
                  {intl.formatMessage({ id: 'modelList.table.column.action.delete' })}
                </Button>
              </div>
            )}
          </>
        );
      },
    },
  ];

  const onShowSizeChange = (current, size) => {
    setPageSize(size);
    getTrainingList(true, { pageSize: size });
  };

  return (
    <PageHeaderWrapper>
      <Card
        bordered={false}
        bodyStyle={{
          padding: '8',
        }}
      >
        <Link to="/model-training/submit">
          <Button type="primary" href="">
            {intl.formatMessage({ id: 'modelList.add.modelTraining' })}
          </Button>
        </Link>
        <div style={{ float: 'right', paddingRight: '20px' }}>
          <Select
            style={{ width: 120, marginRight: '20px' }}
            defaultValue={currentStatus}
            onChange={handleChangeStatus}
          >
            {jobSumary.map((status) => (
              <Option value={status.value}>{status.label}</Option>
            ))}
          </Select>
          <Search
            style={{ width: '200px' }}
            placeholder={intl.formatMessage({ id: 'modelList.placeholder.search' })}
            onChange={onSearchInput}
            onSearch={searchList}
            enterButton
          />
          <Button
            style={{ left: '20px' }}
            icon={<SyncOutlined />}
            onClick={() => getTrainingList()}
          ></Button>
        </div>
        <Table
          loading={tableLoading}
          style={{ marginTop: '30px' }}
          columns={columns}
          dataSource={trainingWorkList}
          onChange={onTableChange}
          pagination={{
            defaultCurrent: 1,
            defaultPageSize: 10,
            showQuickJumper: true,
            showSizeChanger: true,
            total: total,
            current: pageNum,
            pageSize: pageSize,
            onShowSizeChange: onShowSizeChange,
          }}
        />
      </Card>
    </PageHeaderWrapper>
  );
};

export default connect(({ common, vc }) => ({ common, vc }))(List);
