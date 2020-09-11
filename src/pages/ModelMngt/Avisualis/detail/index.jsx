

import { Modal, Form, Input, Card, Tree } from 'antd';
import { PageHeaderWrapper, PageLoading } from '@ant-design/pro-layout';
import React, { useState, useEffect, useRef } from 'react';
import { getPanel, getAvisualisDetail } from '../service';
import styles from './index.less';
import { useDispatch, history } from 'umi';
import { DownOutlined } from '@ant-design/icons'
import { connect } from 'dva';
import FlowChart from '../components/FlowChart';
import _ from 'lodash';

const { confirm } = Modal;
const { Search } = Input;

const AvisualisDetail = (props) => {
  const { avisualis, location } = props;
  const { type, id } = location.query;
  const dispatch = useDispatch();
  const [panelData, setPanelData] = useState([]);
  const flowChartRef = useRef();
  const [loading, setLoading] = useState(true);
  const [detailData, setDetailData] = useState({});
  const { addFormData, panelApiData } = avisualis;

  useEffect(() => {
    dispatch({
      type: 'global/changeLayoutCollapsed',
      payload: {
        collapsed: false
      }
    });
    getData();
  }, []);

  const getData = async () => {
    setLoading(true);
    if (!Object.keys(addFormData).length && !id) history.push('/ModelManagement/avisualis');
    let _addFormData = _.cloneDeep(addFormData);
    if (id) {
      const { code, data } = await getAvisualisDetail(id);
      if (code === 0 && data) {
        const { nodes, edges } = data.model.params;
        const transformNodes = JSON.parse(nodes).map(i => {
          return {
            ...i,
            id: `${i.id}-${i.name}`
          }
        })
        const _detailData = {
          nodes: transformNodes,
          edges: JSON.parse(edges),
        };
        setDetailData(_detailData);
        if (!(_addFormData.way && _addFormData.way === 2)) {
          _addFormData = data.model;
        }
      }
    }
    const { code, data } = await getPanel(type);
    if (code === 0 && data) {
      const { panel, codePath, engine, startupFile } = data;
      if (panel && panel.length) {
        transformData(panel);
        dispatch({
          type: 'avisualis/saveData',
          payload: {
            addFormData: {
              ..._addFormData,
              codePath: codePath,
              engine: engine,
              startupFile: startupFile
            },
            panelApiData: data
          }
        });
      }
    }
    setLoading(false);
  };

  const transformData = (data, newData) => {
    let _treeData = [], _children = [], _data = data || panelApiData.panel, childrenDisabled = id ? true : false;
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
            disabled: childrenDisabled,
            idx: idx
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
          id={id}
          detailData={detailData || {}}
        />
      </div>
    </PageHeaderWrapper>
  );
};

export default connect(({ global, avisualis }) => ({ global, avisualis }))(AvisualisDetail);