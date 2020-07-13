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
            name: 'DataManage',
            icon: 'ReadOutlined',
            routes: [
              {
                path: '/dataManage/dataSet',
                name: 'DataSet',
                component: './DataSet',
              },
              {
                path: '/dataManage/dataSet/detail',
                component: './DataSet/detail',
              },
              {
                path: 'https://www.baidu.com/',
                target: '_blank',
                name: 'ImageLabel',
              },
            ],
          },
          {
            path: '/model-training/list',
            name: 'modelTraining',
            icon: 'FireOutlined',
            component: './ModelTraining/List',
          },
          {
            path: '/model-training/submit',
            component: './ModelTraining/Submit',
          },
          {
            path: '/model-training/:id/detail',
            component: './ModelTraining/Detail',
          },          
          {
            path: '/ModelList',
            name: 'modelManagement',
            icon: 'CodepenOutlined',
            component: './ModelMngt/ModelList'
          },
          {
            path: '/ModelMngt/CreateModel',
            component: './ModelMngt/CreateModel'
          },
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
