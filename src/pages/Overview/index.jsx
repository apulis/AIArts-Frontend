import { Button, Steps, Card } from 'antd';
import { PageHeaderWrapper, PageLoading } from '@ant-design/pro-layout';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import styles from './index.less';
import { Pie, ChartCard } from '../../components/Charts';
import { SyncOutlined, EditOutlined, ReadOutlined, FireOutlined, CodepenOutlined, BulbOutlined } from '@ant-design/icons';
import { getPieData } from './service';
import { getJobStatus } from '@/utils/utils';
import { Link, history } from 'umi';

const { Step } = Steps;

const OverView = () => {
  const [loading, setLoading] = useState(false);
  const [pieData, setPieData] = useState([
    {
      params: 'codeEnv',
      name: '代码开发',
      value: []
    },
    {
      params: 'artsTraining',
      name: '模型训练',
      value: []
    },
    {
      params: 'artsEvaluation',
      name: '模型评估',
      value: []
    },
    {
      params: 'Inferencejob',
      name: '推理服务',
      value: []
    }
  ]);

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    setLoading(true);
    const requestArr = pieData.map(i => getPieData({ jobType: i.params }));
    let obj = pieData;
    const res = await Promise.all(requestArr);
    res.forEach((i, idx) => {
      const keys = Object.keys(i.data);
      if (keys.length) {
        obj[idx].value = keys.map(v => { return {x: getJobStatus(v), y: i.data[v]} })
      }
    });
    setPieData(obj);
    setLoading(false);
  }
  
  const getCards = () => {
    return pieData.map(i => {
      const { value, name } = i;
      return (
        <Card title={name}>
          <Pie
            hasLegend 
            data={value}
            height={250}
          />
        </Card>
      )
    })
  }
  if (loading) return (<PageLoading />);
  return (
    <PageHeaderWrapper>
      <div className={styles.resourceMonitoringWrap}>
        <h3>使用流程</h3>
        <Steps>
          <Step status="finish" 
            title={<Link to='/codeDevelopment'>代码开发</Link>}
            icon={<EditOutlined onClick={() => history.push('/codeDevelopment')} />}
          />
          <Step status="finish" 
            title={<Link to='/dataManage'>数据管理</Link>}
            icon={<ReadOutlined onClick={() => history.push('/dataManage')} />}
          />
          <Step status="finish" 
            title={<Link to='/model-training'>模型训练</Link>}
            icon={<FireOutlined onClick={() => history.push('/model-training')} />}
          />
          <Step status="finish" 
            title={<Link to='/ModelManagement'>模型管理</Link>}
            icon={<CodepenOutlined onClick={() => history.push('/ModelManagement')} />}
          />
          <Step status="finish" 
            title={<Link to='/Inference/list'>推理服务</Link>}
            icon={<BulbOutlined onClick={() => history.push('/Inference/list')} />}
          />
        </Steps>
        {getCards()}
      </div>
    </PageHeaderWrapper>
  );
};
export default OverView;