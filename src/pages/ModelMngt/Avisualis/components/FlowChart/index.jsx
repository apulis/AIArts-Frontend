// import { message, Table, Modal, Form, Input, Button, Card, TextArea, Radio, Select, Tree, PageHeader } from 'antd';
import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import styles from './index.less';
import G6 from '@antv/g6';
import insertCss from 'insert-css';

insertCss(`
  .g6-minimap-container {
    border: 1px solid #e2e2e2;
  }
  .g6-minimap-viewport {
    border: 2px solid rgb(25, 128, 255);
  }
`);

const FlowChart = (props, ref) => {
  const { flowChartData } = props;
  const [graph, setGraph] = useState(null);

  useImperativeHandle(ref, () => ({ 
    graph: graph,
  }));

  
  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    G6.registerNode(
      'sql',
      {
        drawShape(cfg, group) {
          const rect = group.addShape('rect', {
            attrs: {
              x: -75,
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
                y: 10,
                fill: 'black',
                fontSize: 18,
                fontWeight: 'bold',
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
        type: 'sql'
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
      // fitView: true,
      plugins: [minimap],
    });
    _graph.data(flowChartData);
    // _graph.zoom(3);
    _graph.render();
    _graph.on('node:mouseenter', (e) => {
      const nodeItem = e.item; // 获取鼠标进入的节点元素对象
      _graph.setItemState(nodeItem, 'hover', true); // 设置当前节点的 hover 状态为 true
    });
    
    // 鼠标离开节点
    _graph.on('node:mouseleave', (e) => {
      const nodeItem = e.item; // 获取鼠标离开的节点元素对象
      _graph.setItemState(nodeItem, 'hover', false); // 设置当前节点的 hover 状态为 false
    });
    // Click a node
    _graph.on('node:click', (e) => {
      // Swich the 'click' state of the node to be false
      const clickNodes = _graph.findAllByState('node', 'click');
      clickNodes.forEach((cn) => {
        _graph.setItemState(cn, 'click', false);
      });
      const nodeItem = e.item; // et the clicked item
      _graph.setItemState(nodeItem, 'click', true); // Set the state 'click' of the item to be true
    });
    _graph.fitCenter();
    setGraph(_graph)
  };

  const handleDragEnd = (e) => {

    // let str = Math.round(Math.random() * 100).toString();
    // let point = graph.getPointByClient(e.clientX, e.clientY);
    // graph.addItem("node", {
    //   id: str,
    //   type: "rect",
    //   label: str,
    //   size: [180, 80],
    //   x: parseInt(point.x - 40),
    //   y: parseInt(point.y - 40),
    //   comboId: null
    // });
    graph.changeData({
      nodes: [
        {
          id: '1',
          dataType: 'alps',
          name: 'alps_file1',
        },
        {
          id: '2',
          dataType: 'alps',
          name: 'alps_file2',
        },
        {
          id: '3',
          dataType: 'alps',
          name: 'alps_file3',
        },
        {
          id: '4',
          dataType: 'alps',
          name: 'alps_file3',
        },
        {
          id: '5',
          dataType: 'alps',
          name: 'alps_file3'
        },
        {
          id: '6',
          dataType: 'alps',
          name: 'alps_file3',
        },
        {
          id: '7',
          dataType: 'alps',
          name: 'alps_file3',
        },{
          id: '8',
          dataType: 'alps',
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
    })
    graph.fitCenter();
  }

  return (
    <div className={styles.G6Content} id="container">
      <div draggable onDragEnd={handleDragEnd}>11111111111111111111111</div>
    </div>
  );
};

export default forwardRef(FlowChart);