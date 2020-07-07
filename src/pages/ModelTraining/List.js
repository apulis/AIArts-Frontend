import React, { useState } from 'react';
import { Button, Table, Input } from 'antd';
import { Link } from 'umi';
import { PageHeaderWrapper } from '@ant-design/pro-layout';

import moment from 'moment';

const { Search } = Input;

const trainingWork = [{
  id: 10000,
  workName: '作业名称',
  status: '已完成',
  engineType: 'mxnet, mx-1.5.9',
  createTime: '1594122050517',
  runningTime: '1000000',
  desc: '训练作业',
}]

for (let i = 0; i < 30; i ++) {
  trainingWork.push({
    ...trainingWork[i],
    id: i + trainingWork[i].id,
    createTime: trainingWork[i].createTime - 0 + 10000000,
  })
}


const List = () => {
  const [trainingWorkList, setTrainingWorkList] = useState(trainingWork);
  const columns = [
    {
      dataIndex: 'workName',
      title: '作业名称',
      render(_text, item) {
        return (
          <Link to={`/model-training/${item.id}/detail`}>{item.workName}</Link>
        )
      }
    },
    {
      dataIndex: 'status',
      title: '状态'
    },
    {
      dataIndex: 'engineType',
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
      <Table style={{marginTop: '30px'}} columns={columns} dataSource={trainingWorkList} />
    </PageHeaderWrapper>
  )
}







export default List;