export default [
  {
    path: '/',
    component: '../layouts/SecurityLayout',
    routes: [
      {
        path: '/AIarts/user',
        component: '../layouts/UserLayout',
        routes: [
          {
            path: '/AIarts/user',
            redirect: '/AIarts/user/login',
          },
          {
            name: 'login',
            icon: 'smile',
            path: '/AIarts/user/login',
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
            path: '/AIarts/CodeList',
            name: '代码开发',
            icon: 'CodepenOutlined',
            component: './CodeDevelopment/CodeList'
          },  
          {
            path: '/AIarts/CodeCreate',
            component: './CodeDevelopment/CodeCreate'
          },  
          {
            path: '/AIarts/ModelList',
            name: 'modelManagement',
            icon: 'CodepenOutlined',
            component: './ModelMngt/ModelList'
          },
          {
            path: '/AIarts/ModelMngt/CreateModel',
            component: './ModelMngt/CreateModel'
          },
          {
            path: '/AIarts/InferenceList',
            name: 'inferenceService',
            icon: 'BulbOutlined',
            component: './InferenceService/InferenceList'
          },        
          {
            path: '/AIarts/dataManage',
            name: 'DataManage',
            icon: 'ReadOutlined',
            routes: [
              {
                path: '/AIarts/dataManage/dataSet',
                name: 'DataSet',
                component: './DataSet',
              },
              {
                path: '/AIarts/dataManage/dataSet/detail',
                component: './DataSet/detail',
              },
              {
                path: 'https://www.baidu.com/',
                target: '_blank',
                name: 'ImageLabel',
              },
            ],
          },
          // {
          //   name: 'account',
          //   icon: 'user',
          //   path: '/AIarts/account',
          //   routes: [
          //     {
          //       name: 'center',
          //       icon: 'smile',
          //       path: '/AIarts/account/center',
          //       component: './account/center',
          //     },
          //     {
          //       name: 'settings',
          //       icon: 'smile',
          //       path: '/AIarts/account/settings',
          //       component: './account/settings',
          //     },
          //   ],
          // },
          {
            path: '/AIarts',
            redirect: '/AIarts/dataSetManage',
          },
          {
            path: '/model-training/list',
            name: 'ModelTraining',
            component: './ModelTraining/List',
          },
          {
            path: '/model-training/submit',
            component: './ModelTraining',
          },
          {
            path: '/model-training/:id/detail',
            component: './ModelTraining/detail',
          },
          {
            path: '/inference-service/submit',
            name: 'InferenceService',
            component: './InferenceService/Submit',
          },
          {
            path: '/inference-service/:id/detail',
            name: 'InferenceService2',
            component: './InferenceService/Detail',
          },
          {
            path: '/',
            redirect: '/AIarts/dataSetManage',
          },
          {
            component: '404',
          },
        ],
      },
    ],
  },
];
