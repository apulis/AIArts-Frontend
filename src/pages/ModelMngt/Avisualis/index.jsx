import { message, Table, Modal, Input, Button, Card, Space } from 'antd';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import React, { useState, useEffect, useRef } from 'react';
import { getAvisualis, deleteAvisualis } from './service';
import { PAGEPARAMS, sortText } from '@/utils/const';
import styles from './index.less';
import { Link, history, useDispatch } from 'umi';
import { ExclamationCircleOutlined, SyncOutlined } from '@ant-design/icons';
import moment from 'moment';
import { connect } from 'dva';
import AddFormModal from './components/AddFormModal';
import { getJobStatus } from '@/utils/utils';
import { useIntl } from 'umi';

const { confirm } = Modal;
const { Search } = Input;

const Avisualis = () => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const [avisualisData, setAvisualisData] = useState({ data: [], total: 0 });
  const [modalFlag, setModalFlag] = useState(false);
  const [pageParams, setPageParams] = useState(PAGEPARAMS);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [modelTypesData, setModelTypeData] = useState('');
  const [sortedInfo, setSortedInfo] = useState({
    orderBy: '',
    order: '',
  });
  const addFormModalRef = useRef();

  useEffect(() => {
    getData();
  }, [pageParams, sortedInfo]);

  const getData = async (text) => {
    setLoading(true);
    const params = {
      ...pageParams,
      name: name,
      orderBy: sortedInfo.columnKey,
      order: sortText[sortedInfo.order],
      use: 'Avisualis',
    };
    const { code, data } = await getAvisualis(params);
    if (code === 0 && data) {
      const { total, models } = data;
      setAvisualisData({
        data: models,
        total: total,
      });
      text && message.success(text);
    }
    setLoading(false);
  };

  const pageParamsChange = (page, count) => {
    setPageParams({ pageNum: page, pageSize: count });
  };

  const onSortChange = (pagination, filters, sorter) => {
    if (sorter.order !== false) {
      setSortedInfo(sorter);
    }
  };

  const columns = [
    {
      title: intl.formatMessage({id: 'avisualis.table.column.name'}),
      key: 'name',
      sorter: true,
      sortOrder: sortedInfo.columnKey === 'name' && sortedInfo.order,
      render: (item) => (
        <Link to={{ pathname: `/ModelManagement/avisualis/detail/${item.id}` }}>{item.name}</Link>
      ),
    },
    {
      dataIndex: 'status',
      title: intl.formatMessage({id: 'avisualis.table.column.status'}),
      render: (text, item) => (
        <Link to={`/model-training/${item.jobId}/detail`}>{getJobStatus(text)}</Link>
      ),
    },
    {
      title: intl.formatMessage({id: 'avisualis.table.column.use'}),
      dataIndex: 'use',
    },
    {
      title: intl.formatMessage({id: 'avisualis.table.column.description'}),
      dataIndex: 'description',
    },
    {
      title: intl.formatMessage({id: 'avisualis.table.column.createdAt'}),
      key: 'createdAt',
      dataIndex: 'createdAt',
      sorter: true,
      sortOrder: sortedInfo.columnKey === 'createdAt' && sortedInfo.order,
      render: (text) => moment(text).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: intl.formatMessage({id: 'avisualis.table.column.action'}),
      render: (item) => {
        const { id, status } = item;
        return (
          <Space size="middle">
            <a
              onClick={() => history.push(`/ModelManagement/CreateEvaluation?modelId=${id}`)}
              disabled={status !== 'finished'}
            >
              {intl.formatMessage({id: 'avisualis.table.column.action.modelEvaluation'})}
            </a>
            <a style={{ color: 'red' }} onClick={() => onDelete(id)}>
              {intl.formatMessage({id: 'avisualis.table.column.action.delete'})}
            </a>
          </Space>
        );
      },
    },
  ];

  const onDelete = (id) => {
    confirm({
      title: intl.formatMessage({id: 'avisualis.delete.tips'}),
      icon: <ExclamationCircleOutlined />,
      okText: intl.formatMessage({id: 'avisualis.delete'}),
      okType: 'danger',
      cancelText: intl.formatMessage({id: 'avisualis.cancel'}),
      onOk: async () => {
        const { code } = await deleteAvisualis(id);
        if (code === 0) {
          // 若删除的是当前页最后一项，且页数不是第一页，则将页数减一
          if (avisualisData.data.length == 1 && pageParams.pageNum > 1) {
            setPageParams({ ...pageParams, pageNum: pageParams.pageNum - 1 });
          } else {
            getData();
          }
          message.success(intl.formatMessage({id: 'avisualis.delete.success'}));
        }
      },
      onCancel() {},
    });
  };

  return (
    <PageHeaderWrapper>
      <Card>
        <div className={styles.avisualisWrap}>
          <Button
            type="primary"
            style={{ marginBottom: 16 }}
            onClick={() => history.push(`/ModelManagement/avisualis/templateList`)}
          >
            {intl.formatMessage({id: 'avisualis.model.create'})}
          </Button>
          <div className={styles.searchWrap}>
            <Search
              placeholder={intl.formatMessage({id: 'avisualis.queryModel'})}
              enterButton
              onSearch={() => setPageParams({ ...pageParams, pageNum: 1 })}
              onChange={(e) => setName(e.target.value)}
            />
            <Button onClick={() => getData(intl.formatMessage({id: 'avisualis.fresh.success'}))} icon={<SyncOutlined />} />
          </div>
          <Table
            columns={columns}
            dataSource={avisualisData.data}
            rowKey={(r) => r.id}
            onChange={onSortChange}
            pagination={{
              total: avisualisData.total,
              showQuickJumper: true,
              showTotal: (total) => `${intl.formatMessage({id: 'avisualis.table.pagination.showTotal.prefix'})} ${total} ${intl.formatMessage({id: 'avisualis.table.pagination.showTotal.suffix'})}`,
              showSizeChanger: true,
              onChange: pageParamsChange,
              onShowSizeChange: pageParamsChange,
              current: pageParams.pageNum,
              pageSize: pageParams.pageSize,
            }}
            loading={loading}
          />
        </div>
      </Card>
    </PageHeaderWrapper>
  );
};

export default connect(({ avisualis }) => ({ avisualis }))(Avisualis);
