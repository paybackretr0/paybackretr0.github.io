import { projects, type Project } from '@/data/projects'
import { languages, langUrl, SITE_URL, type SiteLang } from '@/data/seo'

/**
 * Machine-readable page data (schema.org), written per language so each URL
 * describes itself in the language it actually contains. Emitted by
 * applySeoHead at runtime, which is also what scripts/prerender.mjs captures.
 */

/** Web apps become WebApplication; everything else here is an Android app. */
const isWebApplication = (project: Project) => project.category.toLowerCase().includes('web')

const listName = {
  en: 'Projects by Khalied Nauly Maturino',
  id: 'Proyek oleh Khalied Nauly Maturino',
} satisfies Record<SiteLang, string>

/** One project as a software entity, titled and described in `lang`. */
function projectSchema(project: Project, lang: SiteLang) {
  const web = isWebApplication(project)

  return {
    '@type': 'SoftwareApplication',
    name: project.title[lang],
    description: project.desc[lang],
    applicationCategory: web ? 'WebApplication' : 'MobileApplication',
    ...(web ? {} : { operatingSystem: 'Android' }),
    keywords: project.stack.join(', '),
    url: project.demo || project.github,
    author: { '@id': `${SITE_URL}/#person` },
  }
}

/** The project list, using the same localized copy the page renders. */
export function projectsItemListJsonLd(lang: SiteLang) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: listName[lang],
    numberOfItems: projects.length,
    itemListElement: projects.map((project, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: projectSchema(project, lang),
    })),
  }
}

/**
 * The page the profile lives on. Each language gets its own node — its own URL
 * and inLanguage — while WebSite and Person stay shared entities in the static
 * HTML, referenced here by @id.
 */
export function profilePageJsonLd(lang: SiteLang) {
  const config = languages[lang]

  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    '@id': `${langUrl(lang)}#webpage`,
    url: langUrl(lang),
    name: config.title,
    description: config.description,
    isPartOf: { '@id': `${SITE_URL}/#website` },
    about: { '@id': `${SITE_URL}/#person` },
    mainEntity: { '@id': `${SITE_URL}/#person` },
    inLanguage: config.htmlLang,
  }
}
