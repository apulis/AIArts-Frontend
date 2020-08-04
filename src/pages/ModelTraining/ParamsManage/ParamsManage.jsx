import React, { useState, useEffect } from 'react';
import { Modal, Table, Input, Button, Select, Card, message } from 'antd';
import { SyncOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { history } from 'umi';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { fetchTemplates, removeTemplate } from '../../../services/modelTraning';
import { PAGEPARAMS, sortText, modelTrainingType } from '@/utils/const';
import moment from 'moment';
import ExpandDetail from './ExpandDetail';
import styles from '@/global.less';

const { confirm } = Modal;
const { Option } = Select;
const { Search } = Input;

const ParamsManage = () => {

  const [tableLoading, setTableLoading] = useState(true);
  const [formValues, setFormValues] = useState({ scope: 3, name: '' });
  const [pageParams, setPageParams] = useState(PAGEPARAMS);
  const [paramList, setParamList] = useState([]);
  const [total, setTotal] = useState(0);
  const [sortedInfo, setSortedInfo] = useState({
    orderBy: '',
    order: ''
  });
  const [currentScope, setCurrentScope] = useState(3);
  const scopeList = [
    { value: 3, label: '全部' },
    { value: 1, label: '公有' },
    { value: 2, label: '私有' },
  ];

  const pageParamsChange = (page, size) => {
    setPageParams({ pageNum: page, pageSize: size });
  };

  const handleCreateTrainJob = (id) => {
    history.push(`paramManage/${id}/createJobWithParam`);
  };
  const handleEdit = (id) => {
    history.push(`paramManage/${id}/editParam`);
  };

  const handleDelete = async (id) => {
    confirm({
      title: '删除参数配置',
      icon: <ExclamationCircleOutlined />,
      content: '删除操作无法恢复，是否继续？',
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        const res = await removeTemplate(id);
        if (res.code === 0) {
          message.success('删除成功');
          handleSearch();
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
      title: '参数配置名称',
      sorter: true,
      sortOrder: sortedInfo.columnKey === 'configName' && sortedInfo.order,
      dataIndex: ['params', 'name'],
      key: 'configName',
    },
    // {
    //   title: '权限',
    //   dataIndex: ['metaData', 'scope'],
    //   key: 'type',
    //   width: 70,
    //   render: item => scopeList.find(scope => scope.value === item)?.label
    // },
    { title: '引擎类型', dataIndex: ['params', 'engine'], key: 'engine' },
    {
      title: '创建时间',
      sorter: true,
      sortOrder: sortedInfo.columnKey === 'createdAt' && sortedInfo.order,
      dataIndex: ['metaData', 'createdAt'],
      key: 'createdAt',
      render: text => moment(text).format('YYYY-MM-DD HH:mm:ss')
    },
    {
      title: '描述',
      width: '25%',
      ellipsis: true,
      dataIndex: ['params', 'desc']
    },
    {
      title: '操作',
      render: item => {
        const id = item.metaData.id;
        return (
          <>
            <a onClick={() => handleCreateTrainJob(id)}>创建训练作业</a>
            <a style={{ margin: '0 16px' }} onClick={() => handleEdit(id)}>编辑</a>
            <a style={{ color: 'red' }} onClick={() => handleDelete(id)}>删除</a>
          </>
        );
      },
    },
  ];

  const handleSearch = async () => {
    const params = {
      pageNum: pageParams.pageNum,
      pageSize: pageParams.pageSize,
      jobType: modelTrainingType,
      orderBy: sortedInfo.columnKey,
      order: sortText[sortedInfo.order]
    };
    if (formValues.scope) {
      params.scope = formValues.scope;
    }

    if (formValues.name) {
      params.name = formValues.name;
    }
    const res = await getParamsList(params);
  };

  const getParamsList = async (params) => {
    setTableLoading(true);
    const res = await fetchTemplates(params);
    if (res.code === 0) {
      const paramList = (res.data && res.data.Templates) || [];
      setParamList(paramList);
      const total = (res.data && res.data.total) || 0;
      setTotal(total);
    }
    setTableLoading(false);
  };

  const onSortChange = (pagination, filters, sorter) => {
    setSortedInfo(sorter);
  };

  const handleScopeChange = (scope) => {
    setFormValues({ ...formValues, ...{ scope } });
  };

  const onSearchName = (name) => {
    setFormValues({ ...formValues, name });
  };

  useEffect(() => {
    handleSearch();
  }, [pageParams, sortedInfo]);

  return (
    <PageHeaderWrapper>
      <Card bordered={false}
        bodyStyle={{
          padding: '0'
        }}
      >
        <div
          style={{
            padding: '24px 0 24px 24px'
          }}
        >
          <div className={styles.searchWrap}>
            {/* <Select style={{ width: 180, marginRight:'20px' }} defaultValue={currentScope} onChange={handleScopeChange}>
              {
                scopeList.map((item) => (
                  <Option key= {item.value} value={item.value}>{item.label}</Option>
                ))                
              }
            </Select> */}
            <Search placeholder="输入参数配置名称" onSearch={() => { setPageParams({ ...pageParams, ...{ pageNum: 1 } }); handleSearch(); }} enterButton onChange={e => onSearchName(e.target.value)} />
            <Button icon={<SyncOutlined />} onClick={() => { handleSearch(); }}></Button>
          </div>
        </div>
        <Table
          columns={columns}
          rowKey={record => record.metaData.id}
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
          expandable={{
            expandedRowRender: record => <ExpandDetail record={record} />
          }}
          dataSource={paramList}
          loading={tableLoading}
        />
      </Card>
    </PageHeaderWrapper >
  );
};

export default ParamsManage;