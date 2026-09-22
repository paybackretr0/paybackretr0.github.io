import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  // Toggle Vue DevTools per run: set VITE_VUE_DEVTOOLS=1 in your .env file
  // (or shell) to enable it. Defaults to off.
  const enableDevtools = ['1', 'true'].includes(env.VITE_VUE_DEVTOOLS?.toLowerCase() ?? '')

  return {
    // Page-level structured data used to be injected here at build time. It is
    // now written per language by applySeoHead, so each prerendered URL carries
    // its own ProfilePage and project list.
    plugins: [vue(), ...(enableDevtools ? [vueDevTools()] : []), tailwindcss()],

    // GitHub Pages user page — the repository must be named
    // <account>.github.io so the site serves from the domain root.
    base: '/',

    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  }
})
