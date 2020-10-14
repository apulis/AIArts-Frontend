import { message, Table, Modal, Form, Input, Button, Card } from 'antd';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import React, { useState, useEffect, useRef } from 'react';
import { getDatasets, edit, deleteDataSet, add, download } from './service';
import { PAGEPARAMS, sortText } from '@/utils/const';
import styles from './index.less';
import { Link } from 'umi';
import AddModalForm from './components/AddModalForm';
import { ExclamationCircleOutlined, SyncOutlined } from '@ant-design/icons';
import moment from 'moment';
import { useIntl } from 'umi';

const { confirm } = Modal;
const { Search } = Input;

const DataSetList = () => {
  const intl = useIntl();
  const [dataSets, setDataSets] = useState({ data: [], total: 0 });
  const [editData, setEditData] = useState({});
  const [modalFlag, setModalFlag] = useState(false);
  const [modalType, setModalType] = useState(0);
  const [pageParams, setPageParams] = useState(PAGEPARAMS);
  const [btnDisabled, setBtnDisabled] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);
  const [pathId, setPathId] = useState(0);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const addModalFormRef = useRef();
  const [sortedInfo, setSortedInfo] = useState({
    orderBy: '',
    order: '',
  });

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
    };
    const { code, data } = await getDatasets(params);
    if (code === 0 && data) {
      const { total, datasets } = data;
      setDataSets({
        data: datasets,
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

  const onSubmit = () => {
    addModalFormRef.current.form.validateFields().then(async (values) => {
      let res = null,
        text = '';
      const { sourceType, path, fileLists } = values;
      setBtnLoading(true);
      if (modalType) {
        text = '编辑';
        res = await edit(editData.id, values);
      } else {
        values.path = sourceType === 1 ? fileLists[0].response.data.path : path;
        delete values.fileLists;
        delete values.sourceType;
        text = '新增';
        res = await add(values);
      }
      const { code } = res;
      if (code === 0) {
        getData();
        message.success(`${text}成功！`);
        setModalFlag(false);
      }
      setBtnLoading(false);
    });
  };

  const columns = [
    {
      title: intl.formatMessage({ id: 'dataSetList.table.column.name' }),
      key: 'name',
      sorter: true,
      sortOrder: sortedInfo.columnKey === 'name' && sortedInfo.order,
      render: (item) => (
        <Link to={{ pathname: '/dataManage/dataSet/detail', query: { id: item.id } }}>
          {item.name}
        </Link>
      ),
    },
    {
      title: intl.formatMessage({ id: 'dataSetList.table.column.description' }),
      dataIndex: 'description',
      ellipsis: true,
      width: 350,
    },
    {
      title: intl.formatMessage({ id: 'dataSetList.table.column.creator' }),
      dataIndex: 'creator',
    },
    {
      title: intl.formatMessage({ id: 'dataSetList.table.column.updatedAt' }),
      key: 'updatedAt',
      dataIndex: 'updatedAt',
      sorter: true,
      sortOrder: sortedInfo.columnKey === 'updatedAt' && sortedInfo.order,
      render: (text) => moment(text).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: intl.formatMessage({ id: 'dataSetList.table.column.version' }),
      dataIndex: 'version',
    },
    {
      title: intl.formatMessage({ id: 'dataSetList.table.column.isTranslated' }),
      dataIndex: 'isTranslated',
      render: (i) => <span>{i === true ? '是' : '否'}</span>,
    },
    {
      title: intl.formatMessage({ id: 'dataSetList.table.column.action' }),
      render: (item) => {
        const { id } = item;
        return (
          <>
            <a onClick={() => onEditClick(item)}>
              {intl.formatMessage({ id: 'dataSetList.table.column.action.edit' })}
            </a>
            <a
              style={{ margin: '0 16px' }}
              onClick={() => window.open(`/ai_arts/api/files/download/dataset/${id}`)}
            >
              {intl.formatMessage({ id: 'dataSetList.table.column.action.download' })}
            </a>
            <a style={{ color: 'red' }} onClick={() => onDelete(id)}>
              {intl.formatMessage({ id: 'dataSetList.table.column.action.delete' })}
            </a>
          </>
        );
      },
    },
  ];

  const onEditClick = (item) => {
    setEditData(item);
    showModal(1);
  };

  const onDelete = (id) => {
    confirm({
      title: '确定要删除该数据集吗？',
      icon: <ExclamationCircleOutlined />,
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        const { code } = await deleteDataSet(id);
        if (code === 0) {
          // 若删除的是当前页最后一项，且页数不是第一页，则将页数减一
          if (dataSets.data.length == 1 && pageParams.pageNum > 1) {
            setPageParams({ ...pageParams, pageNum: pageParams.pageNum - 1 });
          } else {
            getData();
          }
          message.success('删除成功！');
        }
      },
      onCancel() {},
    });
  };

  const showModal = (type) => {
    setModalType(type);
    !type && setPathId(new Date().valueOf());
    setModalFlag(true);
  };

  return (
    <PageHeaderWrapper>
      <Card>
        <div className={styles.datasetWrap}>
          <Button type="primary" style={{ marginBottom: 16 }} onClick={() => showModal(0)}>
            {intl.formatMessage({ id: 'dataSet.list.add.dataSet' })}
          </Button>
          <div className={styles.searchWrap}>
            <Search
              placeholder={intl.formatMessage({ id: 'dataSet.list.placeholder.search' })}
              enterButton
              onSearch={() => setPageParams({ ...pageParams, pageNum: 1 })}
              onChange={(e) => setName(e.target.value)}
            />
            <Button onClick={() => getData('刷新成功！')} icon={<SyncOutlined />} />
          </div>
          <Table
            columns={columns}
            dataSource={dataSets.data}
            rowKey={(r) => r.id}
            onChange={onSortChange}
            pagination={{
              total: dataSets.total,
              showQuickJumper: true,
              showTotal: (total) =>
                `${intl.formatMessage({
                  id: 'dataSetList.table.pagination.showTotal.prefix',
                })} ${total} ${intl.formatMessage({
                  id: 'dataSetList.table.pagination.showTotal.suffix',
                })}`,
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
      {modalFlag && (
        <Modal
          title={`${
            modalType
              ? intl.formatMessage({ id: 'dataSet.list.modal.title.edit' })
              : intl.formatMessage({ id: 'dataSet.list.modal.title.add' })
          } ${intl.formatMessage({ id: 'dataSet.list.modal.title.dataSet' })}`}
          visible={modalFlag}
          onCancel={() => setModalFlag(false)}
          destroyOnClose
          maskClosable={false}
          width={600}
          className={styles.dataSetModal}
          footer={[
            <Button onClick={() => setModalFlag(false)}>
              {intl.formatMessage({ id: 'dataSetCreate.cancel' })}
            </Button>,
            <Button type="primary" disabled={btnDisabled} loading={btnLoading} onClick={onSubmit}>
              {intl.formatMessage({ id: 'dataSetCreate.submit' })}
            </Button>,
          ]}
        >
          <AddModalForm
            ref={addModalFormRef}
            setBtn={setBtnDisabled}
            modalType={modalType}
            editData={editData}
            pathId={pathId}
          />
        </Modal>
      )}
    </PageHeaderWrapper>
  );
};

export default DataSetList;
