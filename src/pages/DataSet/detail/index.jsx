import { Collapse, PageHeader, Descriptions, Tag } from 'antd';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { history } from 'umi';
import React, { useState, useEffect } from 'react';
import styles from './index.less';
import { getDatasetDetail } from '../service';
import { PageLoading } from '@ant-design/pro-layout';
import moment from 'moment';
import { useIntl } from 'umi';

const { Panel } = Collapse;

const DataSetDetail = (props) => {
  const intl = useIntl();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const id = props.location.query.id;

  useEffect(() => {
    getData();
  }, [id]);

  const getData = async () => {
    const { code, data, total } = await getDatasetDetail(id);
    if (code === 0 && data) {
      setData([data.dataset]);
    }
    setLoading(false);
  };

  const getPanelHeader = (i, version) => {
    return (
      <div className={styles.panelHeader}>
        <h3>
          {intl.formatMessage({ id: 'dataSet.detail.versionNum' })} {version}
        </h3>
        {i === 0 && (
          <Tag color="#1890ff">{intl.formatMessage({ id: 'dataSet.detail.curVersion' })}</Tag>
        )}
      </div>
    );
  };

  if (loading) return <PageLoading />;

  return (
    <PageHeaderWrapper title={false}>
      <PageHeader
        ghost={false}
        onBack={() => history.push('/dataManage/dataSet')}
        title={`${intl.formatMessage({ id: 'dataSet.detail.dataSetName' })} ${data[0].name}`}
      >
        <Collapse defaultActiveKey={['0']}>
          {data.map((item, index) => {
            const { creator, path, createdAt, updatedAt, description, version } = item;
            return (
              <Panel header={getPanelHeader(index, version)} key={index}>
                <Descriptions size="small" column={2}>
                  <Descriptions.Item
                    label={intl.formatMessage({ id: 'dataSet.detail.label.creater' })}
                  >
                    {creator}
                  </Descriptions.Item>
                  <Descriptions.Item
                    label={intl.formatMessage({ id: 'dataSet.detail.label.storePath' })}
                  >
                    {path}
                  </Descriptions.Item>
                  <Descriptions.Item
                    label={intl.formatMessage({ id: 'dataSet.detail.label.createTime' })}
                  >
                    {moment(createdAt).format('YYYY-MM-DD HH:mm:ss')}
                  </Descriptions.Item>
                  <Descriptions.Item
                    label={intl.formatMessage({ id: 'dataSet.detail.label.updateTime' })}
                  >
                    {moment(updatedAt).format('YYYY-MM-DD HH:mm:ss')}
                  </Descriptions.Item>
                  <Descriptions.Item
                    label={intl.formatMessage({ id: 'dataSet.detail.label.description' })}
                  >
                    {description}
                  </Descriptions.Item>
                </Descriptions>
              </Panel>
            );
          })}
        </Collapse>
      </PageHeader>
    </PageHeaderWrapper>
  );
};

export default DataSetDetail;
