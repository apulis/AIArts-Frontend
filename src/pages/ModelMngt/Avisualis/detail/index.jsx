import { message, Table, Modal, Form, Input, Button, Card, TextArea, Radio, Select, Tree, PageHeader } from 'antd';
import { PageHeaderWrapper, PageLoading } from '@ant-design/pro-layout';
import React, { useState, useEffect, useRef, useForm } from 'react';
// import { getDatasets, edit, deleteDataSet, add, download } from './service';
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
import ItemPanel from '../components/ItemPanel';
import _ from 'lodash';

const { confirm } = Modal;
const { Search } = Input;

const AvisualisDetail = ({ global }) => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const [avisualis, setAvisualis] = useState({ data: [], total: 0 });
  const [btnLoading, setBtnLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [flowChartData, setFlowChartData] = useState({});
  const flowChartRef = useRef();

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
    const data = {
      nodes: [
        {
          id: '1',
          dataType: 'alps',
          name: 'alps_file1',
          conf: [
            {
              label: 'conf',
              value: 'pai_graph.conf',
            },
            {
              label: 'dot',
              value: 'pai_graph.dot',
            },
            {
              label: 'init',
              value: 'init.rc',
            },
          ],
        },
        {
          id: '2',
          dataType: 'alps',
          name: 'alps_file2',
          conf: [
            {
              label: 'conf',
              value: 'pai_graph.conf',
            },
            {
              label: 'dot',
              value: 'pai_graph.dot',
            },
            {
              label: 'init',
              value: 'init.rc',
            },
          ],
        },
        {
          id: '3',
          dataType: 'alps',
          name: 'alps_file3',
          conf: [
            {
              label: 'conf',
              value: 'pai_graph.conf',
            },
            {
              label: 'dot',
              value: 'pai_graph.dot',
            },
            {
              label: 'init',
              value: 'init.rc',
            },
          ],
        },
        {
          id: '4',
          dataType: 'alps',
          name: 'alps_file3',
          conf: [
            {
              label: 'conf',
              value: 'pai_graph.conf',
            },
            {
              label: 'dot',
              value: 'pai_graph.dot',
            },
            {
              label: 'init',
              value: 'init.rc',
            },
          ],
        },
        {
          id: '5',
          dataType: 'alps',
          name: 'alps_file3',
          conf: [
            {
              label: 'conf',
              value: 'pai_graph.conf',
            },
            {
              label: 'dot',
              value: 'pai_graph.dot',
            },
            {
              label: 'init',
              value: 'init.rc',
            },
          ],
        },
        {
          id: '6',
          dataType: 'alps',
          name: 'alps_file3',
          conf: [
            {
              label: 'conf',
              value: 'pai_graph.conf',
            },
            {
              label: 'dot',
              value: 'pai_graph.dot',
            },
            {
              label: 'init',
              value: 'init.rc',
            },
          ],
        },
        {
          id: '7',
          dataType: 'alps',
          name: 'alps_file3',
          conf: [
            {
              label: 'conf',
              value: 'pai_graph.conf',
            },
            {
              label: 'dot',
              value: 'pai_graph.dot',
            },
            {
              label: 'init',
              value: 'init.rc',
            },
          ],
        },
      ],
      edges: [
        {
          source: '1',
          target: '2',
        },
        {
          source: '2',
          target: '3',
        },
        {
          source: '3',
          target: '4',
        },
        {
          source: '4',
          target: '5',
        },
        {
          source: '5',
          target: '6',
        },
        {
          source: '6',
          target: '7',
        }
      ],
    };
    setFlowChartData(data)
    setLoading(false);
  };

  const treeData = [
    {
      title: 'parent 1',
      key: '0-0',
      icon: <SmileOutlined />,
      children: [
        {
          title: 'leaf',
          key: '0-0-0',
          icon: <MehOutlined />,
        },
        {
          title: 'leaf',
          key: '0-0-1',
          icon: ({ selected }) => (selected ? <FrownFilled /> : <FrownOutlined />),
        },
      ],
    }
  ];

  const onDragEnd = ({event, node}) => {
    const { dataTransfer, pageX } = event;
    if (dataTransfer.dropEffect !== 'none' && pageX > 384) {
      const { nodes, edges } = flowChartData;
      // let _nodes = _.cloneDeep(nodes), _edges = _.cloneDeep(edges);
      // _nodes.push({
      //   id: '8',
      //   dataType: 'alps',
      //   name: 'zzzzzzzzzzzzzzz',
      //   conf: [
      //     {
      //       label: 'conf',
      //       value: 'pai_graph.conf',
      //     },
      //     {
      //       label: 'dot',
      //       value: 'pai_graph.dot',
      //     },
      //     {
      //       label: 'init',
      //       value: 'init.rc',
      //     },
      //   ],
      // });
      // _edges.push( {
      //   source: '7',
      //   target: '8',
      // });

      // setFlowChartData({ nodes: _nodes, edges: _edges})

      const model = {
        id: '8',
        label: 'node',
        address: 'cq',
        // x: 200,
        // y: 150,
        style: {
          fill: 'blue',
        },
      };
      console.log('-----', flowChartRef.current)
      flowChartRef.current.graph.addItem('8', model);
    }
  }
  
  if (loading) {
    return (<PageLoading />)
  } else {
    return (
      <PageHeaderWrapper title={false} loading={loading}>
        <div className={styles.avisualisWrap}>
          <Card>
            <Tree
              showIcon
              defaultExpandAll
              draggable
              switcherIcon={<DownOutlined />}
              treeData={treeData}
              onDragEnd={onDragEnd}
              onDragStart={({event, node}) => event.dataTransfer.effectAllowed = 'move'}
            />
          </Card>
          <FlowChart ref={flowChartRef} flowChartData={flowChartData} />
          <Card>
            <ItemPanel />
          </Card>
        </div>
      </PageHeaderWrapper>
    );
  }
};

export default connect(({ global }) => ({ global }))(AvisualisDetail);