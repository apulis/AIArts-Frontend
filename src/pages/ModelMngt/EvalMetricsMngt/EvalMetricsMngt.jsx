import React, { useState, useEffect, useRef } from 'react';
import { Modal, Table, Input, Button, Select, Card, message, Upload, Tooltip } from 'antd';
import { SyncOutlined, ExclamationCircleOutlined, UploadOutlined } from '@ant-design/icons';
import { history } from 'umi';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { fetchTemplates, removeTemplate } from '../../../services/modelTraning';
import { saveEvaluationParams } from '../ModelEvaluation/services/index';
import { PAGEPARAMS, sortText, modelEvaluationType } from '@/utils/const';
import moment from 'moment';
import ExpandDetail from '@/pages/ModelTraining/ParamsManage/ExpandDetail';
import styles from '@/global.less';
import { getNameFromDockerImage } from '@/utils/reg';
import { downloadStringAsFile } from '@/utils/utils';
import { useIntl } from 'umi';

const { confirm } = Modal;
const { Option } = Select;
const { Search } = Input;

const EvalMetricsMngt = () => {
  const intl = useIntl();
  const [tableLoading, setTableLoading] = useState(true);
  const [formValues, setFormValues] = useState({ scope: 2, searchWord: '' });
  const [pageParams, setPageParams] = useState(PAGEPARAMS);
  const [paramList, setParamList] = useState([]);
  const [total, setTotal] = useState(0);
  const uploadRef = useRef(null);
  const [sortedInfo, setSortedInfo] = useState({
    orderBy: '',
    order: '',
  });
  const [currentScope, setCurrentScope] = useState(3);
  const [importedParamsModalVisible, setImportedParamsModalVisible] = useState(false);
  const [uploadParamsObj, setUploadParamsObj] = useState(undefined);
  const scopeList = [
    { value: 3, label: intl.formatMessage({ id: 'evalMetricsMngt.all' }) },
    { value: 1, label: intl.formatMessage({ id: 'evalMetricsMngt.public' }) },
    { value: 2, label: intl.formatMessage({ id: 'evalMetricsMngt.private' }) },
  ];

  const pageParamsChange = (page, size) => {
    setPageParams({ pageNum: page, pageSize: size });
  };

  const handleEdit = (id) => {
    history.push(`editMetrics/${id}`);
  };

  const handleDelete = async (id) => {
    confirm({
      title: intl.formatMessage({ id: 'evalMetricsMngt.deleteParamConfig' }),
      icon: <ExclamationCircleOutlined />,
      content: intl.formatMessage({ id: 'evalMetricsMngt.delete.tips' }),
      okText: intl.formatMessage({ id: 'evalMetricsMngt.ok' }),
      okType: 'danger',
      cancelText: intl.formatMessage({ id: 'evalMetricsMngt.cancel' }),
      onOk: async () => {
        const res = await removeTemplate(id);
        if (res.code === 0) {
          // 若删除的是当前页最后一项，且页数不是第一页，则将页数减一
          if (paramList.length == 1 && pageParams.pageNum > 1) {
            setPageParams({ ...pageParams, pageNum: pageParams.pageNum - 1 });
          } else {
            handleSearch();
          }
          message.success(intl.formatMessage({ id: 'evalMetricsMngt.delete.success' }));
        } else {
          message.error(
            `${intl.formatMessage({ id: 'evalMetricsMngt.delete.error' })}${error.msg}` ||
              `${intl.formatMessage({ id: 'xxx' })}`,
          );
        }
      },
      onCancel() {},
    });
  };

  const resetQuery = () => {
    setFormValues({ scope: 2, searchWord: '' });
  };

  const handleSaveAsFile = (item) => {
    delete item.metaData.createAt;
    delete item.metaData.updateAt;
    delete item.metaData.id;
    downloadStringAsFile(JSON.stringify(item, null, 2), `${item.metaData.name}.json`);
  };

  const columns = [
    {
      title: intl.formatMessage({ id: 'modelEvaluationMetricsList.table.column.name' }),
      sorter: true,
      width: '16%',
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
      title: intl.formatMessage({ id: 'modelEvaluationMetricsList.table.column.engineType' }),
      dataIndex: ['params', 'engine'],
      width: '16%',
      key: 'engine',
      render(value) {
        return <div>{getNameFromDockerImage(value)}</div>;
      },
    },
    {
      title: intl.formatMessage({ id: 'modelEvaluationMetricsList.table.column.createTime' }),
      sorter: true,
      sortOrder: sortedInfo.columnKey === 'created_at' && sortedInfo.order,
      dataIndex: ['metaData', 'createdAt'],
      key: 'created_at',
      render: (text) => moment(text).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: intl.formatMessage({ id: 'modelEvaluationMetricsList.table.column.description' }),
      ellipsis: true,
      width: '16%',
      dataIndex: ['params', 'desc'],
    },
    {
      title: intl.formatMessage({ id: 'modelEvaluationMetricsList.table.column.action' }),
      align: 'center',
      render: (item) => {
        const id = item.metaData.id;
        return (
          <>
            <a style={{ margin: '0 16px' }} onClick={() => handleEdit(id)}>
              {intl.formatMessage({ id: 'modelEvaluationMetricsList.table.column.action.edit' })}
            </a>
            <a style={{ color: 'red' }} onClick={() => handleDelete(id)}>
              {intl.formatMessage({ id: 'modelEvaluationMetricsList.table.column.action.delete' })}
            </a>
            <a style={{ marginLeft: '16px' }} onClick={() => handleSaveAsFile(item)}>
              {intl.formatMessage({
                id: 'modelEvaluationMetricsList.table.column.action.exportParams',
              })}
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
      jobType: modelEvaluationType,
      orderBy: sortedInfo.columnKey,
      order: sortText[sortedInfo.order],
    };

    if (formValues.scope) {
      params.scope = formValues.scope;
    }

    if (formValues.searchWord) {
      params.searchWord = formValues.searchWord;
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
    if (sorter.order !== false) {
      setSortedInfo(sorter);
    }
  };

  const handleScopeChange = (scope) => {
    setFormValues({ ...formValues, ...{ scope } });
  };

  const onSearchName = (searchWord) => {
    setFormValues({ ...formValues, ...{ searchWord } });
  };

  const saveFileAsTemplate = async () => {
    if (!uploadParamsObj) {
      message.error(intl.formatMessage({ id: 'evalMetricsMngt.noContent' }));
      return;
    }
    const submitData = {};
    // submitData.scope = values.scope;
    submitData.scope = 2;
    submitData.jobType = modelEvaluationType;
    submitData.templateData = {};
    submitData.templateData = Object.assign({}, uploadParamsObj.templateData);
    delete submitData.templateData.id;
    // console.log('submit ', submitData, uploadParamsObj)
    // return
    const res = await saveEvaluationParams(submitData);
    if (res.code === 0) {
      setImportedParamsModalVisible(false);
      handleSearch();
    }
  };

  const beforeUpload = (file) => {
    console.log('file.name', file);
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
        console.log('err', err);
        message.error(err.message);
      }
    };
    reader.readAsText(file);
  };

  useEffect(() => {
    handleSearch();
  }, [pageParams, sortedInfo]);
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
            type="primary"
            onClick={() => {
              setImportedParamsModalVisible(true);
            }}
          >
            {intl.formatMessage({ id: 'modelEvaluationMetrics.list.add.importParams' })}
          </Button>
          <div className={styles.searchWrap}>
            {/* <Select style={{ width: 180, marginRight:'20px' }} defaultValue={currentScope} onChange={handleScopeChange}>
              {
                scopeList.map((item) => (
                  <Option key= {item.value} value={item.value}>{item.label}</Option>
                ))                
              }
            </Select>             */}
            <Search
              placeholder={intl.formatMessage({
                id: 'modelEvaluationMetrics.list.placeholder.search',
              })}
              onSearch={() => {
                setPageParams({ ...pageParams, ...{ pageNum: 1 } });
                handleSearch();
              }}
              enterButton
              onChange={(e) => {
                onSearchName(e.target.value);
              }}
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
            total: total,
            showQuickJumper: true,
            showTotal: (total) =>
              `${intl.formatMessage({
                id: 'modelEvaluationMetricsList.table.pagination.showTotal.prefix',
              })} ${total} ${intl.formatMessage({
                id: 'modelEvaluationMetricsList.table.pagination.showTotal.suffix',
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
          <Upload beforeUpload={beforeUpload} action="/" ref={uploadRef}>
            <Tooltip
              title={
                uploadRef.current?.state.fileList.length >= 1
                  ? intl.formatMessage({ id: 'evalMetricsMngt.upload.tips' })
                  : ''
              }
            >
              <Button
                disabled={uploadRef.current?.state.fileList.length >= 1}
                icon={<UploadOutlined />}
              >
                {intl.formatMessage({ id: 'evalMetricsMngt.upload' })}
              </Button>
            </Tooltip>
          </Upload>
        </Modal>
      )}
    </PageHeaderWrapper>
  );
};

export default EvalMetricsMngt;
