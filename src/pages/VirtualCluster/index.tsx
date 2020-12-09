import React, { useEffect, useReducer, useState } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, message, Menu, Dropdown } from 'antd';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { ColumnProps } from 'antd/lib/table';
import { useIntl } from 'umi';
import { connect } from 'dva';
import { createVC, checkActiveJob, fetchVCList, deleteVC, fetchAvailDevice, modifyVC, addUsersForVC, removeVCUser } from '@/services/vc';
import { jobNameReg } from '@/utils/reg';
import EqualIcon from '@/components/Icon/Equal';
import table from '@/locales/en-US/table';
import SelectUserModal from '@/components/BizComponent/SelectUser';
import { DownOutlined } from '@ant-design/icons';
import RemoveUserModal from './components/RemoveUser';
const FormItem = Form.Item;

interface IVCMeta {
  [props: string]: {
    user_quota: number;
  }
}

interface IVCQuota {
  [props: string]: number;
}
interface IVCColumnsProps {
  vcName: string;
  meta: IVCMeta;
  quota: IVCQuota;
  userNum: number;
  jobMaxTimeSecond: number;
}

interface IPaginationParams {
  pageSize: number;
  pageNum: number;
  search: string;
}

interface IVirtualClusterProps {
  // resource: {
  //   [props: string]: 
  // }
}

export const vcNumbersPrefix = {
  deviceNumber: 'device--',
  maxAvailble: 'max--',
};

const { Search } = Input;

const VirtualCluster: React.FC = ({ resource, dispatch }) => {
  const [vcList, setVCList] = useState<IVCColumnsProps[]>([]);
  const [tableLoading, setTableLoading] = useState<boolean>(false);
  const [unallocatedDevice, setUnallocatedDevice] = useState<{[props: string]: number}>(0);
  const [createVCModalVisible, setCreateVCModalVisible] = useState<boolean>(false);
  const [modifyVCModalVisible, setModifyVCModalVisible] = useState<boolean>(false);
  const [form] = Form.useForm();
  const [currentHandledVC, setCurrentHandledVC] = useState<IVCColumnsProps>();
  const [paginationState, setPaginationState] = useReducer(
    (state: IPaginationParams, action: IPaginationParams) => ({ ...state, ...action }),
    {
      pageSize: 10,
      pageNum: 1,
      search: '',
    }
  );
  const [pageTotal, setPageTotal] = useState(10);
  const [selectUserModalVisible, setSelectUserModalVisible] = useState<boolean>(false);
  const [removeUserModalVisible, setRemoveUserModalVisible] = useState<boolean>(false);
  const [needConfirmOnDelete, setNeedConfirmOnDelete] = useState<boolean>(false);
  const [activeJobOnDelete, setActiceJobsOnDelete] = useState([]);

  const { formatMessage } = useIntl();
  const { devices } = resource;
  const deviceArray = Object.keys(devices);
  const { validateFields, getFieldValue, resetFields } = form;

  const getVCList = async () => {
    setTableLoading(true);
    const res = await fetchVCList<{ code: number, data: { totalNum: number, result: { vcName: string, quota: string, metadata: string, userNum: number }[] } }>(paginationState.pageSize, paginationState.pageNum, paginationState.search);
    setTableLoading(false);
    if (res.code === 0) {
      const list: IVCColumnsProps[] = res.data.result.map(vc => {
        return {
          vcName: vc.vcName,
          meta: JSON.parse(vc.metadata || '{}') as IVCMeta,
          quota: JSON.parse(vc.quota || '{}') as IVCQuota,
          userNum: vc.userNum,
          jobMaxTimeSecond: JSON.parse(vc.metadata || '{}').admin?.job_max_time_second,
        };
      });
      setPageTotal(res.data.totalNum);
      setVCList(list)
    }
  };

  const handleCreateVC = async () => {
    const result = await validateFields();
    const deviceNumbers = {};
    const metaUserQuotas = { admin: { job_max_time_second: result.jobMaxTimeSecond } };
    Object.keys(result).forEach(val => {
      if (val.startsWith(vcNumbersPrefix.deviceNumber)) {
        deviceNumbers[val.replace(new RegExp(vcNumbersPrefix.deviceNumber), '')] = result[val]
      } else if (val.startsWith(vcNumbersPrefix.maxAvailble)) {
        metaUserQuotas[val.replace(new RegExp(vcNumbersPrefix.maxAvailble), '')] = { user_quota: result[val] }
      }
    })
    const data = {
      vcName: result.vcName,
      quota: JSON.stringify(deviceNumbers),
      metadata: JSON.stringify(metaUserQuotas),
    };
    const res = await createVC(data);
    if (res.code === 0) {
      message.success(formatMessage({ id: 'vc.page.create.vc.success' }));
      setCreateVCModalVisible(false);
      getVCList();
    }
  };

  const clearMemoValues = () => {
    setCurrentHandledVC(undefined);
    resetFields();
    setActiceJobsOnDelete([]);
    setNeedConfirmOnDelete(false);
  }

  const handleModifyVC = async () => {
    const result = await validateFields();
    const deviceNumbers = {};    
    const metaUserQuotas = { admin: { job_max_time_second: result.jobMaxTimeSecond } };
    Object.keys(result).forEach(val => {
      if (val.startsWith(vcNumbersPrefix.deviceNumber)) {
        deviceNumbers[val.replace(new RegExp(vcNumbersPrefix.deviceNumber), '')] = result[val]
      } else if (val.startsWith(vcNumbersPrefix.maxAvailble)) {
        metaUserQuotas[val.replace(new RegExp(vcNumbersPrefix.maxAvailble), '')] = { user_quota: result[val] }
      }
    })
    const res = await modifyVC({
      vcName: result.vcName,
      quota: JSON.stringify(deviceNumbers),
      metadata: JSON.stringify(metaUserQuotas),
    })
    setModifyVCModalVisible(false)
    if (res.code === 0) {
      getVCList();
      message.success(formatMessage({ id: 'vc.page.success.modify' }))
    }
    clearMemoValues();
  };

  const handleSelectUser = async (result) => {
    if (result && result.length > 0) {
      const res = await addUsersForVC(result, currentHandledVC.vcName);
      if (res.code === 0) {
        message.success(formatMessage({ id: 'vc.component.relateUser.message.success' }))
        setSelectUserModalVisible(false);
      }
    } else {
      message.warn(formatMessage({ id: 'vc.component.atleast.one.user' }));
    }
  }

  

  const handleRemoveVCUsers = async (userIds: number[], confirmed?: boolean) => {
    if (!userIds || userIds.length === 0) {
      setRemoveUserModalVisible(false);
      clearMemoValues();
      return;
    }
    const res = await removeVCUser(currentHandledVC.vcName, userIds, confirmed);
    if (res.code === 0) {
      message.success(formatMessage({ id: 'vc.component.removeUser.message.success' }));
      setRemoveUserModalVisible(false);
      clearMemoValues();
    } else {
      setNeedConfirmOnDelete(true);
      const { activeJobs } = res;
      setActiceJobsOnDelete(activeJobs);
    }
  }

  const handleCancelRemoveVCUsers = () => {
    setRemoveUserModalVisible(false)
    clearMemoValues();
  }

  

  const handleDeleteVC = (vcName: string) => {
    Modal.confirm({
      title: formatMessage({ id: 'vc.page.confirm.delete.vc.title' }),
      content: formatMessage({ id: 'vc.page.confirm.delete.vc.content' }),
      onCancel() {
        //
      },
      async onOk() {
        const res = await checkActiveJob(vcName);
        if (res.code === 0 && res.data.jobCount > 0) {
          message.warn(formatMessage({ id: 'vc.page.message.current.vc.busy' }));
        } else {
          const res = await deleteVC(vcName);
          if (res.code === 0) {
            message.success(formatMessage({ id: 'vc.page.message.success.delete.vc' }));
            getVCList();
          }
        }
      }
    })
  };

  const getAvailDevice = async () => {
    const res = await fetchAvailDevice();
    if (res.code === 0) {
      const { unallocatedDevice } = res.data;
      setUnallocatedDevice(unallocatedDevice || {});
    }
  }

  useEffect(() => {
    getVCList();
  }, [paginationState]);

  useEffect(() => {
    if (createVCModalVisible || modifyVCModalVisible) {
      getAvailDevice();
    }
  }, [createVCModalVisible, modifyVCModalVisible])

  const readyToModifyVC = async (vcName: string, type: 'modify' | 'delete') => {
    const activeJob = await checkActiveJob(vcName);
    if (activeJob.code === 0) {
      if (activeJob.data.jobCount === 0) {
        if (type === 'modify') {
          setModifyVCModalVisible(true);
        } else if (type === 'delete') {
          handleDeleteVC(vcName);
        }
      } else {
        message.warning(formatMessage({ id: 'vc.page.message.current.vc.active' }))
      }
    }
  }

  const handleRelateUser = (vc: IVCColumnsProps) => {
    setCurrentHandledVC(vc);
    setSelectUserModalVisible(true);
  }

  const handleCancelSelectUser = () => {
    setSelectUserModalVisible(false);
    clearMemoValues();
  }

  const handleRemoveUser = (vc: IVCColumnsProps) => {
    setCurrentHandledVC(vc);
    setRemoveUserModalVisible(true);
  }

  const columns: ColumnProps<IVCColumnsProps>[] = [
    {
      title: formatMessage({
        id: 'vc.page.table.vc.name',
      }),
      dataIndex: 'vcName',
    },
    {
      title: formatMessage({
        id: 'vc.page.table.device.type',
      }),
      render(_text, item) {
        return Object.keys(item.quota).map(val => (
          <div>{val}</div>
        ))
      }
    },
    {
      title: formatMessage({
        id: 'vc.page.table.device.number',
      }),
      align: 'center',
      render(_text, item) {
        return Object.keys(item.quota).map(val => (
          <div>{(item.quota)[val]}</div>
        ))
      }
    },
    {
      title: '单个 job 最大运行时长',
      align: 'center',
      render(_text, item) {
        return <div>{item.jobMaxTimeSecond || '不限时'}</div>
      }
    },
    {
      title: formatMessage({
        id: 'vc.page.table.max.avail',
      }),
      align: 'center',
      render(_text, item) {
        const metas = Object.keys(item.meta)
        if (metas.length === 0) {
          return 0;
        }
        return metas.map(val => (
          <div>{(item.meta)[val].user_quota}</div>
        ))
      }
    },
    {
      title: formatMessage({
        id: 'vc.page.table.user.amount',
      }),
      align: 'center',
      render(_text, item) {
        return (
          <div>{item.userNum || 0}</div>
        )
      }
    },
    {
      title: formatMessage({
        id: 'vc.page.table.max.Operation',
      }),
      align: 'center',
      render(_text, item) {
        return (
          <>
            <Button type="link" onClick={() => { readyToModifyVC(item.vcName, 'modify'); setCurrentHandledVC(item) }}>
              {formatMessage({
                id: 'vc.page.table.button.modify',
              })}
            </Button>
            <Button danger type="link" onClick={() => readyToModifyVC(item.vcName, 'delete')}>
              {formatMessage({
                id: 'vc.page.table.button.delete',
              })}
            </Button>
            <Dropdown overlay={<Menu>
              <Menu.Item>
                <Button onClick={() => handleRelateUser(item)} type="link">
                  {formatMessage({ id: 'vc.page.table.relate.user' })}
                </Button>
              </Menu.Item>
              <Menu.Item>
                <Button onClick={() => handleRemoveUser(item)} type="link">
                  {formatMessage({ id: 'vc.page.table.view.user' })}
                </Button>
              </Menu.Item>
            </Menu>}
            >
              <a>{formatMessage({ id: 'vc.component.relate.user.button' })} <DownOutlined /></a>
            </Dropdown>
           
          </>
        );
      },
    },
  ];
  const modalFormLayout = {
    labelCol: {
      span: 9,
    },
    wrapperCol: {
      span: 15,
    },
  };
  return (
    <PageHeaderWrapper>
      <div
        style={{
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <Button type="primary" onClick={() => setCreateVCModalVisible(true)}>
          {formatMessage({
            id: 'vc.page.button.create.vitual.cluster',
          })}
        </Button>
        <Search
          style={{ width: '160px' }}
          onSearch={(s) => setPaginationState({
            ...paginationState,
            search: s,
          })}
        />
      </div>
      <Table
        columns={columns}
        dataSource={vcList}
        loading={tableLoading}
        pagination={{
          total: pageTotal,
          pageSize: paginationState.pageSize,
          current: paginationState.pageNum,
          onChange(page, pageSize) {
            setPaginationState({
              ...paginationState,
              pageNum: page,
              pageSize: pageSize || paginationState.pageSize,
            });
          },
        }}
      />
      {createVCModalVisible && (
        <Modal
          forceRender
          visible={createVCModalVisible}
          onCancel={() => setCreateVCModalVisible(false)}
          onOk={handleCreateVC}
          width="800px"
          title={formatMessage({ id: 'vc.page.create.vc.modal.title' })}
        >
          <Form form={form}>
            <FormItem
              name="vcName"
              label={formatMessage({ id: 'vc.page.form.vc.name' })}
              preserve={false}
              rules={[
                {
                  required: true,
                  message: formatMessage({ id: 'vc.page.form.vcName.required' })
                },
                { ...jobNameReg },
                {
                  max: 20,
                  message: formatMessage({ id: 'vc.page.form.vcName.max' })
                }
              ]}
              {...modalFormLayout}
            >
              <Input
                style={{
                  width: '180px',
                }}
              />
            </FormItem>
            <FormItem preserve={false} label={formatMessage({ id: 'vc.page.form.vc.device.number' })} required {...modalFormLayout}>
              {deviceArray.map(val => (
                <div>
                  <FormItem preserve={false} style={{ display: 'inline-block' }}>
                    <Input style={{ width: '165px' }} value={val} disabled />
                  </FormItem>
                  <EqualIcon />
                  <FormItem preserve={false} rules={[
                    { required: true, message: formatMessage({ id: 'vc.page.form.device.number.required' }) },
                    {
                      async validator(_rule, value) {
                        if (value > unallocatedDevice[val]) {
                          throw new Error(formatMessage({ id: 'vc.page.form.device.max.error' }) + unallocatedDevice[val]);
                        }
                      }
                    }
                  ]} style={{ display: 'inline-block' }} name={vcNumbersPrefix.deviceNumber + val} initialValue={0}>
                    <InputNumber min={0} max={unallocatedDevice[val]} precision={0} />
                  </FormItem>
                </div>
              ))}
            </FormItem>
            <FormItem preserve={false} label={formatMessage({ id: 'vc.page.form.vc.per.user.max.availble.number' })} required {...modalFormLayout}>
              {deviceArray.map(val => (
                <div>
                  <FormItem style={{ display: 'inline-block' }} preserve={false}>
                    <Input style={{ width: '165px' }} value={val} disabled />
                  </FormItem>
                  <EqualIcon />
                  <FormItem
                    style={{ display: 'inline-block' }}
                    name={vcNumbersPrefix.maxAvailble + val}
                    rules={[
                      { required: true, message: formatMessage({ id: 'vc.page.form.max.avail.rule.error.required' }), },
                      {
                        async validator() {
                          if (getFieldValue(vcNumbersPrefix.maxAvailble + val) > getFieldValue(vcNumbersPrefix.deviceNumber + val)) {
                            throw new Error(formatMessage({ id: 'vc.page.form.max.avail.rule.error' }));
                          }
                        }
                      }
                    ]}
                    preserve={false}
                  >
                    <InputNumber min={0} precision={0} />
                  </FormItem>
                </div>
              ))}
            </FormItem>
            <FormItem
              name="jobMaxTimeSecond"
              label="最大使用时长/分钟"
              {...modalFormLayout}
              initialValue={5 * 3600}
              rules={[
                { required: true }
              ]}
              preserve={false}
            >
              <InputNumber precision={0} />
            </FormItem>
          </Form>
        </Modal>
      )}
      {
        modifyVCModalVisible && currentHandledVC && <Modal
          forceRender
          visible={modifyVCModalVisible}
          onCancel={() => { setModifyVCModalVisible(false); clearMemoValues() }}
          onOk={handleModifyVC}
          width="800px"
        >
          <Form form={form}>
            <FormItem
              name="vcName"
              initialValue={currentHandledVC?.vcName}
              preserve={false}
              label={formatMessage({ id: 'vc.page.form.vc.name' })}
              rules={[
                {
                  required: true,
                  message: formatMessage({ id: 'vc.page.form.vcName.required' })
                },
                { ...jobNameReg },
                {
                  max: 20,
                  message: formatMessage({ id: 'vc.page.form.vcName.max' })
                }
              ]}
              {...modalFormLayout}
            >
              <Input
                style={{
                  width: '180px',
                }}
                disabled
              />
            </FormItem>
            <FormItem
              label={formatMessage({ id: 'vc.page.form.vc.device.number' })}
              required
              {...modalFormLayout}
            >
              {deviceArray.map(val => (
                <div>
                  <FormItem preserve={false} style={{ display: 'inline-block' }}>
                    <Input style={{ width: '165px' }} value={val} disabled />
                  </FormItem>
                  <EqualIcon />
                  <FormItem
                    preserve={false}
                    style={{ display: 'inline-block' }}
                    name={vcNumbersPrefix.deviceNumber + val}
                    initialValue={currentHandledVC!.quota[val]}
                    rules={[
                      { required: true, message: formatMessage({ id: 'vc.page.form.device.number.required' }) },
                      {
                        async validator(_rule, value) {
                          const unallocated = (unallocatedDevice[val] || 0) < 0 ? 0 : (unallocatedDevice[val] || 0) 
                          if (value > (unallocated + currentHandledVC?.quota[val])) {
                            throw new Error(formatMessage({ id: 'vc.page.form.device.max.error' }) + (unallocatedDevice[val] + currentHandledVC?.quota[val]));
                          }
                        }
                      }
                    ]}
                  >
                    <InputNumber min={0} precision={0} />
                  </FormItem>
                </div>
              ))}
            </FormItem>
            <FormItem preserve={false} label={formatMessage({ id: 'vc.page.form.vc.per.user.max.availble.number' })} required {...modalFormLayout}>
              {deviceArray.map(val => (
                <div>
                  <FormItem style={{ display: 'inline-block' }} preserve={false}>
                    <Input style={{ width: '165px' }} value={val} disabled />
                  </FormItem>
                  <EqualIcon />
                  <FormItem
                    style={{ display: 'inline-block' }}
                    name={vcNumbersPrefix.maxAvailble + val}
                    preserve={false}
                    initialValue={currentHandledVC.meta[val] ? currentHandledVC!.meta[val].user_quota : 0}
                    rules={[
                      { required: true, message: formatMessage({ id: 'vc.page.form.max.avail.rule.error.required' }), },
                      {
                        async validator() {
                          if (getFieldValue(vcNumbersPrefix.maxAvailble + val) > getFieldValue(vcNumbersPrefix.deviceNumber + val)) {
                            throw new Error(formatMessage({ id: 'vc.page.form.max.avail.rule.error' }));
                          }
                        }
                      }
                    ]}
                  >
                    <InputNumber min={0} precision={0} />
                  </FormItem>
                </div>
              ))}
            </FormItem>
            
            <FormItem
              name="jobMaxTimeSecond"
              label="最大使用时长/分钟"
              {...modalFormLayout}
              initialValue={currentHandledVC.jobMaxTimeSecond}
              rules={[
                { required: true }
              ]}
              preserve={false}
            >
              <InputNumber precision={0} />
            </FormItem>
          </Form>
        </Modal>
      }
      {
        selectUserModalVisible && <SelectUserModal
          visible={selectUserModalVisible}
          onOk={handleSelectUser}
          onCancel={handleCancelSelectUser} 
        />
      }
      {
        removeUserModalVisible && currentHandledVC && <RemoveUserModal
          visible={removeUserModalVisible}
          title={formatMessage({ id: 'vc.component.remove.confirm.title' })}
          vcName={currentHandledVC.vcName}
          onOk={handleRemoveVCUsers}
          onCancel={handleCancelRemoveVCUsers}
          needConfirm={needConfirmOnDelete}
          activeJob={activeJobOnDelete}
        />

      }
    </PageHeaderWrapper>
  );
};

export default connect(({ resource }) => ({
  resource,
}))(VirtualCluster);
