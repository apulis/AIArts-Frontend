import component from './zh-CN/component';
import globalHeader from './zh-CN/globalHeader';
import menu from './zh-CN/menu';
import pwa from './zh-CN/pwa';
import settingDrawer from './zh-CN/settingDrawer';
import service from './zh-CN/service';
import settings from './zh-CN/settings';
import codeDevelopment from './zh-CN/pages/codeDevelopment';
import dataSet from './zh-CN/pages/DataSet';
import edgeInference from './zh-CN/pages/EdgeInference';
import imageManage from './zh-CN/pages/ImageManage';
import inferenceService from './zh-CN/pages/InferenceService';
import modelTraining from './zh-CN/pages/ModelTraining';
import modelMngt from './zh-CN/pages/ModelMngt';
import overView from './zh-CN/pages/OverView';
import resourceMonitoring from './zh-CN/pages/ResourceMonitoring';
import setting from './zh-CN/pages/Setting';
import visualOperation from './zh-CN/pages/VisualOperation';
import table from './zh-CN/table';
import form from './zh-CN/form';
import ModelList from './zh-CN/pages/ModelTraining/List';
import SubmitTrainingJob from './zh-CN/pages/ModelTraining/Submit'

export default {
  'navBar.lang': '语言',
  'layout.user.link.help': '帮助',
  'layout.user.link.privacy': '隐私',
  'layout.user.link.terms': '条款',
  'app.preview.down.block': '下载此页面到本地项目',
  'app.welcome.link.fetch-blocks': '获取全部区块',
  'app.welcome.link.block-list': '基于 block 开发，快速构建标准页面',
  ...globalHeader,
  ...menu,
  ...settingDrawer,
  ...service,
  ...settings,
  ...pwa,
  ...component,
  ...codeDevelopment,
  ...dataSet,
  ...edgeInference,
  ...imageManage,
  ...inferenceService,
  ...modelTraining,
  ...overView,
  ...resourceMonitoring,
  ...setting,
  ...visualOperation,
  ...modelMngt,
  ...table,
  ...form,
  ...ModelList,
  ...SubmitTrainingJob,
};
