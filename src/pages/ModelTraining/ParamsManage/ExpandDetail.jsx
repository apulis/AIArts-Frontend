import React from 'react';
import { omitText } from '@/utils/utils';
import { Descriptions, Popover } from 'antd';
import { getNameFromDockerImage } from '@/utils/reg';
import { useIntl } from 'umi';

const ExpandDetail = (props) => {
  const { formatMessage } = useIntl();
  const record = props.record;
  // check null
  record.params.params = record.params.params || [];
  const argumentsContent = (
    <div>
      {Object.entries(record.params.params).map((item) => {
        return (
          <p style={{ wordBreak: 'break-word' }} key={item[0]}>
            {item[0] + ':' + item[1]}
          </p>
        );
      })}
    </div>
  );

  const descriptionContent = <p>{record.params.desc}</p>;

  const datasetContent = <p>{record.params.datasetPath}</p>;
  return (
    <Descriptions>
      <Descriptions.Item label={formatMessage({ id: 'model.training.detail.form.name.labe' })}>
        {record.params.name}
      </Descriptions.Item>
      <Descriptions.Item label={formatMessage({ id: 'model.training.detail.startupFile' })}>
        {record.params.startupFile}
      </Descriptions.Item>
      <Descriptions.Item label={formatMessage({ id: 'model.training.detail.deviceNum' })}>
        {record.params.deviceNum}
      </Descriptions.Item>
      <Descriptions.Item label={formatMessage({ id: 'model.training.detail.datasetPath' })}>
        <Popover
          title={formatMessage({ id: 'model.training.detail.datasetPath' })}
          content={datasetContent}
        >
          {omitText(record.params.datasetPath)}
        </Popover>
      </Descriptions.Item>
      <Descriptions.Item label={formatMessage({ id: 'model.training.detail.runningParams' })}>
        <Popover
          title={formatMessage({ id: 'model.training.detail.runningParams' })}
          content={argumentsContent}
        >
          {Object.entries(record.params.params).map((item, index) => {
            if (index === 2) return <p key={item[0]}>...</p>;
            if (index > 2) return;
            return <p key={item[0]}>{omitText(item[0] + ':' + item[1])}</p>;
          })}
        </Popover>
      </Descriptions.Item>
      <Descriptions.Item label={formatMessage({ id: 'model.training.detail.engine' })}>
        {getNameFromDockerImage(record.params.engine)}
      </Descriptions.Item>
      <Descriptions.Item label={formatMessage({ id: 'model.training.detail.codePath' })}>
        {record.params.codePath}
      </Descriptions.Item>
      <Descriptions.Item label={formatMessage({ id: 'model.training.detail.deviceType' })}>
        {record.params.deviceType}
      </Descriptions.Item>
      <Descriptions.Item label={formatMessage({ id: 'model.training.detail.desc' })}>
        <Popover
          title={formatMessage({ id: 'model.training.detail.desc' })}
          content={descriptionContent}
        >
          {omitText(record.params.desc)}
        </Popover>
      </Descriptions.Item>
    </Descriptions>
  );
};

export default ExpandDetail;
