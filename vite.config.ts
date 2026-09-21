import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'

import { projects } from './src/data/projects'

const SITE_URL = 'https://khalied.maturino.id/'

/** Web vs mobile follows the same rule the commit stream uses. */
const isWebProject = (category: string) => category.toLowerCase().includes('web')

/**
 * Project list as JSON-LD, generated from the very same data the site renders
 * so the two can never drift apart. Injected into <head> at build time (and by
 * the dev server) to keep it readable for crawlers that do not execute JS.
 */
function projectsJsonLd(): string {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Projects by Khalied Nauly Maturino',
    numberOfItems: projects.length,
    itemListElement: projects.map((project, index) => {
      const web = isWebProject(project.category)
      return {
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'SoftwareApplication',
          name: project.title.en,
          description: project.desc.en,
          applicationCategory: web ? 'WebApplication' : 'MobileApplication',
          ...(web ? {} : { operatingSystem: 'Android' }),
          keywords: project.stack.join(', '),
          url: project.demo || project.github,
          author: { '@id': `${SITE_URL}#person` },
        },
      }
    }),
  }

  // A stray "</script>" inside the data must not break out of the tag.
  return JSON.stringify(schema).replace(/</g, '\\u003c')
}

function projectsStructuredData(): Plugin {
  return {
    name: 'projects-structured-data',
    transformIndexHtml() {
      return [
        {
          tag: 'script',
          attrs: { type: 'application/ld+json' },
          children: projectsJsonLd(),
          injectTo: 'head',
        },
      ]
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  // Toggle Vue DevTools per run: set VITE_VUE_DEVTOOLS=1 in your .env file
  // (or shell) to enable it. Defaults to off.
  const enableDevtools = ['1', 'true'].includes(env.VITE_VUE_DEVTOOLS?.toLowerCase() ?? '')

  return {
    plugins: [
      vue(),
      ...(enableDevtools ? [vueDevTools()] : []),
      tailwindcss(),
      projectsStructuredData(),
    ],

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
