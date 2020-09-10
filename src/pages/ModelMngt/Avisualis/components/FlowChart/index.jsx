import { Card, message } from 'antd';
import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import styles from './index.less';
import G6 from '@antv/g6';
import insertCss from 'insert-css';
import { PageLoading } from '@ant-design/pro-layout';
import ItemPanel from '../ItemPanel';
import { getAvisualisDetail } from '../../service';
import _ from 'lodash';

insertCss(`
  .g6-minimap-container {
    border: 1px solid #e2e2e2;
  }
  .g6-minimap-viewport {
    border: 2px solid rgb(25, 128, 255);
  }
`);

const FlowChart = (props, ref) => {
  const { id, transformData, apiData, detailData } = props;
  const [graph, setGraph] = useState(null);
  const [flowChartData, setFlowChartData] = useState(detailData);
  const [loading, setLoading] = useState(true);
  const [selectItem, setSelectItem] = useState(null);

  useImperativeHandle(ref, () => ({
    handleDragEnd: handleDragEnd
  }));
  
  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    setLoading(true);
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
    // const toolbar = new G6.ToolBar({
    //   getContent: () => {
    //     return `
    //       <ul>
    //         <li code='add'>测试</li>
    //         <li code="autoZoom">
    //           <svg class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="20" height="24">
    //             <path d="M684.288 305.28l0.128-0.64-0.128-0.64V99.712c0-19.84 15.552-35.904 34.496-35.712a35.072 35.072 0 0 1 34.56 35.776v171.008h170.944c19.648 0 35.84 15.488 35.712 34.432a35.072 35.072 0 0 1-35.84 34.496h-204.16l-0.64-0.128a32.768 32.768 0 0 1-20.864-7.552c-1.344-1.024-2.816-1.664-3.968-2.816-0.384-0.32-0.512-0.768-0.832-1.088a33.472 33.472 0 0 1-9.408-22.848zM305.28 64a35.072 35.072 0 0 0-34.56 35.776v171.008H99.776A35.072 35.072 0 0 0 64 305.216c0 18.944 15.872 34.496 35.84 34.496h204.16l0.64-0.128a32.896 32.896 0 0 0 20.864-7.552c1.344-1.024 2.816-1.664 3.904-2.816 0.384-0.32 0.512-0.768 0.768-1.088a33.024 33.024 0 0 0 9.536-22.848l-0.128-0.64 0.128-0.704V99.712A35.008 35.008 0 0 0 305.216 64z m618.944 620.288h-204.16l-0.64 0.128-0.512-0.128c-7.808 0-14.72 3.2-20.48 7.68-1.28 1.024-2.752 1.664-3.84 2.752-0.384 0.32-0.512 0.768-0.832 1.088a33.664 33.664 0 0 0-9.408 22.912l0.128 0.64-0.128 0.704v204.288c0 19.712 15.552 35.904 34.496 35.712a35.072 35.072 0 0 0 34.56-35.776V753.28h170.944c19.648 0 35.84-15.488 35.712-34.432a35.072 35.072 0 0 0-35.84-34.496z m-593.92 11.52c-0.256-0.32-0.384-0.768-0.768-1.088-1.088-1.088-2.56-1.728-3.84-2.688a33.088 33.088 0 0 0-20.48-7.68l-0.512 0.064-0.64-0.128H99.84a35.072 35.072 0 0 0-35.84 34.496 35.072 35.072 0 0 0 35.712 34.432H270.72v171.008c0 19.84 15.552 35.84 34.56 35.776a35.008 35.008 0 0 0 34.432-35.712V720l-0.128-0.64 0.128-0.704a33.344 33.344 0 0 0-9.472-22.848zM512 374.144a137.92 137.92 0 1 0 0.128 275.84A137.92 137.92 0 0 0 512 374.08z"></path>
    //           </svg>
    //         </li>
    //       </ul>
    //     `
    //   },
    //   handleClick: (code, graph) => {
    //     if (code === 'add') {
    //       graph.addItem('node', {
    //         id: 'node2',
    //         label: 'node2',
    //         x: 300,
    //         y: 150
    //       })
    //     } else if (code === 'undo') {
    //       toolbar.undo()
    //     }
    //   }
    // });
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
          {
            type: 'click-select',
            multiple: false
          },
          'drag-node',
          "customer-events",
        ]
      },
      plugins: [minimap],
    });
    _graph.data(flowChartData);
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
      const clickNodes = _graph.findAllByState('node', 'click');
      clickNodes.forEach(cn => {
        _graph.setItemState(cn, 'click', false);
      });
      const nodeItem = e.item; // et the clicked item
      _graph.setItemState(nodeItem, 'click', true); // Set the state 'click' of the item to be true
      setSelectItem(nodeItem);
    });

    _graph.on('keydown', e => {
      const { keyCode } = e;
      const allNodes = _graph.get('nodes');
      const selectedItem = _graph.findAllByState("node", "selected");
      if ((keyCode === 8 || keyCode === 46) && selectedItem && selectedItem.length) {
        const _id = selectedItem[0]._cfg.id;
        allNodes.forEach(i => {
          if (i._cfg.id === _id) {
            deleteNode(_graph, apiData);
            return;
          }
        })
      }
    });

    _graph.fitCenter();
    setGraph(_graph);
    setLoading(false);
  };

  const handleDragEnd = node => {
    const { title, key, config, idx } = node;
    const hasNodes = Object.keys(flowChartData).length && flowChartData.nodes && flowChartData.nodes.length;
    let newData = {}, 
        newNodes = {
          id: key,
          name: title,
          config: config,
          idx: idx
        };
    if ((hasNodes && idx > flowChartData.nodes.length) || (!hasNodes && idx > 0)) {
      message.warning('只能按照步骤顺序依次拖拽！');
      return;
    }
    if (hasNodes) {
      newData = _.cloneDeep(flowChartData);
      const { edges, nodes } = newData;
      const edgesLen = edges.length;
      const nodesLen = nodes.length;
      const temp = {
        source: nodes[nodesLen - 1].id,
        target: key
      };
      if (edgesLen) {
        edges.push(temp)
      } else {
        edges[0] = temp;
      }
      nodes.push(newNodes);
    } else {
      newData = {
        nodes: [newNodes],
        edges: []
      }
    }
    setFlowChartData(newData);
    graph.changeData(newData);
    graph.fitCenter();
    transformData(null, newData);
    setSelectItem(null);
  }

  const deleteNode = (_graph, apiData) => {
    let newData = _.cloneDeep(_graph);
    const { nodes, edges } = newData.cfg;
    nodes && nodes.length && nodes.pop();
    edges && edges.length && edges.pop();
    const newNodes = nodes.map(i => {
      const { id, name, config } = i._cfg.model;
      return {
        id: id,
        name: name,
        config: config
      }
    })
    const newEdges = edges.map(i => {
      const { source, target } = i._cfg.model;
      return {
        source: source,
        target: target
      }
    })
    const temp = {
      nodes: newNodes,
      edges: newEdges
    };
    setFlowChartData(temp);
    _graph.changeData(temp);
    _graph.fitCenter();
    transformData(apiData, temp);
  }


  return (
    <>
      <div className={styles.G6Content} id="container">
        {loading ? <PageLoading /> : null}
      </div>
      <Card title={false} style={{ position: 'relative' }}>
        <ItemPanel flowChartData={flowChartData} selectItem={selectItem} />
      </Card>
    </>
  );
};

export default forwardRef(FlowChart);