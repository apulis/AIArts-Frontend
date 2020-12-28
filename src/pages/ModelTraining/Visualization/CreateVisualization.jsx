import React, { useState, useEffect } from 'react';
import { Form, Input, PageHeader, Button, message, Select, Alert } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { jobNameReg, linuxPathReg } from '@/utils/reg';
import { createVisualization } from '@/services/modelTraning';
import { history, connect, useIntl } from 'umi';
import { getModels } from '../../ModelMngt/ModelList/services/index';
import { getResource } from '../../CodeDevelopment/service';
import { FolderOpenOutlined } from '@ant-design/icons';
import SelectModelTrainingModel from '@/components/BizComponent/SelectModelTrainingModel';
import FormItem from 'antd/lib/form/FormItem';

const { TextArea } = Input;

const CreateVisualization = (props) => {
  const intl = useIntl();
  const goBackPath = '/model-training/visualization';
  const [form] = useForm();
  const { validateFields, setFieldsValue, getFieldValue } = form;
  const [codePathPrefix, setCodePathPrefix] = useState('');
  const [selectModelPathVisible, setSelectModelPathVisible] = useState(false);
  const { currentSelectedVC } = props.vc;
  const [importPathFlag, setImportPathFlag] = useState(false);
  const [modelName, setModelName] = useState('');

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
    const { name, path } = row;
    setImportPathFlag(true);
    setModelName(name);
    if (path) {
      setFieldsValue({
        tensorboardLogDir: path.split(codePathPrefix)[1],
      });
    } else {
      message.info(intl.formatMessage({ id: 'createVisualization.create.job.notHaveVisualPath' }));
    }
  };

  const handleSubmit = async () => {
    const values = await validateFields();
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
          label={intl.formatMessage({id: 'visualJobCreate.importVisualPath'})}
        >
          <Button
            type='primary'
            onClick={() => { setSelectModelPathVisible(true); }}
          >
            {intl.formatMessage({id: 'visualJobCreate.selectTraing'})}
            </Button>
            {importPathFlag && '  ' + intl.formatMessage({id: 'visualJobCreate.jobName'}) + modelName}
        </Form.Item>
        <Form.Item
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 14 }}
          label={intl.formatMessage({id: 'visualJobCreate.label.tensorboardLogDir'})}
          required
        >
          <Form.Item name="tensorboardLogDir" style={{ display: 'inline-block', width: '300px', marginBottom: '0px' }} rules={[{ required: true, message: intl.formatMessage({id: 'visualJobCreate.placeholder.inputPath'}) }]}>
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