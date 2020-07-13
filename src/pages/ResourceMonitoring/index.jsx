import { Card } from 'antd';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import React, { useState, useEffect, useRef } from 'react';
import { getIp } from './service';
import styles from './index.less';
import { Pie, yuan, ChartCard } from '../../components/Charts';

const ResourceMonitoring = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getIPData();
  }, []);

  const getIPData = async () => {
    const res = await getIp(new Date().getTime(), new Date().getTime() + 1);
    console.log('rrrrr', res)
  }

  // if (loading) return (<PageLoading />)
  const salesPieData = [
    {
      x: '家用电器',
      y: 4544,
    },
    {
      x: '食用酒水',
      y: 3321,
    },
    {
      x: '个护健康',
      y: 3113,
    },
    {
      x: '服饰箱包',
      y: 2341,
    },
    {
      x: '母婴产品',
      y: 1231,
    },
    {
      x: '其他',
      y: 1231,
    },
  ];

  return (
    <PageHeaderWrapper>
      <div className={styles.resourceMonitoringWrap}>
      <div className={styles.flexWrap}>
        <Card title="CPU">
          <Pie
            hasLegend
            title="销售额"
            subTitle="销售额"
            total={() => (
              <span
                dangerouslySetInnerHTML={{
                  __html: yuan(salesPieData.reduce((pre, now) => now.y + pre, 0)),
                }}
              />
            )}
            data={salesPieData}
            valueFormat={val => <span dangerouslySetInnerHTML={{ __html: yuan(val) }} />}
            height={294}
          />
        </Card>
        <Card title="GPU">
          <Pie
            hasLegend
            title="销售额"
            subTitle="销售额"
            total={() => (
              <span
                dangerouslySetInnerHTML={{
                  __html: yuan(salesPieData.reduce((pre, now) => now.y + pre, 0)),
                }}
              />
            )}
            data={salesPieData}
            valueFormat={val => <span dangerouslySetInnerHTML={{ __html: yuan(val) }} />}
            height={294}
          />
        </Card>
        </div>
        <div className={styles.flexWrap}>
        <Card title="内存">
          <Pie
            hasLegend
            title="销售额"
            subTitle="销售额"
            total={() => (
              <span
                dangerouslySetInnerHTML={{
                  __html: yuan(salesPieData.reduce((pre, now) => now.y + pre, 0)),
                }}
              />
            )}
            data={salesPieData}
            valueFormat={val => <span dangerouslySetInnerHTML={{ __html: yuan(val) }} />}
            height={294}
          />
        </Card>
        <Card title="硬盘">
          <Pie
            hasLegend
            title="销售额"
            subTitle="销售额"
            total={() => (
              <span
                dangerouslySetInnerHTML={{
                  __html: yuan(salesPieData.reduce((pre, now) => now.y + pre, 0)),
                }}
              />
            )}
            data={salesPieData}
            valueFormat={val => <span dangerouslySetInnerHTML={{ __html: yuan(val) }} />}
            height={294}
          />
        </Card>
        </div>
      </div>
    </PageHeaderWrapper>
  );
};

export default ResourceMonitoring;
