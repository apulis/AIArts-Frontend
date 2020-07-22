import { Card } from 'antd';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import React from 'react';
import Iframe from "react-iframe";

const ResourceMonitoring = () => {
  let grafana;
  if (process.env.NODE_ENV === 'development') {
    grafana = 'https://atlas02.sigsus.cn/endpoints/grafana/';
  } else {
    const protocol = window.location.protocol;
    const host = window.location.host;
    grafana = protocol + '//' + host + '/endpoints/grafana/';
  }
  const VCUsageUrl = `${grafana}dashboard/db/per-vc-device-statistic?_=${Date.now()}`;
  const clusterUsageUrl = `${grafana}dashboard/db/device-usage?refresh=30s&orgId=1&_=${Date.now()}`;
  return (
    <PageHeaderWrapper>
      <Card bodyStyle={{ padding: '0px 0px' }}>
        <h1 style={{ fontSize: 24, fontWeight: 500, margin: 8 }}>VC设备使用情况</h1>
        <Iframe url={VCUsageUrl} width="100%" height="500" />
        <h1 style={{ fontSize: 24, fontWeight: 500, margin: 8 }}>集群使用情况</h1>
        <Iframe url={clusterUsageUrl} width="100%" height="500" />
      </Card>
    </PageHeaderWrapper>
  );
};

export default ResourceMonitoring;
