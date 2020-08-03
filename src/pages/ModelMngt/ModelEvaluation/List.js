import React, { useState, useEffect } from 'react';
import { Button, Table, Input, message, Card, Select, Popover } from 'antd';
import { Link } from 'umi';
import moment from 'moment';
import { getJobStatus } from '@/utils/utils';
import { PAGEPARAMS, sortText } from '@/utils/const';
import { getEvaluations, stopEvaluation, fetchJobStatusSumary } from './services';
import { SyncOutlined } from '@ant-design/icons';
import { PageHeaderWrapper } from '@ant-design/pro-layout';

export const statusList = [
  { value: 'all', label: '全部' },
  { value: 'unapproved', label: '未批准'},
  { value: 'queued', label: '队列中'},
  { value: 'scheduling', label: '调度中'},
  { value: 'running', label: '运行中'},
  { value: 'finished', label: '已完成'},
  { value: 'failed', label: '已失败'},
  { value: 'pausing', label: '暂停中'},
  { value: 'paused', label: '已暂停'},
  { value: 'killing', label: '关闭中'},
  { value: 'killed', label: '已关闭'},
  { value: 'error', label: '错误'},
]

const { Search } = Input;
const { Option } = Select;

const List = () => {
  const [trainingWorkList, setTrainingWorkList] = useState([]);
  const [tableLoading, setTableLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [pageParams, setPageParams] = useState(PAGEPARAMS);
  const [formValues, setFormValues] = useState({name: '', status: 'all'});
  const [currentStatus, setCurrentStatus] = useState('all');
  const [jobSumary, setJobSumary] = useState([]);
  const [sortedInfo, setSortedInfo] = useState({
    orderBy: '',
    order: '',
  });
  const handleSearch = async () => {
    const params = {
      ...pageParams,
      orderBy: sortedInfo.columnKey,
      order: sortText[sortedInfo.order]
    };

    if (formValues.status) {
      params.status = formValues.status;
    }

    if (formValues.name) {
      params.search = formValues.name;
    }

    setTableLoading(true);
    const res = await getEvaluations(params);
    if (res.code === 0) {
      const trainings = (res.data && res.data.evaluations) || [];
      const total = res.data?.total;
      setTotal(total);
      setTrainingWorkList(trainings);
    }
    setTableLoading(false);
  };

  const handleStatusChange = async (status) => {
    setFormValues({...formValues, ...{status}});
  };

  const getJobStatusSumary = async () => {
    const res = await fetchJobStatusSumary();
    if (res.code === 0) {
      const jobSumary = [{ value: 'all', label: '全部' }];
      let total = 0;
      Object.keys(res.data).forEach(k => {
        let count = res.data[k]
        total += count;
        jobSumary.push({
          label: statusList.find(status => status.value === k)?.label + `（${count}）`,
          value: k
        })
      })
      jobSumary[0].label = jobSumary[0].label  + `（${total}）`
      setJobSumary(jobSumary)
    }
  }

  useEffect(() => {
    getJobStatusSumary();
  }, []);

  useEffect(() => {
    handleSearch();
  }, [pageParams, formValues, sortedInfo]);

  const pageParamsChange = (page, size) => {
    setPageParams({ pageNum: page, pageSize: size });
  };

  const onSortChange = (pagination, filters, sorter) => {
    setSortedInfo(sorter);
  };

  const stopEvaluationJob = async (id) => {
    const res = await stopEvaluation(id);
    if (res.code === 0) {
      message.success('已成功操作');
      handleSearch();
    }
  }
  const onSearchName = (name) => {
    setFormValues({...formValues, ...{name}});
  }
  const columns = [
    {
      dataIndex: 'name',
      title: '作业名称',
      key: 'jobName',
      render(_text, item) {
        return (
          <Popover content='查看评估详情'>
            <Link to={`/ModelManagement/ModelEvaluation/${item.id}/detail`}>{item.name}</Link>
          </Popover>
        )
      },
      sorter: true,
      sortOrder: sortedInfo.columnKey === 'jobName' && sortedInfo.order
    },
    {
      dataIndex: 'status',
      title: '状态',
      render: (text, item) => getJobStatus(item.status),
    },
    {
      dataIndex: 'engine',
      title: '引擎类型',
    },
    {
      dataIndex: 'createTime',
      title: '创建时间',
      key: 'jobTime',
      render(_text, item) {
        return (
          <div>{moment(item.createTime).format('YYYY-MM-DD HH:mm:ss')}</div>
        )
      },
      sorter: true,
      sortOrder: sortedInfo.columnKey === 'jobTime' && sortedInfo.order
    },
    // {
    //   dataIndex: 'desc',
    //   title: '描述'
    // },
    {
      title: '操作',
      render(_text, item) {
        return (
          <>
            {
              ['unapproved', 'queued', 'scheduling', 'running',].includes(item.status)
                ? <a onClick={() => stopEvaluationJob(item.id)}>停止</a>
                : <span>已停止</span>
            }

          </>
        )
      }
    }
  ]

  return (
    <PageHeaderWrapper>
      <Card bordered={false}
        bodyStyle={{
          padding: '8'
        }}
      >
      <div style={{ float: 'right', paddingRight: '20px' }}>
        <Select style={{width: 120, marginRight: '20px'}} defaultValue={currentStatus} onChange={handleStatusChange}>
          {
            jobSumary.map(status => (
              <Option value={status.value}>{status.label}</Option>
            ))
          }
        </Select>
        <Search style={{ width: '200px' }} placeholder="输入作业名称查询" onSearch={onSearchName} enterButton />
        <Button style={{ left: '20px' }} icon={<SyncOutlined />} onClick={() => handleSearch()}></Button>
      </div>
      <Table
        loading={tableLoading}
        style={{ marginTop: '30px' }}
        columns={columns}
        dataSource={trainingWorkList}
        onChange={onSortChange}
        pagination={{
          total: total,
          showQuickJumper: true,
          showTotal: (total) => `总共 ${total} 条`,
          showSizeChanger: true,
          onChange: pageParamsChange,
          onShowSizeChange: pageParamsChange,
        }}
      />
      </Card>
    </PageHeaderWrapper >
  )
}

export default List;