import { message, Form, Input, Button, Radio, Select } from 'antd';
import React, { useState, useEffect, useRef, useForm } from 'react';
// import styles from './index.less'; 

const { Option } = Select;

const ItemPanel = () => {
  const [form] = Form.useForm();

  useEffect(() => {
    // getData();
  }, []);

  return (
    <Form form={form} initialValues={{}}>
      <Form.Item name="name" label="名称"
      >
        <Select 
          placeholder="请选择" 
        >
          <Option value={1}>{1}</Option>
        </Select>
      </Form.Item>
    </Form>
  );
};

export default ItemPanel;