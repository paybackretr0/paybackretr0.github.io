import { createRouter, createWebHistory } from 'vue-router'

import { type SiteLang } from '@/data/seo'
import { applySeoHead } from '@/composables/useSeoHead'
import { locale, setLocale } from '@/composables/useLang'
import Home from '@/views/Home.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // The built site serves a static redirect page at `/`; this route only
    // handles the root in dev and any stale shell that still loads the app.
    {
      path: '/',
      redirect: () => ({ name: locale.value === 'id' ? 'home-id' : 'home-en' }),
    },
    { path: '/en', name: 'home-en', component: Home, meta: { lang: 'en' } },
    { path: '/id', name: 'home-id', component: Home, meta: { lang: 'id' } },
    { path: '/:pathMatch(.*)*', redirect: { name: 'home-en' } },
  ],
  scrollBehavior: () => ({ top: 0 }),
})

// The URL decides the language: state, <html lang> and the head tags all follow
// the route, so a link always opens in the language it points at.
router.afterEach((to) => {
  const lang = (to.meta.lang as SiteLang | undefined) ?? locale.value
  setLocale(lang)
  applySeoHead(lang)
})

export default router
