import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  // mode: 'history',
  routes: [
    {
      path: '/main',
      name: 'main',
      component: require('@/components/Main').default
    },
    {
      path: '/',
      name: 'title',
      component: require('@/sections/Title').default
    },
    {
      path: '/active',
      name: 'active',
      component: require('@/sections/Active').default
    },
    {
      path: '/install',
      name: 'install',
      component: require('@/sections/Install').default
    },
    {
      path: '/cleanup',
      name: 'cleanup',
      component: require('@/sections/Cleanup').default
    },
    // plain sections:
    {
      path: '/about',
      name: 'about',
      component: require('@/sections/About').default
    },
    {
      path: '/external',
      name: 'external',
      component: require('@/sections/External').default
    },
    {
      path: '/authentic',
      name: 'authentic',
      component: require('@/sections/Authentic').default
    },
    {
      path: '/ecbt',
      name: 'ecbt',
      component: require('@/sections/Ecbt').default},
    {
      path: '/dharma',
      name: 'dharma',
      component: require('@/sections/Dharma').default},
    {
      path: '/code',
      name: 'code',
      component: require('@/sections/Code').default},
    {
      path: '/contacts',
      name: 'contacts',
      component: require('@/sections/Contacts').default},
    {
      path: '/acknowledgements',
      name: 'acknowledgements',
      component: require('@/sections/Acknowledgements').default},
    {
      path: '/help',
      name: 'help',
      component: require('@/sections/Help').default},
    {
      path: '/screencast',
      name: 'screencast',
      component: require('@/sections/Screencast').default},

    {
      path: '/tests',
      name: 'tests',
      component: require('@/sections/Tests').default},
    // {
    //   path: '/section',
    //   name: 'section',
    //   component: require('@/components/Section').default
    // },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
