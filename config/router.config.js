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
            name: '代码开发',
            icon: 'CodepenOutlined',
            component: './CodeDevelopment/CodeList'
          },  
          {
            path: '/CodeCreate',
            component: './CodeDevelopment/CodeCreate'
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
            path: '/Inference',
            name: 'inferenceService',
            icon: 'BulbOutlined',
            routes: [
              {
                path: '/Inference/list',
                name: 'list',
                component: './InferenceService/InferenceList'
              },
              {
                path: '/Inference/submit',
                name: '提交推理服务',
                component: './InferenceService/Submit',
              },
              {
                path: '/Inference/:id/detail',
                component: './InferenceService/Detail',
              },
            ]
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
          // {
          //   name: 'account',
          //   icon: 'user',
          //   path: '/account',
          //   routes: [
          //     {
          //       name: 'center',
          //       icon: 'smile',
          //       path: '/account/center',
          //       component: './account/center',
          //     },
          //     {
          //       name: 'settings',
          //       icon: 'smile',
          //       path: '/account/settings',
          //       component: './account/settings',
          //     },
          //   ],
          // },
          {
            path: '/',
            redirect: '/CodeList',
          },
          
          {
            path: '/model-training',
            name: '模型训练',
            icon: 'FireOutlined',
            routes: [
              {
                path: '/model-training/list',
                name: '模型列表',
                component: './ModelTraining/List',
              },
              {
                path: '/model-training/submit',
                name: '创建模型作业',
                component: './ModelTraining',
              },
              {
                path: '/model-training/:id/detail',
                component: './ModelTraining/detail',
              },
            ]
          },
          {
            path: '/',
            redirect: '/dataSetManage',
          },
          {
            component: '404',
          },
        ],
      },
    ],
  },
];
