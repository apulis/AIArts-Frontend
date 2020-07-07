import React, { useState,useEffect } from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import {Table,Space} from 'antd';
import { formatDate } from '@/utils/time';
import { PAGEPARAMS } from '../../../const';
import { getCodes } from './service.js'
const CodeList = (props)=>{
      const [codes, setCodes] = useState({ data: [], total: 0 });
      const [loading,setLoading] = useState(false);
      const [pageParams, setPageParams] = useState(PAGEPARAMS);// 页长
      useEffect(()=>{// componentDidMount()
        getData();
      },[pageParams])// pageParams改变触发的componentwillUpdate()
      const getData = async () => {
        setLoading(true);
        const { page, count } = pageParams;
        const { code, data, msg, total } = await getCodes(page, count);
        setLoading(false);
        if (code === 0) {
          setCodes({
            data: data,
            total: total,
          });
        } else {
          message.error(msg);
        }
      };
      console.log(codes)
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
          dataIndex: 'engineType',
          key: 'engineType',
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
          <PageHeaderWrapper>
            <Table dataSource={codes.data.list} columns={columns} loading={loading}/>
            {/* <h2>s</h2> */}
          </PageHeaderWrapper>
      )
      
}

export default CodeList;