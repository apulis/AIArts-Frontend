import React, { useState, useEffect } from 'react';
import { Modal, Table, Input, Button, Select, Card, message, Upload } from 'antd';
import { SyncOutlined, ExclamationCircleOutlined, UploadOutlined } from '@ant-design/icons';
import { history } from 'umi';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { fetchTemplates, removeTemplate, fetchTemplateById, saveTrainingParams } from '../../../services/modelTraning';
import { PAGEPARAMS, sortText, modelTrainingType } from '@/utils/const';
import { getNameFromDockerImage } from '@/utils/reg.js';
import moment from 'moment';
import ExpandDetail from './ExpandDetail';
import styles from '@/global.less';
import { downloadStringAsFile } from '@/utils/utils';

const { confirm } = Modal;
const { Option } = Select;
const { Search } = Input;

const ParamsManage = () => {

  const [tableLoading, setTableLoading] = useState(true);
  const [formValues, setFormValues] = useState({ scope: 2, searchWord: '' });
  const [pageParams, setPageParams] = useState(PAGEPARAMS);
  const [paramList, setParamList] = useState([]);
  const [total, setTotal] = useState(0);
  const [importedParamsModalVisible, setImportedParamsModalVisible] = useState(false);
  const [sortedInfo, setSortedInfo] = useState({
    orderBy: '',
    order: ''
  });
  const [currentScope, setCurrentScope] = useState(3);
  const [uploadParamsObj, setUploadParamsObj] = useState(undefined);
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
          // 若删除的是当前页最后一项，且页数不是第一页，则将页数减一
          if (paramList.length == 1 && pageParams.pageNum > 1) {
            setPageParams({ ...pageParams, pageNum: pageParams.pageNum - 1 });
          } else {
            handleSearch();
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

  const saveTemplateAsFile = async (id, name) => {
    const cancel = message.loading();
    const res = await fetchTemplateById(id);
    if (res.code === 0) {
      cancel();
      const metaData = res.data.metaData
      if (metaData) {
        delete metaData.creator;
        delete metaData.createdAt;
        delete metaData.updatedAt;
        delete metaData.id;
      }
      const data = JSON.stringify(res.data, null, 2)
      downloadStringAsFile(data, `${name}.json`);
    }
  }

  const columns = [
    {
      title: '参数配置名称',
      sorter: true,
      sortOrder: sortedInfo.columnKey === 'name' && sortedInfo.order,
      dataIndex: ['params', 'name'],
      key: 'name',
    },
    // {
    //   title: '权限',
    //   dataIndex: ['metaData', 'scope'],
    //   key: 'type',
    //   width: 70,
    //   render: item => scopeList.find(scope => scope.value === item)?.label
    // },
    {
      title: '引擎类型', dataIndex: ['params', 'engine'], key: 'engine', render(val) {
        return <div>{getNameFromDockerImage(val)}</div>;
      }
    },
    {
      title: '创建时间',
      sorter: true,
      sortOrder: sortedInfo.columnKey === 'created_at' && sortedInfo.order,
      dataIndex: ['metaData', 'createdAt'],
      key: 'created_at',
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
        const name = item.params.name;
        return (
          <>
            <a onClick={() => handleCreateTrainJob(id)}>创建训练作业</a>
            <a style={{ margin: '0 16px' }} onClick={() => handleEdit(id)}>编辑</a>
            <a style={{ color: 'red' }} onClick={() => handleDelete(id)}>删除</a>
            <a style={{marginLeft: '12px'}} onClick={() => saveTemplateAsFile(id, name)}>导出参数</a>
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
      order: sortText[sortedInfo.order],
      scope: formValues.scope,
      searchWord: formValues.searchWord
    };
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
    if (sorter.order !== false) {
      setSortedInfo(sorter);
    }
  };

  const handleScopeChange = (scope) => {
    setFormValues({ ...formValues, ...{ scope } });
  };

  const onSearchName = (searchWord) => {
    setFormValues({ ...formValues, searchWord });
  };

  useEffect(() => {
    handleSearch();
  }, [pageParams, sortedInfo]);

  const beforeUpload = (file) => {
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const result = JSON.parse(e.target.result)
        const newTemplate = {}
        newTemplate.scope = result.metaData?.scope;
        newTemplate.jobType = result.metaData?.jobType;
        newTemplate.templateData = Object.assign({}, result.params)

        setUploadParamsObj(newTemplate);
      } catch (err) {
        message.error(err);
      }
    };
    reader.readAsText(file);
  }

  const saveFileAsTemplate = async () => {
    if (!uploadParamsObj) {
      message.error('没有可用的内容');
      return;
    }
    const res = await saveTrainingParams(uploadParamsObj);
    if (res.code === 0) {
      setImportedParamsModalVisible(false);
      handleSearch();
    }
  }

  return (
    <PageHeaderWrapper>
      <Card bordered={false}
        bodyStyle={{
          padding: '0'
        }}
      >
        <div
          style={{
            padding: '24px 0 24px 24px',
          }}
        >
          <Button onClick={() => {setImportedParamsModalVisible(true)}} type="primary">导入参数</Button>
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
      <Modal
        visible={importedParamsModalVisible}
        onCancel={() => {setImportedParamsModalVisible(false)}}
        onOk={saveFileAsTemplate}
      >
        <Upload beforeUpload={beforeUpload}>
          <Button icon={<UploadOutlined />}>上传 json 文件</Button>
        </Upload>
      </Modal>
    </PageHeaderWrapper >
  );
};

export default ParamsManage;