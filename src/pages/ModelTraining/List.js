import React, { useState, useEffect } from 'react';
import { Button, Table, Input } from 'antd';
import { Link } from 'umi';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import moment from 'moment';

import { fetchTrainingList } from '@/services/modelTraning';

const { Search } = Input;



const List = () => {
  const [trainingWorkList, setTrainingWorkList] = useState([]);
  const [tableLoading, setTableLoading] = useState(true);
  const getTrainingList = async () => {
    const res = await fetchTrainingList();
    if (res.code === 0) {
      const trainings = (res.data && res.data.Trainings) || [];
      console.log('trainings', trainings)
      setTrainingWorkList(trainings);
      setTableLoading(false)
    }
  }
  useEffect(() => {
    getTrainingList()
  }, [])
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
      title: '状态'
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
          <div>{moment(item.createTime - 0).format('MMMM Do YYYY, h:mm:ss')}</div>
        )
      }
    },
    {
      dataIndex: 'runningTime',
      title: '运行时长'
    },
    {
      dataIndex: 'desc',
      title: '描述'
    },
    {
      title: '操作',
      render() {
        return (
          <>
            <a style={{marginLeft: '-20px'}}>停止</a>
            <a style={{marginLeft: '20px'}}>删除</a>
          </>
        )
      }
    }
  ]

  return (
    <PageHeaderWrapper>
      <Link to="/model-training/submit">
        <Button href="">创建训练作业</Button>
      </Link>
      <Search style={{width: '200px', float: 'right'}} placeholder="输入作业名称查询" />
      <Table loading={tableLoading} style={{marginTop: '30px'}} columns={columns} dataSource={trainingWorkList} />
    </PageHeaderWrapper>
  )
}







export default List;