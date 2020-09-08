import { Card } from 'antd';
import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import styles from './index.less';
import G6 from '@antv/g6';
import insertCss from 'insert-css';
import { PageLoading } from '@ant-design/pro-layout';
import ItemPanel from '../ItemPanel';
import { Children } from 'react';

insertCss(`
  .g6-minimap-container {
    border: 1px solid #e2e2e2;
  }
  .g6-minimap-viewport {
    border: 2px solid rgb(25, 128, 255);
  }
`);

const FlowChart = (props, ref) => {
  const [graph, setGraph] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [flowChartData, setFlowChartData] = useState({});
  const [loading, setLoading] = useState(true);

  useImperativeHandle(ref, () => ({ 
    graph: graph,
    handleDragEnd: handleDragEnd
  }));

  
  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    setLoading(true);
    const data = {
      nodes: [
        {
          id: '1',
          name: 'alps_file1',
          config: []
        },
        {
          id: '2',
          name: 'alps_file2',
        },
        {
          id: '3',
          name: 'alps_file3',
          
        },
        {
          id: '4',
          name: 'alps_file3',
          
        },
        {
          id: '5',
          name: 'alps_file3',
         
        },
        {
          id: '6',
          name: 'alps_file3',
          
        },
        {
          id: '7',
          name: 'alps_file3',
          
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
    setFlowChartData(data);
    G6.registerNode('flowChart',
      {
        drawShape(cfg, group) {
          const rect = group.addShape('rect', {
            attrs: {
              x: -125,
              y: -25,
              width: 250,
              height: 50,
              radius: 10,
              stroke: '#1890ff',
              lineWidth: 3,
            },
            name: 'rect-shape',
          });
          if (cfg.name) {
            group.addShape('text', {
              attrs: {
                text: cfg.name,
                x: 0,
                y: 0,
                fill: 'black',
                fontSize: 18,
                fontWeight: 'bold',
                textAlign: 'center',
                textBaseline: 'middle',
                cursor: 'move',
              },
              name: 'text-shape',
            });
          }
          return rect;
        },
      },
      'single-node',
    );
  
    const height = document.getElementById('container').scrollHeight || 500;
    const minimap = new G6.Minimap({
      size: [150, 100],
    });
    let _graph = new G6.Graph({
      container: 'container',
      width: 800,
      height,
      
      layout: {
        type: 'dagre',
        ranksep: 30,
        controlPoints: true,
      },
      defaultNode: {
        type: 'flowChart'
      },
      defaultEdge: {
        type: 'cubic-vertical',
        style: {
          radius: 20,
          offset: 45,
          endArrow: true,
          lineAppendWidth: 10,
          lineWidth: 2,
          stroke: '#C2C8D5',
        },
      },
      nodeStateStyles: {
        selected: {
          stroke: '#d9d9d9',
          fill: '#5394ef',
        },
        hover: {
          cursor: 'move',
          fill: 'lightsteelblue',
        }
      },
      modes: {
        default: [
          'drag-canvas',
          'zoom-canvas',
          'click-select',
          'drag-node',
          // "hover-node",
          // "select-node",
          // "hover-edge",
          // "keyboard",
          "customer-events",
        ]
      },
      plugins: [minimap],
    });
    _graph.data(data);
    // _graph.zoom(3);
    _graph.render();

    _graph.on('node:mouseenter', e => {
      const nodeItem = e.item; // 获取鼠标进入的节点元素对象
      _graph.setItemState(nodeItem, 'hover', true); // 设置当前节点的 hover 状态为 true
    });
    
    // 鼠标离开节点
    _graph.on('node:mouseleave', e => {
      const nodeItem = e.item; // 获取鼠标离开的节点元素对象
      _graph.setItemState(nodeItem, 'hover', false); // 设置当前节点的 hover 状态为 false
    });

    // Click a node
    _graph.on('node:click', e => {
      // Swich the 'click' state of the node to be false
      const clickNodes = _graph.findAllByState('node', 'click');
      clickNodes.forEach(cn => {
        _graph.setItemState(cn, 'click', false);
      });
      const nodeItem = e.item; // et the clicked item
      _graph.setItemState(nodeItem, 'click', true); // Set the state 'click' of the item to be true
      console.log('-------node:click', nodeItem)
      setSelectedItem(nodeItem);
    });

    _graph.on('keydown', e => {
      console.log('-------', e)
      const { keyCode } = e;
      const allNodes = _graph.get('nodes');
      console.log('-------aaaaaaaaa', allNodes)
      if ((keyCode === 8 || keyCode === 46) && selectedItem) {

      }
    });

    _graph.fitCenter();
    setGraph(_graph);
    setLoading(false);
  };

  const handleDragEnd = e => {
    let newData = {
      nodes: [
        {
          id: '1',
          name: 'alps_file1',
        },
        {
          id: '2',
          name: 'alps_file2',
        },
        {
          id: '3',
          name: 'alps_file3',
        },
        {
          id: '4',
          name: 'alps_file3',
        },
        {
          id: '5',
          name: 'alps_file3'
        },
        {
          id: '6',
          name: 'alps_file3',
        },
        {
          id: '7',
          name: 'alps_file3',
        },{
          id: '8',
          name: '234324234234',
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
        },
        {
          source: '7',
          target: '8',
        }
      ],
    }
    setFlowChartData(newData);
    graph.changeData(newData);
    graph.fitCenter();
  }

  return (
    <>
      <div className={styles.G6Content} id="container">
        {loading ? <PageLoading /> : null}
      </div>
      <Card title="dsd">
        <ItemPanel />
      </Card>
    </>
  );
};

export default forwardRef(FlowChart);