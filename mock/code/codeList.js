// eslint-disable-next-line import/no-extraneous-dependencies
import { parse } from 'url';
import Mock from 'mockjs';
import moment from 'moment';

// mock tableListDataSource
const genList = (current, pageSize) => {
  const tableListDataSource = [];

  for (let i = 0; i < pageSize; i += 1) {
    const index = (current - 1) * 10 + i;
    tableListDataSource.push({
      id: index,
      name: `debug_job_001`,
      status: `status`,
      engine: `engineType`,
      codePath: `storePath`,
      createTime: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
      desc: 'Handwritten digit classification',
      JupyterUrl:'https://www.baidu.com/'
    });
    // tableListDataSource.push({
    //   id: index,
    //   devName: `debug_job_001`,
    //   status: `status`,
    //   engineType: `engineType`,
    //   codeStorePath: `storePath`,
    //   createTime: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
    //   desc: 'Handwritten digit classification',
    // });
  }

  // tableListDataSource.reverse();
  return tableListDataSource;
};

let tableListDataSource = genList(1, 50);
// mock后端：接受request，构造response
function getCodes(req, res, u) {
  let realUrl = u;

  if (!realUrl || Object.prototype.toString.call(realUrl) !== '[object String]') {
    realUrl = req.url;
  }

  const { pageNum = 1, pageSize = 10 } = req.query;// 请求参数
  const params = parse(realUrl, true).query;
  let dataSource = [...tableListDataSource].slice((pageNum - 1) * pageSize, pageNum * pageSize);

  if (params.sorter) {
    const s = params.sorter.split('_');
    dataSource = dataSource.sort((prev, next) => {
      if (s[1] === 'descend') {
        return next[s[0]] - prev[s[0]];
      }

      return prev[s[0]] - next[s[0]];
    });
  }

  if (params.name) {
    dataSource = dataSource.filter((data) => data.name.includes(params.name || ''));
  }

  const result = {
    code: 0,
    data: {
      CodeEnvs: dataSource,
      total: tableListDataSource.length,
    },
    msg: 'success'
  };
  return res.json(result);
}

function postCode(req, res) {
  const result = {
    code:0,
    data:{
      id:'1'
    },
    msg:"success"
  };
  res.json(result);
}

function deleteCode(req, res, u, b){

}

export default {
  'GET /ai_arts/api/codes': getCodes,
  'POST /ai_arts/api/code': postCode,
  'DELETE /ai_arts/api/code':deleteCode// code/??动态路由匹配
};
