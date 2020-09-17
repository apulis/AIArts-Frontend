import React, { useEffect, useState } from 'react';
import { Modal, Table, Input } from 'antd';
import moment from 'moment';

import { PAGEPARAMS, sortText } from '@/utils/const';
import { getModels } from '@/pages/ModelMngt/PretrainedModel/services';

const { Search } = Input;

const SelectModelPath = ({ onSelectModalPath, onCancel, visible, onOk }) => {
  const [sortedInfo, setSortedInfo] = useState({
    orderBy: '',
    order: ''
  });
  const [pageParams, setPageParams] = useState(PAGEPARAMS);
  const [formValues, setFormValues] = useState({});
  const [modelPaths, setModelPaths] = useState({ list: [], total: 0 });
  const [loading, setLoading] = useState(false);
  const [selectedRows, setSelectedRows] = useState({});

  const onSortChange = (pagination, filters, sorter) => {
    if (sorter.order !== false) {
      setSortedInfo(sorter);
    }
  };

  const handleSelectModalPath = () => {
    onOk && onOk(selectedRows[0]);
  }

  useEffect(() => {
    handleSearch();
  }, [pageParams, sortedInfo]);

  const pageParamsChange = (page, size) => {
    setPageParams({ pageNum: page, pageSize: size });
  };

  const handleSearch = async () => {
    setLoading(true);
    const params = {
      ...pageParams,
      isAdvance: false,
      orderBy: sortedInfo.columnKey,
      order: sortText[sortedInfo.order]      
    };

    if (formValues.name) {
      params.name = formValues.name;
    }
    const res = await getModels(params);
    if (res.code === 0) {
      setModelPaths({
        total: res.data.total,
        list: res.data.models,
      })
      setLoading(false);
    }

  };


  const columns = [
    {
      title: '模型名称',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
      width: 150,
      sorter: true,
      sortOrder: sortedInfo.columnKey === 'name' && sortedInfo.order,
    },
    {
      title: '存储路径',
      dataIndex: 'codePath',
      ellipsis: true,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: text => moment(text).format('YYYY-MM-DD HH:mm:ss'),
      ellipsis: true,
      width: 150,
      sorter: true,
      sortOrder: sortedInfo.columnKey === 'createdAt' && sortedInfo.order,      
    },
    {
      title: '描述',
      dataIndex: 'description',
      ellipsis: true,
      width: 150
    },
  ];

  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      setSelectedRows(selectedRows);
    },
  };

  const onSearch = (s) => {
    handleSearch();
  }

  if (!visible) {
    return null;
  }
  return (
    <Modal
      visible={visible}
      onCancel={() => onCancel && onCancel()}
      onOk={handleSelectModalPath}
      width="65%"
    >
      <div style={{ marginTop: '20px', paddingBottom: '10px', overflow: 'hidden' }}>
        <Search
          style={{ width: '200px', marginRight:'20px', float: 'right' }}
          placeholder="请输入模型名称"
          onSearch={onSearch}
          onChange={(e) => setFormValues({ name: e.target.value })}
          enterButton
        />
      </div>
      <Table
        rowSelection={{
          type: 'radio',
          ...rowSelection,
        }}
        style={{ marginTop: '10px' }}
        rowKey="id"
        dataSource={modelPaths.list}
        onChange={onSortChange}
        columns={columns}
        pagination={{
          total: modelPaths.total,
          showQuickJumper: true,
          showTotal: (total) => `总共 ${total} 条`,
          showSizeChanger: true,
          onChange: pageParamsChange,
          onShowSizeChange: pageParamsChange,
          current: pageParams.pageNum,
          pageSize: pageParams.pageSize,              
        }}
        loading={loading}
      />
    </Modal>
  )
}


export default SelectModelPath;