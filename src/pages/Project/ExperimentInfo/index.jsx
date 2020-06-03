import { connect } from 'umi';
import { PageHeaderWrapper, GridContent } from '@ant-design/pro-layout';
import { Col, Row } from 'antd';
import React, { useEffect } from 'react';
import styles from './index.less'
import Code from './components/Code'
import Dataset from './components/Dataset'
import Logs from './components/Logs'
import ModelFiles from './components/ModelFiles'

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

  return (
    <PageHeaderWrapper title="Experiment Details" content={'下面展示了实验详情。'}>
       <GridContent>
          <React.Fragment>
            <Row
              gutter={24}
              style={{
                marginTop: 24,
              }}
            >
              <Col xl={12} lg={24} md={24} sm={24} xs={24}>
                <Code/>
              </Col>
              <Col xl={12} lg={24} md={24} sm={24} xs={24}>
                <Logs {...props} />
              </Col>
            </Row>            
            <Row
              gutter={24}
              style={{
                marginTop: 24,
              }}
            >
              <Col xl={12} lg={24} md={24} sm={24} xs={24}>
                <Dataset/>
              </Col>
              <Col xl={12} lg={24} md={24} sm={24} xs={24}>
                <ModelFiles {...props} />
              </Col>
            </Row>            
          </React.Fragment>
       </GridContent>
    </PageHeaderWrapper>
  );
};

export default connect(({ experimentInfo: { info: values }, loading }) => ({
  values,
  loading: loading.effects['experimentInfo/fetch']
}))(ExperimentInfo);