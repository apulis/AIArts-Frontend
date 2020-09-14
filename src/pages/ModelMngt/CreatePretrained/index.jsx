import { Link, history } from 'umi';
import { message, Modal, Form, Input, Button, Card, PageHeader, Radio, Select, Upload, Divider, Tabs, Col, Row } from 'antd';
import React, { useState, useEffect, useRef } from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { connect } from 'umi';
import { formatDate } from '@/utils/time';
import { PlusSquareOutlined, PauseOutlined, DeleteOutlined } from '@ant-design/icons';
import ModalForm from './components/ModalForm';
import { addModel } from '../ModelList/services';
import { fetchAvilableResource } from '@/services/modelTraning';
import { jobNameReg, getNameFromDockerImage } from '@/utils/reg';
import { fetchPresetTemplates } from './services';
import { generateKey } from '@/pages/ModelTraining/Submit';
import { formatParams } from '@/utils/utils';
import { getAllLabeledDatasets } from '@/pages/ModelMngt/ModelEvaluation/services';

import styles from '@/pages/ModelTraining/index.less';

const { TextArea } = Input;
const { Dragger } = Upload;
const { Option } = Select;
const { TabPane } = Tabs;

const CreatePretrained = props => {
  const [codePathPrefix, setCodePathPrefix] = useState('');
  const [visible, setVisible] = useState(false);
  const [form] = Form.useForm();
  const [form2] = Form.useForm();
  const { validateFields, getFieldValue, setFieldsValue } = form;
  // const [sourceType, setSourceType] = useState(1);
  const [btnDisabled, setBtnDisabled] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [runningParams, setRunningParams] = useState([{ key: '', value: '', createTime: generateKey() }]);
  const [presetParamsVisible, setPresetParamsVisible] = useState(false);
  const [presetRunningParams, setPresetRunningParams] = useState([]);
  const [currentSelectedPresetParamsId, setCurrentSelectedPresetParamsId] = useState('');
  const [datasets, setDatasets] = useState([]);

  const usages = [
    { key: 'ImageClassification',label: '图像分类' }, 
    { key: 'ObjectDetection',label: '物体检测' }, 
  ];

  const engineTypes = [
    { key: '1',label: 'tensorflow , tf-1.8.0-py2.7' }, 
    { key: '2',label: 'tensorflow , tf-1.8.0-py2.7' }, 
  ];

  useEffect(() => {
    // getAvailableResource();
    getTestDatasets();
  }, []);

  useEffect(() => {
    if (presetParamsVisible) {
      fetchPresetTemplates().then(res => {
        if (res.code === 0) {
          const template = res.data.Templates;
          setPresetRunningParams(template);
          if (template.length > 0) {
            setCurrentSelectedPresetParamsId(template[0].metaData?.id);
          }
        }
      });
    }
  }, [presetParamsVisible]);

  const getTestDatasets = async () => {
    const { code, data, msg } = await getAllLabeledDatasets();
    if (code === 0 && data) {
      const { datasets } = data;
      setDatasets(datasets);
    } else {
      message.error(msg);
    }
  }

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

  const addParams = () => {
    const newRunningParams = runningParams.concat({
      key: '',
      value: '',
      createTime: generateKey(),
    });
    setRunningParams(newRunningParams);
  };

  const validateRunningParams = async (index, propertyName, ...args) => {
    const [rule, value, callback] = [...args];
    if (propertyName === 'value') {
      callback();
      return;
    }
    if (!value) {
      callback();
      return;
    }
    const runningParams = await getFieldValue('params');
    runningParams.forEach((r, i) => {
      if (r[propertyName] === value && index !== i) {
        callback('不能输入相同的参数名称');
      }
    });
    callback();
  };

  const removeRuningParams = async (key) => {
    const values = await getFieldValue('params');
    console.log('values', values, key);
    [...runningParams].forEach((param, index) => {
      param.key = values[index].key;
      param.value = values[index].value;
    });
    const newRunningParams = [...runningParams].filter((param) => {
      if (param.createTime) {
        return param.createTime !== key;
      } else {
        return param.key !== key;
      }
    });
    setRunningParams(newRunningParams);
    setFieldsValue({
      params: newRunningParams.map(params => ({ key: params.key, value: params.value }))
    });
  };

  const handleConfirmPresetParams = () => {
    const currentSelected = presetRunningParams.find(p => p.metaData.id == currentSelectedPresetParamsId);
    
    if (currentSelected) {
      // 防止name被覆盖
      if (currentSelected.params.name) {
        delete currentSelected.params.name
      }

      setFieldsValue({
        ...currentSelected.params, 
      });
      // console.log('currentSelected.params.params', currentSelected.params.params)
      const params = Object.entries(currentSelected.params.params|| {}).map(item => {
        var obj = {};
        // console.log('item', item);
        obj['key'] = item[0];
        obj['value'] = item[1];
        return obj;
      });
      setRunningParams(params);
      setFieldsValue({
        params: params
      });
    }
    setPresetParamsVisible(false);
  };

  const handleSelectPresetParams = (current) => {
    // console.log(current);
    setCurrentSelectedPresetParamsId(current);
  };  

  const handleDatasetChange = (value, option) => {
    // setDatasetName(option.children);
    setFieldsValue({datasetPath: option.key})
  };

  const onFinish = async (values) => {
    // console.log(values);
    let params = {};
    values.params && values.params.forEach(p => {
      params[p.key] = p.value;
    });    
    const { name, use, engine, precision, size, datasetName, datasetPath, dataFormat, codePath, startupFile, outputPath, paramPath } = values;
    const data = {
      name,
      use,
      engine,
      precision,
      size: parseInt(size),
      datasetName,
      datasetPath,
      params,
      dataFormat,
      codePath,
      startupFile,
      outputPath,
      paramPath,
      isAdvance: true,
    }
    
    const { code, msg } = await addModel(data);

    if (code === 0) {
      message.success(`创建成功`);
      history.push('/model-training/PretrainedModels');
    } else {
      msg && message.error(`创建失败:${msg}`);
    }
  };

  const showJobModal = () => {
    setVisible(true);
    // setCurrent(item);
  };

  const onReset = () => {
    form.resetFields();
  };

  const handleCancel = () => {
    setVisible(false);
  };

  const handleSubmit = item => {
    // console.log(item)
    form.setFieldsValue({job: item.name});
    setVisible(false);
  };

  const uploadProps = {
    name: 'data',
    multiple: false,
    action: '/ai_arts/api/files/upload/dataset',
    headers: {
      Authorization: 'Bearer ' + window.localStorage.token,
    },
    onChange(info) {
      const { status } = info.file;
      setBtnDisabled(true);
      if (status !== 'uploading') {
        console.log(info.file, info.fileList);
      }
      if (status === 'done') {
        setFileList(info.fileList);
        setBtnDisabled(false);
        message.success(`${info.file.name}文件上传成功！`);
      } else if (status === 'error') {
        message.error(`${info.file.name} 文件上传失败！`);
        setBtnDisabled(false);
      }
    },
    beforeUpload(file) {
      const { type, size } = file;
      const isOverSize = size / 1024 / 1024 / 1024 > 2; 
      return new Promise((resolve, reject) => {
        if (!fileList.length && (type === 'application/x-zip-compressed' || type === 'application/x-tar' || type === 'application/x-gzip') && !isOverSize) {
          resolve(file);
        } else {
          let text = '';
          text = isOverSize ? '2GB以内的文件' : `${fileList.length ?  '一个文件' : '格式为 .zip, .tar 和 .tar.gz 的文件'}`;
          message.warning(`只支持上传 ${text}！`);
          reject(file);
        }
      });
    },
    onRemove(file) {
      if (fileList.length && file.uid === fileList[0].uid) setFileList([]);
    }
  };

  const layout = {
    labelCol: { span: 3 },
    wrapperCol: { span: 14 },
  };

  return (
    <>
      <PageHeader
        ghost={false}
        onBack={() => history.push('/model-training/PretrainedModels')}
        title="录入预置模型"
      >
        <div
          style={{
            padding: '24px'
          }}
        >
          <Form
            form={form}
            onFinish={onFinish}
            // autoComplete="off"
            initialValues={{ 
              dataFormat: 'tfrecord',
              engine: 'apulistech/tensorflow:1.14.0-gpu-py3',
              precision: '0.99',
              size: '',
              use: '图像分类',
              size: 80*1024*1024,
           }}
          >
            <Form.Item
              {...layout}
              name="name"
              label="模型名称"
              rules={[{ required: true, message: '名称不能为空!' }, { ...jobNameReg }]}
            >
              <Input placeholder="请输入模型名称" />
            </Form.Item>
            <Form.Item
              {...layout}
              name="use"
              label="模型用途"
              rules={[{ required: true, message: '用途不能为空!' }]}
            >
              {/* <Select>
                {
                  usages.map(u => (
                    <Option key={u.key} value={u.key}>{u.label}</Option>
                  ))
                }
              </Select> */}
              <Input placeholder="请输入模型用途" />
            </Form.Item>
            <Divider style={{ borderColor: '#cdcdcd' }} />
            <Form.Item {...layout} label="参数来源">
              <Radio.Group defaultValue={1} buttonStyle="solid">
                <Radio.Button value={1}>手动配置</Radio.Button>
                <Radio.Button value={2} onClick={() => { setPresetParamsVisible(true); }}>导入参数</Radio.Button>
              </Radio.Group>
            </Form.Item>            
            <Form.Item
              {...layout} 
              label="引擎类型"
              name="engine" 
              // rules={[{ required: true, message: '请选择引擎类型' }]}
              rules={[{ required: true, message: '请输入引擎类型' }]} 
            >
              {/* <Select>
                {
                  engineTypes.map(type => (
                    <Option key={type.key} value={type.key}>{type.label}</Option>
                  ))
                }
              </Select> */}
              <Input placeholder="请输入引擎类型" />
            </Form.Item>
            <Form.Item
              {...layout}
              name="precision"
              label="模型精度"
              rules={[{ required: true, message: '模型精度为空!' }]}
            >
              <Input placeholder="请输入模型精度" />
            </Form.Item>                     
            <Form.Item
              {...layout}
              name="size"
              label="模型大小"
              rules={[{ required: true, message: '模型大小不能为空!' }]}
            >
              <Input placeholder="请输入模型大小" />
            </Form.Item>                     
            <Form.Item
              {...layout}
              name="datasetName"
              label="数据集名称"
              rules={[{ required: true, message: '数据集名称不能为空!' }]}
            >
              {/* <Input placeholder="请输入数据集名称" /> */}
              <Select
                onChange={handleDatasetChange}
              >
                {
                  datasets.map(d => (
                    <Option key={d.path} value={d.name}>{d.name}</Option>
                  ))
                }
              </Select>              
            </Form.Item>                     
            <Form.Item
              {...layout}
              name="datasetPath"
              label="数据集路径"
              rules={[{ required: true, message: '数据集路径不能为空!' }]}
            >
              <Input placeholder="请输入数据集路径" />
            </Form.Item>                     
            <Form.Item
              {...layout}
              name="dataFormat"
              label="数据格式"
              rules={[{ required: true, message: '数据格式不能为空!' }]}
            >
              <Input placeholder="请输入数据格式" />
            </Form.Item>                     
            {/* <Form.Item
              {...layout}
              name="modelPath"
              label="模型路径"
              rules={[{ required: true, message: '模型路径不能为空!' }]}
            >
              <Input placeholder="请输入模型路径" />
            </Form.Item>                      */}
            {/* <Form.Item
              {...layout}
              name="modelArgumentPath"
              label="模型权重文件"
              rules={[{ required: true, message: '模型权重文件不能为空!' }]}
            >
              <Input placeholder="请输入模型权重文件路径" />
            </Form.Item>                      */}
            <Form.Item
              {...layout}
              name="codePath"
              label="代码目录"
              rules={[{ required: true, message: '代码目录不能为空!' }]}
            >
              <Input placeholder="请输入代码目录" />
            </Form.Item>                     
            <Form.Item
              {...layout}
              name="startupFile"
              label="启动文件"
              rules={[{ required: true, message: '启动文件不能为空!' }]}
            >
              <Input placeholder="请输入启动文件" />
            </Form.Item> 
            <Form.Item
              {...layout}
              name="outputPath"
              label="输出路径"
              rules={[{ required: true, message: '输出路径不能为空!' }]}
            >
              <Input placeholder="请输入输出路径" />
            </Form.Item>
            <Form.Item
              {...layout}
              name="paramPath"
              label="模型参数路径"
              rules={[{ required: true, message: '模型参数路径不能为空!' }]}
            >
              <Input placeholder="请输入参数路径" />
            </Form.Item>
            <Form.Item 
              // {...layout}
              label="运行参数"
              labelCol={{ span: 3 }}
            >
              {
                runningParams.map((param, index) => {
                  return (
                    <div>
                      <Form.Item initialValue={runningParams[index].key} rules={[{ validator(...args) { validateRunningParams(index, 'key', ...args); } }]} name={['params', index, 'key']} wrapperCol={{ span: 24 }} style={{ display: 'inline-block' }}>
                        <Input style={{ width: 200 }} />
                      </Form.Item>
                      <PauseOutlined rotate={90} style={{ marginTop: '8px', width: '30px' }} />
                      <Form.Item initialValue={runningParams[index].value} rules={[{ validator(...args) { validateRunningParams(index, 'value', ...args); } }]} name={['params', index, 'value']} wrapperCol={{ span: 24 }} style={{ display: 'inline-block' }}>
                        <Input style={{ width: 200 }} />
                      </Form.Item>
                      <DeleteOutlined style={{ marginLeft: '10px', cursor: 'pointer' }} onClick={() => removeRuningParams(param.createTime || param.key)} />
                    </div>
                  );
                })
              }
              <div className={styles.addParams} onClick={addParams}>
                <PlusSquareOutlined fill="#1890ff" style={{ color: '#1890ff', marginRight: '10px' }} />
                <a>点击增加参数</a>
              </div>
            </Form.Item>              
            <Form.Item
              style={{ float: 'right' }}
            >
              <Button type="primary" htmlType="submit" disabled={btnDisabled}>立即创建</Button>
            </Form.Item>
          </Form>
        </div>
      </PageHeader>
      <Modal
        visible={presetParamsVisible}
        onCancel={() => setPresetParamsVisible(false)}
        onOk={handleConfirmPresetParams}
        title="导入评估参数"
        forceRender
        width="80%"
      >
        <Form
          form={form2}
        >
          {
            presetRunningParams.length > 0 ? 
            <Tabs defaultActiveKey={presetRunningParams[0].metaData?.id} tabPosition="left" onChange={handleSelectPresetParams} style={{ height: 220 }}>
              {presetRunningParams.map((p, index) => (
                <TabPane tab={p.metaData.name} key={p.metaData.id}>
                  {/* <Row>
                    <Col span={5}>
                      计算节点个数
                  </Col>
                    <Col span={19}>
                      {p.params.deviceNum}
                    </Col>
                  </Row> */}
                  <Row>
                    <Col span={5}>
                      启动文件
                  </Col>
                    <Col span={19}>
                      {p.params.startupFile}
                    </Col>
                  </Row>
                  <Row>
                    <Col span={5}>
                      代码目录
                  </Col>
                    <Col span={19}>
                      {p.params.codePath}
                    </Col>
                  </Row>
                  <Row>
                    <Col span={5}>
                      训练数据集
                  </Col>
                    <Col span={19}>
                      {p.params.datasetPath}
                    </Col>
                  </Row>
                  <Row>
                    <Col span={5}>
                      输出路径
                  </Col>
                    <Col span={19}>
                      {p.params.outputPath}
                    </Col>
                  </Row>
                  <Row>
                    <Col span={5}>
                      运行参数
                  </Col>
                    <Col span={19}>
                      {p.params.params && formatParams(p.params.params).map(p => <div>{p}</div>)}
                    </Col>
                  </Row>
                  <Row>
                    <Col span={5}>
                      计算节点规格
                  </Col>
                    <Col span={19}>
                      {p.params.deviceType}
                    </Col>
                  </Row>
                  <Row>
                    <Col span={5}>
                      引擎类型
                  </Col>
                    <Col span={19}>
                      {getNameFromDockerImage(p.params.engine)}
                    </Col>
                  </Row>
                </TabPane>
              ))}
            </Tabs>
              : <div>暂无</div>
          }
        </Form>
    </Modal>
    </>  
  );
};

export default CreatePretrained;