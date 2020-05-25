export default [
  {
    path: '/',
    component: '../layouts/SecurityLayout',
    routes: [
      {
        path: '/data-manage/user',
        component: '../layouts/UserLayout',
        routes: [
          {
            path: '/data-manage/user',
            redirect: '/data-manage/user/login',
          },
          {
            name: 'login',
            icon: 'smile',
            path: '/data-manage/user/login',
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
            path: '/data-manage/dashboard',
            name: 'dashboard',
            icon: 'dashboard',
            routes: [
              {
                name: 'analysis',
                icon: 'smile',
                path: '/data-manage/dashboard/analysis',
                component: './dashboard/analysis',
              },
              {
                name: 'monitor',
                icon: 'smile',
                path: '/data-manage/dashboard/monitor',
                component: './dashboard/monitor',
              },
              {
                name: 'workplace',
                icon: 'smile',
                path: '/data-manage/dashboard/workplace',
                component: './dashboard/workplace',
              },
            ],
          },
          {
            path: '/data-manage/dataSet-manage',
            name: 'dataSet',
            icon: 'ReadOutlined',
            routes: [
              {
                path: '/data-manage/dataSet-manage',
                component: './dataSet',
              },
            ],
          },
          {
            name: 'account',
            icon: 'user',
            path: '/data-manage/account',
            routes: [
              {
                name: 'center',
                icon: 'smile',
                path: '/data-manage/account/center',
                component: './account/center',
              },
              {
                name: 'settings',
                icon: 'smile',
                path: '/data-manage/account/settings',
                component: './account/settings',
              },
            ],
          },
          {
            path: '/',
            redirect: '/data-manage/dataSet-manage',
          },
          {
            component: '404',
          },
        ],
      },
    ],
  },
];
