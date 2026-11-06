import type { SiteLang } from '@/data/seo'

/**
 * Downloadable documents (CV, portfolio deck).
 *
 * The files live in `public/`, so Vite copies them to the deploy root and they
 * are served from there. Links are built from `import.meta.env.BASE_URL`
 * instead of a relative `./cv.pdf`: a relative path resolves against the
 * current page, so on `/en/` it became `/en/cv.pdf` and 404'd (in dev the URL
 * stayed `/` and it worked, which is why the bug only showed up on the live
 * site). BASE_URL also keeps the links correct if the site is ever deployed
 * under a sub-path (e.g. a GitHub Pages project page at `/porto-lied/`).
 */
export interface DocFile {
  /** File name, also used for the `download` attribute. */
  file: string
  /** Absolute, base-aware URL that is safe to use from any page and language. */
  url: string
}

function doc(file: string): DocFile {
  // BASE_URL always carries both its leading and trailing slash (`/` or `/repo/`).
  return { file, url: `${import.meta.env.BASE_URL}${file}` }
}

/**
 * One CV per language, so the download button follows the site language: the
 * English page offers the English resume, the Indonesian page the Indonesian
 * one.
 */
export const cvDocs: Record<SiteLang, DocFile> = {
  en: doc('CV-Khalied-EN-SD.pdf'),
  id: doc('CV-Khalied-ID-SD.pdf'),
}

/** Portfolio deck — a single PDF, identical in both languages. */
export const portfolioDoc: DocFile = doc('Khalied-Portfolio.pdf')
