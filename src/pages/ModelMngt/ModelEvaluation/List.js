import React, { useState, useEffect, useRef } from 'react';
import { Button, Table, Input, message, Card, Select, Popover, Modal } from 'antd';
import { Link } from 'umi';
import moment from 'moment';
import { getJobStatus } from '@/utils/utils';
import { PAGEPARAMS, sortText } from '@/utils/const';
import { getEvaluations, stopEvaluation, fetchJobStatusSumary,deleteEvaluation } from './services';
import { SyncOutlined } from '@ant-design/icons';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { getNameFromDockerImage } from '@/utils/reg.js';

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
  const searchEl = useRef(null);
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
    setPageParams({...pageParams, ...{pageNum: 1}});
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
    if (sorter.order !== false) {
      setSortedInfo(sorter);
    }
  };

  const stopEvaluationJob = async (id) => {
    const res = await stopEvaluation(id);
    if (res.code === 0) {
      message.success('已成功停止');
      handleSearch();
    }
  }
  const deleteEvaluationJob = async (item) => {

    if (canStop(item)) {
      Modal.warning({
        title: '当前任务尚未停止',
        content: '请先停止该任务',
        okText: '确定'
      });
      return;
    }

    // const res = await deleteEvaluation(item.id);
    // if (res.code === 0) {
    //   message.success('已成功删除');
    //   handleSearch();
    //   getJobStatusSumary();
    // }

    const {code, msg} = await deleteEvaluation(item.id);

    if(code === 0){
      // 若删除的是当前页最后一项，且页数不是第一页，则将页数减一
      if (trainingWorkList.length === 1 && pageParams.pageNum > 1) {
        setPageParams({ ...pageParams, pageNum: pageParams.pageNum - 1 });
      } else {
        handleSearch();
      }
      getJobStatusSumary();
      message.success(`删除成功！`);
    }else{
      message.error(`删除错误：${msg}。`);
    }
  }
  const onSearchName = (name) => {
    setPageParams({...pageParams, ...{pageNum: 1}});
    setFormValues({...formValues, ...{name}});
  };

  const onRefresh = () => {
    setPageParams({...pageParams, ...{pageNum: 1}});
    const name = searchEl.current.value;
    setFormValues({...formValues, ...{name}});
  };

  const canStop = (item) => {
    return ['unapproved', 'queued', 'scheduling', 'running',].includes(item.status);
  };

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
      render(value) {
        return <div>{getNameFromDockerImage(value)}</div>
      }
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
            <Button type="link" onClick={() => stopEvaluationJob(item.id)} disabled={!canStop(item)}>停止</Button>
            <Button type="link" danger onClick={() => deleteEvaluationJob(item)} >删除</Button>          
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
              <Option key={status.value} value={status.value}>{status.label}</Option>
            ))
          }
        </Select>
        <Search ref={searchEl} style={{ width: '200px' }} placeholder="输入作业名称查询" onSearch={onSearchName} enterButton />
        <Button style={{ left: '20px' }} icon={<SyncOutlined />} onClick={handleSearch}></Button>
      </div>
      <Table
        loading={tableLoading}
        style={{ marginTop: '30px' }}
        columns={columns}
        dataSource={trainingWorkList}
        rowKey={record => record.id}
        onChange={onSortChange}
        pagination={{
          total: total,
          showQuickJumper: true,
          showTotal: (total) => `总共 ${total} 条`,
          showSizeChanger: true,
          onChange: pageParamsChange,
          onShowSizeChange: pageParamsChange,
          current: pageParams.pageNum,
          pageSize: pageParams.pageSize,          
        }}
      />
      </Card>
    </PageHeaderWrapper >
  )
}

export default List;