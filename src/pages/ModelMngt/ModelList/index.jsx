import { history } from 'umi';
import { message, Table, Modal, Form, Input, Button, Space, Card } from 'antd';
import React, { useState, useEffect, useRef } from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { PAGEPARAMS, sortText } from '@/utils/const';
import ModalForm from './components/ModalForm';
import { connect } from 'umi';
import { SyncOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { stringify } from 'querystring';
import moment from 'moment';
import { useIntl } from 'umi';

const { confirm } = Modal;
const { Search } = Input;

const ModelList = (props) => {
  const intl = useIntl();
  const {
    loading,
    dispatch,
    modelList: { data },
  } = props;

  const [visible, setVisible] = useState(false);
  const [current, setCurrent] = useState(undefined);
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
      title: intl.formatMessage({ id: 'myModelsList.table.column.name' }),
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
      width: 150,
      sorter: true,
      sortOrder: sortedInfo.columnKey === 'name' && sortedInfo.order,
    },
    // {
    //   title: '引擎类型',
    //   dataIndex: 'type',
    //   ellipsis: true,
    //   width: 100,
    // },
    {
      title: intl.formatMessage({ id: 'myModelsList.table.column.codePath' }),
      dataIndex: 'codePath',
      ellipsis: true,
      width: 100,
    },
    {
      title: intl.formatMessage({ id: 'myModelsList.table.column.createAt' }),
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text) => moment(text).format('YYYY-MM-DD HH:mm:ss'),
      ellipsis: true,
      width: 150,
      sorter: true,
      sortOrder: sortedInfo.columnKey === 'createdAt' && sortedInfo.order,
    },
    {
      title: intl.formatMessage({ id: 'myModelsList.table.column.description' }),
      dataIndex: 'description',
      ellipsis: true,
      width: 150,
    },
    {
      title: intl.formatMessage({ id: 'myModelsList.table.column.action' }),
      width: 220,
      render: (item) => {
        return (
          <Space size="middle">
            <a onClick={() => handleDownload(item)}>
              {intl.formatMessage({ id: 'myModelsList.table.column.action.download' })}
            </a>
            {/* <a onClick={() => createInference(item)}>创建推理</a> */}
            {/* <a onClick={() => modifyModel(item)}>编辑</a> */}
            <a onClick={() => evaluateModel(item)}>
              {intl.formatMessage({ id: 'myModelsList.table.column.action.evaluate' })}
            </a>
            <a style={{ color: 'red' }} onClick={() => deleteModel(item)}>
              {intl.formatMessage({ id: 'myModelsList.table.column.action.delete' })}
            </a>
          </Space>
        );
      },
    },
  ];

  const modifyModel = (item) => {
    setVisible(true);
    setCurrent(item);
  };

  const handleCancel = () => {
    setVisible(false);
  };

  const handleSubmit = async (values) => {
    const id = current ? current.id : '';

    if (id) {
      const { description } = values;

      const { error, msg } = await dispatch({
        type: 'modelList/update',
        payload: { id, description },
      });

      if (error === null) {
        message.success(`${intl.formatMessage({ id: 'modelList.edit.success' })}`);
        handleSearch();
      } else {
        msg && message.error(`${intl.formatMessage({ id: 'modelList.edit.error' })}:${msg}`);
      }
      setVisible(false);
    }
  };

  const handleSearch = () => {
    const params = {
      ...pageParams,
      isAdvance: false,
      orderBy: sortedInfo.columnKey,
      order: sortText[sortedInfo.order],
    };

    if (formValues.name) {
      params.name = formValues.name;
    }

    dispatch({
      type: 'modelList/fetch',
      payload: params,
    });
  };

  const handleDownload = async (item) => {
    window.open(`/ai_arts/api/files/download/model/${item.id}`, '_blank');
  };

  const createInference = (item) => {
    const queryString = stringify({
      modelPath: encodeURIComponent(item.modelPath),
    });
    history.push(`/Inference/submit/?${queryString}`);
  };

  const evaluateModel = (item) => {
    const queryString = stringify({
      modelId: encodeURIComponent(item.id),
    });
    history.push(`/ModelManagement/CreateEvaluation/?${queryString}`);
  };

  const deleteModel = (item) => {
    confirm({
      title: intl.formatMessage({ id: 'modelList.model.delete' }),
      icon: <ExclamationCircleOutlined />,
      content: intl.formatMessage({ id: 'modelList.model.delete.tips' }),
      okText: intl.formatMessage({ id: 'modelList.ok' }),
      okType: 'danger',
      cancelText: intl.formatMessage({ id: 'modelList.cancel' }),
      onOk() {
        dispatch({
          type: 'modelList/delete',
          payload: {
            id: item.id,
          },
        }).then(({ error }) => {
          if (error === null) {
            // 若删除的是当前页最后一项，且页数不是第一页，则将页数减一
            if (data.list.length == 1 && pageParams.pageNum > 1) {
              setPageParams({ ...pageParams, pageNum: pageParams.pageNum - 1 });
            } else {
              handleSearch();
            }
            message.success(`${intl.formatMessage({ id: 'modelList.delete.success' })}`);
          } else {
            message.error(
              `${intl.formatMessage({ id: 'modelList.delete.error' })}${error.msg}` ||
                `${intl.formatMessage({ id: 'xxx' })}`,
            );
          }
        });
      },
      onCancel() {
        // console.log('Cancel');
      },
    });
  };

  const createModel = (item) => {
    history.push('/ModelMngt/CreateModel');
  };

  const onSearchName = (name) => {
    setPageParams({ ...pageParams, ...{ pageNum: 1 } });
    setFormValues({ name });
  };

  const onRefresh = () => {
    setPageParams({ ...pageParams, ...{ pageNum: 1 } });
    const name = searchEl.current.value;
    setFormValues({ name });
  };

  return (
    <>
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
            <Button type="primary" onClick={createModel}>
              {intl.formatMessage({ id: 'myModels.list.add.createModel' })}
            </Button>
            <div
              style={{
                float: 'right',
                paddingRight: '20px',
              }}
            >
              <Search
                style={{ width: '200px', marginRight: '20px' }}
                placeholder={intl.formatMessage({ id: 'myModels.list.placeholder.search' })}
                onSearch={onSearchName}
                enterButton
                ref={searchEl}
              />
              <Button icon={<SyncOutlined />} onClick={onRefresh}></Button>
            </div>
          </div>
          <Table
            columns={columns}
            dataSource={data.list}
            rowKey="id"
            onChange={onSortChange}
            pagination={{
              total: data.pagination.total,
              showQuickJumper: true,
              showTotal: (total) =>
                `${intl.formatMessage({
                  id: 'myModelsList.table.pagination.showTotal.prefix',
                })} ${total} ${intl.formatMessage({
                  id: 'myModelsList.table.pagination.showTotal.suffix',
                })}`,
              showSizeChanger: true,
              onChange: pageParamsChange,
              onShowSizeChange: pageParamsChange,
              current: pageParams.pageNum,
              pageSize: pageParams.pageSize,
            }}
            loading={loading}
          />
        </Card>
      </PageHeaderWrapper>

      {visible && (
        <ModalForm
          current={current}
          visible={visible}
          onCancel={handleCancel}
          onSubmit={handleSubmit}
        />
      )}
    </>
  );
};

export default connect(({ modelList, loading }) => ({
  modelList,
  loading: loading.models.modelList,
}))(ModelList);
