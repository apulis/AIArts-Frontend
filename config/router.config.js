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
            path: '/aIarts/ProjectList',
            // name: 'ProjectList',
            icon: 'ProjectOutlined',
            component: './Project/ProjectList',
            // routes: [
            //   {
            //     name: 'Project List',
            //     icon: 'ProjectOutlined',
            //     path: '/aIarts/ProjectManage/ProjectList',
            //     component: './Project/ProjectList',
            //   },
            //   {
            //     name: 'Experiment List',
            //     icon: 'ExperimentOutlined',
            //     path: '/aIarts/ProjectManage/ExperimentList',
            //     component: './Project/ExperimentList',
            //     hideInMenu: true,
            //   },
            //   {
            //     name: 'Experiment Info',
            //     icon: 'InfoCircleOutlined',
            //     path: '/aIarts/ProjectManage/ExperimentInfo',
            //     component: './Project/ExperimentInfo',
            //     hideInMenu: true,
            //   },
            // ],
          },
          {
            // name: 'ExperimentList',
            // icon: 'ExperimentOutlined',
            path: '/aIarts/ProjectList/ExperimentList',
            component: './Project/ExperimentList',
            hideInMenu: true,
          },
          {
            // name: 'ExperimentInfo',
            // icon: 'InfoCircleOutlined',
            path: '/aIarts/ProjectList/ExperimentList/ExperimentInfo',
            component: './Project/ExperimentInfo',
            hideInMenu: true,
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
