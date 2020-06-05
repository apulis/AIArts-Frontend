import { connect } from 'umi';
import { PageHeaderWrapper, GridContent } from '@ant-design/pro-layout';
import { Col, Row } from 'antd';
import React, { useEffect } from 'react';
import styles from './index.less'
import Code from './components/Code'
import Dataset from './components/Dataset'
import Logs from './components/Logs'
import ModelFiles from './components/ModelFiles'
import { useParams } from 'react-router-dom';

const ExperimentInfo = props => {
  const {
    loading,
    dispatch,
    experimentInfo
  } = props;
  const { id } = useParams();
  useEffect(() => {
    dispatch({
      type: 'experimentInfo/fetch',
      payload: {
        id
      },
    });
  }, [id]);

console.log(experimentInfo)
  const { codeData, datasetData, logData, modelData } = experimentInfo
console.log(codeData, datasetData, logData, modelData)

  const routes = [
    {
      path: '/data-manage/dataSet-manage',
      breadcrumbName: 'Home',
    },
    {
      path: '/data-manage/ProjectList',
      breadcrumbName: 'Project List',
    },
    {
      path: '/data-manage/ProjectList/ExperimentList',
      breadcrumbName: 'Experiment List',
    },
    {
      path: '/data-manage/ProjectList/ExperimentList/ExperimentInfo',
      breadcrumbName: 'Experiment Info',
    },
  ];

  return (
    <PageHeaderWrapper title="Experiment Details" content={'下面展示了实验详情。'} breadcrumb={{ routes }}>
       <GridContent>
          <React.Fragment>
            <Row
              gutter={24}
              style={{
                marginTop: 24,
              }}
            >
              <Col xl={12} lg={24} md={24} sm={24} xs={24}>
                <Code loading={loading} data={codeData}/>
              </Col>
              <Col xl={12} lg={24} md={24} sm={24} xs={24}>
                <Logs loading={loading} data={logData}/>
              </Col>
            </Row>            
            <Row
              gutter={24}
              style={{
                marginTop: 24,
              }}
            >
              <Col xl={12} lg={24} md={24} sm={24} xs={24}>
                <Dataset loading={loading} data={datasetData}/>
              </Col>
              <Col xl={12} lg={24} md={24} sm={24} xs={24}>
                <ModelFiles loading={loading} data={modelData} />
              </Col>
            </Row>            
          </React.Fragment>
       </GridContent>
    </PageHeaderWrapper>
  );
};

export default connect(({ experimentInfo: {data: experimentInfo}, loading }) => ({
  experimentInfo,
  loading: loading.effects['experimentInfo/fetch']
}))(ExperimentInfo);