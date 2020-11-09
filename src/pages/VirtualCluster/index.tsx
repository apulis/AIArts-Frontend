import React, { useEffect, useReducer, useState } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, message } from 'antd';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { ColumnProps } from 'antd/lib/table';
import { useIntl } from 'umi';
import { connect } from 'dva';
import { createVC, checkActiveJob, fetchVCList, deleteVC, fetchAvailDevice, modifyVC } from '@/services/vc';
import { jobNameReg } from '@/utils/reg';
import EqualIcon from '@/components/Icon/Equal';
import table from '@/locales/en-US/table';
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
}

interface IPaginationParams {
  pageSize: number;
  pageNum: number;
  total: number;
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

const VirtualCluster: React.FC = ({ resource }) => {
  const [vcList, setVCList] = useState<IVCColumnsProps[]>([]);
  const [tableLoading, setTableLoading] = useState<boolean>(false);
  const [unallocatedDevice, setUnallocatedDevice] = useState<number>(0);
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
      total: 10,
    }
  );
  const { formatMessage } = useIntl();
  const { devices } = resource;
  const deviceArray = Object.keys(devices);
  const { validateFields, getFieldValue, resetFields } = form;

  const handleCreateVC = async () => {
    const result = await validateFields();
    const deviceNumbers = {};
    const metaUserQuotas = {};
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
      setCreateVCModalVisible(true);
      getVCList();
    }
  };
  const handleModifyVC = async () => {
    const result = await validateFields();
    const deviceNumbers = {};
    const metaUserQuotas = {};
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
    if (res.code === 0) {
      message.success(formatMessage({ id: 'vc.page.success.modify' }))
    }
    clearMemoValues();
  };

  const clearMemoValues = () => {
    setCurrentHandledVC(undefined);
    resetFields();
  }

  const getVCList = async () => {
    setTableLoading(true);
    const res = await fetchVCList<{ code: number, data: { result: { vcName: string, quota: string, metadata: string, userNum: number }[] } }>(paginationState.pageSize, paginationState.pageNum, paginationState.search);
    setTableLoading(false);
    if (res.code === 0) {
      const vcList: IVCColumnsProps[] = res.data.result.map(vc => {
        return {
          vcName: vc.vcName,
          meta: JSON.parse(vc.metadata || '{}') as IVCMeta,
          quota: JSON.parse(vc.quota || '{}') as IVCQuota,
          userNum: vc.userNum,
        };
      });
      setVCList(vcList)
    }
  };

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
      setUnallocatedDevice(unallocatedDevice);
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
          handleDeleteVC(true);
        }
      } else {
        message.warning(formatMessage({ id: 'vc.page.message.current.vc.active' }))
      }
    }
    
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
          total: paginationState.total,
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
              rules={[
                {
                  required: true,
                },
                { ...jobNameReg },
              ]}
              {...modalFormLayout}
            >
              <Input
                style={{
                  width: '180px',
                }}
              />
            </FormItem>
            <FormItem label={formatMessage({ id: 'vc.page.form.vc.device.number' })} required {...modalFormLayout}>
              {deviceArray.map(val => (
                <>
                  <FormItem style={{ display: 'inline-block' }}>
                    <Input style={{ width: '165px' }} value={val} disabled />
                  </FormItem>
                  <EqualIcon />
                  <FormItem rules={[
                    {
                      async validator(_rule, value) { 
                        if (value > unallocatedDevice[val]) {
                          throw new Error(formatMessage({ id: 'vc.page.form.device.max.error' }) + unallocatedDevice[val]);
                        }
                      }
                    }
                  ]} style={{ display: 'inline-block' }} name={vcNumbersPrefix.deviceNumber + val} initialValue={0}>
                    <InputNumber min={0} max={unallocatedDevice[val]} />
                  </FormItem>
                </>
              ))}
            </FormItem>
            <FormItem label={formatMessage({ id: 'vc.page.form.vc.per.user.max.availble.number' })} required {...modalFormLayout}>
              {deviceArray.map(val => (
                <>
                  <FormItem style={{ display: 'inline-block' }}>
                    <Input style={{ width: '165px' }} value={val} disabled />
                  </FormItem>
                  <EqualIcon />
                  <FormItem
                    style={{ display: 'inline-block' }}
                    name={vcNumbersPrefix.maxAvailble + val}
                    rules={[
                      {
                        async validator() {
                          if (getFieldValue(vcNumbersPrefix.maxAvailble + val) > getFieldValue(vcNumbersPrefix.deviceNumber + val)) {
                            throw new Error(formatMessage({ id: 'vc.page.form.max.avail.rule.error' }));
                          }
                        }
                      }
                    ]}
                  >
                    <InputNumber min={0} />
                  </FormItem>
                </>
              ))}
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
              label={formatMessage({ id: 'vc.page.form.vc.name' })}
              rules={[
                {
                  required: true,
                },
                { ...jobNameReg },
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
                <>
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
                      {
                        async validator(_rule, value) {
                          if (value > (unallocatedDevice[val] + currentHandledVC?.quota[val])) {
                            throw new Error(formatMessage({ id: 'vc.page.form.device.max.error' }) + (unallocatedDevice[val] + currentHandledVC?.quota[val]));
                          }
                        }
                      }
                    ]}
                  >
                    <InputNumber min={0} />
                  </FormItem>
                </>
              ))}
            </FormItem>
            <FormItem preserve={false} label={formatMessage({ id: 'vc.page.form.vc.per.user.max.availble.number' })} required {...modalFormLayout}>
              {deviceArray.map(val => (
                <>
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
                      {
                        async validator() {
                          if (getFieldValue(vcNumbersPrefix.maxAvailble + val) > getFieldValue(vcNumbersPrefix.deviceNumber + val)) {
                            throw new Error(formatMessage({ id: 'vc.page.form.max.avail.rule.error' }));
                          }
                        }
                      }
                    ]}
                  >
                    <InputNumber min={0} />
                  </FormItem>
                </>
              ))}
            </FormItem>
          </Form>
        </Modal>
      }

    </PageHeaderWrapper>
  );
};

export default connect(({ resource }) => ({
  resource,
}))(VirtualCluster);
