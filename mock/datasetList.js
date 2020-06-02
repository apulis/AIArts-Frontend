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
      name: `Dataset${index}`,
      version: `Version ${index}`,
      desc: '这是一段实验数据集描述',
      creator: Mock.mock('@cname'),
      latestTime: moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
    });
  }

  return tableListDataSource;
};

let tableListDataSource = genList(1, 100);

function getDatasets(req, res, u) {
  let realUrl = u;

  if (!realUrl || Object.prototype.toString.call(realUrl) !== '[object String]') {
    realUrl = req.url;
  }

  const { current = 1, pageSize = 10 } = req.query;
  const params = parse(realUrl, true).query;
  let dataSource = [...tableListDataSource].slice((current - 1) * pageSize, current * pageSize);

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
      list: dataSource,
      pagination: {
        total: tableListDataSource.length,
        pageSize: parseInt(`${params.pageSize}`, 10) || 10,
        current: parseInt(`${params.current}`, 10) || 1,
      }
    },
    msg: 'success'
  };
  return res.json(result);
}

function postDataset(req, res, u, b) {
  let realUrl = u;

  if (!realUrl || Object.prototype.toString.call(realUrl) !== '[object String]') {
    realUrl = req.url;
  }

  const body = (b && b.body) || req.body;
  const { method, name, desc, key } = body;

  switch (method) {
    /* eslint no-case-declarations:0 */
    case 'delete':
      tableListDataSource = tableListDataSource.filter((item) => key.indexOf(item.key) === -1);
      break;

    case 'post':
      (() => {
        const i = Math.ceil(Math.random() * 10000);
        const newRule = {
          key: tableListDataSource.length,
          name: `Project ${tableListDataSource.length}`,
          desc: '这是一段描述',
          creator: Mock.mock('@cname'),
          latestTime: new Date()
        };
        tableListDataSource.unshift(newRule);
        return res.json(newRule);
      })();

      return;

    case 'update':
      (() => {
        let newRule = {};
        tableListDataSource = tableListDataSource.map((item) => {
          if (item.key === key) {
            newRule = { ...item, desc, name };
            return { ...item, desc, name };
          }

          return item;
        });
        return res.json(newRule);
      })();

      return;

    default:
      break;
  }

  const result = {
    list: tableListDataSource,
    pagination: {
      total: tableListDataSource.length,
    },
  };
  res.json(result);
}

export default {
  'GET /api/project/experiment/dataset/list': getDatasets,
  'POST /api/projct/experiment/dataset/update': postDataset
};
