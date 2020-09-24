export default [
  {
    path: '/',
    component: '../layouts/SecurityLayout',
    routes: [
      {
        path: '/user',
        component: '../layouts/UserLayout',
        routes: [
          {
            path: '/user',
            redirect: '/user/login',
          },
          {
            name: 'login',
            icon: 'smile',
            path: '/user/login',
            component: './user/login',
          },
          {
            component: '404',
          },
        ],
      },
      {
        path: '/',
        redirect: '/OverView',
        authority: ['AI_ARTS_ALL'],
      },
      {
        path: '/',
        component: '../layouts/BasicLayout',
        Routes: ['src/pages/Authorized'],
        authority: ['AI_ARTS_ALL', 'LABELING_IMAGE'],
        routes: [
          {
            path: '/OverView',
            name: 'overView',
            icon: 'HomeOutlined',
            component: './Overview',
            authority: ['AI_ARTS_ALL', 'LABELING_IMAGE'],
          },
          {
            path: '/codeDevelopment',
            name: 'codeDevelopment',
            icon: 'EditOutlined',
            authority: ['AI_ARTS_ALL'],
            component: './CodeDevelopment',
          },
          {
            path: '/codeDevelopment/add',
            authority: ['AI_ARTS_ALL'],
            component: './CodeDevelopment/CodeCreate',
          },
          {
            path: '/dataManage',
            name: 'dataManage',
            icon: 'ReadOutlined',
            authority: ['AI_ARTS_ALL', 'LABELING_IMAGE'],
            routes: [
              {
                path: '/dataManage/dataSet',
                name: 'dataSet',
                component: './DataSet',
                authority: ['AI_ARTS_ALL'],
              },
              {
                path: '/dataManage/dataSet/detail',
                component: './DataSet/detail',
                authority: ['AI_ARTS_ALL'],
              },
              {
                path: '/image_label/project',
                target: '_blank',
                name: 'imageLabel',
                authority: ['AI_ARTS_ALL', 'LABELING_IMAGE'],
              },
            ],
          },
          {
            path: '/model-training',
            name: 'modelTraining',
            icon: 'FireOutlined',
            authority: ['AI_ARTS_ALL'],
            routes: [
              {
                path: '/model-training/modelTraining',
                name: 'modelTraining',
                component: './ModelTraining/List',
              },
              {
                path: '/model-training/visualization',
                name: 'visualization',
                component: './ModelTraining/Visualization/Visualization',
              },
              {
                path: '/model-training/paramsManage',
                name: 'paramsManage',
                component: './ModelTraining/ParamsManage/ParamsManage',
              },
              {
                path: '/model-training/PretrainedModels',
                name: 'pretraindedModels',
                component: './ModelMngt/PretrainedModel',
              },
              {
                path: '/model-training/submit',
                component: './ModelTraining/Submit',
              },
              {
                path: '/model-training/createVisualization',
                component: './ModelTraining/Visualization/CreateVisualization',
              },
              {
                path: '/model-training/paramManage/:id/:type',
                component: './ModelTraining/Submit',
              },
              {
                path: '/model-training/ModelManage/:id/:type',
                component: './ModelTraining/Submit',
              },
              {
                path: '/model-training/:id/detail',
                component: './ModelTraining/Detail',
              },
            ],
          },
          {
            path: '/ModelList',
            path: '/model-training/:id/detail',
            component: './ModelTraining/Detail',
            authority: ['AI_ARTS_ALL'],
          },
          {
            path: '/ModelManagement',
            name: 'modelManagement',
            icon: 'CodepenOutlined',
            authority: ['AI_ARTS_ALL'],
            // component: './ModelMngt/ModelList'
            routes: [
              {
                path: '/ModelManagement/MyModels',
                name: 'myModels',
                component: './ModelMngt/ModelList',
              },
              {
                path: '/ModelManagement/CreateEvaluation',
                // name: 'modelEvaluation',
                // icon: 'CodepenOutlined',
                component: './ModelMngt/ModelEvaluation',
              },
              {
                path: '/ModelManagement/CreatePretrained',
                component: './ModelMngt/CreatePretrained',
              },
              {
                path: '/ModelManagement/ModelEvaluation/:id/detail',
                component: './ModelMngt/ModelEvaluation/detail',
              },
              {
                path: '/ModelManagement/ModelEvaluation/List',
                name: 'modelEvaluationList',
                component: './ModelMngt/ModelEvaluation/List',
              },
              {
                path: '/ModelManagement/EvaluationMetricsManage/',
                name: 'evaluationMetricsManage',
                component: './ModelMngt/EvalMetricsMngt/EvalMetricsMngt',
              },
              {
                path: '/ModelManagement/EvaluationMetricsManage/editMetrics/:id',
                component: './ModelMngt/EvalMetricsMngt/component/EditMetrics',
              },
              // {
              //   path: '/ModelManagement/avisualis',
              //   component: './ModelMngt/Avisualis',
              //   name: 'avisualis',
              // },
              {
                path: '/ModelManagement/avisualis/templateList',
                component: './ModelMngt/Avisualis/templateList',
              },
              {
                path: '/ModelManagement/avisualis/detail/:id',
                component: './ModelMngt/Avisualis/detail',
              },
            ],
          },
          {
            path: '/ModelMngt/CreateModel',
            component: './ModelMngt/CreateModel',
            authority: ['AI_ARTS_ALL'],
          },
          // {
          //   path: '/ModelManagement/CreateEvaluation',
          //   component: './ModelMngt/ModelEvaluation'
          // },
          {
            name: 'inferenceService',
            authority: ['AI_ARTS_ALL'],
            icon: 'BulbOutlined',
            path: '/Inference',
            routes: [
              {
                path: '/Inference/central',
                name: 'center',
                component: './InferenceService/InferenceList',
                authority: ['AI_ARTS_ALL'],
              },
              {
                path: '/Inference/EdgeInference',
                name: 'edgeInference',
                component: './EdgeInference',
                authority: ['AI_ARTS_ALL'],
              },
              {
                path: '/Inference/EdgeInference/submit',
                component: './EdgeInference/Submit',
                authority: ['AI_ARTS_ALL'],
              },
              {
                path: '/Inference/submit',
                component: './InferenceService/Submit',
                authority: ['AI_ARTS_ALL'],
              },
              {
                path: '/Inference/:id/detail',
                component: './InferenceService/Detail',
                authority: ['AI_ARTS_ALL'],
              },
            ],
          },

          {
            path: '/ResourceMonitoring',
            name: 'resourceMonitoring',
            icon: 'DashboardOutlined',
            component: './ResourceMonitoring',
            authority: ['AI_ARTS_ALL'],
          },
          // {
          //   path: '/EdgeInference',
          //   name: 'edgeInference',
          //   icon: 'DashboardOutlined',
          //   component: './EdgeInference'
          // },
          //   component: './ResourceMonitoring'
          // },
          {
            path: '/VisualOperation',
            name: 'visualOperation',
            icon: 'CloudUploadOutlined',
            component: './VisualOperation',
            authority: ['AI_ARTS_ALL'],
          },

          {
            path: '/Image',
            name: 'image',
            icon: 'PictureOutlined',
            component: './ImageManage/List',
            authority: ['AI_ARTS_ALL'],
          },
          {
            path: '/Setting',
            name: 'setting',
            icon: 'Setting',
            component: './Setting',
            authority: ['AI_ARTS_ALL'],
          },
          {
            component: '404',
          },
        ],
      },
    ],
  },
];
