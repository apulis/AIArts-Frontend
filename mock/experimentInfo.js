// eslint-disable-next-line import/no-extraneous-dependencies
import { parse } from 'url';
import Mock from 'mockjs';

function getExperimentById(req, res, u) {
  let realUrl = u;
// console.log('req', req)
  if (!realUrl || Object.prototype.toString.call(realUrl) !== '[object String]') {
    realUrl = req.url;
  }

  // const { current = 1, pageSize = 10 } = req.query;
  // console.log(1, req.query)
  const params = parse(realUrl, true).query;
  // console.log(2, params)  

  let codeData = [
    { 
      codePath: 'https://github.com/loveunk/pytorch_samples/commit/cdac8152f3aa0589f71347ad291a9f80a932fc49',
      version: Mock.mock('@guid')
    }
  ]

  const datasetData = [];

  for (let i = 0; i < 10; i += 1) {
    const index = i;
    datasetData.push({
      id: index,
      name: `MNIST`,
      version: `Version ${index}`,
      desc: 'THE MNIST DATABASE of handwritten digits'
    });
  }

  const logData = [];

  for (let i = 0; i < 10; i += 1) {
    const index = i;
    logData.push({
      id: index,
      name: `logs${index}`
    });
  }

  const modelData = [];

  for (let i = 0; i < 10; i += 1) {
    const index = i;
    modelData.push({
      id: index,
      name: `mnist_cnn.pt`,
      size: Mock.mock('@integer(1024, 1024*1024)')
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
  // debugger
  // console.log( res.json(result))
  return res.json(result);
}

export default {
  'GET /api/experiment/queryById': getExperimentById
};
