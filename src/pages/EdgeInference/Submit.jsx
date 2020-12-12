import React, { useState, useEffect } from 'react';
import { Form, Select, Input, Card, PageHeader, Button, message } from 'antd';
import {
  PauseOutlined,
  DeleteOutlined,
  PlusSquareOutlined,
  FolderOpenOutlined,
} from '@ant-design/icons';
import _ from 'lodash';
import { history, useIntl } from 'umi';
import { connect } from 'dva';

import { NameReg, NameErrorText } from '@/utils/const';
import { getTypes, submit } from './service';
import FormItem from 'antd/lib/form/FormItem';
import SelectModelPath from '@/components/BizComponent/SelectModelPath';

const initArg = {
  key: '',
  val: '',
};

const argsOptions = [
  'mode',
  'weight',
  'check_report',
  'input_format',
  'out_nodes',
  'is_output_adjust_hw_layout',
  'input_fp16_nodes',
  'is_input_adjust_hw_layout',
  'input_shape',
  'json',
  'dump_mode',
  'om',
  'op_name_map',
  'insert_op_conf',
  'output_type',
  'singleop',
  'precision_mode',
  'op_select_implmode',
  'optypelist_for_implmode',
  'disable_reuse_memory',
  'auto_tune_mode',
  'aicore_num',
  'buffer_optimize',
  'enable_small_channel',
  'fusion_switch_file',
  'dynamic_batch_size',
  'dynamic_image_size',
  'log',
];

const ArgNameReg = /^[A-Za-z0-9-_."",:]+$/;

const Submit = (props) => {
  const intl = useIntl();
  const [typesData, setTypesData] = useState([]);
  const [argArr, setArgArr] = useState([{ ...initArg, time: new Date().getTime() }]);
  const [btnLoading, setBtnLoading] = useState(false);
  const [selectModelPathVisible, setSelectModelPathVisible] = useState(false);
  const [form] = Form.useForm();

  const getTypesData = async () => {
    const { code, data } = await getTypes();
    if (code === 0) {
      setTypesData(data.conversionTypes);
    }
  };
  const { currentSelectedVC } = props.vc;

  const onArgsArrChange = (type, time, v) => {
    const newArr = _.cloneDeep(argArr);
    const idx = newArr.findIndex((i) => i.time === time);
    if (type === 1) {
      newArr.push({ ...initArg, time: new Date().getTime() });
    } else if (type === 2) {
      newArr[idx].key = v;
    } else if (type === 3) {
      newArr[idx].val = v;
    } else {
      newArr.splice(idx, 1);
    }
    setArgArr(newArr);
  };

  const handleSelectModelPath = (row) => {
    setSelectModelPathVisible(false);
    if (!row) return;
    form.setFieldsValue({
      inputPath: row.outputPath,
    });
  };

  useEffect(() => {
    getTypesData();
  }, []);

  const commonLayout = {
    labelCol: { span: 4 },
    wrapperCol: { span: 8 },
  };

  const onSubmit = () => {
    form.validateFields().then(async (values) => {
      setBtnLoading(true);
      const { jobName, inputPath, outputPath, conversionType } = values;
      const temp = { ...values };
      let conversionArgs = {};
      delete temp.jobName;
      delete temp.outputPath;
      delete temp.inputPath;
      delete temp.conversionType;
      Object.keys(temp).forEach((i) => {
        if (temp[i]) {
          const type = i.split('-')[0];
          const time = i.split('-')[1];
          if (type === 'argKey') {
            conversionArgs[temp[i]] = '';
          } else {
            const key = temp[`argKey-${time}`];
            conversionArgs[key] = temp[i];
          }
        }
      });
      const { code, data } = await submit({
        jobName,
        inputPath,
        outputPath,
        conversionType,
        conversionArgs,
        vcName: currentSelectedVC,
      });
      setBtnLoading(false);
      if (code === 0) {
        message.success(intl.formatMessage({ id: 'edgeInference.create.submit.success' }));
        history.push('/Inference/EdgeInference');
      }
    });
  };

  return (
    <PageHeader
      title={intl.formatMessage({ id: 'edgeInference.create.title' })}
      onBack={() => history.push('/Inference/EdgeInference')}
    >
      <Card>
        <Form form={form} preserve={false} initialValues={{}}>
          <Form.Item
            label={intl.formatMessage({ id: 'edgeInferenceJobCreate.label.jobName' })}
            name="jobName"
            rules={[
              {
                required: true,
                message: intl.formatMessage({ id: 'edgeInferenceJobCreate.rule.needName' }),
              },
              { pattern: NameReg, message: NameErrorText },
              { max: 20 },
            ]}
            {...commonLayout}
          >
            <Input
              placeholder={intl.formatMessage({
                id: 'edgeInferenceJobCreate.placeholder.inputInferenceName',
              })}
            />
          </Form.Item>
          <Form.Item
            label={intl.formatMessage({ id: 'edgeInferenceJobCreate.label.conversionType' })}
            name="conversionType"
            rules={[
              {
                required: true,
                message: intl.formatMessage({ id: 'edgeInferenceJobCreate.rule.needType' }),
              },
            ]}
            {...commonLayout}
          >
            <Select
              placeholder={intl.formatMessage({
                id: 'edgeInferenceJobCreate.placeholder.selectType',
              })}
            >
              {typesData.map((i) => (
                <Option value={i}>{i}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label={intl.formatMessage({ id: 'edgeInferenceJobCreate.label.inputPath' })}
            labelCol={commonLayout.labelCol}
            wrapperCol={commonLayout.wrapperCol + 3}
            required
          >
            <FormItem
              name="inputPath"
              rules={[
                {
                  required: true,
                  message: intl.formatMessage({ id: 'edgeInferenceJobCreate.rule.needInputPath' }),
                },
              ]}
              style={{ display: 'inline-block', width: '40%' }}
            >
              <Input
                placeholder={intl.formatMessage({
                  id: 'edgeInferenceJobCreate.placeholder.inputInputPath',
                })}
              />
            </FormItem>
            <FormItem style={{ display: 'inline-block', width: '36px', marginLeft: '16px' }}>
              <Button
                icon={<FolderOpenOutlined />}
                onClick={() => setSelectModelPathVisible(true)}
              ></Button>
            </FormItem>
          </Form.Item>
          <Form.Item
            label={intl.formatMessage({ id: 'edgeInferenceJobCreate.label.outputPath' })}
            name="outputPath"
            rules={[
              {
                required: true,
                message: intl.formatMessage({ id: 'edgeInferenceJobCreate.rule.needOutputPath' }),
              },
            ]}
            {...commonLayout}
          >
            <Input
              placeholder={intl.formatMessage({
                id: 'edgeInferenceJobCreate.placeholder.inputOutputPath',
              })}
            />
          </Form.Item>
          <Form.Item
            label={intl.formatMessage({ id: 'edgeInferenceJobCreate.label.transformParams' })}
            rules={[{ required: true }]}
            labelCol={commonLayout.labelCol}
          >
            {argArr.map((i, idx) => {
              const { time, key, val } = i;
              return (
                <div key={time}>
                  <Form.Item
                    name={`argKey-${time}`}
                    style={{ display: 'inline-block' }}
                    rules={[
                      {
                        required: Boolean(val),
                        message: intl.formatMessage({
                          id: 'edgeInferenceJobCreate.rule.needParamsType',
                        }),
                      },
                    ]}
                  >
                    <Select
                      placeholder={intl.formatMessage({
                        id: 'edgeInferenceJobCreate.placeholder.selectParamsType',
                      })}
                      style={{ width: 220 }}
                      allowClear
                      optionFilterProp="children"
                      showSearch
                      onChange={(v) => onArgsArrChange(2, time, v)}
                    >
                      {argsOptions.map((m) => (
                        <Option value={m} disabled={argArr.findIndex((n) => n.key === m) > -1}>
                          {m}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                  <PauseOutlined rotate={90} style={{ marginTop: '8px', width: '30px' }} />
                  <Form.Item
                    name={`argVal-${time}`}
                    rules={
                      key === 'insert_op_conf'
                        ? []
                        : [
                            // {
                            //   pattern: ArgNameReg,
                            //   message: intl.formatMessage({
                            //     id: 'edgeInferenceJobCreate.rule.supportInput',
                            //   }),
                            // },
                          ]
                    }
                    style={{ display: 'inline-block' }}
                    className="speItem"
                  >
                    <Input
                      style={{ width: 276 }}
                      placeholder={intl.formatMessage({
                        id: 'edgeInferenceJobCreate.placeholder.inputParamsValue',
                      })}
                      onChange={(e) => onArgsArrChange(3, time, e.target.value)}
                    />
                  </Form.Item>
                  {argArr.length > 1 && (
                    <DeleteOutlined
                      style={{ marginLeft: '10px', cursor: 'pointer' }}
                      onClick={() => onArgsArrChange(4, time)}
                    />
                  )}
                </div>
              );
            })}
            <div style={{ float: 'left' }} onClick={() => onArgsArrChange(1)}>
              <PlusSquareOutlined fill="#1890ff" style={{ color: '#1890ff', marginRight: 6 }} />
              <a>{intl.formatMessage({ id: 'edgeInference.create.clickForAddParams' })}</a>
            </div>
          </Form.Item>
          <Button type="primary" style={{ float: 'right' }} onClick={onSubmit} loading={btnLoading}>
            {intl.formatMessage({ id: 'edgeInferenceJobCreate.submit' })}
          </Button>
        </Form>
        {selectModelPathVisible && (
          <SelectModelPath
            visible={selectModelPathVisible}
            onOk={handleSelectModelPath}
            onCancel={() => setSelectModelPathVisible(false)}
          />
        )}
      </Card>
    </PageHeader>
  );
};

export default connect(({ vc }) => ({ vc }))(Submit);
