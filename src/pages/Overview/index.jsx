import { Button, Steps, Card } from 'antd';
import { PageHeaderWrapper, PageLoading } from '@ant-design/pro-layout';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import styles from './index.less';
import { Pie, ChartCard } from '../../components/Charts';
import { SyncOutlined, EditOutlined, ReadOutlined, FireOutlined, CodepenOutlined, BulbOutlined } from '@ant-design/icons';
import { getPieData } from './service';
import { getJobStatus, getStatusColor } from '@/utils/utils';
import { Link, history } from 'umi';
import noDataImg from '../../assets/no_data.png';
import { connect } from 'dva';

const { Step } = Steps;

const OverView = ({ user }) => {
  const { currentUser: { permissionList } } = user;
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
        obj[idx].value = keys.map(v => { return {x: getJobStatus(v), y: i.data[v], color: getStatusColor(v)} })
      }
    });
    setPieData(obj);
    setLoading(false);
  }
  
  const getCards = () => {
    return pieData.map(i => {
      const { value, name } = i;
      const colors = value.map(i => i.color);
      return (
        <Card title={name}>
          {value.length > 0 ?
            <Pie
              hasLegend 
              data={value}
              colors={colors}
              height={250}
            />
          : 
          <div className={styles.noData}>
            <img src={noDataImg} />
            <p>暂无数据</p>
          </div>}
        </Card>
      )
    });
  }
  if (loading) return (<PageLoading />);
  return (
    <PageHeaderWrapper style={{ overflowY: 'hidden' }}>
      {permissionList.includes('AI_ARTS_ALL') ? 
      <div className={styles.resourceMonitoringWrap}>
        <h3>使用流程</h3>
        <Steps>
          <Step status="finish" 
            title={<Link to='/codeDevelopment'>代码开发</Link>}
            icon={<EditOutlined onClick={() => history.push('/codeDevelopment')} />}
          />
          <Step status="finish" 
            title={<Link to='/dataManage/dataSet'>数据管理</Link>}
            icon={<ReadOutlined onClick={() => history.push('/dataManage/dataSet')} />}
          />
          <Step status="finish" 
            title={<Link to='/model-training/modelTraining'>模型训练</Link>}
            icon={<FireOutlined onClick={() => history.push('/model-training/modelTraining')} />}
          />
          <Step status="finish" 
            title={<Link to='/ModelManagement/MyModels'>模型管理</Link>}
            icon={<CodepenOutlined onClick={() => history.push('/ModelManagement/MyModels')} />}
          />
          <Step status="finish" 
            title={<Link to='/Inference/central'>推理服务</Link>}
            icon={<BulbOutlined onClick={() => history.push('/Inference/central')} />}
          />
        </Steps>
        {getCards()}
      </div> :
      permissionList.includes('LABELING_IMAGE') ? <Button type="primary" href="/image_label">去标注图片</Button> : null}
    </PageHeaderWrapper>
  );
};

export default connect(({ user }) => ({ user }))(OverView);