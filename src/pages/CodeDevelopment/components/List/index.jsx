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

const { Search } = Input;
const { Option } = Select;

const CodeList = (props) => {
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
        message.info('服务正在准备中，请稍候再试');
      }
    }
  };

  const apiStopCode = async (id) => {
    const obj = await stopCode(id);
    const { code, data, msg } = obj;
    if (code === 0) {
      renderTable('update');
      message.success('停止成功');
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
      message.success('删除成功');
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
        title: '当前任务尚未停止',
        content: '请先停止该任务',
        okText: '确定',
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
    labelCol: { span: 4 },
    wrapperCol: { span: 12 },
  };

  const toSaveImage = (id) => {
    setSaveImageModalVisible(true);
    setCurrentHandledJobId(id);
  };

  const columns = [
    {
      title: '开发环境名称',
      dataIndex: 'name',
      ellipsis: true,
      sorter: true,
      sortOrder: sortInfo.orderBy === 'name' && sortInfo['order'], // name与createTime非复合排序，各自独立排序
    },
    {
      title: '状态',
      dataIndex: 'status',
      ellipsis: true,
      width: '80px',
      render: (status) => statusMap[status]?.local,
    },
    {
      title: '引擎类型',
      dataIndex: 'engine',
      ellipsis: true,
      render(value) {
        return <div>{getNameFromDockerImage(value)}</div>;
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      render: (text) => moment(text).format('YYYY-MM-DD HH:mm:ss'),
      ellipsis: true,
      sorter: true,
      sortOrder: sortInfo.orderBy === 'createTime' && sortInfo['order'],
    },
    {
      title: '代码存储目录',
      dataIndex: 'codePath',
      ellipsis: true,
      width: '120px',
    },
    {
      title: '描述',
      dataIndex: 'desc',
      ellipsis: true,
    },
    {
      title: '操作',
      align: 'center',
      render: (codeItem) => {
        return (
          <Space size="middle">
            <a onClick={() => handleOpen(codeItem)} disabled={!canOpenStatus.has(codeItem.status)}>
              打开
            </a>
            <a
              onClick={() => handleOpenModal(codeItem)}
              disabled={!canUploadStatus.has(codeItem.status)}
            >
              上传代码
            </a>
            <a
              onClick={() => handleStop(codeItem)}
              disabled={!canStopStatus.has(codeItem.status)}
              style={canStopStatus.has(codeItem.status) ? { color: '#1890ff' } : {}}
            >
              停止
            </a>
            {checkIfCanDelete(codeItem.status) ? (
              <a onClick={() => handleDelete(codeItem)} style={{ color: 'red' }}>
                删除
              </a>
            ) : (
              <span style={{ color: '#333' }}>删除</span>
            )}

            {codeItem.status === 'running' && (
              <a onClick={() => toSaveImage(codeItem.id)}>保存镜像</a>
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
              message.success('刷新成功');
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
      const res = await createSaveImage(values);
      if (res.code === 0) {
        renderTable();
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
              创建开发环境
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
              placeholder="输入开发环境名称查询"
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
          showTotal: (total) => `总共 ${total} 条`,
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
          title="上传代码"
          visible={modalFlag}
          onCancel={() => setModalFlag(false)}
          destroyOnClose
          maskClosable={false}
          width={480}
          footer={[<Button onClick={() => setModalFlag(false)}>关闭</Button>]}
        >
          <CodeUpload modalData={modalData}></CodeUpload>
        </Modal>
      )}
      <Modal
        title="保存镜像"
        visible={saveImageModalVisible}
        onCancel={() => {
          setSaveImageModalVisible(false);
          setCurrentHandledJobId('');
        }}
        onOk={() => {
          handleSaveImage();
        }}
      >
        <Form form={form}>
          <Form.Item {...commonLayout} label="名称" name="name" rules={[{ required: true }]}>
            <Input style={{ width: '280px' }} />
          </Form.Item>
          <Form.Item {...commonLayout} label="版本" name="version" rules={[{ required: true }]}>
            <Input style={{ width: '280px' }} />
          </Form.Item>
          <Form.Item {...commonLayout} label="描述" name="description" rules={[{ required: true }]}>
            <Input style={{ width: '280px' }} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default connect(({ common }) => ({ common }))(CodeList);
