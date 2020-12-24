import React, { useEffect, useState } from 'react';
import { Table, Select, Input, Card, Button, message, Modal } from 'antd';
import { connect, useIntl } from 'umi';
import moment from 'moment';
import { PageHeaderWrapper } from '@ant-design/pro-layout';

import { checkIfCanDelete, checkIfCanStop, getJobStatus, getStatusList } from '@/utils/utils';
import { getNameFromDockerImage } from '@/utils/reg';
import { fetchAllJobs, fetchAllJobsSummary } from '@/services/manageJobs';
import useInterval from '@/hooks/useInterval';
import { PAGEPARAMS, sortText } from '@/utils/const';
import { deleteJob, removeTrainings } from '@/services/modelTraning';
import { deleteInference } from '../InferenceService/InferenceList/services';
import { ColumnsType } from 'antd/lib/table';

const { Search } = Input;

export enum EnumJobTrainingType {
  all = 'all',
  visualjob = 'visualjob',
  artsEvaluation = 'artsEvaluation',
  artsTraining = 'artsTraining',
  codeEnv = 'codeEnv',
  InferenceJob = 'InferenceJob'
}

const ManageJobs: React.FC = (props) => {
  const { formatMessage } = useIntl();
  const [loading, setLoading] = useState(false);
  const [jobTotal, setJobTotal] = useState(0);
  const [sortedInfo, setSortedInfo] = useState<{ orderBy: string; order: 'ascend' | 'descend'; columnKey: string }>({
    orderBy: 'jobTime',
    order: 'ascend',
    columnKey: '',
  });
  const [currentJobType, setCurrentJobType] = useState(EnumJobTrainingType.all)
  const { currentSelectedVC, jobMaxTimeSecond } = props.vc;
  const [currentStatus, setCurrentStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [jobs, setJobs] = useState([]);
  const [currentSearchVC, setCurrentSearchVC] = useState<string | null>(currentSelectedVC)
  const [pageParams, setPageParams] = useState(PAGEPARAMS);
  const [jobSumary, setJobSumary] = useState<{ label: string, value: string }[]>([]);

  const getJobList = async (withLoading?: boolean) => {
    if (withLoading) {
      setLoading(true);
    }
    const res = await fetchAllJobs({
      searchWord: search,
      pageNum: pageParams.pageNum,
      pageSize: pageParams.pageSize,
      status: currentStatus || 'all',
      vcName: currentSearchVC || '',
      jobType: currentJobType,
      order: sortText[sortedInfo.order],
      orderBy: sortedInfo.orderBy,
    });
    setLoading(false);
    if (res.code === 0) {
      setJobs(res.data.jobs);
      setJobTotal(res.data.total);
    }
  }

  const onSortChange = (pagination, filters, sorter) => {
    if (sorter.order !== null) {
      setSortedInfo({
        ...sorter,
        order: sortText[sortedInfo.order],
      });
    }
  };


  useInterval(async () => {
    getJobList();
  }, props.common.interval);

  const getAllJobsSummary = async () => {
    const res = await fetchAllJobsSummary(currentSearchVC || undefined);
    if (res.code === 0) {
      const summary = [
        { value: 'all', label: formatMessage({ id: 'centerInference.list.all' }) },
      ];
      let total = 0;
      Object.keys(res.data).forEach((k) => {
        const count = res.data[k];
        total += count;
        summary.push({
          label: getStatusList().find((status) => status.value === k)?.label,
          value: k,
        });
      });
      summary[0].label = `${summary[0].label  }`;
      setJobSumary(summary);
    }
  }

  useEffect(() => {
    getJobList(true);
    getAllJobsSummary()
  }, [pageParams, currentSearchVC, currentStatus, currentJobType, search]);

  const handleChangeStatus = (value: string) => {
    setCurrentStatus(value);
  }


  const handleSearch = (value: string) => {
    setSearch(value);
  }

  const stopTraining = async (id: string) => {
    const res = await removeTrainings(id);
    if (res.code === 0) {
      message.success(formatMessage({ id: 'modelTraining.list.message.delete.success' }));
      getJobList(true);
    }
  };

  const handleDeleteJob = async (jobId: string, status: string) => {
    const handleDelete = async () => {
      const res = await deleteInference(jobId);
      if (res.code === 0) {
        message.success(formatMessage({ id: 'modelTraining.list.message.handle.success' }));
        if (jobs.length === 1) {
          setPageParams({...pageParams, pageNum: pageParams.pageNum - 1});
        } else {
          getJobList(true);
        }
        getAllJobsSummary()
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

  const columns: ColumnsType<any> = [
    {
      dataIndex: 'jobName',
      title: formatMessage({ id: 'jobManagement.table.column.name' }),
      key: 'jobName',
      sorter: true,
      sortOrder: sortedInfo.columnKey === 'jobName' ? sortedInfo.order : null,
    },
    {
      dataIndex: 'jobStatus',
      title: formatMessage({ id: 'jobManagement.table.column.status' }),
      width: '8%',
      render: (text, item) => getJobStatus(item.jobStatus),
    },
    {
      dataIndex: 'engine',
      title: formatMessage({ id: 'jobManagement.table.column.engine' }),
      render(_text, item) {
        return <div>{getNameFromDockerImage(item.jobParams?.image || item.jobParams?.framework)}</div>;
      },
    },
    {
      dataIndex: 'userName',
      title: formatMessage({ id: 'jobManagement.table.column.userName' }),
      render(text, item) {
        return <div>{item.jobParams?.userName}</div>;
      },
      width: '8%',
    },
    {
      dataIndex: 'createTime',
      title: formatMessage({ id: 'jobManagement.table.column.createTime' }),
      key: 'jobTime',
      render(_text, item) {
        return <div>{moment(new Date(item.jobTime).getTime()).format('YYYY-MM-DD HH:mm:ss')}</div>;
      },
      sorter: true,
      sortOrder: sortedInfo.columnKey === 'jobTime' ? sortedInfo.order : null,
    },
    
    {
      title: formatMessage({ id: 'job.used.time' }),
      render: (text, item) => {
        const status = item.status || item.jobStatus;
        const lastedTime = item.duration;
        if (status === 'running') {
          const restTime = Math.floor((lastedTime) / 60);
          return restTime + formatMessage({ id: 'job.rest.minute' });
        }
        return '-';
      },
      ellipsis: true,
      width: '8%',
    },
    {
      dataIndex: 'desc',
      title: formatMessage({ id: 'jobManagement.table.column.desc' }),
      width: '100px',
      render(_text, item) {
        return (
          <div title={item.jobParams?.desc}>
            {item.jobParams?.desc || '-'}
          </div>
        );
      },
    },
    {
      title: formatMessage({ id: 'modelList.table.column.action' }),
      align: 'center',
      render(_text, item) {
        return (
          <>
            {checkIfCanStop(item.jobStatus) ? (
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <a
                  style={{ marginRight: '16px', display: 'block' }}
                  onClick={() => stopTraining(item.jobId)}
                >
                  {formatMessage({ id: 'modelList.table.column.action.stop' })}
                </a>
                <Button
                  type="link"
                  danger
                  disabled={!checkIfCanDelete(item.jobStatus)}
                  onClick={() => handleDeleteJob(item.jobId, item.jobStatus)}
                >
                  {formatMessage({ id: 'modelList.table.column.action.delete' })}
                </Button>
              </div>
            ) : (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ marginRight: '16px' }} className="disabled">
                    {formatMessage({ id: 'modelList.table.column.action.hasStopped' })}
                  </div>
                  <Button
                    danger
                    type="link"
                    disabled={!checkIfCanDelete(item.jobStatus)}
                    onClick={() => handleDeleteJob(item.jobId, item.jobStatus)}
                  >
                    {formatMessage({ id: 'modelList.table.column.action.delete' })}
                  </Button>
                </div>
              )}
          </>
        );
      },
    },
  ];

  

  const pageParamsChange = (page: number, size?: number) => {
    setPageParams({ pageNum: page, pageSize: size || pageParams.pageSize });
  };

  const handleChangeCurrentSearchVC = (value: string | null) => {
    setCurrentSearchVC(value);
  }

  return (
    <PageHeaderWrapper>
      <Card
        bordered={false}
        bodyStyle={{
          padding: '8',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ flexGrow: 1 }}></div>
          <div style={{ paddingRight: '20px' }}>
            <Select
              style={{ width: 180, marginRight: '20px' }}
              defaultValue={currentJobType}
              onChange={(jobType) => setCurrentJobType(jobType)}
            >
              {
                Object.keys(EnumJobTrainingType).map(jobType => (
                  <Option value={jobType}>{formatMessage({ id: 'jobManagement.jobType.' + jobType })}</Option>
                ))
              }
            </Select>
            <Select
              style={{ width: 120, marginRight: '20px' }}
              defaultValue={currentStatus}
              onChange={handleChangeStatus}
            >
              {jobSumary.map((status) => (
                <Option value={status.value}>{status.label}</Option>
              ))}
            </Select>
            <Select
              style={{ width: 180, marginRight: '20px' }}
              defaultValue={currentSelectedVC}
              onChange={handleChangeCurrentSearchVC}
            >
              <Option value={currentSelectedVC}>{formatMessage({ id: 'jobManagement.current.vitual.cluster' })}</Option>
              <Option value={null}>{formatMessage({ id: 'jobManagement.all.vitual.cluster' })}</Option>
            </Select>
            <Search
              style={{ width: '200px' }}
              placeholder={formatMessage({ id: 'jobManagement.placeholder.search' })}
              onSearch={handleSearch}
              enterButton
            />
          </div>
        </div>

        <Table
          style={{ marginTop: '20px' }}
          dataSource={jobs}
          columns={columns}
          onChange={onSortChange}
          pagination={{
            total: jobTotal,
            showQuickJumper: true,
            showTotal: (total) =>
              `${formatMessage({
                id: 'bizComponent.table.pagination.showTotal.total',
              })} ${total} ${formatMessage({
                id: 'bizComponent.table.pagination.showTotal.suffix',
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
}


export default connect(({ common, vc }) => ({ common, vc }))(ManageJobs);