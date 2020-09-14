import { message, Form, Input, Button, Select, Descriptions, InputNumber } from 'antd';
import React, { useState, useEffect, useRef, useForm } from 'react';
import styles from './index.less'; 
import { history, useDispatch } from 'umi';
import { submitAvisualis, patchAvisualis } from '../../service';
import { connect } from 'dva';
import { MODELSTYPES } from '@/utils/const';
import _ from 'lodash';

const { Option } = Select;

const ItemPanel = (props) => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const { avisualis, flowChartData, selectItem, setFlowChartData, id } = props;
  const { addFormData, treeData } = avisualis;
  const [btnLoading, setBtnLoading] = useState(false);
  const [modalFlag, setModalFlag] = useState(false);
  const [changeNodeOptions, setChangeNodeOptions] = useState([]);

  useEffect(() => {
    if (selectItem) {
      const child = treeData.find(i => selectItem._cfg.model.id.split('-')[0] === i.key).children;
      setChangeNodeOptions(child);
    }
  }, [selectItem]);

  const onSubmit = async() => {
    const { nodes, edges } = flowChartData;
    if (nodes.length !== treeData.length) {
      message.warning('请完成剩余步骤！');
      return;
    }
    setBtnLoading(true);
    const _addFormData = _.cloneDeep(addFormData);
    const _flowChartData = _.cloneDeep(flowChartData);
    if (_addFormData.deviceType === 'PSDistJob') {
      _addFormData.numPs = 1;
      _addFormData.deviceNum = _addFormData.deviceTotal;
    }
    _addFormData.datasetPath = nodes[0].config[0].value;
    _addFormData.outputPath = nodes[nodes.length - 1].config[0].value;
    _addFormData.paramPath = _addFormData.outputPath;
    const newNodes = nodes.map(i => {
      return {
        ...i,
        id: i.id.split('-')[0]
      }
    });
    const newEdges = edges.map(i => {
      const { source, target } = i;
      return {
        source: source,
        target: target
      }
    });
    const submitData = {
      ..._addFormData,
      nodes: newNodes,
      edges: newEdges,
    };
    // const { code, data } = id ? await patchAvisualis(id, submitData) : await submitAvisualis(submitData);
    const { code, data } = await submitAvisualis(submitData);
    if (code === 0) {
      message.success(`${id ? '保存' : '创建'}成功！`);
      dispatch({
        type: 'avisualis/saveData',
        payload: {
          addFormData: {}
        }
      });
      history.push('/ModelManagement/avisualis');
    }
    setBtnLoading(false);
  }

  const getConfig = () => {
    const { config } = selectItem._cfg.model;
    return config.map(i => {
      const { type, value, key, options } = i;
      if (type === 'string' || type === 'disabled') {
        return (
        <Form.Item name={key} label={key} initialValue={value} rules={[{ required: true, message: `请输入${key}` }]}>
          <Input placeholder={`请输入${key}`} disabled={type === 'disabled'} />
        </Form.Item>)
      } else if (type === 'number') {
        return (
        <Form.Item name={key} label={key} initialValue={value} rules={[{ required: true, message: `请输入${key}` }]}>
          <InputNumber style={{ width: '100%' }} />
        </Form.Item>)
      } else if (type === 'select') {
        return (
        <Form.Item name={key} label={key} initialValue={value} rules={[{ required: true, message: `请选择${key}！` }]}>
          <Select placeholder="请选择">
            {options.map(o => <Option key={o} value={o}>{o}</Option>)}
          </Select>
        </Form.Item>)
      }
    }) 
  }

  const onSaveConfig = () => {
    form.validateFields().then(async (values) => {
      const newValues = Object.keys(values).map(i => values[i]);
      const cloneData = _.cloneDeep(flowChartData);
      const selectIdx = selectItem._cfg.model.idx;
      cloneData.nodes[selectIdx].config.forEach((m, n) => {
        m.value = newValues[n];
      });
      setFlowChartData(cloneData);
      message.success('保存成功！');
    })
  }

  const getMODELSTYPESText = () => {
    const data = MODELSTYPES.find(i => i.val === addFormData.use);
    return data ? data.text : '--';
  }

  // console.log("-------", selectItem)
  // console.log("-------treeData", treeData)


  return (
    <div className={styles.itemPanelWrap}>
      <div className={styles.btnWrap}>
        <Button onClick={() => history.push(`/ModelManagement/avisualis`)}>返回</Button>
        <Button type="primary" loading={btnLoading} onClick={onSubmit}>{id ? '保存模型' : '创建模型'}</Button>
      </div>
      {selectItem && selectItem._cfg ?
        <>
          <div className="ant-descriptions-title">{`${selectItem._cfg.model.config.length > 0 ? '节点配置' : '该节点无配置项'}`}</div>
          <Form form={form}>
            {getConfig()}
          </Form>
          <div style={{ float: 'right', textAlign: 'right' }}>
            {selectItem._cfg.model.config.length > 0 && 
            <Button type="primary" onClick={onSaveConfig} style={{ marginRight: 16 }}>保存配置</Button>}
            {/* {changeNodeOptions.length > 1 && <Button type="primary" onClick={() => setModalFlag(true)}>更换节点</Button>} */}
          </div>
        </> :
        <Descriptions column={1} title="模型详情">
        <Descriptions.Item label="模型名称">{addFormData.name || '--'}</Descriptions.Item>
        <Descriptions.Item label="模型用途">{getMODELSTYPESText()}</Descriptions.Item>
        <Descriptions.Item label="简介">{addFormData.description || '--'}</Descriptions.Item>
      </Descriptions>}
      {modalFlag && (
        <Modal
          title="更换节点"
          visible={modalFlag}
          onCancel={() => setModalFlag(false)}
          destroyOnClose
          maskClosable={false}
          footer={[
            <Button onClick={() => setModalFlag(false)}>取消</Button>,
            <Button type="primary" onClick={onSubmit}>更换</Button>
          ]}
        >
          <Select placeholder="请选择节点">
            {changeNodeOptions.map(i => <Option value={i.key}>{i.title}</Option>)}
          </Select>
        </Modal>
      )}
    </div>
  );
};

export default connect(({ avisualis }) => ({ avisualis }))(ItemPanel);