import React from 'react';
import { omitText } from '@/utils/utils';
import { Descriptions, Popover } from 'antd';

const ExpandDetail = (props) => {
  const record = props.record;
  // check null
  record.params.params = record.params.params || [];
  const argumentsContent = (
    <div >
      {Object.entries(record.params.params).map(item => {
        return <p style={{ wordBreak: 'break-word' }} key={item[0]}>{item[0] + ':' + item[1]}</p>;
      })}
    </div >
  );

  const descriptionContent = (
    <p>
      {record.params.desc}
    </p>
  );

  const datasetContent = (
    <p>
      {record.params.datasetPath}
    </p>
  );
  return (
    <Descriptions >
      <Descriptions.Item label="参数配置名称">{record.params.name}</Descriptions.Item>
      <Descriptions.Item label="启动文件">{record.params.startupFile}</Descriptions.Item>
      <Descriptions.Item label="计算节点数">{record.params.deviceNum}</Descriptions.Item>
      <Descriptions.Item label="训练数据集">
        <Popover title="训练数据集" content={datasetContent}>
          {omitText(record.params.datasetPath)}
        </Popover>
      </Descriptions.Item>
      <Descriptions.Item label="运行参数">
        <Popover title="运行参数" content={argumentsContent}>
          {
            Object.entries(record.params.params).map((item, index) => {
              if (index === 2) return <p key={item[0]}>...</p>;
              if (index > 2) return;
              return <p key={item[0]}>{omitText(item[0] + ':' + item[1])}</p>;
            })
          }
        </Popover>
      </Descriptions.Item>
      <Descriptions.Item label="引擎类型">{record.params.engine}</Descriptions.Item>
      <Descriptions.Item label="代码目录">{record.params.codePath}</Descriptions.Item>
      <Descriptions.Item label="计算节点规格">{record.params.deviceType}</Descriptions.Item>
      <Descriptions.Item label="描述">
        <Popover title="描述" content={descriptionContent}>
          {omitText(record.params.desc)}
        </Popover>
      </Descriptions.Item>
    </Descriptions>
  );
};

export default ExpandDetail;