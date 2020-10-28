import { Card } from 'antd';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import React from 'react';
import Iframe from 'react-iframe';
import { FormattedMessage, getLocale } from 'umi';

const ResourceMonitoring = () => {
  // const language = getLocale();
  const language = 'en-US';
  const domainName = window.location.protocol + '//' + window.location.host;
  const grafanaLinks = {
    'zh-CN': domainName + '/endpoints/grafana_zh/',
    'en-US': domainName + '/endpoints/grafana/',
  };
  let grafana;
  if (process.env.NODE_ENV === 'development') {
    grafana = 'https://atlas02.sigsus.cn/endpoints/grafana/';
  } else {
    grafana = grafanaLinks[language];
  }
  const VCUsageUrl = `${grafana}dashboard/db/per-vc-device-statistic?_=${Date.now()}&kiosk=tv`;
  const clusterUsageUrl = `${grafana}dashboard/db/device-usage?refresh=30s&orgId=1&_=${Date.now()}&kiosk=tv`;
  return (
    <PageHeaderWrapper>
      <Card bodyStyle={{ padding: '0px 0px' }}>
        <h1 style={{ fontSize: 24, fontWeight: 500, margin: 8 }}>
          <FormattedMessage id="resourceMonitoring.vc.device.usage" />
        </h1>
        <Iframe url={VCUsageUrl} width="100%" height="500" />
        <h1 style={{ fontSize: 24, fontWeight: 500, margin: 8 }}>
          <FormattedMessage id="resourceMonitoring.cluster.usage" />
        </h1>
        <Iframe url={clusterUsageUrl} width="100%" height="500" />
      </Card>
    </PageHeaderWrapper>
  );
};

export default ResourceMonitoring;
