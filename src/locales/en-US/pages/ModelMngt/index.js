import myModels from './myModelsList';
import modelEvaluationList from './modelEvaluationList';
import modelEvaluationMetricsList from './modelEvaluationMetricsList';

export default {
  ...myModels,
  ...modelEvaluationList,
  ...modelEvaluationMetricsList
};