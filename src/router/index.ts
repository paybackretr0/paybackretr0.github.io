import { createRouter, createWebHistory } from 'vue-router'

import Home from '@/views/Home.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
      meta: { title: 'Home' },
    },
  ],
  scrollBehavior: () => ({ top: 0 }),
})

router.afterEach((to) => {
  const base = 'Khalied Nauly Maturino — Software Developer'
  document.title = to.meta.title ? `${to.meta.title} · ${base}` : base
})

export default router
