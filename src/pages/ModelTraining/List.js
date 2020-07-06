import React, { useState } from 'react';
import { Button, Table, Input } from 'antd';
import { Link } from 'umi';
import { PageHeaderWrapper } from '@ant-design/pro-layout';


const { Search } = Input;


const List = () => {
  const [trainingWorkList, setTrainingWorkList] = useState([]);
  const columns = [
    {
      dataIndex: 'workName',
      title: '作业名称'
    },
    {
      dataIndex: 'status',
      title: '状态'
    },
    {
      dataIndex: 'engineType',
      title: '引擎名称',
    },
    {
      dataIndex: 'createTime',
      title: '创建时间'
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
            <a>停止</a>
            <a>删除</a>
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
      <Search style={{width: '200px', float: 'right'}} />
      <Table style={{marginTop: '30px'}} columns={columns} dataSource={trainingWorkList} />
    </PageHeaderWrapper>
  )
}







export default List;