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
    getData2();
  }, []);

  const getData2 = async () => {
    const COLLAPSE_ICON = function COLLAPSE_ICON(x, y, r) {
      return [
        ['M', x - r, y - r],
        ['a', r, r, 0, 1, 0, r * 2, 0],
        ['a', r, r, 0, 1, 0, -r * 2, 0],
        ['M', x + 2 - r, y - r],
        ['L', x + r - 2, y - r],
      ];
    };
    const EXPAND_ICON = function EXPAND_ICON(x, y, r) {
      return [
        ['M', x - r, y - r],
        ['a', r, r, 0, 1, 0, r * 2, 0],
        ['a', r, r, 0, 1, 0, -r * 2, 0],
        ['M', x + 2 - r, y - r],
        ['L', x + r - 2, y - r],
        ['M', x, y - 2 * r + 2],
        ['L', x, y - 2],
      ];
    };
    const data = {
      id: 'root',
      label: 'root',
      children: [
        {
          id: 'c1',
          label: 'c1',
          children: [
            {
              id: 'c1-1',
              label: 'c1-1',
            },
            {
              id: 'c1-2',
              label: 'c1-2',
              children: [
                {
                  id: 'c1-2-1',
                  label: 'c1-2-1',
                },
                {
                  id: 'c1-2-2',
                  label: 'c1-2-2',
                },
              ],
            },
          ],
        },
        {
          id: 'c2',
          label: 'c2',
        },
        {
          id: 'c3',
          label: 'c3',
          children: [
            {
              id: 'c3-1',
              label: 'c3-1',
            },
            {
              id: 'c3-2',
              label: 'c3-2',
              children: [
                {
                  id: 'c3-2-1',
                  label: 'c3-2-1',
                },
                {
                  id: 'c3-2-2',
                  label: 'c3-2-2',
                },
                {
                  id: 'c3-2-3',
                  label: 'c3-2-3',
                },
              ],
            },
            {
              id: 'c3-3',
              label: 'c3-3',
            },
          ],
        },
      ],
    };
    G6.Util.traverseTree(data, (d) => {
      d.leftIcon = {
        style: {
          fill: '#e6fffb',
          stroke: '#e6fffb',
        },
        img: 'https://gw.alipayobjects.com/mdn/rms_f8c6a0/afts/img/A*Q_FQT6nwEC8AAAAAAAAAAABkARQnAQ',
      };
      return true;
    });
    G6.registerNode(
      'icon-node',
      {
        options: {
          size: [60, 20],
          stroke: '#91d5ff',
          fill: '#91d5ff',
        },
        draw(cfg, group) {
          const styles = this.getShapeStyle(cfg);
          const { labelCfg = {} } = cfg;
    
          const keyShape = group.addShape('rect', {
            attrs: {
              ...styles,
              x: 0,
              y: 0,
            },
          });
    
          /**
           * leftIcon 格式如下：
           *  {
           *    style: ShapeStyle;
           *    img: ''
           *  }
           */
          if (cfg.leftIcon) {
            const { style, img } = cfg.leftIcon;
            group.addShape('rect', {
              attrs: {
                x: 1,
                y: 1,
                width: 38,
                height: styles.height - 2,
                fill: '#8c8c8c',
                ...style,
              },
            });
    
            group.addShape('image', {
              attrs: {
                x: 8,
                y: 8,
                width: 24,
                height: 24,
                img:
                  img ||
                  'https://g.alicdn.com/cm-design/arms-trace/1.0.155/styles/armsTrace/images/TAIR.png',
              },
              name: 'image-shape',
            });
          }
    
          // 如果不需要动态增加或删除元素，则不需要 add 这两个 marker
          group.addShape('marker', {
            attrs: {
              x: 40,
              y: 52,
              r: 6,
              stroke: '#73d13d',
              cursor: 'pointer',
              symbol: EXPAND_ICON,
            },
            name: 'add-item',
          });
    
          group.addShape('marker', {
            attrs: {
              x: 80,
              y: 52,
              r: 6,
              stroke: '#ff4d4f',
              cursor: 'pointer',
              symbol: COLLAPSE_ICON,
            },
            name: 'remove-item',
          });
    
          if (cfg.label) {
            group.addShape('text', {
              attrs: {
                ...labelCfg.style,
                text: cfg.label,
                x: 50,
                y: 25,
              },
            });
          }
    
          return keyShape;
        },
      },
      'rect',
    );
    
    G6.registerEdge('flow-line', {
      draw(cfg, group) {
        const startPoint = cfg.startPoint;
        const endPoint = cfg.endPoint;
    
        const { style } = cfg;
        const shape = group.addShape('path', {
          attrs: {
            stroke: style.stroke,
            endArrow: style.endArrow,
            path: [
              ['M', startPoint.x, startPoint.y],
              ['L', startPoint.x, (startPoint.y + endPoint.y) / 2],
              ['L', endPoint.x, (startPoint.y + endPoint.y) / 2],
              ['L', endPoint.x, endPoint.y],
            ],
          },
        });
    
        return shape;
      },
    });
    
    const defaultStateStyles = {
      hover: {
        stroke: '#1890ff',
        lineWidth: 2,
      },
    };
    
    const defaultNodeStyle = {
      fill: '#91d5ff',
      stroke: '#40a9ff',
      radius: 5,
    };
    
    const defaultEdgeStyle = {
      stroke: '#91d5ff',
      endArrow: {
        path: 'M 0,0 L 12, 6 L 9,0 L 12, -6 Z',
        fill: '#91d5ff',
        d: -20,
      },
    };
    
    const defaultLayout = {
      type: 'compactBox',
      direction: 'TB',
      getId: function getId(d) {
        return d.id;
      },
      getHeight: function getHeight() {
        return 16;
      },
      getWidth: function getWidth() {
        return 16;
      },
      getVGap: function getVGap() {
        return 40;
      },
      getHGap: function getHGap() {
        return 70;
      },
    };
    
    const defaultLabelCfg = {
      style: {
        fill: '#000',
        fontSize: 12,
      },
    };
    const height = document.getElementById('container2').scrollHeight || 500;

    const minimap = new G6.Minimap({
      size: [150, 100],
    });
    const toolbar = new G6.ToolBar({
      getContent: () => {
        return `
          <ul>
            <li code="zoomOut">
              <span role="img" aria-label="plus" class="anticon anticon-plus"><svg viewBox="64 64 896 896" focusable="false" class="" data-icon="plus" width="1em" height="1em" fill="currentColor" aria-hidden="true"><defs><style></style></defs><path d="M482 152h60q8 0 8 8v704q0 8-8 8h-60q-8 0-8-8V160q0-8 8-8z"></path><path d="M176 474h672q8 0 8 8v60q0 8-8 8H176q-8 0-8-8v-60q0-8 8-8z"></path></svg></span>
            </li>
            <li code="zoomIn">
              <span role="img" aria-label="minus" class="anticon anticon-minus"><svg viewBox="64 64 896 896" focusable="false" class="" data-icon="minus" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M872 474H152c-4.4 0-8 3.6-8 8v60c0 4.4 3.6 8 8 8h720c4.4 0 8-3.6 8-8v-60c0-4.4-3.6-8-8-8z"></path></svg></span>
            </li>
            <li code="delete">
              <span role="img" aria-label="delete" class="anticon anticon-delete"><svg viewBox="64 64 896 896" focusable="false" class="" data-icon="delete" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M360 184h-8c4.4 0 8-3.6 8-8v8h304v-8c0 4.4 3.6 8 8 8h-8v72h72v-80c0-35.3-28.7-64-64-64H352c-35.3 0-64 28.7-64 64v80h72v-72zm504 72H160c-17.7 0-32 14.3-32 32v32c0 4.4 3.6 8 8 8h60.4l24.7 523c1.6 34.1 29.8 61 63.9 61h454c34.2 0 62.3-26.8 63.9-61l24.7-523H888c4.4 0 8-3.6 8-8v-32c0-17.7-14.3-32-32-32zM731.3 840H292.7l-24.2-512h487l-24.2 512z"></path></svg></span>
            </li>
              <li code="realZoom">
              <span role="img" aria-label="border-outer" class="anticon anticon-border-outer"><svg viewBox="64 64 896 896" focusable="false" class="" data-icon="border-outer" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M880 112H144c-17.7 0-32 14.3-32 32v736c0 17.7 14.3 32 32 32h736c17.7 0 32-14.3 32-32V144c0-17.7-14.3-32-32-32zm-40 728H184V184h656v656zM484 366h56c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8h-56c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8zM302 548h56c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8h-56c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8zm364 0h56c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8h-56c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8zm-182 0h56c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8h-56c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8zm0 182h56c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8h-56c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8z"></path></svg></span>
            </li>
            <li code="autoZoom">
              <span role="img" aria-label="compress" class="anticon anticon-compress"><svg viewBox="64 64 896 896" focusable="false" class="" data-icon="compress" width="1em" height="1em" fill="currentColor" aria-hidden="true"><defs><style></style></defs><path d="M326 664H104c-8.8 0-16 7.2-16 16v48c0 8.8 7.2 16 16 16h174v176c0 8.8 7.2 16 16 16h48c8.8 0 16-7.2 16-16V696c0-17.7-14.3-32-32-32zm16-576h-48c-8.8 0-16 7.2-16 16v176H104c-8.8 0-16 7.2-16 16v48c0 8.8 7.2 16 16 16h222c17.7 0 32-14.3 32-32V104c0-8.8-7.2-16-16-16zm578 576H698c-17.7 0-32 14.3-32 32v224c0 8.8 7.2 16 16 16h48c8.8 0 16-7.2 16-16V744h174c8.8 0 16-7.2 16-16v-48c0-8.8-7.2-16-16-16zm0-384H746V104c0-8.8-7.2-16-16-16h-48c-8.8 0-16 7.2-16 16v224c0 17.7 14.3 32 32 32h222c8.8 0 16-7.2 16-16v-48c0-8.8-7.2-16-16-16z"></path></svg></span>
            </li>
          </ul>
        `
      },
      handleClick: (code, graph) => {
        let zoom = graph.getZoom();
        if (code === 'zoomOut') {
          graph.zoomTo((zoom + 0.1).toFixed(1));
        } else if (code === 'zoomIn') {
          graph.zoomTo((zoom - 0.1).toFixed(1));
        } else if (code === 'delete') {
          deleteNode(graph);
        } else if (code === 'realZoom') {
          graph.fitCenter();
        } else if (code === 'autoZoom') {
          graph.fitView();
        } 
      }
    });
    const _graph = new G6.TreeGraph({
      container: 'container2',
      width: 600,
      height,
      linkCenter: true,
      plugins: [minimap, toolbar],
      modes: {
        default: ['drag-canvas', 'zoom-canvas'],
      },
      defaultNode: {
        type: 'icon-node',
        size: [120, 40],
        style: defaultNodeStyle,
        labelCfg: defaultLabelCfg,
      },
      defaultEdge: {
        type: 'flow-line',
        style: defaultEdgeStyle,
      },
      nodeStateStyles: defaultStateStyles,
      edgeStateStyles: defaultStateStyles,
      layout: defaultLayout,
    });

    _graph.data(data);
    _graph.render();
    _graph.fitView();

    _graph.on('node:mouseenter', (evt) => {
      const { item } = evt;
      _graph.setItemState(item, 'hover', true);
    });

    _graph.on('node:mouseleave', (evt) => {
      const { item } = evt;
      _graph.setItemState(item, 'hover', false);
    });

    _graph.on('node:click', (evt) => {
      const { item, target } = evt;
      const targetType = target.get('type');
      const name = target.get('name');

      // 增加元素
      if (targetType === 'marker') {
        const model = item.getModel();
        if (name === 'add-item') {
          if (!model.children) {
            model.children = [];
          }
          const id = `n-${Math.random()}`;
          model.children.push({
            id,
            label: id.substr(0, 8),
            leftIcon: {
              style: {
                fill: '#e6fffb',
                stroke: '#e6fffb',
              },
              img:
                'https://gw.alipayobjects.com/mdn/rms_f8c6a0/afts/img/A*Q_FQT6nwEC8AAAAAAAAAAABkARQnAQ',
            },
          });
          _graph.updateChild(model, model.id);
        } else if (name === 'remove-item') {
          _graph.removeChild(model.id);
        }
      }
    });
  }

  const getData = async () => {
    setLoading(true);
    G6.registerNode('flowChart',
      {
        drawShape(cfg, group) {
          const rect = group.addShape('rect', {
            attrs: {
              x: -140,
              y: -25,
              width: 280,
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
      width: 300,
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
      // plugins: [toolbar],
    });
    _graph.data(flowChartData);
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
      <div className={styles.G6Content2} id="container2">
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
