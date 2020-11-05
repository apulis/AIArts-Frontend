import React, { useState, useEffect, CSSProperties } from 'react';
import { Select, Form, Button } from 'antd';
import { connect } from 'dva'; 
import { ConnectProps, ConnectState } from '@/models/connect';
import { VCStateType } from '@/models/vc';

interface IUserVirtualClusterProps extends Partial<ConnectProps> {
  vc: VCStateType;
  style?: CSSProperties;
}

const UserVirtualCluster: React.FC<IUserVirtualClusterProps> = ({ dispatch, vc, style }) => {
  const [form] = Form.useForm();

  const commonLayout = {
    labelCol: { span: 4 },
    wrapperCol: { span: 16 },
  };

  return (
    <Form
      form={form}
      // onFinish={onFinish}
      layout="inline"
      style={{ paddingTop: '10px', paddingBlock: '10px', ...style }}
    >
      <Form.Item 
        label="Virtual Cluster"
        name="vcName"     
      >
        
        <Select style={{ width: '200px' }} />
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