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
        component: '../layouts/BasicLayout',
        Routes: ['src/pages/Authorized'],
        authority: ['AI_ARTS_ALL'],
        routes: [
          {
            path: '/CodeList',
            name: 'codeDevelopment',
            icon: 'EditOutlined',
            authority: ['AI_ARTS_ALL'],
            component: './CodeDevelopment/CodeList',
          },
          {
            path: '/CodeCreate',
            component: './CodeDevelopment/CodeCreate',
            authority: ['AI_ARTS_ALL'],
          },
          {
            path: '/dataManage',
            name: 'dataManage',
            icon: 'ReadOutlined',
            authority: ['AI_ARTS_ALL'],
            routes: [
              {
                path: '/dataManage/dataSet',
                name: 'dataSet',
                component: './DataSet',
              },
              {
                path: '/dataManage/dataSet/detail',
                component: './DataSet/detail',
              },
              {
                path: '/image_label/project',
                target: '_blank',
                name: 'imageLabel',
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
                path: '/model-training/paramsManage',
                name: 'paramsManage',
                component: './ModelTraining/ParamsManage/ParamsManage'
              },
              {
                path: '/model-training/submit',
                component: './ModelTraining/Submit',
              },
              {
                path: '/model-training/paramManage/:id/:type',
                component: './ModelTraining/Submit',
              },
              {
                path: '/model-training/:id/detail',
                component: './ModelTraining/Detail',
              },
            ]
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
                icon: 'CodepenOutlined',
                component: './ModelMngt/ModelList',
              },
              {
                path: '/ModelManagement/PretrainedModels',
                name: 'pretraindedModels',
                icon: 'CodepenOutlined',
                component: './ModelMngt/PretrainedModel',
              },
              {
                path: '/ModelManagement/CreateEvaluation',
                // name: 'modelEvaluation',
                // icon: 'CodepenOutlined',           
                component: './ModelMngt/ModelEvaluation'
              },             
              {
                path: '/ModelManagement/CreatePretrained',
                component: './ModelMngt/CreatePretrained'
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
            path: '/Inference/list',
            name: 'inferenceService',
            icon: 'BulbOutlined',
            component: './InferenceService/InferenceList',
            authority: ['AI_ARTS_ALL'],
          },
          {
            path: '/EdgeInference',
            name: 'edgeInference',
            icon: 'ApartmentOutlined',
            component: './EdgeInference'
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
          {
            path: '/ResourceMonitoring',
            name: 'resourceMonitoring',
            icon: 'DashboardOutlined',
            component: './ResourceMonitoring',
            authority: ['AI_ARTS_ALL'],
          },
          {
            path: '/',
            redirect: '/CodeList',
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
