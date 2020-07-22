import { Card, Select, Button } from 'antd';
import { PageHeaderWrapper, PageLoading } from '@ant-design/pro-layout';
import React, { useState, useEffect, useRef, useCallback, useMemo, useContext } from 'react';
import styles from './index.less';
import { Pie, ChartCard } from '../../components/Charts';
import axios from 'axios';
import { SyncOutlined } from '@ant-design/icons';
import Iframe from "react-iframe";

const { Option } = Select;

const ResourceMonitoring = () => {

  const protocol = <window className="location protocol"></window>;
  const host = <window className="location host"></window>;
  const grafana = protocol + '//' + host + '/endpoints/grafana/'
  // const grafana = 'https://atlas02.sigsus.cn/endpoints/grafana/';
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
