import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Divider, Select, Col, Row, message, PageHeader, Modal } from 'antd';
import { history } from 'umi';
import { PauseOutlined, PlusSquareOutlined, DeleteOutlined, FolderOpenOutlined } from '@ant-design/icons';
import { useForm } from 'antd/lib/form/Form';
import FormItem from 'antd/lib/form/FormItem';

import { submitModelTraining } from '../../services/modelTraning';

import styles from './index.less';


const { TextArea } = Input;
const { Option } = Select;

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

export const generateKey = () => {
  return new Date().getTime();
}

const ModelTraining = () => {
  const [runningParams, setRunningParams] = useState([{key: '', value: '', createTime: generateKey()}]);
  const [form] = useForm();
  const [codeDirModalVisible, setCodeDirModalVisible] = useState(false);
  const [bootFileModalVisible, setBootFileModalVisible] = useState(false);
  const [outputPathModalVisible, setOutputPathModalVisible] = useState(false);
  const [trainingDataSetModalVisible, setTrainingDataSetModalVisible] = useState(false);
  const { validateFields, getFieldValue, setFieldsValue } = form;
  const handleSubmit = async () => {
    const values = await validateFields();
    const cancel = message.loading('正在提交');
    const res = await submitModelTraining(values);
    if (res.code === 0) {
      cancel();
    }
  }
  const addParams = () => {
    const newRunningParams = runningParams.concat({
      key: '',
      value: '',
      createTime: generateKey(),
    }); 
    setRunningParams(newRunningParams);
  }
  const validateRunningParams = async (index, propertyName, ...args) => {
    const [rule, value, callback] = [...args];
    const runningParams = await getFieldValue('runningParams');
    runningParams.forEach((r, i) => {
      if (r[propertyName] === value && index !== i) {
        console.log(r[propertyName], value)
        callback('不能输入相同的参数名称');
      }
    })
    callback();
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

  const commonLayout = {
    labelCol: { span: 3 }, 
    wrapperCol: { span: 8 }
  }
  const onSelectCodeDir = () => {

  }
  return (
    <div className={styles.modelTraining}>
      <PageHeader
        className="site-page-header"
        onBack={() => history.push('/model-training/list')}
        title='创建训练作业'
        subTitle={<Button onClick={() => history.push('/model-training/list')}>返回训练作业列表</Button>}
      />
      <Form form={form}>
        <FormItem {...commonLayout} name="workName" label="作业名称" rules={[{ required: true }]}>
          <Input style={{ width: 260 }}  placeholder="请输入作业名称" />
        </FormItem>
        <FormItem labelCol={{ span: 3 }} wrapperCol={{ span: 14 }} name="desc" label="描述" rules={[{ max: 191 }]}>
          <TextArea placeholder="请输入描述信息" />
        </FormItem>
      </Form>
      <Divider style={{borderColor: '#cdcdcd'}} />
      <div className="ant-page-header-heading-title" style={{marginLeft: '38px', marginBottom: '20px'}}>参数配置</div>
      <Form form={form}>
        <FormItem {...commonLayout} name="frameWork" label="引擎" rules={[{ required: true }]}>
          <Select style={{ width: 260 }} >
            {
              frameWorks.map(f => (
                <Option value={f.value}>{f.name}</Option>
              ))
            }
          </Select>
        </FormItem>
        <FormItem {...commonLayout} label="代码目录">
          <FormItem
            name="codeDir"
            noStyle
          >
            <Input style={{ width: 260 }} />
          </FormItem>
          <Button style={{marginLeft: '15px', display: 'inline-block'}} onClick={() => setCodeDirModalVisible(true)} icon={<FolderOpenOutlined />}></Button>
        </FormItem>
        <FormItem {...commonLayout} label="启动文件">
          
          <FormItem name="bootFile" noStyle>
            <Input style={{ width: 260 }} />
          </FormItem>
          
          <Button style={{marginLeft: '15px', display: 'inline-block'}} icon={<FolderOpenOutlined />} onClick={() => setBootFileModalVisible(true)}></Button>
        </FormItem>
        <FormItem className="ant-form-item-required" {...commonLayout} label="输出路径" style={{marginTop: '50px'}}>
          
          <FormItem name="outputPath" rules={[{ required: true, message: '请输入输出路径' }]} noStyle>
            <Input style={{ width: 260 }} />
          </FormItem>
          <Button style={{marginLeft: '15px', display: 'inline-block'}} icon={<FolderOpenOutlined />} onClick={() => setOutputPathModalVisible(true)}></Button>
        </FormItem>
        <FormItem {...commonLayout} label="训练数据集">
          
          <FormItem name="trainingDataSet" rules={[{ required: true, message: '请输入训练数据集' }]} noStyle>
            <Input style={{ width: 260 }} />
          </FormItem>
          <Button style={{marginLeft: '15px', display: 'inline-block'}} icon={<FolderOpenOutlined onClick={() => setTrainingDataSetModalVisible(true)} />}></Button>
        </FormItem>
        <FormItem label="运行参数" labelCol={{ span: 3 }} >
          {
            runningParams.map((param, index) => {
              return (
                <>
                  <FormItem initialValue={runningParams[index].key} rules={[{validator(...args) {validateRunningParams(index, 'key', ...args)}}]} name={['runningParams', index, 'key']} wrapperCol={{ span: 24 }} style={{ display: 'inline-block', width: 'calc(50% - 30px)' }}>
                    <Input />
                  </FormItem>
                  <PauseOutlined rotate={90} style={{marginTop: '8px', width: '30px'}} />
                  <FormItem initialValue={runningParams[index].value} rules={[{validator(...args) {validateRunningParams(index, 'value', ...args)}}]} name={['runningParams', index, 'value']}  wrapperCol={{ span: 24 }} style={{ display: 'inline-block', width: 'calc(50% - 30px)' }}>
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
        <FormItem label="计算节点规格" name="computingNode" {...commonLayout} rules={[{ required: true }]}>
          <Select style={{width: '260px'}}>
            {
              frameWorks.map(f => (
                <Option value={f.value}>{f.name}</Option>
              ))
            }
          </Select>
        </FormItem>
      </Form>
      <Modal
        visible={bootFileModalVisible}
        forceRender
        onCancel={() => setBootFileModalVisible(false)}
      >

      </Modal>
      <Modal
        visible={codeDirModalVisible}
        forceRender
        onCancel={() => setCodeDirModalVisible(false)}
      >

      </Modal>
      <Modal
        visible={outputPathModalVisible}
        forceRender
        onCancel={() => setOutputPathModalVisible(false)}
      >

      </Modal>
      <Modal
        visible={trainingDataSetModalVisible}
        forceRender
        onCancel={() => setTrainingDataSetModalVisible(false)}
      >

      </Modal>
      <Button type="primary" style={{float: 'right'}} onClick={handleSubmit}>立即创建</Button>
    </div>
    
  )
}


export default ModelTraining;