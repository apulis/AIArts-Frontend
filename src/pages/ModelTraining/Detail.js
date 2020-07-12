import React, { useEffect, useState, useRef } from 'react';
import { Button, Descriptions, Divider } from 'antd';
import { useParams } from 'umi';
import { message } from 'antd';

import 'react-virtualized/styles.css';
import List from 'react-virtualized/dist/es/List';
import moment from 'moment';

import { fetchTrainingDetail, removeTrainings } from '@/services/modelTraning';
import styles from './index.less';


const testLog = `
[I 11:41:59.446 NotebookApp] [nb_conda_kernels] enabled, 2 kernels foundenabled, 2 kernels foundenabled, 2 kernels foundenabled, 2 kernels foundenabled, 2 kernels foundenabled, 2 kernels foundenabled, 2 kernels foundenabled, 2 kernels foundenabled, 2 kernels foundenabled, 2 kernels found
[W 11:42:00.091 NotebookApp] WARNING: The notebook server is listening on all IP addresses and not using encryption. This is not recommended.
[I 11:42:00.157 NotebookApp] ✓ nbpresent HTML export ENABLED
[W 11:42:00.157 NotebookApp] ✗ nbpresent PDF export DISABLED: No module named nbbrowserpdf.exporters.pdf
[I 11:42:00.217 NotebookApp] [nb_anacondacloud] enabled
[I 11:42:00.222 NotebookApp] Serving notebooks from local directory: /run/user/0/.jupyter
[I 11:42:00.222 NotebookApp] Serving notebooks from local directory: /run/user/0/.jupyter
[I 11:42:00.223 NotebookApp] The Jupyter Notebook is running at: http://[all ip addresses on your system]:10055/
[I 11:42:00.223 NotebookApp] Use Control-C to stop this server and shut down all kernels (twice to skip confirmation).
[W 11:42:14.721 NotebookApp] 401 POST /login?next=%2F (10.177.22.82) 1.86ms referer=http://10.186.61.102:10055/login[I 11:41:59.446 NotebookApp] [nb_conda_kernels] enabled, 2 kernels foundenabled, 2 kernels foundenabled, 2 kernels foundenabled, 2 kernels foundenabled, 2 kernels foundenabled, 2 kernels foundenabled, 2 kernels foundenabled, 2 kernels foundenabled, 2 kernels foundenabled, 2 kernels found
[W 11:42:00.091 NotebookApp] WARNING: The notebook server is listening on all IP addresses and not using encryption. This is not recommended.
[I 11:42:00.157 NotebookApp] ✓ nbpresent HTML export ENABLED
[W 11:42:00.157 NotebookApp] ✗ nbpresent PDF export DISABLED: No module named nbbrowserpdf.exporters.pdf
[I 11:42:00.217 NotebookApp] [nb_anacondacloud] enabled
[I 11:42:00.222 NotebookApp] Serving notebooks from local directory: /run/user/0/.jupyter
[I 11:42:00.222 NotebookApp] Serving notebooks from local directory: /run/user/0/.jupyter
[I 11:42:00.223 NotebookApp] The Jupyter Notebook is running at: http://[all ip addresses on your system]:10055/
[I 11:42:00.223 NotebookApp] Use Control-C to stop this server and shut down all kernels (twice to skip confirmation).
[W 11:42:14.721 NotebookApp] 401 POST /login?next=%2F (10.177.22.82) 1.86ms referer=http://10.186.61.102:10055/login
[I 11:41:59.446 NotebookApp] [nb_conda_kernels] enabled, 2 kernels foundenabled, 2 kernels foundenabled, 2 kernels foundenabled, 2 kernels foundenabled, 2 kernels foundenabled, 2 kernels foundenabled, 2 kernels foundenabled, 2 kernels foundenabled, 2 kernels foundenabled, 2 kernels found
[W 11:42:00.091 NotebookApp] WARNING: The notebook server is listening on all IP addresses and not using encryption. This is not recommended.
[I 11:42:00.157 NotebookApp] ✓ nbpresent HTML export ENABLED
[W 11:42:00.157 NotebookApp] ✗ nbpresent PDF export DISABLED: No module named nbbrowserpdf.exporters.pdf
[I 11:42:00.217 NotebookApp] [nb_anacondacloud] enabled
[I 11:42:00.222 NotebookApp] Serving notebooks from local directory: /run/user/0/.jupyter
[I 11:42:00.222 NotebookApp] Serving notebooks from local directory: /run/user/0/.jupyter
[I 11:42:00.223 NotebookApp] The Jupyter Notebook is running at: http://[all ip addresses on your system]:10055/
[I 11:42:00.223 NotebookApp] Use Control-C to stop this server and shut down all kernels (twice to skip confirmation).
[W 11:42:14.721 NotebookApp] 401 POST /login?next=%2F (10.177.22.82) 1.86ms referer=http://10.186.61.102:10055/login[I 11:41:59.446 NotebookApp] [nb_conda_kernels] enabled, 2 kernels foundenabled, 2 kernels foundenabled, 2 kernels foundenabled, 2 kernels foundenabled, 2 kernels foundenabled, 2 kernels foundenabled, 2 kernels foundenabled, 2 kernels foundenabled, 2 kernels foundenabled, 2 kernels found
[W 11:42:00.091 NotebookApp] WARNING: The notebook server is listening on all IP addresses and not using encryption. This is not recommended.
[I 11:42:00.157 NotebookApp] ✓ nbpresent HTML export ENABLED
[W 11:42:00.157 NotebookApp] ✗ nbpresent PDF export DISABLED: No module named nbbrowserpdf.exporters.pdf
[I 11:42:00.217 NotebookApp] [nb_anacondacloud] enabled
[I 11:42:00.222 NotebookApp] Serving notebooks from local directory: /run/user/0/.jupyter
[I 11:42:00.222 NotebookApp] Serving notebooks from local directory: /run/user/0/.jupyter
[I 11:42:00.223 NotebookApp] The Jupyter Notebook is running at: http://[all ip addresses on your system]:10055/
[I 11:42:00.223 NotebookApp] Use Control-C to stop this server and shut down all kernels (twice to skip confirmation).
[W 11:42:14.721 NotebookApp] 401 POST /login?next=%2F (10.177.22.82) 1.86ms referer=http://10.186.61.102:10055/login

`


const Detail = () => {
  const params = useParams();
  const logEl = useRef(null);
  const id = params.id;
  const [logs, setLogs] = useState(testLog);
  const [jobDetail, setJobDetail] = useState({});
  const getTrainingDetail = async () => {
    const res = await fetchTrainingDetail(id);
    if (res.code === 0) {
      setJobDetail(res.data)
    }
  }
  useEffect(() => {
    getTrainingDetail();
  }, [])

  const getTrainingLogs = () => {
    logEl.current.scrollTo(0, 100000000)
  }

  const stopTraining = () => {
    //
  }

  const removeTraining = async () => {
    const res = await removeTrainings(id);
    if (res.code === 0) {
      message.success('成功删除');
    }
  }
  return (
    <div className={styles.modelDetail}>
      <div className={styles.topButtons}>
        <div className="ant-descriptions-title" style={{marginTop: '30px'}}>模型训练</div>
        <div>
          <Button onClick={removeTraining}>删除训练</Button>
        </div>
      </div>
      <Descriptions bordered={true} column={2}>
        <Descriptions.Item label="作业名称">{jobDetail.name}</Descriptions.Item>
        <Descriptions.Item label="作业状态">{jobDetail.status}</Descriptions.Item>
        <Descriptions.Item label="引擎类型">{jobDetail.engine}</Descriptions.Item>
        <Descriptions.Item label="ID">{jobDetail.id}</Descriptions.Item>
        <Descriptions.Item label="创建时间">{moment(jobDetail.createTime).format('MMMM Do YYYY, hh:mm:ss')}</Descriptions.Item>
        <Descriptions.Item label="运行参数">{jobDetail.params}</Descriptions.Item>
        <Descriptions.Item label="代码目录">{jobDetail.codePath}</Descriptions.Item>
        <Descriptions.Item label="计算节点个数">{jobDetail.deviceNum}</Descriptions.Item>
        <Descriptions.Item label="启动文件">{jobDetail.startupFile}</Descriptions.Item>
        <Descriptions.Item label="计算节点规格">{jobDetail.deviceType}</Descriptions.Item>
        <Descriptions.Item label="训练数据集">{jobDetail.datasetPath}</Descriptions.Item>
        <Descriptions.Item label="描述">{jobDetail.desc}</Descriptions.Item>
        <Descriptions.Item label="输出路径">{jobDetail.outputPath}</Descriptions.Item>
        <Descriptions.Item label="checkpoint 文件">{jobDetail.checkpoint}</Descriptions.Item>
      </Descriptions>
      <div className="ant-descriptions-title" style={{marginTop: '30px'}}>训练日志</div>
      <Button onClick={getTrainingLogs}>获取训练日志</Button>
      <pre ref={logEl} style={{marginTop: '20px'}} className={styles.logs}>
        {logs}
      </pre>
    </div>
    
  )
}




export default Detail;




