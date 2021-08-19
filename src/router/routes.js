
const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { name: 'projects', path: '', component: () => import('pages/projectList') },
      { name: 'project', path: '/project/:id', component: () => import('pages/projectDetail') },
      { name: 'annotate', path: '/annotate/:id', props: true, component: () => import('pages/annotate.vue') },
      { name: 'sentenceAnnotate', path: '/sentenceAnnotate/:id', props: true, component: () => import('pages/sentenceAnnotate.vue') },
      { name: 'relationAnnotate', path: '/relationAnnotate/:id', props: true, component: () => import('pages/relationAnnotate.vue') }
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
