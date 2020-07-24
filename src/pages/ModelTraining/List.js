import React, { useState, useEffect } from 'react';
import { Button, Table, Input, message, Card } from 'antd';
import { Link } from 'umi';
import moment from 'moment';
import { getJobStatus } from '@/utils/utils';
import { fetchTrainingList, removeTrainings } from '@/services/modelTraning';
import { SyncOutlined } from '@ant-design/icons';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { set } from 'numeral';
import { fetch } from 'umi-request';

const { Search } = Input;

const List = () => {
  const [trainingWorkList, setTrainingWorkList] = useState([]);
  const [totalTrainingWorkList, setTotalTrainingWorkList] = useState([]);
  const [tableLoading, setTableLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [pageNum, setPageNum] = useState(1)
  const getTrainingList = async () => {
    const res = await fetchTrainingList({pageNum, pageSize, search});
    if (res.code === 0) {
      const trainings = (res.data && res.data.Trainings) || [];
      const total = res.data?.total;
      setTotal(total);
      setTotalTrainingWorkList(trainings);
      setTrainingWorkList(trainings)
      setTableLoading(false)
    }
  }
  useEffect(() => {
    getTrainingList();
    // let timer = setInterval(() => {
    //   getTrainingList();
    // }, 3000);
    // return () => {
    //   clearInterval(timer)
    // }
  }, [])
  const onTableChange = (pagination) => {
    console.log('pagination', pagination)
    const { current } = pagination;
    fetchTrainingList({
      pageNum: current,
      pageSize,
      search,
    })
    setPageNum(current);
  }
  const removeTraining = async (id) => {
    const res = await removeTrainings(id);
    if (res.code === 0) {
      message.success('已成功操作');
      getTrainingList({ pageNum, pageSize, search });
    }
  }
  const searchList = async (s) => {
    setSearch(s);
    const res = await fetchTrainingList({ pageNum: 1, pageSize, search: s });
    if (res.code === 0) {
      setTrainingWorkList(res.data.Trainings);
    }
  }
  const columns = [
    {
      dataIndex: 'name',
      title: '作业名称',
      render(_text, item) {
        return (
          <Link to={`/model-training/${item.id}/detail`}>{item.name}</Link>
        )
      }
    },
    {
      dataIndex: 'status',
      title: '状态',
      render: (text, item) => getJobStatus(item.status)
    },
    {
      dataIndex: 'engine',
      title: '引擎类型',
    },
    {
      dataIndex: 'createTime',
      title: '创建时间',
      render(_text, item) {
        return (
          <div>{moment(item.createTime).format('YYYY-MM-DD HH:mm:ss')}</div>
        )
      }
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