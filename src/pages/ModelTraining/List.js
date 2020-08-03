import React, { useState, useEffect } from 'react';
import { Button, Table, Input, message, Card, Select } from 'antd';
import { Link } from 'umi';
import moment from 'moment';
import { getJobStatus } from '@/utils/utils';
import { sortText } from '@/utils/const';
import { fetchTrainingList, removeTrainings, fetchJobStatusSumary } from '@/services/modelTraning';
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
  const getTrainingList = async () => {
    const res = await fetchTrainingList({pageNum, pageSize, search, sortedInfo, status: currentStatus});
    if (res.code === 0) {
      const trainings = (res.data && res.data.Trainings) || [];
      const total = res.data?.total;
      setTotal(total);
      setTrainingWorkList(trainings)
      setTableLoading(false)
    }
  }
  const handleChangeStatus = async (status) => {
    setCurrentStatus(status);
  }

  useEffect(() => {
    getTrainingList();
  }, [currentStatus])

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
    getTrainingList();
    getJobStatusSumary()
  }, [])
  const onTableChange = async (pagination, filters, sorter) => {
    console.log('setSortedInfo', sorter)
    setSortedInfo(sorter);
    console.log('sorter', sortText[sorter.order])
    const { current } = pagination;
    setPageNum(current);
    const searchSorterInfo = {
      ...sorter,
      // 正序，倒序，取消排序
      orderBy: sortText[sorter.order] && sorter.columnKey,
      order: sortText[sorter.order],
    }
    setTableLoading(true);
    const res = await fetchTrainingList({
      pageNum: current,
      pageSize,
      search,
      status: currentStatus,
      sortedInfo: searchSorterInfo,
    })
    if (res.code === 0) {
      setTableLoading(false);
      setTrainingWorkList(res.data.Trainings);
    }
  }
  const removeTraining = async (id) => {
    const res = await removeTrainings(id);
    if (res.code === 0) {
      message.success('已成功操作');
      getTrainingList();
    }
  }
  const searchList = async (s) => {
    setSearch(s);
    setTableLoading(true);
    const res = await fetchTrainingList({ pageNum: 1, pageSize, search: s });
    if (res.code === 0) {
      setTrainingWorkList(res.data.Trainings);
      setTableLoading(false);
      setTotal(res.data.total);
    }
  }
  const columns = [
    {
      dataIndex: 'name',
      title: '作业名称',
      key: 'jobName',
      render(_text, item) {
        return (
          <Link to={`/model-training/${item.id}/detail`}>{item.name}</Link>
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
    {
      dataIndex: 'desc',
      title: '描述'
    },
    {
      title: '操作',
      render(_text, item) {
        return (
          <>
            {
              ['unapproved', 'queued', 'scheduling', 'running',].includes(item.status)
                ? <a onClick={() => removeTraining(item.id)}>停止</a>
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
      <Link to="/model-training/submit">
        <Button href="">创建训练作业</Button>
      </Link>
      <div style={{ float: 'right', paddingRight: '20px' }}>
        <Select style={{width: 120, marginRight: '20px'}} defaultValue={currentStatus} onChange={handleChangeStatus}>
          {
            jobSumary.map(status => (
              <Option value={status.value}>{status.label}</Option>
            ))
          }
        </Select>
        <Search style={{ width: '200px' }} placeholder="输入作业名称查询" onSearch={searchList} />
        <Button style={{ left: '20px' }} icon={<SyncOutlined />} onClick={() => getTrainingList()}></Button>
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
          total: total,
          current: pageNum,
          pageSize: pageSize,
        }}
      />
      </Card>
    </PageHeaderWrapper >
  )
}

export default List;