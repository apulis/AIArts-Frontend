import { message, Form, Input, Button, Select, Radio, InputNumber } from 'antd';
import React, { useState, useImperativeHandle, forwardRef, useEffect } from 'react';
import { NameReg, NameErrorText } from '@/utils/const';
import { fetchAvilableResource } from '../../../../../services/modelTraning';
import { getDeviceNumPerNodeArrByNodeType, getDeviceNumArrByNodeType } from '@/utils/utils';
import _ from 'lodash';
import { useIntl } from 'umi';
import { getAvailPSDDeviceNumber, getAvailRegularDeviceNumber } from '@/utils/device-utils';

const { Option } = Select;

const AddFormModal = (props, ref) => {
  const intl = useIntl();
  const [form] = Form.useForm();
  const { getFieldValue, setFieldsValue } = form;
  const { detailData } = props;
  const [jobTrainingType, setJobtrainingtype] = useState('RegularJob');
  const [nodeInfo, setNodeInfo] = useState([]);
  const [deviceTotal, setDeviceTotal] = useState(0);
  const [deviceList, setDeviceList] = useState([]);
  const [deviceType, setDeviceType] = useState('');
  const [availableDeviceNumList, setAvailableDeviceNumList] = useState([]);

  useImperativeHandle(ref, () => ({
    form: form,
  }));

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    if (!deviceType) return;
    let list = [];
    if (jobTrainingType === 'PSDistJob') {
      list = getAvailRegularDeviceNumber(deviceType, deviceList.find(val => val.deviceType === deviceType)?.userQuota);
    } else {
      list = getAvailPSDDeviceNumber(deviceType, deviceList.find(val => val.deviceType === deviceType)?.userQuota, getFieldValue('numPsWorker') || 1);
    }

    setAvailableDeviceNumList(list);
  }, [jobTrainingType, deviceList, deviceType, deviceTotal]);

  const getData = async () => {
    if (detailData) {
      const { deviceType, jobTrainingType } = detailData;
      setJobtrainingtype(jobTrainingType);
      setDeviceType(deviceType);
    }
    const { code, data } = await fetchAvilableResource();
    if (code === 0) {
      const { nodeInfo, deviceList } = data;
      setNodeInfo(nodeInfo || []);
      setDeviceList(deviceList);
    }
  };

  const handleDeviceChange = () => {
    const deviceTotal =
      Number(getFieldValue('numPsWorker') || 0) * Number(getFieldValue('deviceNum') || 0);
    setFieldsValue({ deviceTotal: deviceTotal || 0 });
    setDeviceTotal(deviceTotal);
  };

  return (
    <Form
      form={form}
      preserve={false}
      initialValues={detailData || { jobTrainingType: jobTrainingType, numPsWorker: 1 }}
    >
      <Form.Item
        label={intl.formatMessage({ id: 'avisualis.label.name' })}
        name="name"
        rules={[
          {
            required: true,
            message: intl.formatMessage({ id: 'avisualis.rule.needInferenceName' }),
          },
          { pattern: NameReg, message: intl.formatMessage({ id: 'const.nameInputLimit' }) },
          { max: 30 },
        ]}
      >
        <Input
          placeholder={intl.formatMessage({ id: 'avisualis.placeholder.inputInferenceName' })}
        />
      </Form.Item>
      {/* <Form.Item
        label="模型用途"
        name="use"
        rules={[{ required: true, message: '请选择模型用途！' }]}
      >
        <Select placeholder="请选择类型">
          {MODELSTYPES.map(i => <Option value={i.val}>{i.text}</Option>)}
        </Select>
      </Form.Item> */}
      <Form.Item
        label={intl.formatMessage({ id: 'avisualis.label.description' })}
        name="description"
        rules={[
          { required: true, message: intl.formatMessage({ id: 'avisualis.rule.needDescription' }) },
          { max: 50 },
        ]}
      >
        <Input.TextArea
          placeholder={intl.formatMessage({ id: 'avisualis.placeholder.inputDescription' })}
          autoSize={{ minRows: 4 }}
        />
      </Form.Item>
      <Form.Item
        label={intl.formatMessage({ id: 'avisualis.label.jobTrainingType' })}
        rules={[{ required: true }]}
        name="jobTrainingType"
        className="speItem"
      >
        <Radio.Group onChange={(e) => setJobtrainingtype(e.target.value)}>
          <Radio value="PSDistJob">{intl.formatMessage({ id: 'avisualis.value.yes' })}</Radio>
          <Radio value="RegularJob">{intl.formatMessage({ id: 'avisualis.value.no' })}</Radio>
        </Radio.Group>
      </Form.Item>
      {jobTrainingType === 'PSDistJob' && (
        <Form.Item
          label={intl.formatMessage({ id: 'avisualis.label.numPsWorker' })}
          name="numPsWorker"
          rules={[
            {
              required: true,
              message: intl.formatMessage({ id: 'avisualis.rule.neednumPsWorker' }),
            },
            {
              validator(rule, value, callback) {
                if (Number(value) > nodeInfo.length) {
                  callback(
                    `${intl.formatMessage({ id: 'avisualis.curHave' })} ${
                      nodeInfo.length
                    } ${intl.formatMessage({ id: 'avisualis.nodes' })}`,
                  );
                  return;
                }
                if (Number(value) < 1) {
                  callback(`${intl.formatMessage({ id: 'avisualis.min1' })}`);
                  return;
                }
                callback();
              },
            },
          ]}
        >
          <InputNumber
            style={{ width: '100%' }}
            onChange={handleDeviceChange}
            min={1}
            max={nodeInfo.length}
          />
        </Form.Item>
      )}
      <Form.Item
        label={intl.formatMessage({ id: 'avisualis.label.deviceNum' })}
        name="deviceType"
        rules={[{ required: true }]}
      >
        <Select onChange={(v) => setDeviceType(v)}>
          {deviceList.map((d) => (
            <Option key={d.deviceType} value={d.deviceType}>{d.deviceType}</Option>
          ))}
        </Select>
      </Form.Item>
      {deviceType && (
        <Form.Item
          label={
            jobTrainingType === 'PSDistJob'
              ? intl.formatMessage({ id: 'avisualis.label.deviceNumPerNode' })
              : intl.formatMessage({ id: 'avisualis.label.deviceNum' })
          }
          name="deviceNum"
          rules={[
            { required: true, message: intl.formatMessage({ id: 'avisualis.rule.needDeviceNum' }) },
          ]}
        >
          <Select onChange={handleDeviceChange}>
            {availableDeviceNumList.map((i) => (
              <Option key={i} value={i}>{i}</Option>
            ))}
          </Select>
        </Form.Item>
      )}
      {jobTrainingType === 'PSDistJob' && (
        <Form.Item
          label={intl.formatMessage({ id: 'avisualis.label.deviceTotal' })}
          name="deviceTotal"
        >
          <Input value={deviceTotal} disabled />
        </Form.Item>
      )}
    </Form>
  );
};

export default forwardRef(AddFormModal);
