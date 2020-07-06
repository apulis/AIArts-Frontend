import React, { useState, useEffect, useRef } from 'react';
import {Table,Space} from 'antd';
import { formatDate } from '@/utils/time';
import { connect } from 'umi';
const CodeList = ()=>{
    const dataSource = [
      {
        devName:'debug_job_001',
        status:'创建中',
        enginType:'tensorflow,tf-1.8.0-py2.7',
        createTime:'Aug 5,2017 7:20:57 AM GMT +08:00',
        codeStorePath:'/hhftest-huanan/ckpt/',
        desc:'this is debug job this is debug job',
      },
      {
        devName:'debug_job_001',
        status:'创建中',
        enginType:'tensorflow,tf-1.8.0-py2.7',
        createTime:'Aug 5,2017 7:20:57 AM GMT +08:00',
        codeStorePath:'/hhftest-huanan/ckpt/',
        desc:'this is debug job this is debug job',
      },
      {
        devName:'debug_job_001',
        status:'创建中',
        enginType:'tensorflow,tf-1.8.0-py2.7',
        createTime:'Aug 5,2017 7:20:57 AM GMT +08:00',
        codeStorePath:'/hhftest-huanan/ckpt/',
        desc:'this is debug job this is debug job',
      },
      {
        devName:'debug_job_001',
        status:'创建中',
        enginType:'tensorflow,tf-1.8.0-py2.7',
        createTime:'Aug 5,2017 7:20:57 AM GMT +08:00',
        codeStorePath:'/hhftest-huanan/ckpt/',
        desc:'this is debug job this is debug job',
      },
      {
        devName:'debug_job_001',
        status:'创建中',
        enginType:'tensorflow,tf-1.8.0-py2.7',
        createTime:'Aug 5,2017 7:20:57 AM GMT +08:00',
        codeStorePath:'/hhftest-huanan/ckpt/',
        desc:'this is debug job this is debug job',
      },
      {
        devName:'debug_job_001',
        status:'创建中',
        enginType:'tensorflow,tf-1.8.0-py2.7',
        createTime:'Aug 5,2017 7:20:57 AM GMT +08:00',
        codeStorePath:'/hhftest-huanan/ckpt/',
        desc:'this is debug job this is debug job',
      },
      ];
      
      const columns = [
        {
          title: '开发环境名称',
          dataIndex: 'devName',
          key: 'devName',
          ellipsis: true,
        },
        {
          title: '状态',
          dataIndex: 'status',
          key: 'status',
          ellipsis: true,
        },
        {
          title: '引擎类型',
          dataIndex: 'enginType',
          key: 'enginType',
          ellipsis: true,
        },
        {
          title: '创建时间',
          dataIndex: 'createTime',
          key: 'createTime',
          render: text => formatDate(text, 'YYYY-MM-DD HH:MM:SS'),
          ellipsis: true,
        },
        {
          title: '代码存储目录',
          dataIndex: 'codeStorePath',
          key: 'codeStorePath',
          ellipsis: true,
        },
        {
          title: '描述',
          dataIndex: 'desc',
          key: 'desc',
          ellipsis: true,
        },
        {
          title: '操作',
          render: (item) => {
            return (
              <Space size="middle">
                <a onClick={()=>openTest(item)}>打开</a>
                <a onClick={()=>deleteTest(item)}>删除</a>
              </Space>
            );
          },
        },
      ];
      const openTest = (item)=>{
        alert('open')
        console.log('open',item)
      }
      const deleteTest = (item)=>{
        alert('delete')
        console.log('delete',item)
      }
      return (
          <>
            <Table dataSource={dataSource} columns={columns} />;
          </>
      )
      
}

export default CodeList;