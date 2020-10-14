import createCode from './createCode';
import createDataSet from './createDataSet';
import createEdgeInference from './createEdgeInference';
import createModel from './createModel';
import createInferenceJob from './createInferenceJob';
import createTraining from './createTraining';
import createVisualJob from './createVisualJob';
import confirmEdgeInferencePush from './confirmEdgeInferencePush';

export default {
  ...createCode,
  ...createDataSet,
  ...createModel,
  ...createEdgeInference,
  ...createInferenceJob,
  ...createTraining,
  ...createVisualJob,
  ...confirmEdgeInferencePush,
};
