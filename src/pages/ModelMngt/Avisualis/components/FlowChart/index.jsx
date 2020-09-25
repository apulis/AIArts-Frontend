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

const anchorPoints = [ [0.5, 1], [0.5, 0] ];

const FlowChart = forwardRef((props, ref) => {
  const { transformData, detailData, avisualis, detailId } = props;
  const [graph, setGraph] = useState(null);
  const [flowChartData, setFlowChartData] = useState(detailData);
  const [loading, setLoading] = useState(true);
  const [selectItem, setSelectItem] = useState(null);
  const [combosTempArr, setCombosTempArr] = useState([]);
  const [nodesTempArr, setNodesTempArr] = useState([]);
  const { panelApiData, treeData } = avisualis;
  const data = {
    nodes: [
      { id: "mnist", name: "mnist", treeIdx: 0, anchorPoints: anchorPoints },
      { id: 'DevResNet', name: 'DevResNet',treeIdx: 1, comboId: 'SEResNet', anchorPoints: anchorPoints },
      { id: 'MaxNet',name: 'MaxNet', comboId: "SEResNet", treeIdx: 1, anchorPoints: anchorPoints },
      // { id: 'MineNet',name: 'MineNet', comboId: "MainNet", treeIdx: 1, anchorPoints: anchorPoints }
    ],
    
    combos: [
      // { id: 'aa', label: 'aa', anchorPoints: anchorPoints },
      { id: 'Backbone', label: 'Backbone', anchorPoints: anchorPoints },
      { id: 'SEResNet', label: 'SEResNet', parentId: "Backbone", anchorPoints: anchorPoints },
      // { id: 'MiniResNet', label: 'MiniResNet', parentId: "SEResNet", anchorPoints: anchorPoints },
      // { id: 'MainNet', label: 'MainNet', parentId: "SEResNet", anchorPoints: anchorPoints },
    ],
    edges: [
      { source: 'mnist', target: 'DevResNet' },
      // { source: 'mnist', target: 'MineNet', style: { strokeOpacity: 0 } },
      // { source: 'ResNeXt', target: 'AdaptiveAvgMaxPool2d' },
    ],
  };
  
  useImperativeHandle(ref, () => ({
    handleDragEnd: handleDragEnd
  }));
  
  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    setLoading(true);
    G6.registerCombo(
      'cRect',
      {
        drawShape: function drawShape(cfg, group) {
          const self = this;
          cfg.padding = cfg.padding || [50, 20, 20, 20];
          const style = self.getShapeStyle(cfg);
          const rect = group.addShape('rect', {
            attrs: {
              ...style,
              x: -style.width / 2 - (cfg.padding[3] - cfg.padding[1]) / 2,
              y: -style.height / 2 - (cfg.padding[0] - cfg.padding[2]) / 2,
              width: style.width,
              height: style.height,
            },
            draggable: false,
            name: 'combo-keyShape',
          });
          group.addShape('marker', {
            attrs: {
              ...style,
              fill: '#fff',
              opacity: 1,
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
        afterUpdate: function afterUpdate(cfg, combo) {
          const group = combo.get('group');
          const marker = group.find((ele) => ele.get('name') === 'combo-marker-shape');
          marker.attr({
            x: cfg.style.width / 2 + cfg.padding[1],
            y: (cfg.padding[2] - cfg.padding[0]) / 2,
            symbol: cfg.collapsed ? expandIcon : collapseIcon,
          });
        },
      },
      'rect',
    );

    G6.registerNode('flowChart',
      {
        drawShape(cfg, group) {
          const { name } = cfg;
          const rect = group.addShape('rect', {
            attrs: {
              x: -(name.length * 8),
              y: -20,
              width: 16 * name.length,
              height: 40,
              radius: 10,
              stroke: '#1890ff',
              lineWidth: 3,
            },
            name: 'rect-shape',
          });
          if (name) {
            group.addShape('text', {
              attrs: {
                text: name,
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
    let _graph = new G6.Graph({
      container: 'container',
      width: 800,
      height,
      layout: {
        type: 'dagre',
        // ranksepFunc: (d) => {
        //   if (d.comboId) return 10;
        //   return 10
        // },
        ranksep: 150,
        // align: 'UL',
        controlPoints: true,
        // sortByCombo: true,
      },
      defaultNode: {
        type: 'flowChart'
      },
      defaultEdge: {
        style: {
          radius: 20,
          endArrow: true,
          lineAppendWidth: 10,
          lineWidth: 2,
          stroke: '#C2C8D5',
        },
      },
      groupByTypes: false,
      defaultCombo: {
        type: 'cRect',
        labelCfg: {
          style: {
            fontSize: 16
          }
        }
      },
      comboStateStyles: {
        hover: {
          cursor: 'pointer',
        }
      },
      nodeStateStyles: {
        selected: {
          stroke: '#d9d9d9',
          fill: '#5394ef',
        },
        hover: {
          cursor: 'pointer',
          fill: 'lightsteelblue',
        }
      },
      modes: {
        default: [
          'zoom-canvas',
          'drag-combo',
          {
            type: 'click-select',
            multiple: false
          },
          "customer-events",
        ]
      },
      plugins: [minimap, toolbar],
    });
    _graph.data(data);

    _graph.on('afterlayout', e => {
      _graph.updateItem(_graph.findById('mnist'), {
        x: 0,
        y: -200
      });
      _graph.updateItem(_graph.findById('MaxNet'), {
        x: 200,
        y: 0
      });

      _graph.updateItem(_graph.findById('DevResNet'), {
        x: 0,
        y: 0
      });
      
    });

    _graph.render();

    _graph.on('node:mouseenter', e => {
      _graph.setItemState(e.item, 'hover', true); // 设置当前节点的 hover 状态为 true
    });
    
    _graph.on('node:mouseleave', e => {
      _graph.setItemState(e.item, 'hover', false); // 设置当前节点的 hover 状态为 false
    });

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
      const nodeItem = e.item;
      const clickNodes = _graph.findAllByState('node', 'click');
      clickNodes.forEach(cn => {
        _graph.setItemState(cn, 'selected', false);
      });
      if (e.target.get('name') === 'combo-marker-shape') {
        _graph.collapseExpandCombo(nodeItem);
        _graph.refreshPositions();
      }
      if (nodeItem._cfg.type === "combo") {
        setSelectItem(null);
      } else {
        setSelectItem(nodeItem);
      }
    });

    _graph.on('combo:mouseenter', e => {
      _graph.setItemState(e.item, 'hover', true);
    });
    
    _graph.on('combo:mouseleave', e => {
      _graph.setItemState(e.item, 'hover', false);
    });

    _graph.fitCenter();
    setGraph(_graph);
    setLoading(false);
  };

  const handleDragEnd = node => {
    const { title, key, config, treeIdx, child, fName } = node;
    const hasNodes = Object.keys(flowChartData).length && flowChartData.nodes && flowChartData.nodes.length;
    if ((hasNodes && treeIdx > flowChartData.nodes.length) || (!hasNodes && treeIdx > 0)) {
      message.warning('只能按照步骤顺序依次拖拽！');
      return;
    }

    let newData = {}, nodeArr = [], combosArr = [], 
        newNodes = {
          id: key,
          name: title,
          config: config,
          treeIdx: treeIdx
        };
    if (child && child.length) {
      combosArr.push(...[
        {
          id: fName,
          label: fName,
        },
        {
          id: key,
          label: title,
          config: config,
          parentId: fName,
          treeIdx: treeIdx
        }
      ]);
      // child.forEach(i => getChilds(i.children, nodeArr, combosArr, i.name, treeIdx));
      getChilds(child, nodeArr, combosArr, key, treeIdx)
    }
    

    // getChilds(child, nodeArr, combosArr, key, treeIdx)


    if (hasNodes) {
      newData = _.cloneDeep(flowChartData);
      const { edges, nodes, combos } = newData;
      const edgesLen = edges.length;
      if (child && child.length) {
        nodeArr.forEach(i => {
          newData.nodes.push(i);
        })
        if (!combos) newData.combos = [];
        combosArr.forEach(i => {
          newData.combos.push(i);
        })
      } else {
        newData.nodes.push(newNodes);
      }

      const edgesTemp = {
        source: newData.nodes.find(o => o.treeIdx === (treeIdx - 1)).id,
        target: newData.nodes.find(o => o.treeIdx === treeIdx).id
      };
      if (edges && edgesLen) {
        newData.edges.push(edgesTemp)
      } else {
        newData.edges[0] = edgesTemp;
      }
    } else {
      newData.nodes = [newNodes];
      if (child && child.length) {
        newData.nodes.push(nodeArr);
        newData.combos = combosArr;
      }
      newData.edges = [];
    }
    Object.keys(newData).forEach(i => {
      if (i !== 'edges') newData[i].forEach(m => m.anchorPoints = anchorPoints);
    })
    console.log('-------newData', newData)
    setFlowChartData(newData);
    graph.read(newData);
    graph.fitCenter();
    transformData(null, newData);
    setSelectItem(null);
  }

  const getChilds = (data, nodeArr, combosArr, fName, treeIdx) => {
    data.forEach(i => {
      const { name, config, children } = i;
      if (children && children.length) {
        combosArr.push({
          id: name,
          label: name,
          parentId: fName,
          config: config,
          treeIdx: treeIdx
        });
        console.log('-------combosArr', combosArr)

        // children.forEach(x => getChilds(x.children, nodeArr, combosArr, x.name, treeIdx))
        getChilds(children, nodeArr, combosArr, name, treeIdx)
      } else {
        nodeArr.push({
          id: name,
          config: config,
          name: name,
          comboId: fName,
          treeIdx: treeIdx
        });
      }
    })
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

  console.log('-------selectItem', selectItem)

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
