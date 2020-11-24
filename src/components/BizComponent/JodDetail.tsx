import React, { useEffect } from 'react';
import { Descriptions } from 'antd';
import { useIntl } from 'umi';
import moment from 'moment';
import { formatParams, getJobStatus } from '@/utils/utils';
import { getNameFromDockerImage } from '@/utils/reg';

interface IJobDetail {
  jobDetail: {
    codePath: string;
    command?: string;
    createTime: string;
    datasetPath: string;
    desc: string;
    deviceNum: number;
    deviceType: string;
    engine: string;
    id: string;
    jobTrainingType: string;
    name: string;
    numPs: number;
    numPsWorker: number;
    outputPath: string;
    params: {
      [props: string]: string;
    };
    startupFile?: string;
    status: string;
    vcName: string;
    visualPath: string;
    checkpoint: string;
  }
}

const JobDetail: React.FC<IJobDetail> = ({ jobDetail }) => {

  const { formatMessage } = useIntl()
  const isUseCommand = !Boolean(jobDetail.startupFile);
  return (
    <Descriptions bordered={true} column={1}>
        <Descriptions.Item label={formatMessage({ id: 'model.training.detail.jobName' })}>
          {jobDetail.name}
        </Descriptions.Item>
        <Descriptions.Item label={formatMessage({ id: 'model.training.detail.jobStatus' })}>
          {getJobStatus(jobDetail.status)}
        </Descriptions.Item>
        <Descriptions.Item label={formatMessage({ id: 'model.training.detail.engine' })}>
          {getNameFromDockerImage(jobDetail.engine)}
        </Descriptions.Item>
        <Descriptions.Item label={formatMessage({ id: 'model.training.detail.ID' })}>
          {jobDetail.id}
        </Descriptions.Item>
        <Descriptions.Item label={formatMessage({ id: 'model.training.detail.createTime' })}>
          {moment(jobDetail.createTime).format('YYYY-MM-DD HH:mm:ss')}
        </Descriptions.Item>
        {
          !isUseCommand && <Descriptions.Item label={formatMessage({ id: 'model.training.detail.runningParams' })}>
            {jobDetail.params && formatParams(jobDetail.params).map((val) => <div>{val}</div>)}
          </Descriptions.Item>
        }
        
        <Descriptions.Item label={formatMessage({ id: 'model.training.detail.codePath' })}>
          {jobDetail.codePath}
        </Descriptions.Item>
        <Descriptions.Item label={formatMessage({ id: 'model.training.detail.deviceNum' })}>
          {jobDetail.deviceNum}
        </Descriptions.Item>
        {
          !isUseCommand && <Descriptions.Item label={formatMessage({ id: 'model.training.detail.startupFile' })}>
            {jobDetail.startupFile}
          </Descriptions.Item>
        }
        
        <Descriptions.Item label={formatMessage({ id: 'model.training.detail.deviceType' })}>
          {jobDetail.deviceType}
        </Descriptions.Item>
        <Descriptions.Item label={formatMessage({ id: 'model.training.detail.datasetPath' })}>
          {jobDetail.datasetPath}
        </Descriptions.Item>
        <Descriptions.Item label={formatMessage({ id: 'model.training.detail.desc' })}>
          {jobDetail.desc}
        </Descriptions.Item>
        {jobDetail.visualPath && !isUseCommand && (
          <Descriptions.Item label={formatMessage({ id: 'model.training.detail.visualPath' })}>
            {jobDetail.visualPath}
          </Descriptions.Item>
        )}
        {
          isUseCommand && <Descriptions.Item label={formatMessage({ id: 'model.training.detail.command' })}>
          {jobDetail.command}
        </Descriptions.Item>
        }
        <Descriptions.Item label={formatMessage({ id: 'model.training.detail.outputPath' })}>
          {jobDetail.outputPath}
        </Descriptions.Item>
        {jobDetail.checkpoint && (
          <Descriptions.Item label={formatMessage({ id: 'model.training.detail.checkpoint' })}>
            {jobDetail.checkpoint}
          </Descriptions.Item>
        )}
      </Descriptions>
  )
}


export default JobDetail;