import React, { useState, useEffect, useRef } from 'react';
import { history, useIntl } from 'umi';
import { Table, Select, Space, Row, Col, Input, message, Modal, Form, Dropdown, Menu, Typography, Popover, InputNumber, Tooltip } from 'antd';
import { CopyToClipboard } from 'react-copy-to-clipboard';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { SyncOutlined, DownOutlined, LoadingOutlined, InfoCircleOutlined } from '@ant-design/icons';
import moment from 'moment';
import { getNameFromDockerImage , jobNameReg } from '@/utils/reg.js';
import { connect } from 'dva';
import useInterval from '@/hooks/useInterval';
import FormItem from 'antd/lib/form/FormItem';
import { checkIfCanDelete, checkIfCanPause, checkIfCanResume, checkIfCanStop } from '@/utils/utils.js';

import Button from '@/components/locales/Button';
import JobStatusToolTip from '@/components/JobStatusToolTip/index';
import CodeUpload from '../UpLoad';
import { isEmptyString } from '../../util.js';
import {
  statusMap,
  canOpenStatus,
  canStopStatus,
  sortColumnMap,
  sortTextMap,
  pageObj,
} from '../../serviceController.js';
import {
  getCodes,
  stopCode,
  deleteCode,
  getJupyterUrl,
  getCodeCount,
  fetchSSHInfo,
  createSaveImage,
  pauseJob,
  resumeJob,
  addEndpointForJob
} from '../../service.js';
import { format } from 'prettier';

const { Search } = Input;
const { Option } = Select;

const CodeList = (props) => {
  const { formatMessage } = useIntl();
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
  const [currentHandledJob, setCurrentHandledJob] = useState(undefined);
  const [saveImageModalVisible, setSaveImageModalVisible] = useState(false);
  const [saveImageButtonLoading, setSaveImageButtonLoading] = useState(false);
  const [sshInfo, setSshInfo] = useState({});
  const [sshCommond, setSshCommond] = useState('');
  const [enableDirectoryUpload, setEnableDirectoryUpload] = useState(false);
  const [sortInfo, setSortInfo] = useState({
    orderBy: '',
    order: '',
  });
  const [endpointsModalVisible, setEndpointsModalVisible] = useState(false);
  const [interactiveEndpoints, setInteractiveEndpoints] = useState([]);
  const [interactiveEndpointsTableLoading, setInteractiveEndpointsTableLoading] = useState(false);
  const [sshModalVisible, setSshModalVisible] = useState(false);

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
    const obj = await getCodeCount(props.vc.currentSelectedVC);
    const { code, data, msg } = obj;
    if (code === 0) {
      return data;
    } else {
      return null;
    }
  };

  const apiGetCodes = async (params) => {
    const obj = await getCodes({ ...params, vcName: props.vc.currentSelectedVC });
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
      } else if (data.name === '' && data.status === '') {
        message.info(formatMessage({ id: 'codeList.tips.open.none' }))
      } else {
        message.info(formatMessage({ id: 'codeList.tips.open.error' }));
      }
    }
  };

  const apiStopCode = async (id) => {
    const obj = await stopCode(id);
    const { code, data, msg } = obj;
    if (code === 0) {
      renderTable('update');
      message.success(formatMessage({ id: 'codeList.tips.stop.success' }));
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
      message.success(formatMessage({ id: 'codeList.tips.delete.success' }));
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
        title: formatMessage({ id: 'codeList.tips.delete.modal.title' }),
        content: formatMessage({ id: 'codeList.tips.delete.modal.content' }),
        okText: formatMessage({ id: 'codeList.tips.delete.modal.okText' }),
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

  const handleOpenUploadModal = (codeItem, directory) => {
    setModalData(codeItem);
    setModalFlag(true);
    setEnableDirectoryUpload(directory);
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

  const handleSshPopoverVisible = async (visible, currentHandledJobId) => {
    if (visible) {
      setSshModalVisible(true);
      const res = await fetchSSHInfo(currentHandledJobId);
      if (res.code === 0) {
        const sshInfo = res.data.endpointsInfo.find(val => val.name === 'ssh');
        const identityFile = res.data.identityFile;
        setSshInfo(sshInfo);
        if (sshInfo) {
          const { status } = sshInfo;
          if (status === 'running') {
            const host = `${sshInfo['nodeName']}.${sshInfo['domain']}`;
            const command = `ssh -i ${identityFile} -p ${sshInfo['port']} ${sshInfo['username']}@${host}` + ` [Password: ${sshInfo['password'] ? sshInfo['password'] : ''}]`
            setSshCommond(command);
          }

        }
      }
    } else {
      setSshModalVisible(false);
      setSshCommond('');
      setSshInfo({});
    }
  }

  const startSSH = (id, status) => {
    if (status !== 'running') {
      message.warn(formatMessage({ id: 'codeList.tips.open.error' }))
      return;
    }
    handleSshPopoverVisible(true, id)
    setSshModalVisible(true);
    setCurrentHandledJobId(id);
  }

  const handlePauseJob = async (job) => {
    const res = await pauseJob(job.id);
    if (res.code === 0) {
      message.success(formatMessage({ id: 'codeList.tips.pause.success' }));
      renderTable('update');
    }
  }

  const handleResumeJob = async (job) => {
    const res = await resumeJob(job.id);
    if (res.code === 0) {
      message.success(formatMessage({ id: 'codeList.tips.resume.success' }));
      renderTable('update');
    }
  }

  const { jobMaxTimeSecond } = props.vc;

  const columns = [
    {
      title: formatMessage({ id: 'codeList.table.column.name' }),
      dataIndex: 'name',
      ellipsis: true,
      width: '5%',
      sorter: true,
      sortOrder: sortInfo.orderBy === 'name' && sortInfo['order'], // name与createTime非复合排序，各自独立排序
    },
    {
      title: formatMessage({ id: 'codeList.table.column.status' }),
      dataIndex: 'status',
      ellipsis: true,
      width: '5%',
      render: (status, item) => {
        return <div style={{ display: 'flex', alignItems: 'center' }}>
          {statusMap[status]?.local}
          <JobStatusToolTip jobDetail={item} />
        </div>
      },
    },
    {
      title: formatMessage({ id: 'codeList.table.column.engineType' }),
      dataIndex: 'engine',
      ellipsis: true,
      width: '11%',
      render(value) {
        return <div>{getNameFromDockerImage(value)}</div>;
      },
    },
    {
      title: formatMessage({ id: 'codeList.table.column.createTime' }),
      dataIndex: 'createTime',
      render: (text) => moment(text).format('YYYY-MM-DD HH:mm:ss'),
      ellipsis: true,
      width: '10%',
      sorter: true,
      sortOrder: sortInfo.orderBy === 'createTime' && sortInfo['order'],
    },
    {
      title: formatMessage({ id: 'job.rest.time' }),
      render: (text, item) => {
        const status = item.status || item.jobStatus;
        const lastedTime = item.duration;
        if (status === 'running') {
          if (!jobMaxTimeSecond) {
            return '-';
          }
          const restTime = Math.floor((jobMaxTimeSecond - lastedTime) / 60);
          return restTime + formatMessage({ id: 'job.rest.minute' });
        }
        return '-';
      },
      ellipsis: true,
      width: '7%',
    },
    {
      // title: formatMessage({ id: 'codeList.table.column.storePath' }) + ' / ' + formatMessage({ id: 'codeList.table.column.cmd' }),
      title: formatMessage({ id: 'codeList.table.column.storePath' }),
      dataIndex: 'codePath',
      ellipsis: true,
      width: '10%',
      render(_text, item) {
        if (item.codePath) {
          return <Tooltip title={item.codePath}>
            {item.codePath}
          </Tooltip>
        }
        return item.cmd;
      }
    },
    {
      title: formatMessage({ id: 'codeList.table.column.description' }),
      dataIndex: 'desc',
      ellipsis: true,
      align: 'center',
      width: '5%',
      render(text) {
        return text || '-';
      }
    },
    {
      title: '是否 Privilege Job',
      dataIndex: 'isPrivileged',
      width: '7%',
      render(isPrivileged) {
        return isPrivileged ? '是' : '否'
      }
    },
    {
      title: formatMessage({ id: 'codeList.table.column.action' }),
      align: 'center',
      width: '20%',
      render: (codeItem) => {
        return (
          <Space size="middle">
            <>
              <Button
                type="link"
                disabled={!canOpenStatus.has(codeItem.status)}
                disableUpperCase
                onClick={() => startSSH(codeItem.id, codeItem.status)}
              >SSH</Button>
              <a onClick={() => handleOpen(codeItem)} disabled={!canOpenStatus.has(codeItem.status)}>
                {formatMessage({ id: 'codeList.table.column.action.open.jupyter' })}
              </a>
              <Button type="link" disabled={codeItem.status !== 'running'} onClick={() => {setCurrentHandledJob(codeItem)}}>使用交互式端口</Button>
              {/* <Dropdown disabled={!canUploadStatus.has(codeItem.status)} overlay={<Menu> */}
              {/* <Menu.Item> */}
              <Button disabled={codeItem.status !== 'running'} type="link" onClick={() => handleOpenUploadModal(codeItem, false)}>
                {formatMessage({ id: 'codeList.table.column.action.upload.file' })}
              </Button>
              {/* </Menu.Item> */}
              {/* <Menu.Item>
                  <Button type="link" onClick={() => handleOpenUploadModal(codeItem, true)}>
                    {formatMessage({ id: 'codeList.table.column.action.upload.directory' })}
                  </Button>
                </Menu.Item> */}
              {/* </Menu>}> */}
              {/* <Button type="link" disabled={!canUploadStatus.has(codeItem.status)}>
                  {formatMessage({ id: 'codeList.table.column.action.upload' })}
                  <DownOutlined />
                </Button> */}
              {/* </Dropdown> */}

              <Dropdown overlay={<Menu>
                {codeItem.status === 'running' && (
                  <Menu.Item>
                    <Button type="link" onClick={() => toSaveImage(codeItem.id)}>
                      {formatMessage({ id: 'codeList.table.column.action.save' })}
                    </Button>
                  </Menu.Item>
                )}
                {
                  checkIfCanStop(codeItem.status) &&
                  <Menu.Item>
                    <Button
                      type="link"
                      onClick={() => handleStop(codeItem)}
                    >
                      {formatMessage({ id: 'codeList.table.column.action.stop' })}
                    </Button>
                  </Menu.Item>
                }
                {checkIfCanDelete(codeItem.status) && (
                  <Menu.Item>
                    <Button type="link" onClick={() => handleDelete(codeItem)} danger>
                      {formatMessage({ id: 'codeList.table.column.action.delete' })}
                    </Button>
                  </Menu.Item>
                )}
                {checkIfCanPause(codeItem.status) && (
                  <Menu.Item>
                    <Button type="link" onClick={() => handlePauseJob(codeItem)} danger>
                      {formatMessage({ id: 'codeList.table.column.action.pause' })}
                    </Button>
                  </Menu.Item>
                )}

                {checkIfCanResume(codeItem.status) && (
                  <Menu.Item>
                    <Button type="link" onClick={() => handleResumeJob(codeItem)}>
                      {formatMessage({ id: 'codeList.table.column.action.resume' })}
                    </Button>
                  </Menu.Item>
                )}
              </Menu>}>
                <Button type="link" disabled={codeItem.status === 'pausing'}>
                  {formatMessage({ id: 'codeList.table.column.action.more' })}
                  <DownOutlined />
                </Button>
              </Dropdown>
            </>
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
              message.success(formatMessage({ id: 'codeList.tips.fresh.success' }));
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
      const cancel = message.loading(
        formatMessage({ id: 'codeCreate.message.loading.processing' }),
        12000,
      );
      setSaveImageButtonLoading(true);
      const res = await createSaveImage(values);
      if (res.code === 0) {
        renderTable();
        cancel();
        setSaveImageButtonLoading(false);
        const { duration } = res.data;
        if (duration) {
          message.success(formatMessage({ id: 'codeList.tips.saveImage.success.left' }) + duration + formatMessage({ id: 'codeList.tips.saveImage.success.right' }), 6);
        } else {
          message.success(formatMessage({ id: 'codeList.tips.saveImage.success' }));
        }
        setSaveImageModalVisible(false);
      }
    }
  };

  const fetchEndpointsInfo = async (jobId) => {
    setInteractiveEndpointsTableLoading(true);
    const res = await fetchSSHInfo(jobId);
    setInteractiveEndpointsTableLoading(false);
    if (res.code === 0) {
      const endpointsInfo = res.data.endpointsInfo;
      const interactiveEndpoints = [];
      endpointsInfo.forEach(endpoint => {
        if (!['ipython', 'ssh', 'jupyter'].includes(endpoint.name)) {
          endpoint.link = `http://${endpoint['nodeName']}.${endpoint['domain']}:${endpoint['port']}`;
          interactiveEndpoints.push(endpoint);
        }
      });
      setInteractiveEndpoints(interactiveEndpoints);
     
    }
  }

  const handleCreateInteractiveEndpoints = async () => {
    const result = await form.validateFields(['podPort']);
    const res = await addEndpointForJob(currentHandledJob.id, result.podPort);
    if (res.code === 0) {
      form.resetFields();
      fetchEndpointsInfo(currentHandledJob.id);
      message.success('添加成功')
    }
  }

  useEffect(() => {
    if (currentHandledJob) {
      setEndpointsModalVisible(true);
      fetchEndpointsInfo(currentHandledJob.id);
    }
  }, [currentHandledJob]);

  useEffect(() => {
    if (!endpointsModalVisible) {
      setCurrentHandledJob(undefined);
    }
  }, [endpointsModalVisible])

  return (
    <div style={{ minWidth: '2180px', overflow: 'auto' }}>
      <Row style={{ marginBottom: '20px' }}>
        <Col span={12}>
          <div style={{ float: 'left' }}>
            <Button
              type="primary"
              onClick={() => {
                handleCreateCodeDev();
              }}
            >
              {formatMessage({ id: 'codeList.add.codeDevelopment' })}
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
              placeholder={formatMessage({ id: 'codeList.placeholder.search' })}
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
            `${formatMessage({
              id: 'codeList.table.pagination.showTotal.prefix',
            })} ${total} ${formatMessage({
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
          title={formatMessage({ id: 'codeList.modal.upload.title.uploadCode' })}
          visible={modalFlag}
          onCancel={() => setModalFlag(false)}
          destroyOnClose
          maskClosable={false}
          width={480}
          footer={[
            <Button onClick={() => setModalFlag(false)}>
              {formatMessage({ id: 'codeList.modal.upload.footer.close' })}
            </Button>,
          ]}
        >
          <CodeUpload modalData={modalData} directory={enableDirectoryUpload} />
        </Modal>
      )}
      {
        saveImageModalVisible && <Modal
          title={formatMessage({ id: 'codeList.modal.saveImage.title.saveImage' })}
          visible={saveImageModalVisible}
          forceRender
          onCancel={() => {
            setSaveImageModalVisible(false);
            setCurrentHandledJobId('');
          }}
          footer={[
            <Button
              key="back"
              onClick={() => {
                setSaveImageModalVisible(false);
                setCurrentHandledJobId('');
              }}
            >
              {formatMessage({ id: 'codeList.modal.saveImage.footer.cancel' })}
            </Button>,
            <Button
              key="submit"
              type="primary"
              loading={saveImageButtonLoading}
              onClick={() => handleSaveImage()}
            >
              {formatMessage({ id: 'codeList.modal.saveImage.footer.ok' })}
            </Button>,
          ]}
        >
          <Form form={form}>
            <Form.Item
              {...commonLayout}
              label={formatMessage({ id: 'codeList.modal.saveImage.label.name' })}
              name="name"
              preserve={false}
              rules={[{ required: true }, jobNameReg]}
            >
              <Input style={{ width: '280px' }} />
            </Form.Item>
            <Form.Item
              {...commonLayout}
              preserve={false}
              label={formatMessage({ id: 'codeList.modal.saveImage.label.version' })}
              name="version"
              rules={[
                { required: true },
                { pattern: /^[A-Za-z0-9|.]+$/, message: formatMessage({ id: 'codeList.modal.saveImage.label.version.reg' }) },
              ]}
            >
              <Input style={{ width: '280px' }} />
            </Form.Item>
            <Form.Item
              {...commonLayout}
              preserve={false}
              label={formatMessage({ id: 'codeList.modal.saveImage.label.description' })}
              name="description"
              rules={[{ required: true }]}
            >
              <Input style={{ width: '280px' }} />
            </Form.Item>
          </Form>
        </Modal>
      }

      {
        endpointsModalVisible && <Modal
          visible={endpointsModalVisible}
          onCancel={() => setEndpointsModalVisible(false)}
          onOk={() => setEndpointsModalVisible(false)}
          width="660px"
          title={formatMessage({ id: 'codeList.endpoint.modal.title' })}
        >

          <Form
            form={form}
            style={{ marginTop: '50px' }}
          >
            <FormItem
              required
              label={formatMessage({ id: 'codeList.endpoint.modal.form.endpoint' })}
            >
              <FormItem
                name="podPort"
                rules={[
                  { required: true, message: formatMessage({ id: 'codeList.endpoint.modal.form.endpoint.required' }) },
                  { validator(_rule, value, callback) {
                    if (value < 40000 || value > 49999) {
                      callback(formatMessage({ id: 'codeList.endpoint.modal.form.endpoint.validator' }));
                    }
                  }}
                ]}
                style={{ display: 'inline-block' }}
              >
                <InputNumber style={{ width: '280px' }} min={40000} max={49999} placeholder="选填 40000 - 49999 之间的数值" />
              </FormItem>
              <FormItem
                style={{ display: 'inline-block', width: '40%', marginLeft: '25px' }}
              >
                <Button
                  key="submit"
                  type="primary"
                  onClick={handleCreateInteractiveEndpoints}
                >
                  {formatMessage({ id: 'codeList.endpoint.modal.form.confirm' })}
                </Button>
              </FormItem>
            </FormItem>
            
            
          </Form>

          <Table
            loading={interactiveEndpointsTableLoading}
            columns={[
              { title: formatMessage({ id: 'codeList.endpoint.modal.table.endpoint' }), dataIndex: 'name', align: 'center' },
              { title: formatMessage({ id: 'codeList.endpoint.modal.table.action' }), align: 'center', render(_text, item) {
                
                return (
                  <Tooltip title={item.status === 'pending' ? 'pending' : undefined}>

                    <Button disabled={item.status === 'pending'} type="link" href={item.link} onClick={() => {}}>
                      {formatMessage({ id: 'codeList.endpoint.modal.table.action.open' })}
                    </Button>
                  </Tooltip>
                )
              }, }
            ]}
            dataSource={interactiveEndpoints}
            pagination={false}
          />
        </Modal>
      }

      {
        sshModalVisible && <Modal
          title="SSH"
          visible={sshModalVisible}
          onCancel={() => setSshModalVisible(false)}
          onOk={() => setSshModalVisible(false)}
          width="65%"
        >
          {
            sshInfo && (sshInfo.status === 'running' ? <CopyToClipboard
              text={sshCommond}
              onCopy={() => message.success(formatMessage({ id: 'codeList.table.column.action.copy.success' }))}
            >
              {
                (sshCommond.length ? <pre>{sshCommond}</pre> : <LoadingOutlined />)
              }
            </CopyToClipboard > : <div>{formatMessage({ id: 'codeList.table.column.action.ssh.pending' })}</div>)
          }
          {
            !sshInfo && <div>
              {formatMessage({ id: 'codeList.ssh.not.open' })}
            </div>
          }
        </Modal>
      }

    </div>
  );
};

export default connect(({ common, vc }) => ({ common, vc }))(CodeList);
