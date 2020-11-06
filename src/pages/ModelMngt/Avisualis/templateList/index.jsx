import { Card, Collapse, PageHeader } from 'antd';
import { PageHeaderWrapper, PageLoading } from '@ant-design/pro-layout';
import React, { useState, useEffect } from 'react';
import { getAvisualis } from '../service';
import { PAGEPARAMS } from '@/utils/const';
import styles from './index.less';
import { Link, history } from 'umi';
import { EllipsisOutlined } from '@ant-design/icons';
import noDataImg from '../../../../assets/no_data.png';
import modelIconImg from '../../../../assets/modelIconImg.png';
import appIconImg from '../../../../assets/appIconImg.png';
import { useIntl } from 'umi';

const { Panel } = Collapse;
const { Meta } = Card;

const TemplateList = () => {
  const intl = useIntl();
  const [modelTplData, setModelTplData] = useState({ data: [], total: 0 });
  const [appTplData, setAppTplData] = useState({ data: [], total: 0 });
  const [mPageParams, setMPageParams] = useState(PAGEPARAMS);
  const [aPageParams, setAPageParams] = useState(PAGEPARAMS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getModelTplData();
  }, [mPageParams]);

  useEffect(() => {
    getAppTplData();
  }, [aPageParams]);

  const getModelTplData = () => {
    const params = {
      ...mPageParams,
      isAdvance: true,
      use: 'Avisualis_Model',
    };
    getData(1, params);
  };

  const getAppTplData = () => {
    const params = {
      ...aPageParams,
      isAdvance: true,
      use: 'Avisualis_App',
    };
    getData(2, params);
  };

  const getData = async (type, params) => {
    setLoading(true);
    const { code, data } = await getAvisualis(params);
    if (code === 0 && data) {
      const { total, models } = data;
      if (type === 1) {
        setModelTplData({
          data: models,
          total: total,
        });
      } else {
        setAppTplData({
          data: models,
          total: total,
        });
      }
    }
    setLoading(false);
  };

  const mPageParamsChange = (page, count) => {
    setMPageParams({ pageNum: page, pageSize: count });
  };

  const aPageParamsChange = (page, count) => {
    setAPageParams({ pageNum: page, pageSize: count });
  };

  const getCardList = (type) => {
    const data = type === 1 ? modelTplData.data : appTplData.data;
    if (data.length) {
      return data.map((i) => {
        const { name, id, description, use } = i;
        return (
          <Card
            style={{ width: 240 }}
            cover={
              <div className={styles.coverWrap}>
                <img src={type === 1 ? modelIconImg : appIconImg} />
              </div>
            }
            actions={[
              <div
                onClick={() =>
                  history.push(`/ModelManagement/avisualis/detail/${`add`}?modelId=${id}`)
                }
              >
                {intl.formatMessage({ id: 'templateList.createFromTemplate' })}
              </div>,
              // <EllipsisOutlined key="ellipsis" />,
            ]}
          >
            <Meta title={name} description={description} />
          </Card>
        );
      });
    }
    return (
      <div className={styles.noData}>
        <img src={noDataImg} />
        <p>{intl.formatMessage({ id: 'templateList.noData' })}</p>
      </div>
    );
  };

  if (loading) return <PageLoading />;

  return (
    <PageHeaderWrapper title={false}>
      <PageHeader
        ghost={false}
        onBack={() => history.push('/ModelManagement/avisualis')}
        title={intl.formatMessage({ id: 'templateList.visualModeling' })}
      >
        <div className={styles.templateListWrap}>
          <Collapse defaultActiveKey={['1', '2']}>
            <Panel header={intl.formatMessage({ id: 'templateList.modelRepo' })} key="1">
              {getCardList(1)}
            </Panel>
            {/* <Panel header={intl.formatMessage({ id: 'templateList.applicationRepo' })} key="2">
              {getCardList(2)}
            </Panel> */}
          </Collapse>
        </div>
      </PageHeader>
    </PageHeaderWrapper>
  );
};

export default TemplateList;
