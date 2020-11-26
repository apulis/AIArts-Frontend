import React, { useEffect, useState } from 'react';
import { Table, Select, Input, Card } from 'antd';
import { SortOrder } from 'antd/lib/table/interface';
import { useIntl } from 'umi';
import moment from 'moment';
import { checkIfCanStop, getJobStatus } from '@/utils/utils';
import { getNameFromDockerImage } from '@/utils/reg';
import { PageHeaderWrapper } from '@ant-design/pro-layout';

const { Search } = Input;

export enum EnumJobTrainingType {
  visualization = 'visualization',
  ModelConversionJob = 'ModelConversionJob',
  InferenceJob = 'InferenceJob',
  training = 'training'
}

const ManageJobs: React.FC = () => {
  const { formatMessage } = useIntl();
  const [sortedInfo, setSortedInfo] = useState<{ orderBy: string; order: SortOrder; columnKey: string}>({
    orderBy: '',
    order: null,
    columnKey: '',
  });
  const [currentStatus, setCurrentStatus] = useState('all');
  const columns = [
    {
      dataIndex: 'name',
      title: formatMessage({ id: 'jobManagement.table.column.name' }),
      key: 'name',
      sorter: true,
      sortOrder: sortedInfo.columnKey === 'jobName' && sortedInfo.order,
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
      key: 'jobTime',
      render(_text, item) {
        return <div>{moment(item.createTime).format('YYYY-MM-DD HH:mm:ss')}</div>;
      },
      sorter: true,
      sortOrder: sortedInfo.columnKey === 'jobTime' && sortedInfo.order,
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
  const [jobSumary, setJobSumary] = useState([]);

  const handleChangeStatus = () => {

  }

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
            onChange={handleChangeStatus}
          >
            {jobSumary.map((status) => (
              <Option value={status.value}>{status.label}</Option>
            ))}
          </Select>
          <Search
            style={{ width: '200px' }}
            placeholder={formatMessage({ id: 'modelList.placeholder.search' })}
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
          dataSource={[]}
          columns={columns}
        />
      </Card>
    </PageHeaderWrapper>
    
  );
}


export default ManageJobs;