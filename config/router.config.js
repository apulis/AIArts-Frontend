export default [
  {
    path: '/',
    component: '../layouts/SecurityLayout',
    routes: [
      {
        path: '/aIarts/user',
        component: '../layouts/UserLayout',
        routes: [
          {
            path: '/aIarts/user',
            redirect: '/aIarts/user/login',
          },
          {
            name: 'login',
            icon: 'smile',
            path: '/aIarts/user/login',
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
          // {
          //   path: '/aIarts/dashboard',
          //   name: 'dashboard',
          //   icon: 'dashboard',
          //   routes: [
          //     {
          //       name: 'analysis',
          //       icon: 'smile',
          //       path: '/aIarts/dashboard/analysis',
          //       component: './dashboard/analysis',
          //     },
          //     {
          //       name: 'monitor',
          //       icon: 'smile',
          //       path: '/aIarts/dashboard/monitor',
          //       component: './dashboard/monitor',
          //     },
          //     {
          //       name: 'workplace',
          //       icon: 'smile',
          //       path: '/aIarts/dashboard/workplace',
          //       component: './dashboard/workplace',
          //     },
          //   ],
          // },
          {
            path: '/aIarts/CodeList',
            name: '代码开发',
            icon: 'CodepenOutlined',
            component: './CodeDevelopment/CodeList'
          },  
          {
            path: '/aIarts/CodeCreate',
            component: './CodeDevelopment/CodeCreate'
          },  
          {
            path: '/aIarts/ModelList',
            name: '模型管理',
            icon: 'CodepenOutlined',
            component: './ModelMngt/ModelList'
          },         
          {
            path: '/aIarts/dataSetManage',
            name: 'DataSet',
            icon: 'ReadOutlined',
            routes: [
              {
                path: '/aIarts/dataSetManage',
                component: './DataSet',
              },
              {
                path: '/aIarts/dataSetManage/detail',
                component: './DataSet/detail',
              },
            ],
          },
          // {
          //   name: 'account',
          //   icon: 'user',
          //   path: '/aIarts/account',
          //   routes: [
          //     {
          //       name: 'center',
          //       icon: 'smile',
          //       path: '/aIarts/account/center',
          //       component: './account/center',
          //     },
          //     {
          //       name: 'settings',
          //       icon: 'smile',
          //       path: '/aIarts/account/settings',
          //       component: './account/settings',
          //     },
          //   ],
          // },
          {
            path: '/aIarts',
            redirect: '/aIarts/dataSetManage',
          },
          {
            path: '/',
            redirect: '/aIarts/dataSetManage',
          },
          {
            component: '404',
          },
        ],
      },
    ],
  },
];
