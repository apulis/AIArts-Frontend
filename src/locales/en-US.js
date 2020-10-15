import component from './en-US/component';
import globalHeader from './en-US/globalHeader';
import menu from './en-US/menu';
import pwa from './en-US/pwa';
import settingDrawer from './en-US/settingDrawer';
import settings from './en-US/settings';
import service from './en-US/service';
import codeDevelopment from './en-US/pages/codeDevelopment';
import dataSet from './en-US/pages/DataSet';
import edgeInference from './en-US/pages/EdgeInference';
import imageManage from './en-US/pages/ImageManage';
import inferenceService from './en-US/pages/InferenceService';
import modelTraining from './en-US/pages/ModelTraining';
import modelMngt from './en-US/pages/ModelMngt';
import overView from './en-US/pages/OverView';
import resourceMonitoring from './en-US/pages/ResourceMonitoring';
import setting from './en-US/pages/Setting';
import visualOperation from './en-US/pages/VisualOperation';
import table from './en-US/table';
import form from './en-US/form';
import ModelList from './en-US/pages/ModelTraining/List';
import SubmitTrainingJob from './en-US/pages/ModelTraining/Submit'

export default {
  'navBar.lang': 'Languages',
  'layout.user.link.help': 'Help',
  'layout.user.link.privacy': 'Privacy',
  'layout.user.link.terms': 'Terms',
  'app.preview.down.block': 'Download this page to your local project',
  'app.welcome.link.fetch-blocks': 'Get all block',
  'app.welcome.link.block-list': 'Quickly build standard, pages based on `block` development',
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
  ...SubmitTrainingJob
};
