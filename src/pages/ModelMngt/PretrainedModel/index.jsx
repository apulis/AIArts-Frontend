import { history } from 'umi';
import { Table, Form, Input, Button, Card, Descriptions, Popover } from 'antd';
import React, { useState, useEffect, useRef } from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { PAGEPARAMS, sortText } from '@/utils/const';
import { bytesToSize } from '@/utils/utils';
import { connect } from 'umi';
import { SyncOutlined } from '@ant-design/icons';
import { stringify } from 'querystring';
import moment from 'moment';
import { getNameFromDockerImage } from '@/utils/reg';
import { useIntl } from 'umi';

const { Search } = Input;

const ExpandDetails = (item) => {
  const { formatMessage } = useIntl();
  // 转换运行参数格式
  let runArguments = [];

  if (item.params) {
    Object.keys(item.params).forEach((key) => {
      runArguments.push({
        key: key,
        value: item.params[key],
      });
    });
  }

  const argumentsContent = (
    <div>
      {runArguments &&
        runArguments.map((a) => {
          return <div>{a.key + '=' + a.value}</div>;
        })}
    </div>
  );

  const argsSuffix = runArguments.length > 1 ? '...' : '';

  return (
    <Descriptions>
      <Descriptions.Item label={formatMessage({ id: 'pretrainedModel.datasetName' })}>
        {item.datasetName}
      </Descriptions.Item>
      <Descriptions.Item label={formatMessage({ id: 'pretrainedModel.dataFormat' })}>
        {item.dataFormat}
      </Descriptions.Item>
      <Descriptions.Item label={formatMessage({ id: 'pretrainedModel.runningParams' })}>
        <Popover content={argumentsContent}>
          {runArguments && runArguments.length > 0 && (
            <div>{runArguments[0].key + '=' + runArguments[0].value + argsSuffix}</div>
          )}
        </Popover>
      </Descriptions.Item>
      <Descriptions.Item label={formatMessage({ id: 'pretrainedModel.engine' })}>
        {getNameFromDockerImage(item.engine)}
      </Descriptions.Item>
      <Descriptions.Item label={formatMessage({ id: 'pretrainedModel.outputModel' })}>
        {item.outputPath}
      </Descriptions.Item>
    </Descriptions>
  );
};

const PretrainedModelList = (props) => {
  const { formatMessage } = useIntl();
  const {
    loading,
    dispatch,
    pretrainedModelList: { data },
  } = props;
  const [pageParams, setPageParams] = useState(PAGEPARAMS);
  const [formValues, setFormValues] = useState({});
  const [form] = Form.useForm();
  const [sortedInfo, setSortedInfo] = useState({
    orderBy: '',
    order: '',
  });
  const searchEl = useRef(null);

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

  const columns = [
    {
      title: formatMessage({ id: 'presetModelList.table.column.name' }),
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
      width: 150,
      sorter: true,
      sortOrder: sortedInfo.columnKey === 'name' && sortedInfo.order,
    },
    {
      title: formatMessage({ id: 'presetModelList.table.column.use' }),
      dataIndex: 'use',
      ellipsis: true,
      width: 100,
    },
    {
      title: formatMessage({ id: 'presetModelList.table.column.precision' }),
      dataIndex: 'precision',
      ellipsis: true,
      width: 100,
    },
    {
      title: formatMessage({ id: 'presetModelList.table.column.size' }),
      // dataIndex: 'size',
      ellipsis: true,
      width: 150,
      render: (item) => bytesToSize(item.size),
    },
    {
      title: formatMessage({ id: 'presetModelList.table.column.createdAt' }),
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text) => moment(text).format('YYYY-MM-DD HH:mm:ss'),
      ellipsis: true,
      width: 200,
      sorter: true,
      sortOrder: sortedInfo.columnKey === 'createdAt' && sortedInfo.order,
    },
    {
      title: formatMessage({ id: 'presetModelList.table.column.action' }),
      width: 220,
      render: (item) => {
        return (
          <a onClick={() => createInference(item)}>
            {formatMessage({ id: 'presetModelList.table.column.action.createTrainingJob' })}
          </a>
        );
      },
    },
  ];

  const handleNameSearch = (name) => {
    setPageParams({ ...pageParams, ...{ pageNum: 1 } });
    setFormValues({ name });
  };

  const onRefresh = () => {
    setPageParams({ ...pageParams, ...{ pageNum: 1 } });
    const name = searchEl.current.value;
    setFormValues({ name });
  };

  const handleSearch = () => {
    const params = {
      ...pageParams,
      isAdvance: true,
      orderBy: sortedInfo.columnKey,
      order: sortText[sortedInfo.order],
    };

    if (formValues.name) {
      params.name = formValues.name;
    }

    dispatch({
      type: 'pretrainedModelList/fetch',
      payload: params,
    });
  };

  const createInference = (item) => {
    const modelId = item.id;
    history.push(`/model-training/ModelManage/${modelId}/PretrainedModel`);
  };

  const addPretrainedModel = (item) => {
    history.push(`/ModelManagement/CreatePretrained`);
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
          {/* <Button type="default" onClick={addPretrainedModel}>录入模型</Button> */}
          <div
            style={{
              float: 'right',
              paddingRight: '20px',
            }}
          >
            <Search
              style={{ width: '200px', marginRight: '20px' }}
              placeholder={formatMessage({ id: 'presetModelList.placeholder.search' })}
              onSearch={handleNameSearch}
              enterButton
              ref={searchEl}
            />
            <Button icon={<SyncOutlined />} onClick={onRefresh}></Button>
          </div>
        </div>
        <Table
          columns={columns}
          dataSource={data.list}
          rowKey={(record) => record.id}
          onChange={onSortChange}
          pagination={{
            total: data.pagination.total,
            showQuickJumper: true,
            showTotal: (total) =>
              `${formatMessage({
                id: 'presetModelList.table.pagination.showTotal.prefix',
              })} ${total} ${formatMessage({
                id: 'presetModelList.table.pagination.showTotal.suffix',
              })}`,
            showSizeChanger: true,
            onChange: pageParamsChange,
            onShowSizeChange: pageParamsChange,
            current: pageParams.pageNum,
            pageSize: pageParams.pageSize,
          }}
          loading={loading}
          expandable={{
            expandedRowRender: (record) => ExpandDetails(record),
          }}
        />
      </Card>
    </PageHeaderWrapper>
  );
};

export default connect(({ pretrainedModelList, loading }) => ({
  pretrainedModelList,
  loading: loading.models.pretrainedModelList,
}))(PretrainedModelList);
