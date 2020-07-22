import { history } from 'umi';
import { message, Modal, Form, Input, Button, Card, PageHeader, Radio, Select, Tag } from 'antd';
import React, { useState, useEffect, useRef } from 'react';
import { FolderOpenOutlined } from '@ant-design/icons';
// import ModalForm from './components/ModalForm';
import { addModel } from '../ModelList/services';
import { fetchAvilableResource } from '@/services/modelTraning';

const { TextArea } = Input;

const ModelEvaluation = props => {
  const query = props.location.query;
  debugger
  const modelName = decodeURIComponent(query.modelName);
  const modelId = decodeURIComponent(query.modelId);

  const [codePathPrefix, setCodePathPrefix] = useState('');
  const [visible, setVisible] = useState(false);
  const [frameWorks, setFrameWorks] = useState([]);
  const [datasets, setDatasets] = useState([]);
  const [form] = Form.useForm();

  useEffect(() => {
    getAvailableResource();
  }, []);

  const getAvailableResource = async () => {
    const res = await fetchAvilableResource();
    if (res.code === 0) {
      let { data: { codePathPrefix } } = res;
      if (!/\/$/.test(codePathPrefix)) {
        codePathPrefix = codePathPrefix + '/' 
      }
      
      setCodePathPrefix(codePathPrefix);
    }
  }

  const selectTrainingJob = () => {

  };

  const onFinish = async (values) => {
    const { name, description, path, jobId } = values;
    const data = {
      name,
      description,
      path: codePathPrefix + path,
      jobId: jobId || '',
    }
    
    const { code, msg } = await addModel(data);

    if (code === 0) {
      message.success(`创建成功`);
      history.push('/ModelManagement/MyModels');
    } else {
      msg && message.error(`创建失败:${msg}`);
    }
  };

  const showJobModal = () => {
    setVisible(true);
  };

  const onReset = () => {
    form.resetFields();
  };

  const handleCancel = () => {
    setVisible(false);
  };

  const handleSubmit = item => {
    form.setFieldsValue({job: item.name, jobId: item.id});
    setVisible(false);
  };

  const layout = {
    labelCol: { span: 3 },
    wrapperCol: { span: 12 },
  };

  return (
    <>
    <PageHeader
      ghost={false}
      onBack={() => history.push('/ModelManagement/MyModels')}
      title="模型评估"
    >
      <div
        style={{
          padding: '24px'
        }}
      >
        <Form
          form={form}
          onFinish={onFinish}
          autoComplete="off"
          initialValues={{name: modelName}}
        >
          <Form.Item
            {...layout}
            name="name"
            label="名称"
            rules={[{ required: true, message: '名称不能为空!' }]}
          >
            <Input placeholder="请输入模型名称" disabled/>
          </Form.Item>
          <Form.Item {...layout} name="engine" label="引擎" rules={[{ required: true }]}>
            <Select>
              {
                frameWorks.map(f => (
                  <Option value={f} key={f}>{f}</Option>
                ))
              }
            </Select>
          </Form.Item>
          <Form.Item {...layout} name="datasetPath" rules={[{ required: true, message: '请选择测试数据集' }]} label="训练数据集">
            <Select>
              {
                datasets.map(d => (
                  <Option value={d.path}>{d.name}</Option>
                ))
              }
            </Select>
          </Form.Item>          
          <Form.Item
            {...layout}
            name="codePath"
            label="代码目录"
          >
            <Input addonBefore={codePathPrefix} />
          </Form.Item>
          <Form.Item {...layout} label="启动文件" name="startupFile" rules={[{ required: true }, { pattern: /\.py$/, message: '需要填写一个python 文件' }]}>
            <Input addonBefore={codePathPrefix} />
          </Form.Item>
          <Form.Item name="outputPath" {...layout} label="输出路径" >
            <Input addonBefore={codePathPrefix} />
          </Form.Item>
          <Form.Item name="status" {...layout} label="评估状态" >
            <Tag color="success">success</Tag>
            <Tag color="processing">processing</Tag>
            <Tag color="error">error</Tag>
            {/* <Tag color="warning">warning</Tag>
            <Tag color="default">default</Tag> */}
          </Form.Item>
          <Form.Item
            style={{ float: 'right' }}
          >
            <Button type="primary" htmlType="submit">开始评估</Button>
          </Form.Item>
        </Form>
      </div>
    </PageHeader>
    {/* 选择训练作业弹框 */}
    {/* {
      visible && <ModalForm
      visible={visible}
      onCancel={handleCancel}
      onSubmit={handleSubmit}
    />
    } */}
    </>  
  );
};

export default ModelEvaluation;