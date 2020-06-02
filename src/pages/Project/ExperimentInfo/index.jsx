import { connect } from 'umi';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { Card, Tabs } from 'antd';
import React, { useEffect } from 'react';
import { tabs } from './config'
import styles from './index.less'

const ExperimentInfo = props => {
  const {
    dispatch,
    values,
    values: {experimentId}
  } = props;

  useEffect(() => {
    dispatch({
      type: 'experimentInfo/fetch',
      payload: {
        id: experimentId
      }
    });
  }, [experimentId]);

  const { TabPane } = Tabs

  return (
    <PageHeaderWrapper title="Experiment Details">
      <Card bordered={false}>
        <div className={styles.tabsWrapper}>
            <Tabs animated={false}>
            {tabs.map(item => (
                <TabPane tab={<span title={item.title}>{item.title}</span>} key={item.id}>
                  <div className={styles.panel}>{item.children ? item.children({ ...values,experimentId: experimentId}) : null}</div>
                </TabPane>
            ))}
            </Tabs>
        </div>
      </Card>
    </PageHeaderWrapper>
  );
};

export default connect(({ experimentInfo: { info: values }, loading }) => ({
  values,
  loading: loading.effects['experimentInfo/fetch']
}))(ExperimentInfo);