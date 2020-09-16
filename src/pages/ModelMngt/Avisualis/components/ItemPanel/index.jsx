import { message, Form, Input, Button, Select, Descriptions, InputNumber, Modal } from 'antd';
import React, { useState, useEffect, useRef, useForm } from 'react';
import styles from './index.less'; 
import { history, useDispatch } from 'umi';
import { submitAvisualis, patchAvisualis } from '../../service';
import { connect } from 'dva';
import { MODELSTYPES } from '@/utils/const';
import _ from 'lodash';
import AddFormModal from '../AddFormModal';

const { Option } = Select;

const ItemPanel = (props) => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const addFormModalRef = useRef();
  const { avisualis, flowChartData, selectItem, setFlowChartData, detailId, onChangeNode } = props;
  const { addFormData, treeData } = avisualis;
  const [btnLoading, setBtnLoading] = useState(false);
  const [modalFlag, setModalFlag] = useState(false);
  const [changeNodeOptions, setChangeNodeOptions] = useState([]);
  const [changeNodeKey, setChangeNodeKey] = useState({});
  const hasSelectItem = selectItem && selectItem._cfg && selectItem._cfg.model.config.length > 0;

  useEffect(() => {
    if (selectItem) {
      const selectId = selectItem._cfg.model.id;
      const child = treeData.find(i => selectId.split('-')[0] === i.key).children;
      setChangeNodeOptions(child.filter(i => i.key !== selectId));
    }
  }, [selectItem]);

  const onSubmit = async() => {
    addFormModalRef.current.form.validateFields().then(async (values) => {
      const { nodes, edges } = flowChartData;
      if (nodes.length !== treeData.length) {
        message.warning('请完成剩余步骤！');
        return;
      }
      setBtnLoading(true);
      const _values = _.cloneDeep(values);
      if (_values.deviceType === 'PSDistJob') {
        _values.numPs = 1;
        _values.deviceNum = _values.deviceTotal;
      }
      _values.datasetPath = nodes[0].config[0].value;
      _values.outputPath = nodes[nodes.length - 1].config[0].value;
      _values.paramPath = _values.outputPath;
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
      let submitData = {
        ...addFormData,
        ..._values,
        nodes: newNodes,
        edges: newEdges,
      };
      if (!detailId) delete submitData.id;
      const { code, data } = detailId ? await patchAvisualis(detailId, submitData) : await submitAvisualis(submitData);
      if (code === 0) {
        message.success(`${detailId ? '保存' : '创建'}成功！`);
        dispatch({
          type: 'avisualis/saveData',
          payload: {
            addFormData: {}
          }
        });
        history.push('/ModelManagement/avisualis');
      }
      setBtnLoading(false);
    });
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

  const selectChangeNode = () => {
    if (!changeNodeKey) {
      message.warning('请选择更换节点');
      return;
    }
    const success = onChangeNode(changeNodeKey);
    if (success) {
      setModalFlag(false);
      message.success('更换成功！');
    }
  }

  return (
    <div className={styles.itemPanelWrap}>
      <div className={styles.btnWrap}>
        <Button onClick={() => history.push(`/ModelManagement/avisualis`)}>返回</Button>
        <Button type="primary" loading={btnLoading} onClick={onSubmit}>{detailId ? '保存模型' : '创建模型'}</Button>
      </div>
      <Descriptions title="模型详情"></Descriptions>
      <AddFormModal ref={addFormModalRef} detailData={addFormData} />
      {hasSelectItem &&
        <>
          <div className="ant-descriptions-title">{`${hasSelectItem ? '节点配置' : '该节点无配置项'}`}</div>
          <Form form={form}>
            {getConfig()}
          </Form>
        </>}
        <div style={{ float: 'right', textAlign: 'right' }}>
          {hasSelectItem && <Button type="primary" onClick={onSaveConfig} style={{ marginRight: 16 }}>保存配置</Button>}
          {changeNodeOptions.length > 0 && <Button type="primary" onClick={() => setModalFlag(true)}>更换节点</Button>}
        </div>
      {modalFlag && (
        <Modal
          title="更换节点"
          visible={modalFlag}
          onCancel={() => setModalFlag(false)}
          destroyOnClose
          maskClosable={false}
          footer={[
            <Button onClick={() => setModalFlag(false)}>取消</Button>,
            <Button type="primary" onClick={selectChangeNode}>更换</Button>
          ]}
        >
          <Select placeholder="请选择节点" style={{ width: '100%' }} onChange={v => setChangeNodeKey(v)}>
            {changeNodeOptions.map(i => <Option value={i.key}>{i.title}</Option>)}
          </Select>
        </Modal>
      )}
    </div>
  );
};

export default connect(({ avisualis }) => ({ avisualis }))(ItemPanel);