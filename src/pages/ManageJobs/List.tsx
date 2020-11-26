import React, { useEffect, useState } from 'react';
import { Table, Select, Input, Card, Button, message } from 'antd';
import { SortOrder } from 'antd/lib/table/interface';
import { connect, useIntl } from 'umi';
import moment from 'moment';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { SyncOutlined } from '@ant-design/icons';

import { checkIfCanStop, getJobStatus, getStatusList } from '@/utils/utils';
import { getNameFromDockerImage } from '@/utils/reg';
import { fetchAllJobs, fetchAllJobsSummary } from '@/services/manageJobs';
import useInterval from '@/hooks/useInterval';
import { PAGEPARAMS, sortText } from '@/utils/const';
import { removeTrainings } from '@/services/modelTraning';

const { Search } = Input;

export enum EnumJobTrainingType {
  visualization = 'visualization',
  ModelConversionJob = 'ModelConversionJob',
  InferenceJob = 'InferenceJob',
  training = 'training'
}

const ManageJobs: React.FC = (props) => {
  const { formatMessage } = useIntl();
  const [loading, setLoading] = useState(false);
  const [jobTotal, setJobTotal] = useState(0);
  const [sortedInfo, setSortedInfo] = useState<{ orderBy: string; order: SortOrder; columnKey: string }>({
    orderBy: 'name',
    order: 'ascend',
    columnKey: '',
  });
  const [currentJobType, setCurrentJobType] = useState(EnumJobTrainingType.training)
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
      search,
      pageNum: pageParams.pageNum,
      pageSize: pageParams.pageSize,
      status: currentStatus || 'all',
      vcName: currentSearchVC,
      jobType: 'training',
      sortedInfo: {
        order: sortedInfo.order,
        orderBy: sortedInfo.orderBy,
      },
    });
    setLoading(false);
    if (res.code === 0) {
      setJobs(res.data.list);
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
  }, [pageParams, currentSearchVC, currentJobType, currentSearchVC]);

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

  const columns = [
    {
      dataIndex: 'name',
      title: formatMessage({ id: 'jobManagement.table.column.name' }),
      key: 'name',
      sorter: true,
      sortOrder: sortedInfo.columnKey === 'name' && sortedInfo.order,
    },
    {
      dataIndex: 'status',
      title: formatMessage({ id: 'jobManagement.table.column.status' }),
      render: (text, item) => getJobStatus(item.status),
    },
    {
      dataIndex: 'engine',
      title: formatMessage({ id: 'jobManagement.table.column.engine' }),
      render(value) {
        return <div>{getNameFromDockerImage(value)}</div>;
      },
    },
    {
      dataIndex: 'userName',
      title: formatMessage({ id: 'jobManagement.table.column.userName' }),
      render(value) {
        return <div>{getNameFromDockerImage(value)}</div>;
      },
    },
    {
      dataIndex: 'createTime',
      title: formatMessage({ id: 'jobManagement.table.column.createTime' }),
      key: 'createTime',
      render(_text, item) {
        return <div>{moment(item.createTime).format('YYYY-MM-DD HH:mm:ss')}</div>;
      },
      sorter: true,
      sortOrder: sortedInfo.columnKey === 'createTime' && sortedInfo.order,
    },
    {
      dataIndex: 'desc',
      title: formatMessage({ id: 'jobManagement.table.column.desc' }),
      width: '100px',
      render(_text) {
        return (
          <div title={_text}>
            {_text}
          </div>
        );
      },
    },
    {
      title: formatMessage({ id: 'modelList.table.column.action' }),
      render(_text, item) {
        return (
          <>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <a
                style={{ marginRight: '16px', display: 'block' }}
                onClick={() => stopTraining(item.id)}
              >
                {formatMessage({ id: 'modelList.table.column.action.stop' })}
              </a>
            </div>
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
    console.log('value', value)
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
                  <Option value={jobType}>{jobType}</Option>
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
              <Option value={currentSelectedVC}>{'当前虚拟集群'}</Option>
              <Option value={null}>{'所有虚拟集群'}</Option>
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