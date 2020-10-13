import centerInferenceList from './centerInferenceList';
import codeList from './codeList';
import dataSetList from './dataSetList';
import edgeInferenceList from './edgeInferenceList';
import imageListt from './imageList';
import modelEvaluationList from './modelEvaluationList';
import modelEvaluationMetricsList from './modelEvaluationMetricsList';
import modelList from './modelList';
import myModelList from './myModelsList';
import presetModelList from './presetModelList';
import trainingParamsList from './trainingParamsList';
import visualizationList from './visualizationList';

export default {
  ...centerInferenceList,
  ...codeList,
  ...dataSetList,
  ...edgeInferenceList,
  ...imageListt,
  ...modelEvaluationList,
  ...modelEvaluationMetricsList,
  ...modelList,
  ...myModelList,
  ...presetModelList,
  ...trainingParamsList,
  ...visualizationList
}