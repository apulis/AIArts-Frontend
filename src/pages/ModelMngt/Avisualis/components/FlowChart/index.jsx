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
  let graph = null;

  useImperativeHandle(ref, () => ({ 
    graph: graph
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
    graph = new G6.Graph({
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
          cursor: 'move'
        }
      },
      modes: {
        default: [
          'drag-canvas',
          'zoom-canvas',
          'click-select',
          'drag-node'
        ]
      },
      fitView: true,
      plugins: [minimap],
    });
    graph.data(flowChartData);
    graph.zoom(0.1);
    graph.render();
    graph.on('node:mouseenter', (e) => {
      const nodeItem = e.item; // 获取鼠标进入的节点元素对象
      graph.setItemState(nodeItem, 'hover', true); // 设置当前节点的 hover 状态为 true
    });
    
    // 鼠标离开节点
    graph.on('node:mouseleave', (e) => {
      const nodeItem = e.item; // 获取鼠标离开的节点元素对象
      graph.setItemState(nodeItem, 'hover', false); // 设置当前节点的 hover 状态为 false
    });
  
  };

  return (
    <div className={styles.G6Content} id="container"></div>
  );
};

export default forwardRef(FlowChart);