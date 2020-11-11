import { Card } from 'antd';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import React from 'react';
import Iframe from 'react-iframe';
import { FormattedMessage, getLocale } from 'umi';

const ResourceMonitoring = () => {
  const language = getLocale();
  const domainName = window.location.protocol + '//' + window.location.host;
  let vcUsageLinks;
  let deviceUsageLinks;
  if (process.env.NODE_ENV === 'development') {
    vcUsageLinks = {
      'zh-CN': 'http://219.133.167.42:6688/endpoints/grafana_zh/d/per-vc-gpu-statistic-zh/mei-ge-vcshe-bei-tong-ji-xin-xi',
      'en-US': 'http://219.133.167.42:6688/endpoints/grafana/d/per-vc-gpu-statistic',
    };
    deviceUsageLinks = {
      'zh-CN': 'http://219.133.167.42:6688/endpoints/grafana_zh/d/device-usage-history-zh/she-bei-shi-yong-liang',
      'en-US': 'http://219.133.167.42:6688/endpoints/grafana/d/device-usage-history/device-usage',
    };;
  } else {
    vcUsageLinks = {
      'zh-CN': domainName + '/endpoints/grafana_zh/d/per-vc-gpu-statistic-zh/mei-ge-vcshe-bei-tong-ji-xin-xi',
      'en-US': domainName + '/endpoints/grafana/d/per-vc-gpu-statistic',
    };
    deviceUsageLinks = {
      'zh-CN': domainName + '/endpoints/grafana_zh/d/device-usage-history-zh/she-bei-shi-yong-liang',
      'en-US': domainName + '/endpoints/grafana/d/device-usage-history/device-usage',
    };
  }
  const VCUsageUrl = vcUsageLinks[language];
  const clusterUsageUrl = deviceUsageLinks[language];
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
