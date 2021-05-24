
const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { name: 'projects', path: '', component: () => import('pages/projectList') },
      { name: 'project', path: '/project/:id', component: () => import('pages/projectDetail') },
      { name: 'annotate', path: '/annotate/:id', props: true, component: () => import('pages/annotate.vue') }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '*',
    component: () => import('pages/Error404.vue')
  }
]

export default routes
