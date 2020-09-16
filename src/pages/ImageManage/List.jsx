import React, { useEffect, useState } from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { Table } from 'antd';




const List = () => {

  const columns = [
    {
      title: 'ID',
      dataIndex: 'imageId',
    },
    {
      title: '名称',
      dataIndex: 'name',
    },
    {
      title: '创建时间',
      render(_text, item) {
        return <div>{moment(item.createdAt).format('YYYY-MM-DD HH:mm')}</div>
      }
    },
  ]
  
  return (
    <PageHeaderWrapper>
      <Table
        columns={columns}
      />
    </PageHeaderWrapper>
  )
}



export default List;