// eslint-disable-next-line import/no-extraneous-dependencies
import Mock from 'mockjs';

function getExperimentById(req, res, u) {
  let codeData = [
    { 
      codePath: '',
      version: Mock.mock('@guid') 
    }
  ]

  const datasetData = [];

  for (let i = 0; i < 10; i += 1) {
    const index = i;
    datasetData.push({
      id: index,
      name: `Dataset${index}`,
      version: `Version ${index}`,
      desc: '这是一段实验数据集描述'
    });
  }

  const logData = [];

  for (let i = 0; i < 10; i += 1) {
    const index = i;
    logData.push({
      id: index,
      name: `log${index}`
    });
  }

  const modelData = [];

  for (let i = 0; i < 10; i += 1) {
    const index = i;
    modelData.push({
      id: index,
      name: `Model${index}`,
      size: Mock.mock('@integer(1000)')
    });
  }


  const result = {
    code: 0,
    data: {
      codeData,
      datasetData,
      logData,
      modelData
    },
    msg: 'success'
  };
  return res.json(result);
}

export default {
  'GET /api/experiment/queryById': getExperimentById
};
