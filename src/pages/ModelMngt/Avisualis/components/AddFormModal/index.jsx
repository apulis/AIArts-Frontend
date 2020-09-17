import { message, Form, Input, Button, Select, Radio, InputNumber } from 'antd';
import React, { useState, useImperativeHandle, forwardRef, useEffect } from 'react';
import { NameReg, NameErrorText } from '@/utils/const';
import { fetchAvilableResource } from '../../../../../services/modelTraning';
import { getDeviceNumPerNodeArrByNodeType, getDeviceNumArrByNodeType } from '@/utils/utils';
import _ from 'lodash';

const { Option } = Select

const AddFormModal = (props, ref) => {
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
    form: form
  }));

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    if (!deviceType) return;
    let list = [];
    if (jobTrainingType === 'PSDistJob') {
      list = getDeviceNumPerNodeArrByNodeType(nodeInfo, deviceType);
    } else {
      list = getDeviceNumArrByNodeType(nodeInfo, deviceType);
    }
    setAvailableDeviceNumList(list);
  }, [jobTrainingType, nodeInfo, deviceType]);

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
  }

  const handleDeviceChange = () => {
    const deviceTotal = (Number(getFieldValue('numPsWorker') || 0)) * (Number(getFieldValue('deviceNum') || 0));
    setFieldsValue({ deviceTotal: deviceTotal || 0 });
    setDeviceTotal(deviceTotal);
  };

  return (
    <Form form={form} preserve={false} 
      initialValues={detailData || { jobTrainingType: jobTrainingType, numPsWorker: 1 }}>
      <Form.Item
        label="模型名称"
        name="name"
        rules={[
          { required: true, message: '请输入推理名称！' }, 
          { pattern: NameReg, message: NameErrorText },
          { max: 30 }
        ]}
      >
        <Input placeholder="请输入模型名称" />
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
        label="简介"
        name="description"
        rules={[{ required: true, message: '请输入简介！' }, { max: 50 }]} 
      >
        <Input.TextArea placeholder="请输入简介" autoSize={{ minRows: 4 }} />
      </Form.Item>
      <Form.Item label="是否分布式训练" rules={[{ required: true }]} name="jobTrainingType" className='speItem'>
        <Radio.Group onChange={e => setJobtrainingtype(e.target.value)}>
          <Radio value='PSDistJob'>是</Radio>
          <Radio value='RegularJob'>否</Radio>
        </Radio.Group>
      </Form.Item>
      {jobTrainingType === 'PSDistJob' && <Form.Item
        label="节点数量"
        name="numPsWorker"
        rules={[
          { required: true, message: '请填写节点数量！'  },
          {
            validator(rule, value, callback) {
              if (Number(value) > nodeInfo.length) {
                callback(`当前只有 ${nodeInfo.length} 个节点`);
                return;
              }
              if (Number(value) < 1) {
                callback(`不能小于 1`);
                return;
              }
              callback();
            }
          }
        ]}
      >
        <InputNumber
          style={{ width: '100%' }}
          onChange={handleDeviceChange}
          min={1}
          max={nodeInfo.length}
        />
      </Form.Item>}
      <Form.Item label="设备类型" name="deviceType" rules={[{ required: true }]}>
        <Select onChange={v => setDeviceType(v)}>
          {deviceList.map(d => (
            <Option value={d.deviceType}>{d.deviceType}</Option>
          ))}
        </Select>
      </Form.Item>
      {deviceType && <Form.Item
        label={jobTrainingType === 'PSDistJob' ? "每个节点设备数量" : "设备数量"}
        name="deviceNum"
        rules={[{ required: true, message: '请选择设备数量！' }]}
      >
        <Select onChange={handleDeviceChange}>
          {availableDeviceNumList.map(i => (
            <Option value={i}>{i}</Option>
          ))}
        </Select>
      </Form.Item>}
      {jobTrainingType === 'PSDistJob' && <Form.Item
        label="设备总数"
        name="deviceTotal"
      >
        <Input value={deviceTotal} disabled />
      </Form.Item>}
    </Form>
  );
};

export default forwardRef(AddFormModal);