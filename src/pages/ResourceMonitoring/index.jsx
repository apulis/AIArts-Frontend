import { Card, Select  } from 'antd';
import { PageHeaderWrapper, PageLoading } from '@ant-design/pro-layout';
import React, { useState, useEffect, useRef } from 'react';
import { getIP, getPie } from './service';
import styles from './index.less';
import { Pie, yuan, ChartCard } from '../../components/Charts';

const { Option } = Select;

const ResourceMonitoring = () => {
  const [loading, setLoading] = useState(false);
  const [nodeIp, setNodeIp] = useState('');
  const [IPOptions, setIPOptions] = useState([]);
  const [pieData, setPieData] = useState({
    'CPU': [{x: '已用', y: 80}, {x: '可用', y: 20}], 
    'GPU': [{x: '已用', y: 60}, {x: '可用', y: 40}],
    '内存': [{x: '已用', y: 55}, {x: '可用', y: 45}], 
    '硬盘': [{x: '已用', y: 30}, {x: '可用', y: 70}]
  });
  const type1 = ['CPU', 'GPU'];
  const type2 = ['内存', '硬盘'];

  useEffect(() => {
    getIPData();
  }, []);

  useEffect(() => {
    if (nodeIp !== '') getPieData(nodeIp);
  }, [nodeIp]);

  const getIPData = async () => {
    setLoading(true);
    const nowTime = new Date().getTime();
    const res = await getIP(Math.round((nowTime - 3600000)/1000).toString(), Math.round(nowTime/1000).toString());
    const { status, data } = res;
    if (status === 'success' && data) {
      const _ip = data[0].instance.split(':')[0];
      setIPOptions(data);
      setNodeIp(_ip);
      getPieData(_ip)
    }
    setLoading(false);
  }

  const getPieData = async (_ip) => {
    const URL = {
      usedCPU: `100 - (avg by (instance)(irate(node_cpu_seconds_total{mode="idle",instance=~"${_ip}(:[0-9]*)?$"}[300s])) * 100)`,
      totalGPU: `k8s_node_device_total{device_str='nvidia.com/gpu',host_ip='${_ip}'} OR on() vector(0)`,
      canUseGPU: `k8s_node_device_available{device_str='nvidia.com/gpu',host_ip='${_ip}'} OR on() vector(0)`,
      usedRAM: `node_memory_MemTotal_bytes{instance=~'${_ip}(:[0-9]*)?$'} - node_memory_MemFree_bytes - node_memory_Buffers_bytes - node_memory_Cached_bytes`,
      totalRAM: `node_memory_MemTotal_bytes{instance=~'${_ip}(:[0-9]*)?$'}`,
      canUseHD: `avg by (device) (node_filesystem_free_bytes{instance=~"${_ip}(:[0-9]*)?$", device=~"/dev/.*"} / node_filesystem_size_bytes) * 100`
    };
    const { totalGPU, canUseGPU, usedCPU, usedRAM, totalRAM, canUseHD } = URL;
    const res = await Promise.all([getPie(usedCPU), getPie(totalGPU), getPie(canUseGPU), getPie(usedRAM), getPie(totalRAM),  getPie(canUseHD)]);
    
  }

  const getCards = (type) => {
    return type.map(i => {
      return (
        <Card title={i}>
          <Pie
            hasLegend
            data={pieData[i]}
            valueFormat={val => <span dangerouslySetInnerHTML={{ __html: val }} />}
            colors={['#d9d9d9', '#1890ff']}
            height={294}
            total={() => (
              <span
                dangerouslySetInnerHTML={{
                  // __html: pieData[i].reduce((pre, now) => now.y + pre, 0),
                  __html: i,
                }}
              />
            )}
          />
        </Card>
      )
    })
  }

  const getSelect = () => {
    return (
      <Select value={nodeIp} size='large' style={{ width: 240, margin: '0 0 20px 20px' }} onChange={v => setNodeIp(v)}>
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
