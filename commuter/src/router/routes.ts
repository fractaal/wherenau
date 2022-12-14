import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/IndexPage.vue') }],
  },
  {
    path: '/driver',
    component: () => import('layouts/SimpleLayout.vue'),
    props: { title: 'Driver Configuration ' },
    children: [
      {
        path: '',
        component: () => import('pages/DriverConfig.vue'),
      },
    ],
  },
  {
    path: '/login',
    component: () => import('layouts/SimpleLayout.vue'),
    props: { title: 'Login' },
    children: [
      {
        path: '',
        component: () => import('src/pages/LoginPage.vue'),
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
