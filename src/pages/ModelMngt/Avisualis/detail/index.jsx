

import { Modal, Form, Input, Card, Tree } from 'antd';
import { PageHeaderWrapper, PageLoading } from '@ant-design/pro-layout';
import React, { useState, useEffect, useRef } from 'react';
import { getPanel, getAvisualisDetail } from '../service';
import styles from './index.less';
import { useDispatch, history } from 'umi';
import { DownOutlined, FolderOutlined, FolderOpenOutlined, FolderOpenTwoTone } from '@ant-design/icons'
import { connect } from 'dva';
import FlowChart from '../components/FlowChart';

const { confirm } = Modal;
const { Search } = Input;

const AvisualisDetail = (props) => {
  const { avisualis, location } = props;
  const { type, modelId } = location.query;
  const detailId = props.match.params.id;
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
    const { code, data } = await getAvisualisDetail(modelId || detailId);
    if (code === 0 && data) {
      const { model, training } = data;
      const { nodes, edges, panel, combos } = model.params;
      const _panel = JSON.parse(panel);
      if (nodes && edges) {
        const _detailData = {
          nodes: JSON.parse(nodes),
          edges: JSON.parse(edges),
          combos: JSON.parse(combos),
        };
        setDetailData(_detailData);
      }
      transformData(_panel);
      dispatch({
        type: 'avisualis/saveData',
        payload: {
          addFormData: {
            ...addFormData,
            ...training,
            ...model
          },
          panelApiData: _panel
        }
      });
      console.log('------_panel',_panel)
    }
    setLoading(false);
  };

  const transformData = (data, newData) => {
    let _treeData = [], _children = [], _data = data || panelApiData, 
    childrenDisabled = (Boolean(Number(modelId)) || Boolean(Number(detailId))) ? true : false;
    // childrenDisabled = (Boolean(Number(detailId))) ? true : false;
    _data && _data.length && _data.forEach((i, idx) => {
      if (newData) {
        const len = newData && newData.edges ? (newData.edges.length + 1) : 1;
        childrenDisabled = len > 0 && !(len < (idx + 1));
      }
      let _children = [];
      const { children, name } = i;
      if (children &&  children.length) {
        children.forEach(c => {
          const { children, config } = c;
          const childName = c.name;
          _children.push({
            title: childName,
            key: childName,
            config: config,
            disabled: childrenDisabled,
            treeIdx: idx,
            child: children || [],
            fName: name
          })
        })
      }
      _treeData.push({
        title: `步骤${idx + 1}：${name}`,
        key: name,
        children: _children,
        disabled: true,
        icon: <FolderOpenTwoTone />,
        // titleRender: (nodeData) => <div className="test">{`步骤${idx + 1}：${name}`}</div>,
      })
    })
    setPanelData(_treeData);
    dispatch({
      type: 'avisualis/saveData',
      payload: {
        treeData: _treeData
      }
    });
  }

  const onDragEnd = ({event, node}) => {
    const { dataTransfer, pageX } = event;
    if (dataTransfer.dropEffect !== 'none' && pageX > 384) {
      const { handleDragEnd } = flowChartRef.current;
      handleDragEnd && handleDragEnd(node);
    }
  }

  if (loading) return <PageLoading />;

  return (
    <PageHeaderWrapper title={false}>
      <div className={styles.avisualisDetailWrap}>
        <Card className="treeCard">
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
          detailId={detailId}
          detailData={detailData || {}}
        />
      </div>
    </PageHeaderWrapper>
  );
};

export default connect(({ global, avisualis }) => ({ global, avisualis }))(AvisualisDetail);