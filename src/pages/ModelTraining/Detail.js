import React, { useEffect } from 'react';
import { Button, Descriptions, Divider } from 'antd';
import { useParams } from 'umi';

import 'react-virtualized/styles.css';
import List from 'react-virtualized/dist/es/List';


import styles from './index.less';





const Detail = () => {
  const params = useParams();
  console.log('params', params)
  useEffect(() => {
    // 获取当前job detail
    return () => {
      
    }
  }, [])
  const stopTraining = () => {
    //
  }

  const removeTraining = () => {
    //
  }
  return (
    <div className={styles.modelDetail}>
      <div className={styles.topButtons}>
        <div className="ant-descriptions-title" style={{marginTop: '30px'}}>模型训练</div>
        <div>
          <Button onClick={stopTraining} style={{marginRight: '12px'}}>停止训练</Button>
          <Button onClick={removeTraining}>删除训练</Button>
        </div>
      </div>
      <Descriptions bordered={true} column={2}>
        <Descriptions.Item label="作业名称">Zhou Maomao</Descriptions.Item>
        <Descriptions.Item label="作业状态">1810000000</Descriptions.Item>
        <Descriptions.Item label="引擎类型">Hangzhou, Zhejiang</Descriptions.Item>
        <Descriptions.Item label="ID">empty</Descriptions.Item>
        <Descriptions.Item label="创建时间">test</Descriptions.Item>
        <Descriptions.Item label="运行时长">test</Descriptions.Item>
        <Descriptions.Item label="运行参数">test</Descriptions.Item>
        <Descriptions.Item label="代码目录">test</Descriptions.Item>
        <Descriptions.Item label="计算节点个数">test</Descriptions.Item>
        <Descriptions.Item label="启动文件">test</Descriptions.Item>
        <Descriptions.Item label="计算节点规格">test</Descriptions.Item>
        <Descriptions.Item label="训练数据集">test</Descriptions.Item>
        <Descriptions.Item label="描述">test</Descriptions.Item>
        <Descriptions.Item label="输出路径">test</Descriptions.Item>
        <Descriptions.Item label="checkpoint 文件">test</Descriptions.Item>
        <Descriptions.Item label="输出路径">test</Descriptions.Item>
      </Descriptions>
      <div className="ant-descriptions-title" style={{marginTop: '30px'}}>训练日志</div>
      <pre>
        logafsduj afsdhuj
      </pre>
    </div>
    
  )
}




export default Detail;




