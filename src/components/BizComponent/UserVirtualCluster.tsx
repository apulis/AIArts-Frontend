import React, { useState, useEffect, CSSProperties } from 'react';
import { Select, Form, Button, message } from 'antd';
import { connect } from 'dva'; 
import { ConnectProps, ConnectState } from '@/models/connect';
import { VCStateType } from '@/models/vc';

interface IUserVirtualClusterProps extends Partial<ConnectProps> {
  vc: VCStateType;
  style?: CSSProperties;
}

const UserVirtualCluster: React.FC<IUserVirtualClusterProps> = ({ dispatch, vc, style }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    dispatch({
      type: 'vc/fetchUserAvailVC',
    })
  }, [])
  
  const onFinish = async () => {
    const { vcName } = await form.validateFields(['vcName']);
    if (vcName) {
      dispatch({
        type: 'vc/userSelectVC',
        payload: {
          vcName,
        }
      })
      message.success('Success set default virtual cluster');
    }
  }

  return (
    <Form
      form={form}
      onFinish={onFinish}
      layout="inline"
      style={{ paddingTop: '10px', paddingBlock: '10px', ...style }}
    >
      <Form.Item
        label="Default Virtual Cluster"
        name="vcName"
      >
        <Select showSearch style={{ width: '200px' }} />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" style={{ marginLeft: '40px' }}>
          Confirm
        </Button>
      </Form.Item>
    </Form>
  )

}



export default connect(({ vc }: ConnectState) => ({ vc }))(UserVirtualCluster);