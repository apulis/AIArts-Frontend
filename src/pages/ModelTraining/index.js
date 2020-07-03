import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Divider, Select } from 'antd';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { PauseOutlined, PlusSquareOutlined, DeleteOutlined } from '@ant-design/icons';
import { useForm } from 'antd/lib/form/Form';
import FormItem from 'antd/lib/form/FormItem';
import FormList from 'antd/lib/form/FormList';

import styles from './index.less';


const { TextArea } = Input;
const { Option } = Select;

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

const generateKey = () => {
  return new Date().getTime();
}

const ModelTraining = () => {
  const [runningParams, setRunningParams] = useState([{key: '', value: '', createTime: generateKey()}]);
  const [form] = useForm();
  const { validateFields, getFieldValue, setFieldsValue } = form;
  const handleClick = async () => {
    const values = await validateFields();
    console.log('values', values)
  }
  const addParams = () => {
    const newRunningParams = runningParams.concat({
      key: '',
      value: '',
      createTime: generateKey(),
    }); 
    setRunningParams(newRunningParams);
  }
  const removeRuningParams = async (key) => {
    const values = await getFieldValue('runningParams');
    [...runningParams].forEach((param, index) => {
      param.key = values[index].key;
      param.value = values[index].value;
    })
    const newRunningParams = [...runningParams].filter((param) => param.createTime !== key)
    console.log('newRunningParams', newRunningParams)
    setRunningParams(newRunningParams)
    setFieldsValue({
      runningParams: newRunningParams.map(params => ({key: params.key, value: params.value}))
    })
  }
  const frameWorks = [
    {
      name: 'name1',
      value: 'value1'
    },
    {
      name: 'name2',
      value: 'value2'
    },
  ]
  return (
    <PageHeaderWrapper>
      <div className={styles.modelTraining}>
        <Form form={form}>
          <FormItem labelCol={{ span: 3 }} wrapperCol={{ span: 8 }} name="workName" label="作业名称" rules={[{ required: true }]}>
            <Input placeholder="请输入作业名称" />
          </FormItem>
          <FormItem labelCol={{ span: 3 }} wrapperCol={{ span: 14 }} name="desc" label="描述" rules={[{ max: 191 }]}>
            <TextArea placeholder="请输入描述信息" />
          </FormItem>
        </Form>
        <Form form={form}>
          <FormItem labelCol={{ span: 3 }} wrapperCol={{ span: 8 }} name="frameWork" label="算法引擎" rules={[{ required: true }]}>
            <Select>
              {
                frameWorks.map(f => (
                  <Option value={f.value}>{f.name}</Option>
                ))
              }
            </Select>
          </FormItem>
          <FormItem label="运行参数" labelCol={{ span: 3 }} >
            {
              runningParams.map((param, index) => {
                return (
                  <>
                    <FormItem initialValue={runningParams[index].key} name={['runningParams', index, 'key']} wrapperCol={{ span: 24 }} rules={[{required: true}]} style={{ display: 'inline-block', width: 'calc(50% - 30px)' }}>
                      <Input />
                    </FormItem>
                    <PauseOutlined rotate={90} style={{marginTop: '8px', width: '30px'}} />
                    <FormItem initialValue={runningParams[index].value} name={['runningParams', index, 'value']}  wrapperCol={{ span: 24 }} rules={[{required: true}]} style={{ display: 'inline-block', width: 'calc(50% - 30px)' }}>
                      <Input />
                    </FormItem>
                    {
                      runningParams.length > 1 && <DeleteOutlined style={{marginLeft: '10px', cursor: 'pointer'}} onClick={() => removeRuningParams(param.createTime)} />
                    }
                  </>
                )
              })
            }
            <div className={styles.addParams} onClick={addParams}>
              <PlusSquareOutlined fill="#1890ff" style={{color: '#1890ff', marginRight: '10px'}} />
              <a>点击增加参数</a>
            </div>
          </FormItem>
        </Form>
        <Button type="primary" style={{float: 'right'}} onClick={handleClick}>立即创建</Button>
      </div>
    </PageHeaderWrapper>
    
  )
}


export default ModelTraining;