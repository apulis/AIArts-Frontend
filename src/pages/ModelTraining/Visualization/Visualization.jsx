import React, { useState, useEffect } from 'react';
import { Button, Table, Input, message, Card, Select, Modal } from 'antd';
import { Link, history } from 'umi';
import moment from 'moment';
import { connect } from 'dva';
import { getJobStatus } from '@/utils/utils';
import { sortText, PAGEPARAMS } from '@/utils/const';
import {
  fetchVisualizations,
  deleteVisualization,
  switchVisualizationJobStatus,
  getTensorboardUrl,
} from '@/services/modelTraning';
import { SyncOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { useIntl, formatMessage } from 'umi';

const { confirm } = Modal;

const statusList = [
  { value: 'all', label: formatMessage({ id: 'service.status.all' }) },
  { value: 'unapproved', label: formatMessage({ id: 'service.status.unapproved' }) },
  { value: 'queued', label: formatMessage({ id: 'service.status.queued' }) },
  { value: 'scheduling', label: formatMessage({ id: 'service.status.scheduling' }) },
  { value: 'running', label: formatMessage({ id: 'service.status.running' }) },
  { value: 'finished', label: formatMessage({ id: 'service.status.finished' }) },
  { value: 'failed', label: formatMessage({ id: 'service.status.failed' }) },
  { value: 'pausing', label: formatMessage({ id: 'service.status.pausing' }) },
  { value: 'paused', label: formatMessage({ id: 'service.status.paused' }) },
  { value: 'killing', label: formatMessage({ id: 'service.status.killing' }) },
  { value: 'killed', label: formatMessage({ id: 'service.status.killed' }) },
  { value: 'error', label: formatMessage({ id: 'service.status.error' }) },
];

const { Search } = Input;
const { Option } = Select;

const Visualization = (props) => {
  const intl = useIntl();
  const [tableLoading, setTableLoading] = useState(true);
  const [formValues, setFormValues] = useState({ status: 'all', jobName: '' });
  const [pageParams, setPageParams] = useState(PAGEPARAMS);
  const [visualizations, setVisualizations] = useState([]);
  const [total, setTotal] = useState(0);
  const [sortedInfo, setSortedInfo] = useState({
    orderBy: '',
    order: '',
  });

  const { currentSelectedVC } = props.vc;

  const getVisualizations = async () => {
    setTableLoading(true);
    const params = {
      ...pageParams,
      ...formValues,
      orderBy: sortedInfo.columnKey,
      order: sortText[sortedInfo.order],
    };
    const res = await fetchVisualizations({ ...params, vcName: currentSelectedVC });
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
        message.info(intl.formatMessage({ id: 'visualzation.server.ready' }));
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
        title: intl.formatMessage({ id: 'visualzation.notStop' }),
        content: intl.formatMessage({ id: 'visualzation.needStop' }),
        okText: intl.formatMessage({ id: 'visualzation.ok' }),
      });
      return;
    }
    confirm({
      title: intl.formatMessage({ id: 'visualzation.delete.job' }),
      content: intl.formatMessage({ id: 'visualzation.delete.isContinue' }),
      icon: <ExclamationCircleOutlined />,
      okText: intl.formatMessage({ id: 'visualzation.ok' }),
      okType: 'danger',
      cancelText: intl.formatMessage({ id: 'visualzation.cancel' }),
      onOk: async () => {
        const res = await deleteVisualization(item.id);
        if (res.code === 0) {
          // 若删除的是当前页最后一项，且页数不是第一页，则将页数减一
          if (visualizations.length == 1 && pageParams.pageNum > 1) {
            setPageParams({ ...pageParams, pageNum: pageParams.pageNum - 1 });
          } else {
            getVisualizations();
          }
          message.success(intl.formatMessage({ id: 'visualzation.delete.success' }));
        } else {
          message.error(
            `${intl.formatMessage({ id: 'visualzation.delete.error' })}${error.msg}` ||
              `${intl.formatMessage({ id: 'visualzation.delete.error' })}`,
          );
        }
      },
      onCancel() {},
    });
  };

  const columns = [
    {
      dataIndex: 'jobName',
      title: formatMessage({ id: 'visualizationList.table.column.name' }),
      key: 'name',
      sorter: true,
      sortOrder: sortedInfo.columnKey === 'name' && sortedInfo.order,
    },
    {
      dataIndex: 'status',
      title: formatMessage({ id: 'visualizationList.table.column.status' }),
      render: (text, item) => getJobStatus(item.status),
    },
    {
      dataIndex: 'TensorboardLogDir',
      title: formatMessage({ id: 'visualizationList.table.column.logPath' }),
    },
    {
      dataIndex: 'createTime',
      title: formatMessage({ id: 'visualizationList.table.column.createTime' }),
      key: 'createTime',
      render(_text, item) {
        return <div>{moment(item.createTime).format('YYYY-MM-DD HH:mm:ss')}</div>;
      },
      sorter: true,
      sortOrder: sortedInfo.columnKey === 'createTime' && sortedInfo.order,
    },
    {
      dataIndex: 'description',
      title: formatMessage({ id: 'visualizationList.table.column.description' }),
    },
    {
      title: formatMessage({ id: 'visualizationList.table.column.action' }),
      render(_text, item) {
        return (
          <>
            <Button
              type="link"
              onClick={() => {
                openTensorboard(item.id);
              }}
              disabled={!['running'].includes(item.status)}
            >
              {formatMessage({ id: 'visualizationList.table.column.action.open' })}
            </Button>
            {['unapproved', 'queued', 'scheduling', 'running'].includes(item.status) ? (
              <Button
                type="link"
                onClick={() => changeJobStatus(item.id, 'pause')}
                disabled={!['unapproved', 'queued', 'scheduling', 'running'].includes(item.status)}
              >
                {formatMessage({ id: 'visualizationList.table.column.action.stop' })}
              </Button>
            ) : (
              <Button
                type="link"
                onClick={() => changeJobStatus(item.id, 'running')}
                disabled={!['paused', 'killed'].includes(item.status)}
              >
                {formatMessage({ id: 'visualizationList.table.column.action.run' })}
              </Button>
            )}
            <Button type="link" onClick={() => handleDelete(item)} style={{ color: 'red' }}>
              {formatMessage({ id: 'visualizationList.table.column.action.delete' })}
            </Button>
          </>
        );
      },
    },
  ];

  return (
    <PageHeaderWrapper>
      <Card
        bordered={false}
        bodyStyle={{
          padding: '8',
        }}
      >
        <Link to="/model-training/createVisualization">
          <Button type="primary" href="">
            {formatMessage({ id: 'visualizationList.add.createVisaulJob' })}
          </Button>
        </Link>
        <div style={{ float: 'right', paddingRight: '20px' }}>
          <Select
            style={{ width: 120, marginRight: '20px' }}
            defaultValue={formValues.status}
            onChange={handleChangeStatus}
          >
            {statusList.map((status) => (
              <Option key={status.value} value={status.value}>
                {status.label}
              </Option>
            ))}
          </Select>
          <Search
            style={{ width: '200px' }}
            placeholder={formatMessage({ id: 'visualizationList.placeholder.search' })}
            onSearch={() => {
              setPageParams({ ...pageParams, ...{ pageNum: 1 } });
              getVisualizations();
            }}
            onChange={(e) => onJobNameChange(e.target.value)}
          />
          <Button
            style={{ left: '20px' }}
            icon={<SyncOutlined />}
            onClick={() => getVisualizations()}
          ></Button>
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
            showTotal: (total) =>
              `${formatMessage({
                id: 'visualizationList.table.pagination.showTotal.prefix',
              })} ${total} ${formatMessage({
                id: 'visualizationList.table.pagination.showTotal.suffix',
              })}`,
            showSizeChanger: true,
            onChange: pageParamsChange,
            onShowSizeChange: pageParamsChange,
            current: pageParams.pageNum,
            pageSize: pageParams.pageSize,
          }}
        />
      </Card>
    </PageHeaderWrapper>
  );
};

export default connect(({ vc }) => ({ vc }))(Visualization);
