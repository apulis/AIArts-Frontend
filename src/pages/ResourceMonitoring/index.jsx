import { Card, Select  } from 'antd';
import { PageHeaderWrapper, PageLoading } from '@ant-design/pro-layout';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import styles from './index.less';
import { Pie, ChartCard } from '../../components/Charts';
import axios from 'axios';

const { Option } = Select;
const prefix = '/endpoints/grafana/api/datasources/proxy/1/api/v1';

const ResourceMonitoring = () => {
  const [loading, setLoading] = useState(false);
  const [nodeIp, setNodeIp] = useState(null);
  const [IPOptions, setIPOptions] = useState([]);
  const initData = [{x: '已用', y: 0}, {x: '可用', y: 100}];
  const [pieData, setPieData] = useState({
    'CPU': initData, 
    'GPU': initData,
    '内存': initData, 
    '硬盘': initData
  });
  const type1 = [{type: 'CPU', unit: '%'}, {type: 'GPU', unit: '个'}];
  const type2 = [{type: '内存', unit: 'GB'}, {type: '硬盘', unit: 'GB'}];

  useEffect(() => {
    getIPData();
  }, []);

  const getIPData = () => {
    setLoading(true);
    const nowTime = new Date().getTime();
    const start = Math.round((nowTime - 3600000)/1000).toString();
    const end = Math.round(nowTime/1000).toString();
    axios.get(`${prefix}/series?match[]=node_uname_info&start=${start}&end=${end}`)
    .then(res => {
      const { status, data } = res;
      if (status === 200 && data.data) {
        const _ip = data.data[0].instance.split(':')[0];
        setIPOptions(data.data);
        setNodeIp(_ip);
        getPieData(_ip);
      }
    })
  }

  const getPie = query => {
    return new Promise((resolve, reject) =>{        
      axios.get(`${prefix}/query?query=${query}`).then(res => {
        resolve(res.data);
      }).catch(err =>{
        reject(err.data)        
      })    
    });
  }

  const getPieData = async (_ip) => {
    const URL = {
      usedCPU: `100 - (avg by (instance)(irate(node_cpu_seconds_total{mode="idle",instance=~"${_ip}(:[0-9]*)?$"}[300s])) * 100)`,
      canUseGPU: `k8s_node_device_available{device_str='nvidia.com/gpu',host_ip='${_ip}'} OR on() vector(0)`,
      totalGPU: `k8s_node_device_total{device_str='nvidia.com/gpu',host_ip='${_ip}'} OR on() vector(0)`,
      usedRAM: `node_memory_MemTotal_bytes{instance=~'${_ip}(:[0-9]*)?$'} - node_memory_MemFree_bytes - node_memory_Buffers_bytes - node_memory_Cached_bytes`,
      totalRAM: `node_memory_MemTotal_bytes{instance=~'${_ip}(:[0-9]*)?$'}`,
      canUseHD: `node_filesystem_free_bytes{instance=~"${_ip}(:[0-9]*)?$", fstype=~"nfs[0-9]?"}`,
      totalHD: `node_filesystem_size_bytes{instance=~"${_ip}(:[0-9]*)?$", fstype=~"nfs[0-9]?"}`
    };
    const { totalGPU, canUseGPU, usedCPU, usedRAM, totalRAM, canUseHD, totalHD } = URL;
    const res = await Promise.all([getPie(usedCPU), getPie(canUseGPU), getPie(totalGPU), getPie(usedRAM), getPie(totalRAM),  getPie(canUseHD), getPie(totalHD)]);
    const dataArr = res.map(i => {
      const result = i.data.result;
      if (result.length) {
        return Number((Number(result[0].value[1])).toFixed(2));
      } else {
        return 0;
      }
    });
    let obj = {
      'CPU': [{x: '已用', y: dataArr[0]}, {x: '可用', y: 100 - dataArr[0]}], 
      'GPU': [{x: '已用', y: dataArr[1]}, {x: '可用', y: dataArr[2] - dataArr[1]}],
      '内存': [{x: '已用', y: gbFormat(dataArr[3])}, {x: '可用', y: Number((gbFormat(dataArr[4]) - gbFormat(dataArr[3])).toFixed(2))}], 
      '硬盘': [{x: '已用', y: gbFormat(dataArr[6]) - gbFormat(dataArr[5])}, {x: '可用', y: gbFormat(dataArr[5])}]
    }
    setPieData(obj);
    setLoading(false);
  }

  const gbFormat = val => {
    return Number((val / 1014 / 1024 / 1024).toFixed(2));
  }

  const getCards = (type) => {
    return type.map(i => {
      const { type, unit } = i;
      const data = pieData[type];
      return (
        <Card title={type}>
          <Pie
            hasLegend
            data={data}
            subTitle="总额"
            colors={['#d9d9d9', '#1890ff']}
            height={294}
            total={() => (
              <span>{data.reduce((pre, now) => now.y + pre, 0)} ({unit})</span>
            )}
            valueFormat={val => <span>{unit !== '%' ? val : ''}{unit !== '%' ? unit : ''}</span>}
          />
        </Card>
      )
    })
  }

  const handleSelect = v => {
    setNodeIp(v);
    getPieData(v);
  }

  const getSelect = () => {
    return (
      <Select value={nodeIp} size='large' style={{ width: 240, margin: '0 0 20px 20px' }} onChange={handleSelect}>
        {IPOptions.map(i => {
          const { instance, nodename } = i;
          const _instance = instance.split(':')[0];
          return (
            <Option value={_instance}>{nodename}（{_instance}）</Option>
          )}
        )}
      </Select>
    )
  }

  if (loading) return (<PageLoading />);

  return (
    <PageHeaderWrapper>
      <Card bodyStyle={{ padding: '24px 0px' }}>
        {getSelect()}
        <div className={styles.resourceMonitoringWrap}>
          <div className={styles.flexWrap}>
            {getCards(type1)}
          </div>
          <div className={styles.flexWrap}>
            {getCards(type2)}
          </div>
        </div>
      </Card>
    </PageHeaderWrapper>
  );
};

export default ResourceMonitoring;
