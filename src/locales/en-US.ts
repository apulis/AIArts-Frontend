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
import SubmitTrainingJob from './en-US/pages/ModelTraining/Submit';
import SubmitTrainingJobDetail from './en-US/pages/ModelTraining/Detail';
import ParamsManage from './en-US/pages/ModelTraining/ParamsManage';
import PretrainedModel from './en-US/pages/ModelMngt/PretrainedModel';
import request from './en-US/request';
import bizComponent from './en-US/bizComponent';
import reg from './en-US/reg';
import layout from './en-US/layout';
import vc from './en-US/pages/vc';
import ManageJobs from './en-US/pages/ManageJobs';
import _const from './en-US/const';
import ManagePrivilegeJob from './en-US/ManagePrivilegeJob';
import envTip from './en-US/envTip';

import { capFirstLetter } from '@/utils/utils';

for (const item in menu) {
  menu[item] = capFirstLetter(menu[item]);
}

export default {
  'navBar.lang': 'Languages',
  'layout.user.link.help': 'Help',
  'layout.user.link.privacy': 'Privacy',
  'layout.user.link.terms': 'Terms',
  'app.preview.down.block': 'Download this page to your local project',
  'app.welcome.link.fetch-blocks': 'Get all block',
  'app.welcome.link.block-list': 'Quickly build standard, pages based on `block` development',
  'job.rest.time': 'remaining runnable time',
  'job.rest.minute': 'Min',
  'job.used.time': 'Running Time',
  'download.full.log': 'Download Full Log',
  'download.full.log.loading': 'Loading...',
  'delete.modal.title': 'Confirm delete ?',
  'delete.modal.okText': 'Confirm',
  'delete.modal.content': 'Cannot be restored after deletion',
  ..._const,
  ...layout,
  ...bizComponent,
  ...request,
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
  ...SubmitTrainingJobDetail,
  ...ParamsManage,
  ...PretrainedModel,
  ...reg,
  ...vc,
  ...ManageJobs,
  ...ManagePrivilegeJob,
  ...envTip,
};
