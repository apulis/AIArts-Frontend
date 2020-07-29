import { history } from 'umi';
import { PageHeader, Descriptions, Button, message } from 'antd';
import React, { useState, useEffect, useRef } from 'react';
// import { getEvaluationStatus } from '@/utils/utils';
import { useParams } from 'umi';
import moment from 'moment';
import { fetchEvaluationLog, fetchEvaluationDetail } from './services';
import styles from './index.less';

const EvaluationDetail = props => {
  const params = useParams();
  const modelId = params.id;

  const logEl = useRef(null);
  const [evaluationDetail, setEvaluationDetail] = useState(null);
  const [logs, setLogs] = useState('');

  const getEvaluationLog = async () => {
    const res = await fetchEvaluationDetail(modelId);
    if (res.code === 0) {
      // let log = res.data.log;
      // if (typeof log === 'object') {
      //   log = '';
      // }
      let log = `name: GeForce RTX 2070 major: 7 minor: 5 memoryClockRate(GHz): 1.62
      pciBusID: 0000:01:00.0
      2020-07-29 06:41:52.143807: I tensorflow/stream_executor/platform/default/dso_loader.cc:42] Successfully opened dynamic library libcudart.so.10.0
      2020-07-29 06:41:52.143814: I tensorflow/stream_executor/platform/default/dso_loader.cc:42] Successfully opened dynamic library libcublas.so.10.0
      2020-07-29 06:41:52.143820: I tensorflow/stream_executor/platform/default/dso_loader.cc:42] Successfully opened dynamic library libcufft.so.10.0
      2020-07-29 06:41:52.143826: I tensorflow/stream_executor/platform/default/dso_loader.cc:42] Successfully opened dynamic library libcurand.so.10.0
      2020-07-29 06:41:52.143855: I tensorflow/stream_executor/platform/default/dso_loader.cc:42] Successfully opened dynamic library libcusolver.so.10.0
      2020-07-29 06:41:52.143860: I tensorflow/stream_executor/platform/default/dso_loader.cc:42] Successfully opened dynamic library libcusparse.so.10.0
      2020-07-29 06:41:52.143880: I tensorflow/stream_executor/platform/default/dso_loader.cc:42] Successfully opened dynamic library libcudnn.so.7
      2020-07-29 06:41:52.143964: I tensorflow/stream_executor/cuda/cuda_gpu_executor.cc:1005] successful NUMA node read from SysFS had negative value (-1), but there must be at least one NUMA node, so returning NUMA node zero
      2020-07-29 06:41:52.144244: I tensorflow/stream_executor/cuda/cuda_gpu_executor.cc:1005] successful NUMA node read from SysFS had negative value (-1), but there must be at least one NUMA node, so returning NUMA node zero
      2020-07-29 06:41:52.144524: I tensorflow/core/common_runtime/gpu/gpu_device.cc:1763] Adding visible gpu devices: 0
      2020-07-29 06:41:52.144825: I tensorflow/stream_executor/cuda/cuda_gpu_executor.cc:1005] successful NUMA node read from SysFS had negative value (-1), but there must be at least one NUMA node, so returning NUMA node zero
      2020-07-29 06:41:52.145080: I tensorflow/core/common_runtime/gpu/gpu_device.cc:1640] Found device 0 with properties: 
      name: GeForce RTX 2070 major: 7 minor: 5 memoryClockRate(GHz): 1.62
      pciBusID: 0000:01:00.0
      2020-07-29 06:41:52.145106: I tensorflow/stream_executor/platform/default/dso_loader.cc:42] Successfully opened dynamic library libcudart.so.10.0
      2020-07-29 06:41:52.145111: I tensorflow/stream_executor/platform/default/dso_loader.cc:42] Successfully opened dynamic library libcublas.so.10.0
      2020-07-29 06:41:52.145116: I tensorflow/stream_executor/platform/default/dso_loader.cc:42] Successfully opened dynamic library libcufft.so.10.0
      2020-07-29 06:41:52.145122: I tensorflow/stream_executor/platform/default/dso_loader.cc:42] Successfully opened dynamic library libcurand.so.10.0
      2020-07-29 06:41:52.145128: I tensorflow/stream_executor/platform/default/dso_loader.cc:42] Successfully opened dynamic library libcusolver.so.10.0
      2020-07-29 06:41:52.145133: I tensorflow/stream_executor/platform/default/dso_loader.cc:42] Successfully opened dynamic library libcusparse.so.10.0
      2020-07-29 06:41:52.145162: I tensorflow/stream_executor/platform/default/dso_loader.cc:42] Successfully opened dynamic library libcudnn.so.7
      2020-07-29 06:41:52.145203: I tensorflow/stream_executor/cuda/cuda_gpu_executor.cc:1005] successful NUMA node read from SysFS had negative value (-1), but there must be at least one NUMA node, so returning NUMA node zero
      2020-07-29 06:41:52.145574: I tensorflow/stream_executor/cuda/cuda_gpu_executor.cc:1005] successful NUMA node read from SysFS had negative value (-1), but there must be at least one NUMA node, so returning NUMA node zero
      2020-07-29 06:41:52.146000: I tensorflow/core/common_runtime/gpu/gpu_device.cc:1763] Adding visible gpu devices: 0
      2020-07-29 06:41:52.146044: I tensorflow/core/common_runtime/gpu/gpu_device.cc:1181] Device interconnect StreamExecutor with strength 1 edge matrix:
      2020-07-29 06:41:52.146048: I tensorflow/core/common_runtime/gpu/gpu_device.cc:1187]      0 
      2020-07-29 06:41:52.146071: I tensorflow/core/common_runtime/gpu/gpu_device.cc:1200] 0:   N 
      2020-07-29 06:41:52.146133: I tensorflow/stream_executor/cuda/cuda_gpu_executor.cc:1005] successful NUMA node read from SysFS had negative value (-1), but there must be at least one NUMA node, so returning NUMA node zero
      2020-07-29 06:41:52.146538: I tensorflow/stream_executor/cuda/cuda_gpu_executor.cc:1005] successful NUMA node read from SysFS had negative value (-1), but there must be at least one NUMA node, so returning NUMA node zero
      2020-07-29 06:41:52.146809: I tensorflow/core/common_runtime/gpu/gpu_device.cc:1326] Created TensorFlow device (/job:localhost/replica:0/task:0/device:GPU:0 with 7484 MB memory) -> physical GPU (device: 0, name: GeForce RTX 2070, pci bus id: 0000:01:00.0, compute capability: 7.5)
      W0729 06:41:52.146923 140574846863168 deprecation.py:323] From /usr/local/lib/python3.6/dist-packages/tensorflow/python/training/saver.py:1276: checkpoint_exists (from tensorflow.python.training.checkpoint_management) is deprecated and will be removed in a future version.
      Instructions for updating:
      Use standard file APIs to check for files with this prefix.
      I0729 06:41:52.148046 140574846863168 saver.py:1280] Restoring parameters from /home/jin.li/work_dirs/flowers-models/resnet_v1_50/model.ckpt-3001
      2020-07-29 06:41:52.856707: W tensorflow/compiler/jit/mark_for_compilation_pass.cc:1412] (One-time warning): Not using XLA:CPU for cluster because envvar TF_XLA_FLAGS=--tf_xla_cpu_global_jit was not set.  If you want XLA:CPU, either set that envvar, or use experimental_jit_scope to enable XLA:CPU.  To confirm that XLA is active, pass --vmodule=xla_compilation_cache=1 (as a proper command-line flag, not via TF_XLA_FLAGS) or set the envvar XLA_FLAGS=--xla_hlo_profile.
      I0729 06:41:52.876146 140574846863168 session_manager.py:500] Running local_init_op.
      I0729 06:41:52.899772 140574846863168 session_manager.py:502] Done running local_init_op.
      W0729 06:41:53.095691 140574846863168 deprecation.py:323] From /usr/local/lib/python3.6/dist-packages/tensorflow/python/training/monitored_session.py:875: start_queue_runners (from tensorflow.python.training.queue_runner_impl) is deprecated and will be removed in a future version.
      Instructions for updating:
      To construct input pipelines, use the  module.
      2020-07-29 06:41:53.643921: I tensorflow/stream_executor/platform/default/dso_loader.cc:42] Successfully opened dynamic library libcudnn.so.7
      I0729 06:41:55.753674 140574846863168 evaluation.py:167] Evaluation [1/4]
      I0729 06:41:55.920057 140574846863168 evaluation.py:167] Evaluation [2/4]
      I0729 06:41:56.137565 140574846863168 evaluation.py:167] Evaluation [3/4]
      I0729 06:41:56.386112 140574846863168 evaluation.py:167] Evaluation [4/4]
      eval/Recall_5[1]
      eval/Accuracy[0.92]
      I0729 06:41:56.613431 140574846863168 evaluation.py:275] Finished evaluation at 2020-07-29-06:41:56
      + EXIT_CODE=0
      ++ date
      + echo Wed Jul 29 06:41:57 UTC 2020 ': 0'
      + exit 0
      
      
      
      =========================================================
              end of logs from pod: ce8adace-9ff0-46cb-8f77-b458ae8a2036
      =========================================================
      
      
      `;
      setLogs(log);
    }
    return res;
  }
  // const getEvaluationLog = async () => {
  //   const res = await fetchEvaluationDetail(modelId);
  //   if (res.code === 0) {
  //     let log = res.data.log;
  //     if (typeof log === 'object') {
  //       log = '';
  //     }
  //     setLogs(log);
  //   }
  //   return res;
  // }
  const getEvaluationDetail = async () => {
    const res = await fetchEvaluationDetail(modelId);
    const {code, msg, data} = res;
    if (code === 0) {
      setEvaluationDetail(data);
    }
  }

  const getLateastLogs = async () => {
    // const cancel = message.loading('获取结果中');
    const res = await getEvaluationLog();
    // cancel();
    // if (res.code === 0) {
    //   message.success('成功获取结果');
    // }
    if (res.code === 0) {
      // let log = res.data.log;
      // if (typeof log === 'object') {
      //   log = '';
      // }
      let log = `name: GeForce RTX 2070 major: 7 minor: 5 memoryClockRate(GHz): 1.62
      pciBusID: 0000:01:00.0
      2020-07-29 06:41:52.143807: I tensorflow/stream_executor/platform/default/dso_loader.cc:42] Successfully opened dynamic library libcudart.so.10.0
      2020-07-29 06:41:52.143814: I tensorflow/stream_executor/platform/default/dso_loader.cc:42] Successfully opened dynamic library libcublas.so.10.0
      2020-07-29 06:41:52.143820: I tensorflow/stream_executor/platform/default/dso_loader.cc:42] Successfully opened dynamic library libcufft.so.10.0
      2020-07-29 06:41:52.143826: I tensorflow/stream_executor/platform/default/dso_loader.cc:42] Successfully opened dynamic library libcurand.so.10.0
      2020-07-29 06:41:52.143855: I tensorflow/stream_executor/platform/default/dso_loader.cc:42] Successfully opened dynamic library libcusolver.so.10.0
      2020-07-29 06:41:52.143860: I tensorflow/stream_executor/platform/default/dso_loader.cc:42] Successfully opened dynamic library libcusparse.so.10.0
      2020-07-29 06:41:52.143880: I tensorflow/stream_executor/platform/default/dso_loader.cc:42] Successfully opened dynamic library libcudnn.so.7
      2020-07-29 06:41:52.143964: I tensorflow/stream_executor/cuda/cuda_gpu_executor.cc:1005] successful NUMA node read from SysFS had negative value (-1), but there must be at least one NUMA node, so returning NUMA node zero
      2020-07-29 06:41:52.144244: I tensorflow/stream_executor/cuda/cuda_gpu_executor.cc:1005] successful NUMA node read from SysFS had negative value (-1), but there must be at least one NUMA node, so returning NUMA node zero
      2020-07-29 06:41:52.144524: I tensorflow/core/common_runtime/gpu/gpu_device.cc:1763] Adding visible gpu devices: 0
      2020-07-29 06:41:52.144825: I tensorflow/stream_executor/cuda/cuda_gpu_executor.cc:1005] successful NUMA node read from SysFS had negative value (-1), but there must be at least one NUMA node, so returning NUMA node zero
      2020-07-29 06:41:52.145080: I tensorflow/core/common_runtime/gpu/gpu_device.cc:1640] Found device 0 with properties: 
      name: GeForce RTX 2070 major: 7 minor: 5 memoryClockRate(GHz): 1.62
      pciBusID: 0000:01:00.0
      2020-07-29 06:41:52.145106: I tensorflow/stream_executor/platform/default/dso_loader.cc:42] Successfully opened dynamic library libcudart.so.10.0
      2020-07-29 06:41:52.145111: I tensorflow/stream_executor/platform/default/dso_loader.cc:42] Successfully opened dynamic library libcublas.so.10.0
      2020-07-29 06:41:52.145116: I tensorflow/stream_executor/platform/default/dso_loader.cc:42] Successfully opened dynamic library libcufft.so.10.0
      2020-07-29 06:41:52.145122: I tensorflow/stream_executor/platform/default/dso_loader.cc:42] Successfully opened dynamic library libcurand.so.10.0
      2020-07-29 06:41:52.145128: I tensorflow/stream_executor/platform/default/dso_loader.cc:42] Successfully opened dynamic library libcusolver.so.10.0
      2020-07-29 06:41:52.145133: I tensorflow/stream_executor/platform/default/dso_loader.cc:42] Successfully opened dynamic library libcusparse.so.10.0
      2020-07-29 06:41:52.145162: I tensorflow/stream_executor/platform/default/dso_loader.cc:42] Successfully opened dynamic library libcudnn.so.7
      2020-07-29 06:41:52.145203: I tensorflow/stream_executor/cuda/cuda_gpu_executor.cc:1005] successful NUMA node read from SysFS had negative value (-1), but there must be at least one NUMA node, so returning NUMA node zero
      2020-07-29 06:41:52.145574: I tensorflow/stream_executor/cuda/cuda_gpu_executor.cc:1005] successful NUMA node read from SysFS had negative value (-1), but there must be at least one NUMA node, so returning NUMA node zero
      2020-07-29 06:41:52.146000: I tensorflow/core/common_runtime/gpu/gpu_device.cc:1763] Adding visible gpu devices: 0
      2020-07-29 06:41:52.146044: I tensorflow/core/common_runtime/gpu/gpu_device.cc:1181] Device interconnect StreamExecutor with strength 1 edge matrix:
      2020-07-29 06:41:52.146048: I tensorflow/core/common_runtime/gpu/gpu_device.cc:1187]      0 
      2020-07-29 06:41:52.146071: I tensorflow/core/common_runtime/gpu/gpu_device.cc:1200] 0:   N 
      2020-07-29 06:41:52.146133: I tensorflow/stream_executor/cuda/cuda_gpu_executor.cc:1005] successful NUMA node read from SysFS had negative value (-1), but there must be at least one NUMA node, so returning NUMA node zero
      2020-07-29 06:41:52.146538: I tensorflow/stream_executor/cuda/cuda_gpu_executor.cc:1005] successful NUMA node read from SysFS had negative value (-1), but there must be at least one NUMA node, so returning NUMA node zero
      2020-07-29 06:41:52.146809: I tensorflow/core/common_runtime/gpu/gpu_device.cc:1326] Created TensorFlow device (/job:localhost/replica:0/task:0/device:GPU:0 with 7484 MB memory) -> physical GPU (device: 0, name: GeForce RTX 2070, pci bus id: 0000:01:00.0, compute capability: 7.5)
      W0729 06:41:52.146923 140574846863168 deprecation.py:323] From /usr/local/lib/python3.6/dist-packages/tensorflow/python/training/saver.py:1276: checkpoint_exists (from tensorflow.python.training.checkpoint_management) is deprecated and will be removed in a future version.
      Instructions for updating:
      Use standard file APIs to check for files with this prefix.
      I0729 06:41:52.148046 140574846863168 saver.py:1280] Restoring parameters from /home/jin.li/work_dirs/flowers-models/resnet_v1_50/model.ckpt-3001
      2020-07-29 06:41:52.856707: W tensorflow/compiler/jit/mark_for_compilation_pass.cc:1412] (One-time warning): Not using XLA:CPU for cluster because envvar TF_XLA_FLAGS=--tf_xla_cpu_global_jit was not set.  If you want XLA:CPU, either set that envvar, or use experimental_jit_scope to enable XLA:CPU.  To confirm that XLA is active, pass --vmodule=xla_compilation_cache=1 (as a proper command-line flag, not via TF_XLA_FLAGS) or set the envvar XLA_FLAGS=--xla_hlo_profile.
      I0729 06:41:52.876146 140574846863168 session_manager.py:500] Running local_init_op.
      I0729 06:41:52.899772 140574846863168 session_manager.py:502] Done running local_init_op.
      W0729 06:41:53.095691 140574846863168 deprecation.py:323] From /usr/local/lib/python3.6/dist-packages/tensorflow/python/training/monitored_session.py:875: start_queue_runners (from tensorflow.python.training.queue_runner_impl) is deprecated and will be removed in a future version.
      Instructions for updating:
      To construct input pipelines, use the  module.
      2020-07-29 06:41:53.643921: I tensorflow/stream_executor/platform/default/dso_loader.cc:42] Successfully opened dynamic library libcudnn.so.7
      I0729 06:41:55.753674 140574846863168 evaluation.py:167] Evaluation [1/4]
      I0729 06:41:55.920057 140574846863168 evaluation.py:167] Evaluation [2/4]
      I0729 06:41:56.137565 140574846863168 evaluation.py:167] Evaluation [3/4]
      I0729 06:41:56.386112 140574846863168 evaluation.py:167] Evaluation [4/4]
      eval/Recall_5[1]
      eval/Accuracy[0.92]
      I0729 06:41:56.613431 140574846863168 evaluation.py:275] Finished evaluation at 2020-07-29-06:41:56
      + EXIT_CODE=0
      ++ date
      + echo Wed Jul 29 06:41:57 UTC 2020 ': 0'
      + exit 0
      
      
      
      =========================================================
              end of logs from pod: ce8adace-9ff0-46cb-8f77-b458ae8a2036
      =========================================================
      
      
      `;
      setLogs(log);
    }
    return res;    
  }  

  // const evaluationDetail = {
  //   modelName: 'hanjf-test2',
  //   status: 'running',
  //   engineType: 'apulistech/pytorch:2.0',
  //   dataset: 'coco',
  //   createAt: new Date().valueOf(),
  //   deviceType: 'nvidia_gpu_amd64',
  //   deviceNum: '2',
  // };

  useEffect(() => {
    // getMockEvaluationDetail();
    getEvaluationDetail();
  }, []);

  return (
    <PageHeader
      ghost={false}
      onBack={() => history.push('/ModelManagement/MyModels')}
      title="评估详情"
    >
      <Descriptions style={{marginTop: '20px'}} bordered={true} column={2}>
        <Descriptions.Item label="模型名称">{evaluationDetail?.modelName}</Descriptions.Item>
        {/* <Descriptions.Item label="评估状态">{getEvaluationStatus(evaluationDetail.status)}</Descriptions.Item> */}
        <Descriptions.Item label="评估状态">{'success'}</Descriptions.Item>
        <Descriptions.Item label="引擎类型">{evaluationDetail?.engineType}</Descriptions.Item>
        <Descriptions.Item label="测试数据集">{evaluationDetail?.datasetName}</Descriptions.Item>
        {/* <Descriptions.Item label="创建时间">{moment(evaluationDetail.createAt).format('YYYY-MM-DD HH:mm')}</Descriptions.Item> */}
        <Descriptions.Item label="创建时间">{evaluationDetail?.createdAt}</Descriptions.Item>
        <Descriptions.Item label="设备类型">{'nvidia_gpu_amd64'}</Descriptions.Item>
        <Descriptions.Item label="设备数量">{evaluationDetail?.deviceNum}</Descriptions.Item>
      </Descriptions>
      <div className="ant-descriptions-title" style={{marginTop: '30px'}}>评估结果</div>
      <Button onClick={getLateastLogs}>点击获取评估结果</Button>
      <div>
        {logs && <pre ref={logEl} style={{marginTop: '20px'}} className={styles.logs}>
          {logs}
        </pre>}
      </div>
    </PageHeader>
  );
};

export default EvaluationDetail;