import { Card, message } from 'antd';
import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import styles from './index.less';
import G6 from '@antv/g6';
import insertCss from 'insert-css';
import { PageLoading } from '@ant-design/pro-layout';
import ItemPanel from '../ItemPanel';
import _ from 'lodash';
import { connect } from 'dva';

insertCss(`
  .g6-minimap-container {
    border: 1px solid #e2e2e2;
  }
  .g6-minimap-viewport {
    border: 2px solid rgb(25, 128, 255);
  }
`);

const FlowChart = forwardRef((props, ref) => {
  const { transformData, detailData, avisualis, detailId } = props;
  const [graph, setGraph] = useState(null);
  const [flowChartData, setFlowChartData] = useState(detailData);
  const [loading, setLoading] = useState(true);
  const [selectItem, setSelectItem] = useState(null);
  const { panelApiData, treeData } = avisualis;

  useImperativeHandle(ref, () => ({
    handleDragEnd: handleDragEnd
  }));
  
  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    setLoading(true);
    const collapseIcon = (x, y, r) => {
      return [
        ['M', x - r, y],
        ['a', r, r, 0, 1, 0, r * 2, 0],
        ['a', r, r, 0, 1, 0, -r * 2, 0],
        ['M', x - r + 4, y],
        ['L', x - r + 2 * r - 4, y],
      ];
    };
    const expandIcon = (x, y, r) => {
      return [
        ['M', x - r, y],
        ['a', r, r, 0, 1, 0, r * 2, 0],
        ['a', r, r, 0, 1, 0, -r * 2, 0],
        ['M', x - r + 4, y],
        ['L', x - r + 2 * r - 4, y],
        ['M', x - r + r, y - r + 4],
        ['L', x, y + r - 4],
      ];
    };
    const data = {
      nodes: [
        { id: 'node1', x: 250, y: 200, comboId: 'combo1', anchorPoints: [
          [0.5, 1],
          [0.5, 0]
        ],},
        { id: 'node2', x: 300, y: 200, comboId: 'combo1',
        anchorPoints: [
          [0.5, 1],
          [0.5, 0]
        ] },
        { id: 'node3', x: 100, y: 200, comboId: 'combo3',
        anchorPoints: [
          [0.5, 1],
          [0.5, 0]
        ] },
        { id: 'node4', x: 100, y: 200, comboId: 'combo4',
        anchorPoints: [
          [0.5, 1],
          [0.5, 0]
        ] },
      ],
      edges: [
        { source: 'node1', target: 'node3', style: {strokeOpacity: 0}},
        { source: 'combo2', target: 'combo3' },
        { source: 'combo3', target: 'node4'},
        { source: 'node3', target: 'node4', style: {strokeOpacity: 0}},
      ],
      combos: [
        { id: 'combo1', label: 'Combo 1', parentId: 'combo2',
        anchorPoints: [
          [0.5, 1],
          [0.5, 0]
        ]  },
        { id: 'combo2', label: 'Combo 2', 
        anchorPoints: [
          [0.5, 1],
          [0.5, 0]
        ]  },
        { id: 'combo3', label: 'Combo 3', 
        anchorPoints: [
          [0.5, 1],
          [0.5, 0]
        ]  },
        // { id: 'combo3', label: 'Combo 3' },
      ],
    };
    G6.registerCombo(
      'cRect',
      {
        drawShape: function drawShape(cfg, group) {
          const self = this;
          // Get the padding from the configuration
          cfg.padding = cfg.padding || [50, 20, 20, 20];
          // Get the shape's style, where the style.width and style.height correspond to the width and height in the figure of Illustration of Built-in Rect Combo
          const style = self.getShapeStyle(cfg);
          // Add a rect shape as the keyShape which is the same as the extended rect Combo
          const rect = group.addShape('rect', {
            attrs: {
              ...style,
              x: -style.width / 2 - (cfg.padding[3] - cfg.padding[1]) / 2,
              y: -style.height / 2 - (cfg.padding[0] - cfg.padding[2]) / 2,
              width: style.width,
              height: style.height,
            },
            draggable: true,
            name: 'combo-keyShape',
          });
          // Add the circle on the right
          group.addShape('marker', {
            attrs: {
              ...style,
              fill: '#fff',
              opacity: 1,
              // cfg.style.width and cfg.style.heigth correspond to the innerWidth and innerHeight in the figure of Illustration of Built-in Rect Combo
              x: cfg.style.width / 2 + cfg.padding[1],
              y: (cfg.padding[2] - cfg.padding[0]) / 2,
              r: 10,
              symbol: collapseIcon,
            },
            draggable: true,
            name: 'combo-marker-shape',
          });
          return rect;
        },
        // Define the updating logic of the right circle
        afterUpdate: function afterUpdate(cfg, combo) {
          const group = combo.get('group');
          // Find the circle shape in the graphics group of the Combo by name
          const marker = group.find((ele) => ele.get('name') === 'combo-marker-shape');
          // Update the position of the right circle
          marker.attr({
            // cfg.style.width and cfg.style.heigth correspond to the innerWidth and innerHeight in the figure of Illustration of Built-in Rect Combo
            x: cfg.style.width / 2 + cfg.padding[1],
            y: (cfg.padding[2] - cfg.padding[0]) / 2,
            // The property 'collapsed' in the combo data represents the collapsing state of the Combo
            // Update the symbol according to 'collapsed'
            symbol: cfg.collapsed ? expandIcon : collapseIcon,
          });
        },
      },
      'rect',
    );

    G6.registerNode('flowChart',
      {
        drawShape(cfg, group) {
          const rect = group.addShape('rect', {
            attrs: {
              x: -140,
              y: -25,
              width: 80,
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
        ranksep: 80,
        controlPoints: true,
      },
      defaultNode: {
        type: 'flowChart'
      },
      defaultEdge: {
        // type: 'cubic-vertical',
        style: {
          radius: 20,
          // offset: 45,
          endArrow: true,
          lineAppendWidth: 10,
          lineWidth: 2,
          stroke: '#C2C8D5',
        },
      },
      groupByTypes: false,
      // Configure the combos globally
      defaultCombo: {
        // The type of the combos. You can also assign type in the data of combos
        type: 'cRect',
        // ... Other global configurations for combos
      },
      comboStateStyles: {
        dragenter: {
          lineWidth: 4,
          stroke: '#FE9797',
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
          "customer-events",'drag-combo', 'drag-node', 'drag-canvas'
        ]
      },
      plugins: [minimap],
    });
    _graph.data(data);
    _graph.render();

    _graph.on('node:mouseenter', e => {
      _graph.setItemState(e.item, 'hover', true); // 设置当前节点的 hover 状态为 true
    });
    
    // 鼠标离开节点
    _graph.on('node:mouseleave', e => {
      _graph.setItemState(e.item, 'hover', false); // 设置当前节点的 hover 状态为 false
    });

    // Click a node
    _graph.on('node:click', e => {
      const clickNodes = _graph.findAllByState('node', 'click');
      clickNodes.forEach(cn => {
        _graph.setItemState(cn, 'click', false);
      });
      const nodeItem = e.item;
      _graph.setItemState(nodeItem, 'click', true); // Set the state 'click' of the item to be true
      setSelectItem(nodeItem);
    });

    _graph.on('canvas:click', e => {
      setSelectItem(null);
    });

    _graph.on('keydown', e => {
      const { keyCode } = e;
      if (keyCode === 46) deleteNode(_graph);
    });

    _graph.on('combo:click', (e) => {
      if (e.target.get('name') === 'combo-marker-shape') {
        // _graph.collapseExpandCombo(e.item.getModel().id);
        _graph.collapseExpandCombo(e.item);
        if (_graph.get('layout')) _graph.layout();
        else _graph.refreshPositions();
      }
    });
    
    _graph.on('combo:dragend', (e) => {
      _graph.getCombos().forEach((combo) => {
        _graph.setItemState(combo, 'dragenter', false);
      });
    });
    _graph.on('node:dragend', (e) => {
      _graph.getCombos().forEach((combo) => {
        _graph.setItemState(combo, 'dragenter', false);
      });
    });
    
    _graph.on('combo:dragenter', (e) => {
      _graph.setItemState(e.item, 'dragenter', true);
    });
    _graph.on('combo:dragleave', (e) => {
      _graph.setItemState(e.item, 'dragenter', false);
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

  const deleteNode = (graph) => {
    const allNodes = graph.get('nodes');
    const selectedItem = graph.findAllByState("node", "selected");
    if (selectedItem && selectedItem.length) {
      const _id = selectedItem[0]._cfg.id;
      if (_id !== allNodes[allNodes.length - 1]._cfg.id) {
        message.warning('只能按照模型顺序依次删除！');
        return;
      }
      allNodes.forEach(i => {
        if (i._cfg.id === _id) {
          let newData = _.cloneDeep(graph);
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
          graph.changeData(temp);
          graph.fitCenter();
          transformData(panelApiData, temp);
          setSelectItem(null);
          return;
        }
      })
    }
  }

  const onChangeNode = (id) => {
    const fId = id.split('-')[0];
    const fIdx = treeData.findIndex(i => fId === i.key);
    const changeChildTemp = treeData[fIdx].children;
    const changeNode = changeChildTemp.find(i => i.key === id);
    const cloneData = _.cloneDeep(flowChartData);
    const { title, key, config } = changeNode;
    cloneData.nodes[fIdx] = {
      id: key,
      name: title,
      config: config,
      idx: fIdx
    };
    cloneData.edges[fIdx].source = id;
    if (fIdx !== 0) cloneData.edges[fIdx - 1].target = id;
    setSelectItem(null);
    setFlowChartData(cloneData);
    graph.changeData(cloneData);
    graph.fitCenter();
    return true;
  }

  return (
    <>
      <div className={styles.G6Content} id="container">
        {loading ? <PageLoading /> : null}
      </div>
      <Card title={false} style={{ position: 'relative' }}>
        <ItemPanel
          flowChartData={flowChartData}
          selectItem={selectItem}
          setFlowChartData={setFlowChartData}
          detailId={Number(detailId)}
          onChangeNode={onChangeNode}
        />
      </Card>
    </>
  );
});

const mapStateToProps = (state) => {
  return {
    avisualis: state.avisualis
  }
}
export default connect(mapStateToProps, null, null, { forwardRef: true })(FlowChart);
