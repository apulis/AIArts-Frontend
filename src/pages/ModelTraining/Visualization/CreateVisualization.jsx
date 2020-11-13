import React, { useState, useEffect } from 'react';
import { Form, Input, PageHeader, Button, message, Select } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { jobNameReg, linuxPathReg } from '@/utils/reg';
import { createVisualization } from '@/services/modelTraning';
import { history, connect, useIntl } from 'umi';
import { getModels } from '../../ModelMngt/ModelList/services/index';
import { getResource } from '../../CodeDevelopment/service';

const { TextArea } = Input;

const CreateVisualization = (props) => {
  const intl = useIntl();
  const goBackPath = '/model-training/visualization';
  const [form] = useForm();
  const { validateFields, setFieldsValue, getFieldValue } = form;
  const [modelArr, setModelArr] = useState([]);
  const [curModel, setCurModel] = useState();
  const [codePathPrefix, setCodePathPrefix] = useState('');
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
    const modelList = await apiGetModelList();
    const resource = await apiGetResource();
    if (modelList && resource) {
      const codePathPrefix = resource.codePathPrefix;
      const models = modelList.models.map((item, index) => {
        return {
          id: item.id,
          name: item.name,
          path: item.visualPath ? item.visualPath.replace(codePathPrefix, '') : '',
        };
      });
      setModelArr(models);
      setCodePathPrefix(codePathPrefix);
    }
  };

  const onCreate = async () => {
    const values = await validateFields();
    values.tensorboardLogDir = codePathPrefix + values.tensorboardLogDir;
    const res = await createVisualization({ ...values, vcName: currentSelectedVC });
    if (res.code === 0) {
      message.success(intl.formatMessage({ id: 'createVisualization.create.success' }));
      history.push(goBackPath);
    }
  };

  const handleModelChange = (modelId) => {
    const model = modelArr.find((model) => model.id === modelId);
    if (model) setCurModel(model);
  };

  useEffect(() => {
    renderInitForm();
  }, []);

  useEffect(() => {
    if (curModel) {
      setFieldsValue({ tensorboardLogDir: curModel.path });
    }
  }, [curModel]);

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
          name="selectModel"
          label={intl.formatMessage({ id: 'visualJobCreate.label.selectModel' })}
        >
          <Select
            placeholder={intl.formatMessage({ id: 'visualJobCreate.placeholder.selectModel' })}
            style={{ width: 300 }}
            allowClear
            optionFilterProp="children"
            showSearch
            onChange={() => {
              handleModelChange(getFieldValue('selectModel'));
            }}
          >
            {modelArr.map((model) => (
              <Option value={model.id}>{model.name}</Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 14 }}
          name="tensorboardLogDir"
          label={intl.formatMessage({ id: 'visualJobCreate.label.tensorboardLogDir' })}
          rules={[{ required: true }]}
        >
          <Input
            addonBefore={codePathPrefix}
            placeholder={intl.formatMessage({
              id: 'visualJobCreate.placeholder.inputVisualLogPath',
            })}
          />
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
      <Button type="primary" onClick={onCreate} style={{ marginLeft: '16.7%' }}>
        {intl.formatMessage({ id: 'visualJobCreate.submit' })}
      </Button>
    </>
  );
}

export default connect(({ vc }) => ({ vc }))(CreateVisualization);