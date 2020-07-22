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
        authority: ['admin', 'user'],
        routes: [
          {
            path: '/CodeList',
            name: 'codeDevelopment',
            icon: 'EditOutlined',
            component: './CodeDevelopment/CodeList',
          },
          {
            path: '/CodeCreate',
            component: './CodeDevelopment/CodeCreate'
          },
          {
            path: '/dataManage',
            name: 'dataManage',
            icon: 'ReadOutlined',
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
          },          
          {
            path: '/ModelManagement',
            name: 'modelManagement',
            icon: 'CodepenOutlined',
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
            ],            
          },
          {
            path: '/ModelMngt/CreateModel',
            component: './ModelMngt/CreateModel'
          },
          // {
          //   path: '/ModelManagement/CreateEvaluation',
          //   component: './ModelMngt/ModelEvaluation'
          // },
          {
            path: '/Inference/list',
            name: 'inferenceService',
            icon: 'BulbOutlined',
            component: './InferenceService/InferenceList'
          },
          {
            path: '/Inference/submit',
            component: './InferenceService/Submit',
          },
          {
            path: '/Inference/:id/detail',
            component: './InferenceService/Detail',
          },
          {
            path: '/ResourceMonitoring',
            name: 'resourceMonitoring',
            icon: 'DashboardOutlined',
            component: './ResourceMonitoring'
          },
          {
            path: '/',
            redirect: '/CodeList',
          },
          {
            component: '404',
          },
        ],
      },
    ],
  },
];
