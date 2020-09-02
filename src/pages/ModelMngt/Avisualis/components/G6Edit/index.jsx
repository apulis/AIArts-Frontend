// import { message, Table, Modal, Form, Input, Button, Card, TextArea, Radio, Select, Tree, PageHeader } from 'antd';
import React, { useState, useEffect, useRef } from 'react';
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

const G6Edit = () => {
  useEffect(() => {
    getData();
  }, []);

  const getData = async (text) => {
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
          id: '6',
          dataType: 'feature_etl',
          name: 'feature_etl_1',
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
          dataType: 'feature_etl',
          name: 'feature_etl_1',
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
          id: '8',
          dataType: 'feature_extractor',
          name: 'feature_extractor',
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
          source: '1',
          target: '3',
        },
        {
          source: '2',
          target: '6',
        },
        {
          source: '3',
          target: '6',
        },
        {
          source: '6',
          target: '7',
        },
        {
          source: '6',
          target: '8',
        },
      ],
    };
    
    G6.registerNode(
      'sql',
      {
        drawShape(cfg, group) {
          const rect = group.addShape('rect', {
            attrs: {
              x: -75,
              y: -25,
              width: 150,
              height: 50,
              radius: 10,
              stroke: '#5B8FF9',
              fill: '#C6E5FF',
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
                fill: '#00287E',
                fontSize: 14,
                textAlign: 'center',
                textBaseline: 'middle',
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
    const graph = new G6.Graph({
      container: 'container',
      width: 800,
      height,
      fitView: true,
      
      layout: {
        type: 'dagre',
        nodesepFunc: (d) => {
          if (d.id === '3') {
            return 500;
          }
          return 50;
        },
        ranksep: 70,
        controlPoints: true,
      },
      defaultNode: {
        type: 'sql',
      },
      defaultEdge: {
        type: 'polyline',
        style: {
          radius: 20,
          offset: 45,
          endArrow: true,
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
    graph.data(data);
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

export default G6Edit;