import { Button, Steps, Card } from 'antd';
import { PageHeaderWrapper, PageLoading } from '@ant-design/pro-layout';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import styles from './index.less';
import { Pie, ChartCard } from '../../components/Charts';
import {
  SyncOutlined,
  EditOutlined,
  ReadOutlined,
  FireOutlined,
  CodepenOutlined,
  BulbOutlined,
} from '@ant-design/icons';
import { getPieData } from './service';
import { getJobStatus, getStatusColor } from '@/utils/utils';
import { Link, history, FormattedMessage } from 'umi';
import noDataImg from '../../assets/no_data.png';
import { connect } from 'dva';

const { Step } = Steps;

const OverView = ({ user }) => {
  const {
    currentUser: { permissionList },
  } = user;
  const [loading, setLoading] = useState(false);
  const [pieData, setPieData] = useState([
    {
      params: 'codeEnv',
      name: <FormattedMessage id="overview.codeDevelop" />,
      value: [],
    },
    {
      params: 'artsTraining',
      name: <FormattedMessage id="overview.modelTraining" />,
      value: [],
    },
    {
      params: 'artsEvaluation',
      name: <FormattedMessage id="overview.modelEvaluation" />,
      value: [],
    },
    {
      params: 'Inferencejob',
      name: <FormattedMessage id="overview.inference" />,
      value: [],
    },
  ]);

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    setLoading(true);
    const requestArr = pieData.map((i) => getPieData({ jobType: i.params }));
    let obj = pieData;
    const res = await Promise.all(requestArr);
    res &&
      res.length &&
      res.forEach((i, idx) => {
        const keys = Object.keys(i.data);
        if (keys.length) {
          obj[idx].value = keys.map((v) => {
            return { x: getJobStatus(v), y: i.data[v], color: getStatusColor(v) };
          });
        }
      });
    setPieData(obj);
    setLoading(false);
  };

  const getCards = () => {
    return pieData.map((i) => {
      const { value, name } = i;
      const colors = value.map((i) => i.color);
      return (
        <Card title={name}>
          {value.length > 0 ? (
            <Pie hasLegend data={value} colors={colors} height={250} inner={0.68} />
          ) : (
            <div className={styles.noData}>
              <img src={noDataImg} />
              <p>
                <FormattedMessage id="overview.noData" />
              </p>
            </div>
          )}
        </Card>
      );
    });
  };
  if (loading) return <PageLoading />;
  return (
    <PageHeaderWrapper style={{ overflowY: 'hidden' }}>
      {permissionList.includes('AI_ARTS_ALL') ? (
        <div className={styles.resourceMonitoringWrap}>
          <h3>
            <FormattedMessage id="overview.use.manual" />
          </h3>
          <Steps>
            <Step
              status="finish"
              title={
                <Link to="/codeDevelopment">
                  <FormattedMessage id="overview.codeDevelop" />
                </Link>
              }
              icon={<EditOutlined onClick={() => history.push('/codeDevelopment')} />}
            />
            <Step
              status="finish"
              title={
                <Link to="/dataManage/dataSet">
                  <FormattedMessage id="overview.datesets" />
                </Link>
              }
              icon={<ReadOutlined onClick={() => history.push('/dataManage/dataSet')} />}
            />
            <Step
              status="finish"
              title={
                <Link to="/model-training/modelTraining">
                  <FormattedMessage id="overview.modelTraining" />
                </Link>
              }
              icon={<FireOutlined onClick={() => history.push('/model-training/modelTraining')} />}
            />
            <Step
              status="finish"
              title={
                <Link to="/ModelManagement/MyModels">
                  <FormattedMessage id="overview.modelManagement" />
                </Link>
              }
              icon={<CodepenOutlined onClick={() => history.push('/ModelManagement/MyModels')} />}
            />
            <Step
              status="finish"
              title={
                <Link to="/Inference/central">
                  <FormattedMessage id="overview.inference" />
                </Link>
              }
              icon={<BulbOutlined onClick={() => history.push('/Inference/central')} />}
            />
          </Steps>
          {getCards()}
        </div>
      ) : permissionList.includes('LABELING_IMAGE') ? (
        <Button type="primary" href="/image_label">
          <FormattedMessage id="overview.to.label.image" />
        </Button>
      ) : null}
    </PageHeaderWrapper>
  );
};

export default connect(({ user }) => ({ user }))(OverView);
