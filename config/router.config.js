export default [
  {
    path: '/',
    component: '../layouts/SecurityLayout',
    routes: [
      {
        path: '/data_manage/user',
        component: '../layouts/UserLayout',
        routes: [
          {
            path: '/data_manage/user',
            redirect: '/data_manage/user/login',
          },
          {
            name: 'login',
            icon: 'smile',
            path: '/data_manage/user/login',
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
            path: '/data_manage/dashboard',
            name: 'dashboard',
            icon: 'dashboard',
            routes: [
              {
                name: 'analysis',
                icon: 'smile',
                path: '/data_manage/dashboard/analysis',
                component: './dashboard/analysis',
              },
              {
                name: 'monitor',
                icon: 'smile',
                path: '/data_manage/dashboard/monitor',
                component: './dashboard/monitor',
              },
              {
                name: 'workplace',
                icon: 'smile',
                path: '/data_manage/dashboard/workplace',
                component: './dashboard/workplace',
              },
            ],
          },
          {
            path: '/data_manage/dataSet-manage',
            name: 'dataSet',
            icon: 'AppstoreOutlined',
            routes: [
              {
                name: 'dataSet-list',
                icon: 'ReadOutlined',
                path: '/data_manage/dataSet-manage/dataSet-list',
                component: './dataSet/dataSetList',
              },
            ],
          },
          {
            name: 'account',
            icon: 'user',
            path: '/data_manage/account',
            routes: [
              {
                name: 'center',
                icon: 'smile',
                path: '/data_manage/account/center',
                component: './account/center',
              },
              {
                name: 'settings',
                icon: 'smile',
                path: '/data_manage/account/settings',
                component: './account/settings',
              },
            ],
          },
          {
            path: '/',
            redirect: '/data_manage/dataSet/dataSet-list',
          },
          {
            component: '404',
          },
        ],
      },
    ],
  },
];
