import { message, Table, Modal, Form, Input, Button, Card, TextArea, Radio, Select, Tree, PageHeader } from 'antd';
import { PageHeaderWrapper, PageLoading } from '@ant-design/pro-layout';
import React, { useState, useEffect, useRef, useForm } from 'react';
import { getPanel } from '../service';
import styles from './index.less';
import { useDispatch } from 'umi';
import {
  DownOutlined,
  FrownOutlined,
  SmileOutlined,
  MehOutlined,
  FrownFilled,
} from '@ant-design/icons'
import { connect } from 'dva';
import FlowChart from '../components/FlowChart';
import _ from 'lodash';

const { confirm } = Modal;
const { Search } = Input;

const AvisualisDetail = (props) => {
  const { avisualis, location } = props;
  const { type, id } = location.query;
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const [panelData, setPanelData] = useState([]);
  const [btnLoading, setBtnLoading] = useState(false);
  const flowChartRef = useRef();
  const [apiData, setApiData] = useState({ panel: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dispatch({
      type: 'global/changeLayoutCollapsed',
      payload: {
        collapsed: false
      }
    });
    getData();
  }, []);

  const getData = async (text) => {
    setLoading(true);
    const { code, data } = await getPanel(type);
    if (code === 0 && data) {
      const { panel, codePath, engine, startupFile } = data;
      if (panel && panel.length) {
        transformData(panel);
        setApiData(data);
        dispatch({
          type: 'avisualis/saveData',
          payload: {
            addFormData: {
              ...avisualis.addFormData,
              codePath: codePath,
              engine: engine,
              startupFile: startupFile
            }
          }
        });
      }
    }
    setLoading(false);
  };

  const transformData = (data, newData) => {
    let _treeData = [], _children = [], _data = data || apiData.panel, childrenDisabled = false;
    _data && _data.length && _data.forEach((i, idx) => {
      if (newData) {
        const len = newData && newData.nodes ? newData.nodes.length : 0;
        childrenDisabled = len > 0 && !(len < (idx + 1));
      }
      let _children = [];
      const { children, name } = i;
      if (children &&  children.length) {
        children.forEach((c, cdx) => {
          const key = Object.keys(c)[0];
          _children.push({
            title: key,
            key: `${name}-${key}`,
            config: c[key],
            disabled: childrenDisabled
          })
        })
      }
      _treeData.push({
        title: `步骤${idx + 1}：${name}`,
        key: `${name}`,
        children: _children,
        disabled: true
      })
    })
    setPanelData(_treeData);
  }

  const onDragEnd = ({event, node}) => {
    const { dataTransfer, pageX } = event;
    if (dataTransfer.dropEffect !== 'none' && pageX > 384) {
      const { handleDragEnd } = flowChartRef.current;
      handleDragEnd && handleDragEnd(node);
    }
  }

  if (loading) {
    return <PageLoading />
  }

  return (
    <PageHeaderWrapper title={false}>
      <div className={styles.avisualisWrap}>
        <Card>
          {panelData.length ? <Tree
            showIcon
            defaultExpandAll
            draggable
            switcherIcon={<DownOutlined />}
            treeData={panelData}
            onDragEnd={onDragEnd}
            onDragStart={({event, node}) => event.dataTransfer.effectAllowed = 'move'}
          /> : null}
        </Card>
        <FlowChart 
          ref={flowChartRef} 
          transformData={transformData} 
          isNewAdd={Boolean(id)}
          apiData={apiData.panel}
        />
      </div>
    </PageHeaderWrapper>
  );
};

export default connect(({ global, avisualis }) => ({ global, avisualis }))(AvisualisDetail);