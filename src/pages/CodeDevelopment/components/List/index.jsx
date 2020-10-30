import React, { useState, useEffect, useRef } from 'react';
import { history } from 'umi';
import { Table, Select, Space, Button, Row, Col, Input, message, Modal, Form } from 'antd';
import { SyncOutlined } from '@ant-design/icons';
import {
  getCodes,
  stopCode,
  deleteCode,
  getJupyterUrl,
  getCodeCount,
  createSaveImage,
} from '../../service.js';
import moment from 'moment';
import { isEmptyString } from '../../util.js';
import CodeUpload from '../UpLoad';
import {
  statusMap,
  canOpenStatus,
  canStopStatus,
  canUploadStatus,
  sortColumnMap,
  sortTextMap,
  pageObj,
} from '../../serviceController.js';
import { getNameFromDockerImage } from '@/utils/reg.js';
import { connect } from 'dva';
import useInterval from '@/hooks/useInterval';
import FormItem from 'antd/lib/form/FormItem';
import { checkIfCanDelete } from '@/utils/utils.js';
import { jobNameReg } from '@/utils/reg';
import { useIntl } from 'umi';

const { Search } = Input;
const { Option } = Select;

const CodeList = (props) => {
  const intl = useIntl();
  const searchRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const [form] = Form.useForm();
  const [codes, setCodes] = useState({ codeEnvs: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [pageParams, setPageParams] = useState(pageObj); // 页长
  const [statusSearchArr, setStatusSearchArr] = useState([]);
  const [curStatus, setCurStatus] = useState('');
  const [searchObj, setSearchObj] = useState({});
  const [modalFlag, setModalFlag] = useState(false);
  const [modalData, setModalData] = useState({});
  const [currentHandledJobId, setCurrentHandledJobId] = useState('');
  const [saveImageModalVisible, setSaveImageModalVisible] = useState(false);
  const [saveImageButtonLoading, setSaveImageButtonLoading] = useState(false);
  const [sortInfo, setSortInfo] = useState({
    orderBy: '',
    order: '',
  });

  const renderStatusSelect = async (type = 'init') => {
    const apiData = await apiGetCodeCount();
    if (!apiData) return;
    switch (type) {
      case 'init':
        setStatusSearchArr(apiData);
        setCurStatus(apiData[0]?.status);
        break;
      case 'update':
        setStatusSearchArr(apiData);
        break;
    }
  };

  const renderTable = async (type = 'init', options) => {
    let params;
    let apiData;
    let needLoading = true;
    // 构造参数传递，必需参数pageParams、status，可选参数searchWord、orderBy、order
    params = { ...pageParams, status: curStatus };
    switch (type) {
      case 'init':
        setLoading(true);
        params = { ...params, ...pageObj, status: 'all' };
        break;
      case 'sort':
        params['orderBy'] = sortColumnMap[sortInfo.orderBy];
        params['order'] = sortTextMap[sortInfo.order];
        if (!isEmptyString(searchObj.word)) {
          params['searchWord'] = searchObj.word;
        }
      case 'interval':
        needLoading = false;
        // 根据当前参数刷新
        if (!isEmptyString(searchObj.word)) {
          params['searchWord'] = searchObj.word;
        }
        if (sortInfo.order && !isEmptyString(sortInfo.orderBy) && !isEmptyString(sortInfo.order)) {
          params['orderBy'] = sortColumnMap[sortInfo.orderBy];
          params['order'] = sortTextMap[sortInfo.order];
        }
        break;
      case 'deleteItem':
        needLoading = false;
        if (!isEmptyString(searchObj.word)) {
          params['searchWord'] = searchObj.word;
        }
        if (sortInfo.order && !isEmptyString(sortInfo.orderBy) && !isEmptyString(sortInfo.order)) {
          params['orderBy'] = sortColumnMap[sortInfo.orderBy];
          params['order'] = sortTextMap[sortInfo.order];
        }
        // 修正最后一页
        if (codes.codeEnvs.length == 1 && pageParams.pageNum > 1) {
          params['pageNum'] = pageParams.pageNum - 1;
        }
        break;
      case 'statusChange':
        console.log('statusChange renderTable');
        setLoading(true);
        if (!isEmptyString(searchObj.word)) {
          params['searchWord'] = searchObj.word;
        }
        // 修正，回到第一页
        params = { ...params, ...pageObj };
        break;
      case 'search':
        setLoading(true);
        params['searchWord'] = searchObj.word;
        break;
      case 'pageChange':
      case 'fresh':
        console.log('pageChange renderTable');
        setLoading(true);
        if (!isEmptyString(searchObj.word)) {
          params['searchWord'] = searchObj.word;
        }
        if (sortInfo.order && !isEmptyString(sortInfo.orderBy) && !isEmptyString(sortInfo.order)) {
          params['orderBy'] = sortColumnMap[sortInfo.orderBy];
          params['order'] = sortTextMap[sortInfo.order];
        }
        break;
    }
    apiData = await apiGetCodes(params);
    if (apiData) {
      setCodes({
        codeEnvs: apiData.CodeEnvs,
        total: apiData.total,
      });
      if (options?.callback) {
        options.callback();
      }
    }
    if (needLoading) setLoading(false);
  };

  const apiGetCodeCount = async () => {
    const obj = await getCodeCount();
    const { code, data, msg } = obj;
    if (code === 0) {
      return data;
    } else {
      return null;
    }
  };

  const apiGetCodes = async (params) => {
    const obj = await getCodes(params);
    const { code, data, msg } = obj;
    if (code === 0) {
      return data;
    } else {
      return null;
    }
  };

  const apiOpenJupyter = async (id) => {
    const { code, data, msg } = await getJupyterUrl(id);
    if (code === 0) {
      if (data.name === 'ipython' && data.status === 'running' && data.accessPoint) {
        window.open(data.accessPoint);
      } else {
        message.info(intl.formatMessage({ id: 'codeList.tips.open.error' }));
      }
    }
  };

  const apiStopCode = async (id) => {
    const obj = await stopCode(id);
    const { code, data, msg } = obj;
    if (code === 0) {
      renderTable('update');
      message.success(intl.formatMessage({ id: 'codeList.tips.stop.success' }));
    }
  };

  const apiDeleteCode = async (id) => {
    const obj = await deleteCode(id);
    const { code, data, msg } = obj;
    if (code === 0) {
      renderTable('deleteItem');
      if (codes.codeEnvs.length == 1 && pageParams.pageNum > 1) {
        // 冗余请求，因为修正分页参数，导致触发监听拉取新数据
        setPageParams({ ...pageParams, pageNum: pageParams.pageNum - 1 });
      }
      renderStatusSelect('update');
      message.success(intl.formatMessage({ id: 'codeList.tips.delete.success' }));
    }
  };

  const handleOpen = (item) => {
    apiOpenJupyter(item.id);
  };

  const handleStop = (item) => {
    apiStopCode(item.id);
  };

  const handleDelete = (item) => {
    const status = item.status;
    if (canStopStatus.has(status)) {
      Modal.warning({
        title: intl.formatMessage({ id: 'codeList.tips.delete.modal.title' }),
        content: intl.formatMessage({ id: 'codeList.tips.delete.modal.content' }),
        okText: intl.formatMessage({ id: 'codeList.tips.delete.modal.okText' }),
      });
    } else {
      apiDeleteCode(item.id);
    }
  };

  const handleSelectChange = (selectStatus) => {
    setCurStatus(selectStatus);
  };

  const handleSearch = (searchWord) => {
    setSearchObj({ type: 'search', word: searchWord });
  };

  const handleFresh = () => {
    const value = searchRef.current.state.value;
    setSearchObj({ type: 'fresh', word: value });
  };

  const handlePageParamsChange = (pageNum, pageSize) => {
    setPageParams({ pageNum, pageSize });
  };

  const handleOpenModal = (codeItem) => {
    setModalData(codeItem);
    setModalFlag(true);
  };

  const handleSortChange = (pagination, filters, sorter) => {
    const { field: orderBy, order } = sorter;
    setSortInfo({ orderBy, order });
  };

  const handleCreateCodeDev = () => {
    history.push('/codeDevelopment/add');
  };

  const commonLayout = {
    labelCol: { span: 5 },
    wrapperCol: { span: 12 },
  };

  const toSaveImage = (id) => {
    setSaveImageModalVisible(true);
    setCurrentHandledJobId(id);
  };

  const columns = [
    {
      title: intl.formatMessage({ id: 'codeList.table.column.name' }),
      dataIndex: 'name',
      ellipsis: true,
      width: '12%',
      sorter: true,
      sortOrder: sortInfo.orderBy === 'name' && sortInfo['order'], // name与createTime非复合排序，各自独立排序
    },
    {
      title: intl.formatMessage({ id: 'codeList.table.column.status' }),
      dataIndex: 'status',
      ellipsis: true,
      width: '10%',
      render: (status) => statusMap[status]?.local,
    },
    {
      title: intl.formatMessage({ id: 'codeList.table.column.engineType' }),
      dataIndex: 'engine',
      ellipsis: true,
      width: '10%',
      render(value) {
        return <div>{getNameFromDockerImage(value)}</div>;
      },
    },
    {
      title: intl.formatMessage({ id: 'codeList.table.column.createTime' }),
      dataIndex: 'createTime',
      render: (text) => moment(text).format('YYYY-MM-DD HH:mm:ss'),
      ellipsis: true,
      width: '12%',
      sorter: true,
      sortOrder: sortInfo.orderBy === 'createTime' && sortInfo['order'],
    },
    {
      title: intl.formatMessage({ id: 'codeList.table.column.storePath' }),
      dataIndex: 'codePath',
      ellipsis: true,
      width: '12%',
    },
    {
      title: intl.formatMessage({ id: 'codeList.table.column.description' }),
      dataIndex: 'desc',
      ellipsis: true,
      align: 'center',
      width: '14%',
    },
    {
      title: intl.formatMessage({ id: 'codeList.table.column.action' }),
      align: 'center',
      width: '20%',
      render: (codeItem) => {
        return (
          <Space size="middle">
            <a onClick={() => handleOpen(codeItem)} disabled={!canOpenStatus.has(codeItem.status)}>
              {intl.formatMessage({ id: 'codeList.table.column.action.open' })}
            </a>
            <a
              onClick={() => handleOpenModal(codeItem)}
              disabled={!canUploadStatus.has(codeItem.status)}
            >
              {intl.formatMessage({ id: 'codeList.table.column.action.upload' })}
            </a>
            <a
              onClick={() => handleStop(codeItem)}
              disabled={!canStopStatus.has(codeItem.status)}
              style={canStopStatus.has(codeItem.status) ? { color: '#1890ff' } : {}}
            >
              {intl.formatMessage({ id: 'codeList.table.column.action.stop' })}
            </a>
            {checkIfCanDelete(codeItem.status) ? (
              <a onClick={() => handleDelete(codeItem)} style={{ color: 'red' }}>
                {intl.formatMessage({ id: 'codeList.table.column.action.delete' })}
              </a>
            ) : (
              <span style={{ color: '#333' }}>
                {intl.formatMessage({ id: 'codeList.table.column.action.delete' })}
              </span>
            )}

            {codeItem.status === 'running' && (
              <a onClick={() => toSaveImage(codeItem.id)}>
                {intl.formatMessage({ id: 'codeList.table.column.action.save' })}
              </a>
            )}
          </Space>
        );
      },
    },
  ];

  useInterval(async () => {
    renderStatusSelect('update');
    renderTable('interval');
  }, props.common.interval);

  useEffect(() => {
    setIsReady(true);
    renderStatusSelect('init');
    renderTable('init');
    return () => {
      getCodes.cancel && getCodes.cancel();
      getCodeCount.cancel && getCodeCount.cancel();
    };
  }, []);

  useEffect(() => {
    if (isReady) {
      renderTable('pageChange');
    }
  }, [pageParams]);

  useEffect(() => {
    if (isReady) {
      renderTable('sort');
    }
  }, [sortInfo]);

  useEffect(() => {
    if (isReady) {
      setPageParams(pageObj); // 冗余请求
      renderTable('statusChange');
    }
  }, [curStatus]);

  useEffect(() => {
    if (isReady) {
      if (searchObj.type != undefined) {
        const type = searchObj.type;
        if (type === 'search') {
          renderTable('search');
        } else if (type === 'fresh') {
          renderTable('fresh', {
            callback: () => {
              message.success(intl.formatMessage({ id: 'codeList.tips.fresh.success' }));
            },
          });
        }
      }
    }
  }, [searchObj]);

  const handleSaveImage = async () => {
    if (currentHandledJobId) {
      const values = await form.validateFields();
      values.isPrivate = true;
      values.jobId = currentHandledJobId;
      const cancel = message.loading('Submitting', 12000);
      setSaveImageButtonLoading(true);
      const res = await createSaveImage(values);
      if (res.code === 0) {
        renderTable();
        cancel();
        setSaveImageButtonLoading(false);
        message.success(intl.formatMessage({ id: 'codeList.tips.saveImage.success' }));
        setSaveImageModalVisible(false);
      }
    }
  };

  return (
    <>
      <Row style={{ marginBottom: '20px' }}>
        <Col span={12}>
          <div style={{ float: 'left' }}>
            <Button
              type="primary"
              onClick={() => {
                handleCreateCodeDev();
              }}
            >
              {intl.formatMessage({ id: 'codeList.add.codeDevelopment' })}
            </Button>
          </div>
        </Col>
        <Col span={12}>
          <div style={{ float: 'right' }}>
            <div style={{ width: '200px', display: 'inline-block' }}>
              <Select
                value={curStatus}
                style={{ width: 'calc(100% - 8px)', margin: '0 8px 0 0' }}
                onChange={(item) => handleSelectChange(item)}
              >
                {statusSearchArr.map((item, key) => (
                  <Option key={key} value={item.status}>
                    {item.desc}
                  </Option>
                ))}
              </Select>
            </div>
            <Search
              placeholder={intl.formatMessage({ id: 'codeList.placeholder.search' })}
              ref={searchRef}
              onSearch={(value) => handleSearch(value)}
              // onChange
              style={{ width: 210 }}
              enterButton
            />
            <Button
              onClick={() => handleFresh()}
              icon={<SyncOutlined />}
              style={{ marginLeft: '3px' }}
            />
          </div>
        </Col>
      </Row>
      <Table
        dataSource={codes.codeEnvs}
        columns={columns}
        onChange={handleSortChange}
        rowKey={(r) => r.id}
        pagination={{
          total: codes.total,
          showTotal: (total) =>
            `${intl.formatMessage({
              id: 'codeList.table.pagination.showTotal.prefix',
            })} ${total} ${intl.formatMessage({
              id: 'codeList.table.pagination.showTotal.suffix',
            })}`,
          showQuickJumper: true,
          showSizeChanger: true,
          onChange: handlePageParamsChange,
          onShowSizeChange: handlePageParamsChange,
          current: pageParams.pageNum,
        }}
        loading={loading}
      />
      {modalFlag && (
        <Modal
          title={intl.formatMessage({ id: 'codeList.modal.upload.title.uploadCode' })}
          visible={modalFlag}
          onCancel={() => setModalFlag(false)}
          destroyOnClose
          maskClosable={false}
          width={480}
          footer={[
            <Button onClick={() => setModalFlag(false)}>
              {intl.formatMessage({ id: 'codeList.modal.upload.footer.close' })}
            </Button>,
          ]}
        >
          <CodeUpload modalData={modalData}></CodeUpload>
        </Modal>
      )}
      <Modal
        title={intl.formatMessage({ id: 'codeList.modal.saveImage.title.saveImage' })}
        visible={saveImageModalVisible}
        onCancel={() => {
          setSaveImageModalVisible(false);
          setCurrentHandledJobId('');
        }}
        footer={[
          <Button key="back" onClick={() => {setSaveImageModalVisible(false);setCurrentHandledJobId('');}}>
            {intl.formatMessage({ id: 'codeList.modal.saveImage.footer.cancel' })}
          </Button>,
          <Button key="submit" type="primary" loading={saveImageButtonLoading} onClick={() => handleSaveImage()}>
            {intl.formatMessage({ id: 'codeList.modal.saveImage.footer.ok' })}
          </Button>,
        ]}
      >
        <Form form={form}>
          <Form.Item
            {...commonLayout}
            label={intl.formatMessage({ id: 'codeList.modal.saveImage.label.name' })}
            name="name"
            rules={[{ required: true }, jobNameReg]}
          >
            <Input style={{ width: '280px' }} />
          </Form.Item>
          <Form.Item
            {...commonLayout}
            label={intl.formatMessage({ id: 'codeList.modal.saveImage.label.version' })}
            name="version"
            rules={[
              { required: true },
              { pattern: /^[A-Za-z0-9|\.]+$/, message: '只允许数字，英文字母和小数点' },
            ]}
          >
            <Input style={{ width: '280px' }} />
          </Form.Item>
          <Form.Item
            {...commonLayout}
            label={intl.formatMessage({ id: 'codeList.modal.saveImage.label.description' })}
            name="description"
            rules={[{ required: true }]}
          >
            <Input style={{ width: '280px' }} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default connect(({ common }) => ({ common }))(CodeList);
