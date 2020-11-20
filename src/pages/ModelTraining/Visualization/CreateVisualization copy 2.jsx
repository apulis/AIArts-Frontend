import React, { useState, useEffect } from 'react';
import { Form, Input, PageHeader, Button, message, Select } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { jobNameReg, linuxPathReg } from '@/utils/reg';
import { createVisualization } from '@/services/modelTraning';
import { history, connect, useIntl } from 'umi';
import { getModels } from '../../ModelMngt/ModelList/services/index';
import { getResource } from '../../CodeDevelopment/service';
import { FolderOpenOutlined } from '@ant-design/icons';
import SelectModelTrainingModel from '@/components/BizComponent/SelectModelTrainingModel';

const { TextArea } = Input;

const CreateVisualization = (props) => {
  const intl = useIntl();
  const goBackPath = '/model-training/visualization';
  const [form] = useForm();
  const { validateFields, setFieldsValue, getFieldValue } = form;
  const [modelArr, setModelArr] = useState([]);
  const [curModel, setCurModel] = useState();
  const [codePathPrefix, setCodePathPrefix] = useState('');
  const [selectModelPathVisible, setSelectModelPathVisible] = useState(false);
  const { currentSelectedVC } = props.vc;

  const apiGetModelList = async () => {
    const obj = await getModels({ vcName: currentSelectedVC });
    const { code, data, msg } = obj;
    if (code === 0) {
      return data;
    } else {
      return null;
    }
  };

  const apiGetResource = async () => {
    const obj = await getResource();
    const { code, data, msg } = obj;
    if (code === 0) {
      return data;
    } else {
      return null;
    }
  };

  const renderInitForm = async () => {
    const resource = await apiGetResource();
    if (resource) {
      setCodePathPrefix(resource.codePathPrefix);
    }
  };

  useEffect(() => {
    renderInitForm();
  }, []);

  const handleSelectModelPath = (row) => {
    setSelectModelPathVisible(false);
    if (!row) return;
    setFieldsValue({
      tensorboardLogDir: row.name,
    });
  };

  const handleSubmit = async () => {
    const values = await validateFields();
    debugger
    values.tensorboardLogDir = codePathPrefix + values.tensorboardLogDir;
    const res = await createVisualization({ ...values, vcName: currentSelectedVC });
    if (res.code === 0) {
      message.success(intl.formatMessage({ id: 'createVisualization.create.success' }));
      history.push(goBackPath);
    }
  };

  return (
    <>
      <PageHeader
        className="site-page-header"
        onBack={() => history.push(goBackPath)}
        title={intl.formatMessage({ id: 'createVisualization.create.title.visualJob' })}
      />
      <Form form={form}>
        <Form.Item
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 14 }}
          style={{ marginTop: '30px' }}
          name="jobName"
          label={intl.formatMessage({ id: 'visualJobCreate.label.jobName' })}
          rules={[{ required: true }, { ...jobNameReg }]}
        >
          <Input
            style={{ width: 300 }}
            placeholder={intl.formatMessage({
              id: 'visualJobCreate.placeholder.inputVisualJobName',
            })}
          />
        </Form.Item>
        <Form.Item
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 14 }}
          label='训练作业名称'
        >
          <Form.Item style={{ display: 'inline-block', width: '263px', marginBottom: '0px' }}>
            <Input placeholder='点击右侧按钮选择训练作业' disabled/>
          </Form.Item>

          <Form.Item style={{ display: 'inline-block', marginLeft: '6px', marginBottom: '0px' }}>
            <Button
              icon={<FolderOpenOutlined />}
              onClick={() => setSelectModelPathVisible(true)}
            ></Button>
          </Form.Item>
        </Form.Item>

        <Form.Item
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 14 }}
          label='训练作业路径'
          required
        >
          <Form.Item name="tensorboardLogDir" style={{ display: 'inline-block', width: '300px', marginBottom: '0px' }} rules={[{ required: true, message: '请输入可视化路径' }]}>
            <Input
              addonBefore={codePathPrefix}
              placeholder={intl.formatMessage({
                id: 'visualJobCreate.placeholder.inputVisualLogPath',
              })}
            />
          </Form.Item>
        </Form.Item>
        <Form.Item
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 14 }}
          name="description"
          label={intl.formatMessage({ id: 'visualJobCreate.label.description' })}
          rules={[{ max: 191 }]}
        >
          <TextArea
            placeholder={intl.formatMessage({ id: 'visualJobCreate.placeholder.inputDescription' })}
          />
        </Form.Item>
      </Form>
      <Button type="primary" onClick={handleSubmit} style={{ marginLeft: '16.7%' }}>
        {intl.formatMessage({ id: 'visualJobCreate.submit' })}
      </Button>
      {selectModelPathVisible && (
        <SelectModelTrainingModel
          visible={selectModelPathVisible}
          onOk={handleSelectModelPath}
          onCancel={() => setSelectModelPathVisible(false)}
        />
      )}
    </>
  );
}

export default connect(({ vc }) => ({ vc }))(CreateVisualization);