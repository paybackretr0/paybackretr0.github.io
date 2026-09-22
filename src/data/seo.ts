export type SiteLang = 'en' | 'id'

/** Canonical origin. Keep in sync with SITE_URL in vite.config.ts. */
export const SITE_URL = 'https://khalied.maturino.id'

export interface LangConfig {
  /** URL path the language is served from, with a trailing slash. */
  path: string
  /** Value for <html lang>. */
  htmlLang: string
  /** og:locale; the other language is advertised as og:locale:alternate. */
  ogLocale: string
  title: string
  description: string
}

/**
 * One URL per language so each version can be prerendered, indexed and shared
 * in the language it actually contains. scripts/prerender.mjs snapshots every
 * entry here, so adding a language adds its page too.
 */
export const languages: Record<SiteLang, LangConfig> = {
  en: {
    path: '/en/',
    htmlLang: 'en',
    ogLocale: 'en_US',
    title: 'Khalied Nauly Maturino — Software Developer',
    description:
      'Khalied Nauly Maturino — Software Developer building Android apps (Kotlin, Jetpack Compose, Flutter) and web information systems (Laravel, React.js, Node.js).',
  },
  id: {
    path: '/id/',
    htmlLang: 'id',
    ogLocale: 'id_ID',
    title: 'Khalied Nauly Maturino — Software Developer',
    description:
      'Khalied Nauly Maturino — Software Developer yang membangun aplikasi Android (Kotlin, Jetpack Compose, Flutter) dan sistem informasi web (Laravel, React.js, Node.js).',
  },
}

/** Language a visitor gets when nothing else points at one. */
export const defaultLang: SiteLang = 'en'

/** The language a pathname names, or null when it names none. */
export function langFromPath(pathname: string): SiteLang | null {
  const match = /^\/(en|id)(?:\/|$)/.exec(pathname)
  return match ? (match[1] as SiteLang) : null
}

/** The other language — the one the toggle switches to. */
export function otherLang(lang: SiteLang): SiteLang {
  return lang === 'en' ? 'id' : 'en'
}

/** Absolute URL of a language page. */
export function langUrl(lang: SiteLang): string {
  return `${SITE_URL}${languages[lang].path}`
}
