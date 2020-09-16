import React,{ useState,useEffect } from 'react';
import { Form, Input, PageHeader, Button, message, Select } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { jobNameReg, linuxPathReg } from '@/utils/reg';
import { createVisualization } from '@/services/modelTraning';
import { history } from 'umi';
import { getModels } from '../../ModelMngt/ModelList/services/index';
import { getResource } from '../../CodeDevelopment/service';

const { TextArea } = Input;

export default function CreateVisualization() {
  const goBackPath = '/model-training/visualization';
  const [form] = useForm();
  const { validateFields, setFieldsValue, getFieldValue } = form;
  const [modelArr, setModelArr] = useState([]);
  const [curModel,setCurModel] = useState();
  const [codePathPrefix, setCodePathPrefix] = useState('');

  const apiGetModelList = async() =>{
    const obj = await getModels();
    const { code, data, msg } = obj;
    if (code === 0) {
      return data;
    } else {
      return null;
    }
  }

  const apiGetResource = async() =>{
    const obj = await getResource();
    const { code, data, msg } = obj;
    if (code === 0) {
      return data;
    } else {
      return null;
    }
  }


  const renderInitForm = async ()=> {
    const modelList = await apiGetModelList();
    const resource = await apiGetResource();
    if(modelList && resource){
      const codePathPrefix = resource.codePathPrefix;
      const models = modelList.models.map((item,index) => {
        return {id: item.id, name: item.name, path: item.visualPath ? item.visualPath.replace(codePathPrefix,'') : ''}
      });
      setModelArr(models);
      setCodePathPrefix(codePathPrefix);
    }
  }


  const onCreate = async () => {
    const values = await validateFields();
    values.tensorboardLogDir = codePathPrefix + values.tensorboardLogDir;
    const res = await createVisualization(values);
    if (res.code === 0) {
      message.success('创建成功');
      history.push(goBackPath);
    }
  };

  const handleModelChange = (modelId) => {
    const model = modelArr.find(model => model.id === modelId);
    if(model) setCurModel(model);
  }

  useEffect( () => {
    renderInitForm();
  },[]);

  useEffect(() => {
    if(curModel){
      setFieldsValue({'tensorboardLogDir' : curModel.path});
    }
  },[curModel]);
 

  return (
    <>
      <PageHeader
        className="site-page-header"
        onBack={() => history.push(goBackPath)}
        title='创建可视化作业'
      />
      <Form form={form}>
        <Form.Item labelCol={{ span: 4 }} wrapperCol={{ span: 14 }} style={{ marginTop: '30px' }} name="jobName" label="可视化作业名称" rules={[{ required: true }, { ...jobNameReg }]}>
          <Input style={{ width: 300 }} placeholder="请输入可视化作业名称" />
        </Form.Item>
        <Form.Item labelCol={{ span: 4 }} wrapperCol={{ span: 14 }} name="selectModel" label="选择模型">
          <Select 
          placeholder = "请选择模型"
          style={{ width: 300 }} 
          allowClear 
          optionFilterProp="children"
          showSearch
          onChange={() => { handleModelChange(getFieldValue('selectModel')) }}
          >
          {
            modelArr.map((model) => (
            <Option value={model.id}>{model.name}</Option>
            ))
          }
          </Select>
        </Form.Item>
        <Form.Item labelCol={{ span: 4 }} wrapperCol={{ span: 14 }} name="tensorboardLogDir" label="可视化日志路径" rules={[{ required: true }]}>
          <Input addonBefore={codePathPrefix} placeholder="请输入可视化日志路径" />
        </Form.Item>
        <Form.Item labelCol={{ span: 4 }} wrapperCol={{ span: 14 }} name="description" label="描述" rules={[{ max: 191 }]}>
          <TextArea placeholder="请输入描述信息" />
        </Form.Item>
      </Form>
      <Button type="primary" onClick={onCreate} style={{ marginLeft: '16.7%' }}>创建</Button>
    </>
  );
}
