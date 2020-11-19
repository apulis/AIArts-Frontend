import React, { useState, useEffect, useRef } from 'react';
import { Modal, Table, Input } from 'antd';
import Button from '@/components/locales/Button';
import { useIntl, connect } from 'umi';
import { PAGEPARAMS, sortText } from '@/utils/const';
import { getJobStatus, formatTime } from '@/utils/utils';
import { SyncOutlined } from '@ant-design/icons';
import { canCreateVisualJobStatus } from '@/utils/utils';
import { getNameFromDockerImage } from '@/utils/reg';
import { fetchTrainingList } from '@/services/modelTraning';

const { Search } = Input;

const SelectModelTrainingModel = ({ onCancel, visible, onOk, vc }) => {
  const intl = useIntl();
  const { formatMessage } = intl;
  const searchRef = useRef(null);
  const { currentSelectedVC } = vc;
  const [tableLoading, setTableLoading] = useState(true);
  const [trainingWorkList, setTrainingWorkList] = useState([]);
  const [pageParams, setPageParams] = useState(PAGEPARAMS);
  const [search, setSearch] = useState('');
  const [sortInfo, setSortInfo] = useState({// 排序
    orderBy: '',
    order: '',
  });

  const renderTable = async (options = {}) => {
    const { searchWord } = options;
    const params = Object.assign({ vcName: currentSelectedVC }, pageParams);
    if (searchWord) {
      Reflect.set(params, 'search', searchWord);
    }
    if (sortInfo && sortInfo.orderBy && sortInfo.order) {
      const sortMap = {name: 'jobName', createTime: 'jobTime'}
      const sortedInfo = {orderBy: sortMap[sortInfo.orderBy], order: sortText[sortInfo.order]}
      Reflect.set(params, 'sortedInfo', sortedInfo);
    }
    const data = await apiGetModelTrainings(params);
    setTableLoading(false);
    if (data) {
      setTrainingWorkList(data);
    }
  };

  const apiGetModelTrainings = async (params) => {
    const obj = await fetchTrainingList(params);
    const { code, data, msg } = obj;
    if (code === 0) {
      return data;
    } else {
      return null;
    }
  };

  useEffect(() => {
    renderTable();
  }, [pageParams, sortInfo]);

  const handlePageParamsChange = (pageNum, pageSize) => {
    setPageParams({ pageNum, pageSize });
  };

  const handleSortChange = (pagination, filters, sorter) => {
    const { field: orderBy, order } = sorter;
    setSortInfo({ orderBy, order });
  };

  const handleSelectModalPath = () => {
    // onOk && onOk(selectedRows[0]);
    onOk && onOk({ name: 'xxxs' });
  };

  const handleSearch = (searchWord) => {
    renderTable({ searchWord });
  };

  const columns = [
    {
      dataIndex: 'name',
      title: intl.formatMessage({ id: 'modelList.table.column.name' }),
      sorter: true,
      sortOrder: sortInfo.orderBy === 'name' && sortInfo.order,
    },
    {
      dataIndex: 'status',
      title: intl.formatMessage({ id: 'modelList.table.column.status' }),
      render: (text, item) => getJobStatus(item.status),
    },
    {
      dataIndex: 'engine',
      title: intl.formatMessage({ id: 'modelList.table.column.engine' }),
      render(value) {
        return <div>{getNameFromDockerImage(value)}</div>;
      },
    },
    {
      dataIndex: 'createTime',
      title: intl.formatMessage({ id: 'modelList.table.column.createTime' }),
      sorter: true,
      sortOrder: sortInfo.orderBy === 'createTime' && sortInfo.order,
      render(_text, item) {
        return <div>{formatTime(item.createTime)}</div>;
      },
    },
    {
      dataIndex: 'desc',
      title: intl.formatMessage({ id: 'modelList.table.column.description' }),
      width: '100px',
      render(_text) {
        return (
          <div title={_text}>
            {_text}
          </div>
        );
      },
    }
  ];

  return (
    <Modal
      visible={visible}
      maskClosable={false}
      onCancel={() => onCancel && onCancel()}
      onOk={handleSelectModalPath}
      width="65%"
    >
      <div style={{ float: 'right' }}>
        <Search
          placeholder= '搜索'
          ref={searchRef}
          onSearch={(value) => handleSearch(value)}
          style={{ width: '210px', marginTop: '20px', marginBottom: '10px' }}
          enterButton
        />
      </div>
      <Table
        dataSource={trainingWorkList.Trainings}
        columns={columns}
        loading={tableLoading}
        onChange={handleSortChange}
        rowKey={(r) => r.id}
        pagination={{
          total: trainingWorkList.total,
          showTotal: (total) => `总共 ${total} 条`,
          defaultPageSize: 5,
          showQuickJumper: true,
          showSizeChanger: true,
          onChange: handlePageParamsChange,
          onShowSizeChange: handlePageParamsChange,
          current: pageParams.pageNum,
        }}
      />
    </Modal>
  );
};

export default connect(({ vc }) => ({ vc }))(SelectModelTrainingModel);
