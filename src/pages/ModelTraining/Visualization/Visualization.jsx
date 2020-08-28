import React, { useState, useEffect } from 'react';
import { Button, Table, Input, message, Card, Select, Modal } from 'antd';
import { Link, history } from 'umi';
import moment from 'moment';
import { getJobStatus } from '@/utils/utils';
import { sortText, PAGEPARAMS } from '@/utils/const';
import { fetchVisualizations, deleteVisualization, switchVisualizationJobStatus, getTensorboardUrl } from '@/services/modelTraning';
import { SyncOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { PageHeaderWrapper } from '@ant-design/pro-layout';

const { confirm } = Modal;

const statusList = [
  { value: 'all', label: '全部' },
  { value: 'unapproved', label: '未批准' },
  { value: 'queued', label: '队列中' },
  { value: 'scheduling', label: '调度中' },
  { value: 'running', label: '运行中' },
  { value: 'finished', label: '已完成' },
  { value: 'failed', label: '已失败' },
  { value: 'pausing', label: '暂停中' },
  { value: 'paused', label: '已暂停' },
  { value: 'killing', label: '关闭中' },
  { value: 'killed', label: '已关闭' },
  { value: 'error', label: '错误' },
];

const { Search } = Input;
const { Option } = Select;

const Visualization = () => {
  const [tableLoading, setTableLoading] = useState(true);
  const [formValues, setFormValues] = useState({ status: 'all', jobName: '' });
  const [pageParams, setPageParams] = useState(PAGEPARAMS);
  const [visualizations, setVisualizations] = useState([]);
  const [total, setTotal] = useState(0);
  const [sortedInfo, setSortedInfo] = useState({
    orderBy: '',
    order: ''
  });

  const getVisualizations = async () => {
    setTableLoading(true);
    const params = {
      ...pageParams,
      ...formValues,
      orderBy: sortedInfo.columnKey,
      order: sortText[sortedInfo.order],
    };
    const res = await fetchVisualizations(params);
    if (res.code === 0) {
      const visualizations = (res.data && res.data.Templates) || [];
      const total = res.data.total;
      setTotal(total);
      setVisualizations(visualizations);
    }
    setTableLoading(false);
  };

  const handleChangeStatus = (status) => {
    setFormValues({ ...formValues, status: status });
  };
  const onJobNameChange = (jobName) => {
    setFormValues({ ...formValues, jobName: jobName });
  };
  const onSortChange = (pagination, filters, sorter) => {
    if (sorter.order !== false) {
      setSortedInfo(sorter);
    }
  };
  const pageParamsChange = (page, size) => {
    setPageParams({ pageNum: page, pageSize: size });
  };

  const changeJobStatus = async (id, action) => {
    const res = await switchVisualizationJobStatus(id, action);
    if (res.code === 0) {
      getVisualizations();
    }
  };

  const openTensorboard = async (id) => {
    const res = await getTensorboardUrl(id);
    if (res.code === 0) {
      const { path } = res.data;
      if (!path) {
        message.info('服务正在准备中，请稍候再试');
        return;
      }
      window.open(path, '_blank');
    }
  };
  useEffect(() => {
    getVisualizations();
  }, [sortedInfo, pageParams, formValues.status]);

  const handleDelete = (item) => {
    if (['unapproved', 'queued', 'scheduling', 'running'].includes(item.status)) {
      Modal.warning({
        title: '删除提示',
        content: '请先停止该任务',
        okText: '确定'
      });
      return;
    }
    confirm({
      title: '删除可视化作业',
      content: '删除操作无法恢复，是否继续？',
      icon: <ExclamationCircleOutlined />,
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        const res = await deleteVisualization(item.id);
        if (res.code === 0) {
          // 若删除的是当前页最后一项，且页数不是第一页，则将页数减一
          if (visualizations.length == 1 && pageParams.pageNum > 1) {
            setPageParams({ ...pageParams, pageNum: pageParams.pageNum - 1 });
          } else {
            getVisualizations();
          }
          message.success('删除成功');
        } else {
          message.error(`删除失败${error.msg}` || `删除失败`);
        }
      },
      onCancel() {
      },
    });
  };

  const columns = [
    {
      dataIndex: 'jobName',
      title: '作业名称',
      key: 'name',
      sorter: true,
      sortOrder: sortedInfo.columnKey === 'name' && sortedInfo.order
    },
    {
      dataIndex: 'status',
      title: '状态',
      render: (text, item) => getJobStatus(item.status),
    },
    {
      dataIndex: 'TensorboardLogDir',
      title: '可视化日志路径',
    },
    {
      dataIndex: 'createTime',
      title: '创建时间',
      key: 'createTime',
      render(_text, item) {
        return (
          <div>{moment(item.createTime).format('YYYY-MM-DD HH:mm:ss')}</div>
        );
      },
      sorter: true,
      sortOrder: sortedInfo.columnKey === 'createTime' && sortedInfo.order
    },
    {
      dataIndex: 'description',
      title: '描述'
    },
    {
      title: '操作',
      render(_text, item) {
        return (
          <>
            <Button type='link' onClick={() => { openTensorboard(item.id); }} disabled={!['running'].includes(item.status)}>打开</Button>
            {
              ['unapproved', 'queued', 'scheduling', 'running'].includes(item.status)
                ? <Button type="link" onClick={() => changeJobStatus(item.id, 'pause')} disabled={!['unapproved', 'queued', 'scheduling', 'running'].includes(item.status)}>停止</Button>
                : <Button type="link" onClick={() => changeJobStatus(item.id, 'running')} disabled={!['paused', 'killed'].includes(item.status)} >运行</Button>
            }
            <Button
              type="link"
              onClick={() => handleDelete(item)}
              style={{ color: 'red' }}
            >
              删除
            </Button>
          </>
        );
      }
    }
  ];

  return (
    <PageHeaderWrapper>
      <Card bordered={false}
        bodyStyle={{
          padding: '8'
        }}
      >
        <Link to="/model-training/createVisualization">
          <Button type="primary" href="">创建可视化作业</Button>
        </Link>
        <div style={{ float: 'right', paddingRight: '20px' }}>
          <Select style={{ width: 120, marginRight: '20px' }} defaultValue={formValues.status} onChange={handleChangeStatus}>
            {
              statusList.map(status => (
                <Option key={status.value} value={status.value}>{status.label}</Option>
              ))
            }
          </Select>
          <Search style={{ width: '200px' }} placeholder="输入作业名称查询" onSearch={() => { setPageParams({ ...pageParams, ...{ pageNum: 1 } }); getVisualizations(); }} onChange={e => onJobNameChange(e.target.value)} />
          <Button style={{ left: '20px' }} icon={<SyncOutlined />} onClick={() => getVisualizations()}></Button>
        </div>
        <Table
          loading={tableLoading}
          style={{ marginTop: '30px' }}
          columns={columns}
          dataSource={visualizations}
          onChange={onSortChange}
          pagination={{
            current: pageParams.pageNum,
            pageSize: pageParams.pageSize,
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
  );
};

export default Visualization;