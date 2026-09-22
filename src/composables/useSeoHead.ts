import { languages, langUrl, otherLang, type SiteLang } from '@/data/seo'
import { profilePageJsonLd, projectsItemListJsonLd } from '@/data/structuredData'

/**
 * Reuses a tag already in <head> (including one parsed from prerendered HTML)
 * or appends a new one.
 */
function upsert(selector: string, create: () => HTMLElement): HTMLElement {
  const existing = document.head.querySelector<HTMLElement>(selector)
  if (existing) return existing

  const element = create()
  document.head.appendChild(element)
  return element
}

function setMeta(attr: 'name' | 'property', key: string, content: string) {
  const meta = upsert(`meta[${attr}="${key}"]`, () => {
    const element = document.createElement('meta')
    element.setAttribute(attr, key)
    return element
  })
  meta.setAttribute('content', content)
}

/**
 * Writes a JSON-LD block, keyed by data-seo so a route change rewrites the
 * existing one instead of stacking duplicates.
 *
 * `<` is escaped to \u003c: still valid JSON and identical once parsed, but it
 * cannot end the <script> tag early if the data ever contains markup.
 */
function setJsonLd(key: string, data: unknown) {
  const script = upsert(`script[type="application/ld+json"][data-seo="${key}"]`, () => {
    const element = document.createElement('script')
    element.setAttribute('type', 'application/ld+json')
    element.dataset.seo = key
    return element
  })

  script.textContent = JSON.stringify(data).replace(/</g, '\\u003c')
}

function setLink(rel: string, href: string, hreflang?: string) {
  const selector = hreflang ? `link[rel="${rel}"][hreflang="${hreflang}"]` : `link[rel="${rel}"]`
  const link = upsert(selector, () => {
    const element = document.createElement('link')
    element.setAttribute('rel', rel)
    if (hreflang) element.setAttribute('hreflang', hreflang)
    return element
  })
  link.setAttribute('href', href)
}

/**
 * Writes the language-specific head tags for a page: <html lang>, title,
 * description, canonical, hreflang alternates, the Open Graph/Twitter
 * equivalents and the page-level JSON-LD.
 *
 * Runs on every route change so the address bar, the tags and the rendered
 * copy always agree — and because scripts/prerender.mjs captures the live DOM,
 * the static HTML each URL ships already carries these tags for crawlers that
 * never execute JavaScript.
 */
export function applySeoHead(lang: SiteLang) {
  const config = languages[lang]
  const other = languages[otherLang(lang)]

  document.documentElement.lang = config.htmlLang
  document.title = config.title

  setMeta('name', 'description', config.description)
  setLink('canonical', langUrl(lang))

  // Both languages are advertised on both pages, as hreflang requires;
  // x-default is the version a visitor with no matching language lands on.
  setLink('alternate', langUrl('en'), 'en')
  setLink('alternate', langUrl('id'), 'id')
  setLink('alternate', langUrl('en'), 'x-default')

  setMeta('property', 'og:url', langUrl(lang))
  setMeta('property', 'og:title', config.title)
  setMeta('property', 'og:description', config.description)
  setMeta('property', 'og:locale', config.ogLocale)
  setMeta('property', 'og:locale:alternate', other.ogLocale)

  setMeta('property', 'twitter:url', langUrl(lang))
  setMeta('property', 'twitter:title', config.title)
  setMeta('property', 'twitter:description', config.description)

  setJsonLd('profile-page', profilePageJsonLd(lang))
  setJsonLd('projects', projectsItemListJsonLd(lang))
}
