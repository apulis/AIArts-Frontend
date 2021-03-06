import React, { useState, useEffect, useRef } from 'react';
import { Modal, Table, Input, Button, Select, Card, message, Upload, Tooltip } from 'antd';
import { SyncOutlined, ExclamationCircleOutlined, UploadOutlined } from '@ant-design/icons';
import { history, useIntl } from 'umi';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import {
  fetchTemplates,
  removeTemplate,
  fetchTemplateById,
  saveTrainingParams,
} from '../../../services/modelTraning';
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
  const { formatMessage } = useIntl();
  const [tableLoading, setTableLoading] = useState(true);
  const [formValues, setFormValues] = useState({ scope: 2, searchWord: '' });
  const [pageParams, setPageParams] = useState(PAGEPARAMS);
  const [paramList, setParamList] = useState([]);
  const [fileList, setFileList] = useState([]);
  const [total, setTotal] = useState(0);
  const uploadRef = useRef(null);
  const [importedParamsModalVisible, setImportedParamsModalVisible] = useState(false);
  const [sortedInfo, setSortedInfo] = useState({
    orderBy: '',
    order: '',
  });
  const [currentScope, setCurrentScope] = useState(3);
  const [uploadParamsObj, setUploadParamsObj] = useState(undefined);
  const scopeList = [
    { value: 3, label: formatMessage({ id: 'paramsManager.all' }) },
    { value: 1, label: formatMessage({ id: 'paramsManager.public' }) },
    { value: 2, label: formatMessage({ id: 'paramsManager.private' }) },
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
      title: formatMessage({ id: 'paramsManage.modal.confirm.delete.title' }),
      icon: <ExclamationCircleOutlined />,
      content: formatMessage({ id: 'paramsManage.modal.confirm.delete.content' }),
      okType: 'danger',
      onOk: async () => {
        const res = await removeTemplate(id);
        if (res.code === 0) {
          // 若删除的是当前页最后一项，且页数不是第一页，则将页数减一
          if (paramList.length == 1 && pageParams.pageNum > 1) {
            setPageParams({ ...pageParams, pageNum: pageParams.pageNum - 1 });
          } else {
            handleSearch();
          }
          message.success(formatMessage({ id: 'paramsManage.modal.confirm.delete.success' }));
        } else {
          message.error(`${paramsManage.modal.confirm.delete.fail}${error.msg}`);
        }
      },
      onCancel() {},
    });
  };

  const saveTemplateAsFile = async (id, name) => {
    const cancel = message.loading();
    const res = await fetchTemplateById(id);
    if (res.code === 0) {
      cancel();
      const metaData = res.data.metaData;
      if (metaData) {
        delete metaData.creator;
        delete metaData.createdAt;
        delete metaData.updatedAt;
        delete metaData.id;
      }
      const data = JSON.stringify(res.data, null, 2);
      downloadStringAsFile(data, `${name}.json`);
    }
  };

  const columns = [
    {
      title: formatMessage({ id: 'trainingParamsList.table.column.name' }),
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
      title: formatMessage({ id: 'trainingParamsList.table.column.engineType' }),
      dataIndex: ['params', 'engine'],
      key: 'engine',
      render(val) {
        return <div>{getNameFromDockerImage(val)}</div>;
      },
    },
    {
      title: formatMessage({ id: 'trainingParamsList.table.column.createTime' }),
      sorter: true,
      sortOrder: sortedInfo.columnKey === 'created_at' && sortedInfo.order,
      dataIndex: ['metaData', 'createdAt'],
      key: 'created_at',
      render: (text) => moment(text).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: formatMessage({ id: 'trainingParamsList.table.column.description' }),
      width: '25%',
      ellipsis: true,
      dataIndex: ['params', 'desc'],
    },
    {
      title: formatMessage({ id: 'trainingParamsList.table.column.action' }),
      render: (item) => {
        const id = item.metaData.id;
        const name = item.params.name;
        return (
          <>
            <a onClick={() => handleCreateTrainJob(id)}>
              {formatMessage({
                id: 'trainingParamsList.table.column.action.createTrainingJob',
              })}
            </a>
            <a style={{ margin: '0 16px' }} onClick={() => handleEdit(id)}>
              {formatMessage({ id: 'trainingParamsList.table.column.action.edit' })}
            </a>
            <a style={{ color: 'red' }} onClick={() => handleDelete(id)}>
              {formatMessage({ id: 'trainingParamsList.table.column.action.delete' })}
            </a>
            <a style={{ marginLeft: '12px' }} onClick={() => saveTemplateAsFile(id, name)}>
              {formatMessage({ id: 'trainingParamsList.table.column.action.exportParams' })}
            </a>
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
      searchWord: formValues.searchWord,
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
    reader.onload = (e) => {
      try {
        const result = JSON.parse(e.target.result);
        const newTemplate = {};
        newTemplate.scope = result.metaData?.scope;
        newTemplate.jobType = result.metaData?.jobType;
        newTemplate.templateData = Object.assign({}, result.params, {
          name: result.metaData.name || file.name,
        });
        setUploadParamsObj(newTemplate);
      } catch (err) {
        message.error(err);
      }
    };
    reader.readAsText(file);
  };

  const saveFileAsTemplate = async () => {
    if (!uploadParamsObj) {
      message.error(formatMessage({ id: 'paramsManager.noContent' }));
      return;
    }
    const res = await saveTrainingParams(uploadParamsObj);
    if (res.code === 0) {
      setImportedParamsModalVisible(false);
      handleSearch();
    }
  };

  return (
    <PageHeaderWrapper>
      <Card
        bordered={false}
        bodyStyle={{
          padding: '0',
        }}
      >
        <div
          style={{
            padding: '24px 0 24px 24px',
          }}
        >
          <Button
            onClick={() => {
              setImportedParamsModalVisible(true);
            }}
            type="primary"
          >
            {formatMessage({ id: 'trainingParamsList.add.importParams' })}
          </Button>
          <div className={styles.searchWrap}>
            {/* <Select style={{ width: 180, marginRight:'20px' }} defaultValue={currentScope} onChange={handleScopeChange}>
              {
                scopeList.map((item) => (
                  <Option key= {item.value} value={item.value}>{item.label}</Option>
                ))                
              }
            </Select> */}
            <Search
              placeholder={formatMessage({ id: 'trainingParamsList.placeholder.search' })}
              onSearch={() => {
                setPageParams({ ...pageParams, ...{ pageNum: 1 } });
                handleSearch();
              }}
              enterButton
              onChange={(e) => onSearchName(e.target.value)}
            />
            <Button
              icon={<SyncOutlined />}
              onClick={() => {
                handleSearch();
              }}
            ></Button>
          </div>
        </div>
        <Table
          columns={columns}
          rowKey={(record) => record.metaData.id}
          onChange={onSortChange}
          pagination={{
            current: pageParams.pageNum,
            pageSize: pageParams.pageSize,
            total: total,
            showQuickJumper: true,
            showTotal: (total) =>
              `${formatMessage({
                id: 'trainingParamsList.table.pagination.showTotal.prefix',
              })} ${total} ${formatMessage({
                id: 'trainingParamsList.table.pagination.showTotal.suffix',
              })}`,
            showSizeChanger: true,
            onChange: pageParamsChange,
            onShowSizeChange: pageParamsChange,
            current: pageParams.pageNum,
            pageSize: pageParams.pageSize,
          }}
          expandable={{
            expandedRowRender: (record) => <ExpandDetail record={record} />,
          }}
          dataSource={paramList}
          loading={tableLoading}
        />
      </Card>
      {importedParamsModalVisible && (
        <Modal
          visible={importedParamsModalVisible}
          onCancel={() => {
            setImportedParamsModalVisible(false);
          }}
          onOk={saveFileAsTemplate}
        >
          <Upload
            ref={uploadRef}
            beforeUpload={beforeUpload}
            action="/"
            onChange={(info) => setFileList(info.fileList)}
          >
            <Tooltip
              title={fileList.length >= 1 ? formatMessage({ id: 'paramsManage.upload.tip' }) : ''}
            >
              <Button disabled={fileList.length >= 1} icon={<UploadOutlined />}>
                {formatMessage({ id: 'paramsManage.upload.button' })}
              </Button>
            </Tooltip>
          </Upload>
        </Modal>
      )}
    </PageHeaderWrapper>
  );
};

export default ParamsManage;
