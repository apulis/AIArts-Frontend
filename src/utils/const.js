export const USER_DASHBOARD_PATH = '/custom-user-dashboard'
export const USER_DASHBOARD_BACKEND = '/custom-user-dashboard-backend'

export const USER_LOGIN_URL = USER_DASHBOARD_PATH + '/user/login'

export const PAGEPARAMS = {
  pageNum: 1,
  pageSize: 10,
};

export const REFRESH_INTERVAL = 3*1000;

export const avatar =
  'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png';

export const NameReg = /^[A-Za-z0-9-_]+$/;

export const NameErrorText = '名称只能由字母，数字，下划线或横线组成！';

export const pollInterval = 3000;

export const modelTrainingType = 'artsTraining';

export const modelEvaluationType = 'artsEvaluation';

export const inferenceJobType = 'InferenceJob';

export const sortText = {
  ascend: 'asc',
  descend: 'desc'
}

export const FilePathReg = /^(.*)\/$/;

export const FilePathErrorText = '路径必须以 / 结尾！';

export const DEVICE_TYPES = {
  'npu.huawei.com/NPU': 'npu',
  'nvidia.com/gpu': 'gpu',
}

