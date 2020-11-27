import React, { useEffect, useState } from 'react';
import { Table, Select, Input, Card, Button, message, Dropdown, Menu } from 'antd';
import { connect, useIntl } from 'umi';
import moment from 'moment';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { SyncOutlined } from '@ant-design/icons';

import { checkIfCanDelete, checkIfCanStop, getJobStatus, getStatusList } from '@/utils/utils';
import { getNameFromDockerImage } from '@/utils/reg';
import { fetchAllJobs, fetchAllJobsSummary } from '@/services/manageJobs';
import useInterval from '@/hooks/useInterval';
import { PAGEPARAMS, sortText } from '@/utils/const';
import { deleteJob, removeTrainings } from '@/services/modelTraning';
import Modal from 'antd/lib/modal/Modal';
import { deleteInference } from '../InferenceService/InferenceList/services';
import { ColumnsType } from 'antd/lib/table';

const { Search } = Input;

export enum EnumJobTrainingType {
  all = 'all',
  visualization = 'visualization',
  ModelConversionJob = 'ModelConversionJob',
  InferenceJob = 'InferenceJob',
  training = 'training'
}

const ManageJobs: React.FC = (props) => {
  const { formatMessage } = useIntl();
  const [loading, setLoading] = useState(false);
  const [jobTotal, setJobTotal] = useState(0);
  const [sortedInfo, setSortedInfo] = useState<{ orderBy: string; order: string; columnKey: string }>({
    orderBy: 'jobTime',
    order: 'ascend',
    columnKey: '',
  });
  const [currentJobType, setCurrentJobType] = useState(EnumJobTrainingType.all)
  const { currentSelectedVC } = props.vc;
  const [currentStatus, setCurrentStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [jobs, setJobs] = useState([]);
  const [currentSearchVC, setCurrentSearchVC] = useState(currentSelectedVC)
  const [pageParams, setPageParams] = useState(PAGEPARAMS);

  const getJobList = async (withLoading?: boolean) => {
    if (withLoading) {
      setLoading(true);
    }
    const res = await fetchAllJobs({
      searchWord: search,
      pageNum: pageParams.pageNum,
      pageSize: pageParams.pageSize,
      status: currentStatus || 'all',
      vcName: currentSearchVC,
      jobType: 'training',
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
    if (sorter.order !== false) {
      console.log('sorter', sorter)
      setSortedInfo({
        ...sorter,
        order: sortText[sortedInfo.order],
      });
    }
  };


  useInterval(async () => {
    getJobList();
  }, props.common.interval);

  useEffect(() => {
    getJobList(true);
    getAllJobsSummary()
  }, [pageParams, currentSearchVC, currentStatus, currentJobType, currentSearchVC]);

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
      sortOrder: sortedInfo.columnKey === 'jobName' && sortedInfo.order,
    },
    {
      dataIndex: 'jobStatus',
      title: formatMessage({ id: 'jobManagement.table.column.status' }),
      render: (text, item) => getJobStatus(item.jobStatus),
    },
    {
      dataIndex: 'engine',
      title: formatMessage({ id: 'jobManagement.table.column.engine' }),
      render(_text, item) {
        return <div>{getNameFromDockerImage(item.jobParams?.image)}</div>;
      },
    },
    {
      dataIndex: 'userName',
      title: formatMessage({ id: 'jobManagement.table.column.userName' }),
      render(text, item) {
        return <div>{item.jobParams?.userName}</div>;
      },
    },
    {
      dataIndex: 'createTime',
      title: formatMessage({ id: 'jobManagement.table.column.createTime' }),
      key: 'jobTime',
      render(_text, item) {
        return <div>{moment(new Date(item.jobTime).getTime()).format('YYYY-MM-DD HH:mm:ss')}</div>;
      },
      sorter: true,
      sortOrder: sortedInfo.columnKey === 'jobTime' && sortedInfo.order,
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
            {checkIfCanStop(item.status) ? (
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
                  disabled={!checkIfCanDelete(item.status)}
                  onClick={() => handleDeleteJob(item.jobId, item.status)}
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
                    disabled={!checkIfCanDelete(item.status)}
                    onClick={() => handleDeleteJob(item.jobId, item.status)}
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

  const getAllJobsSummary = async () => {
    const res = await fetchAllJobsSummary();
    if (res.code === 0) {
      const jobSumary = [
        { value: 'all', label: formatMessage({ id: 'centerInference.list.all' }) },
      ];
      let total = 0;
      Object.keys(res.data).forEach((k) => {
        let count = res.data[k];
        total += count;
        jobSumary.push({
          label: getStatusList().find((status) => status.value === k)?.label + `( ${count} )`,
          value: k,
        });
      });
      jobSumary[0].label = jobSumary[0].label + `（${total}）`;
      setJobSumary(jobSumary);
    }
  }

  const pageParamsChange = (page: number, size: number) => {
    setPageParams({ pageNum: page, pageSize: size });
  };

  const handleChangeCurrentSearchVC = (value: string | null) => {
    setCurrentSearchVC(value);
  }

  const [jobSumary, setJobSumary] = useState<{ label: string, value: string }[]>([]);
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
              placeholder={formatMessage({ id: 'modelList.placeholder.search' })}
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