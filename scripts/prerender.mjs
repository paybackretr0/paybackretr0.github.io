/**
 * Prerenders every language page into dist/<lang>/index.html and turns
 * dist/index.html into a language redirect.
 *
 * The SPA shell ships an empty <div id="app">, so crawlers that do not execute
 * JavaScript (Bing, social/link previews, AI bots) would see no content at all,
 * and a single URL could never rank for two languages. Here headless Chrome
 * loads each language URL, lets Vue render it, and the resulting DOM is written
 * back as static HTML — head tags included, because the app writes canonical,
 * hreflang, Open Graph and descriptions at runtime (see useSeoHead).
 *
 * Runs after `vite build`. Snapshots use prefers-reduced-motion so the
 * scroll-reveal directive leaves no "opacity: 0" inline styles behind.
 *
 * Run with: node scripts/prerender.mjs  (or: npm run prerender)
 * Requires Google Chrome; override its location with CHROME_PATH.
 */
import { spawn } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import puppeteer from 'puppeteer-core'

import { experience } from '../src/data/experience.ts'
import { defaultLang, languages, langUrl } from '../src/data/seo.ts'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const distDir = join(root, 'dist')
const distIndex = join(distDir, 'index.html')
const viteBin = join(root, 'node_modules', 'vite', 'bin', 'vite.js')

const PORT = Number(process.env.PRERENDER_PORT ?? 4178)
// Not named `URL`: shadowing the global would break fetch() in this module.
const PAGE_ORIGIN = `http://localhost:${PORT}`

/** Driven by src/data/seo.ts — a new language gets its page automatically. */
const LANGS = Object.keys(languages)

/** Every language renders the education entry, so its copy doubles as a
 *  "did this page really render in language X?" check. */
function languageMarker(lang) {
  const entry = experience.find((item) => item.id === 'education')
  return entry.desc[lang].slice(0, 48)
}

const kB = (bytes) => `${(bytes / 1024).toFixed(1)} kB`

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  join(process.env.LOCALAPPDATA ?? '', 'Google/Chrome/Application/chrome.exe'),
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/chromium',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].filter(Boolean)

function resolveChrome() {
  const found = CHROME_CANDIDATES.find((path) => existsSync(path))
  if (!found) {
    throw new Error(
      'Chrome not found. Install Google Chrome or point CHROME_PATH at the binary.',
    )
  }
  return found
}

/** Polls the preview server until it answers (or times out). */
async function waitForServer(timeoutMs = 30_000) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    try {
      const res = await fetch(PAGE_ORIGIN, { method: 'HEAD' })
      if (res.ok) return
    } catch {
      /* not up yet */
    }
    await new Promise((resolve) => setTimeout(resolve, 200))
  }
  throw new Error(`Preview server did not start on ${PAGE_ORIGIN}`)
}

/** Loads one language page, lets it settle, and returns its serialized DOM. */
async function snapshot(page, lang) {
  const config = languages[lang]

  await page.goto(`${PAGE_ORIGIN}${config.path}`, {
    waitUntil: 'load',
    timeout: 60_000,
  })

  // Vue has mounted once the root container has children.
  await page.waitForFunction(
    () => (document.querySelector('#app')?.children.length ?? 0) > 0,
    { timeout: 20_000 },
  )
  await page.evaluate(() => document.fonts?.ready)
  // Let the initial layout settle before capturing.
  await new Promise((resolve) => setTimeout(resolve, 1_200))

  const html = await page.evaluate(
    () => `<!doctype html>\n${document.documentElement.outerHTML}`,
  )

  const expected = [
    `<html lang="${config.htmlLang}"`,
    `hreflang="${lang}" href="${langUrl(lang)}"`,
    languageMarker(lang),
  ]
  const missing = expected.filter((needle) => !html.includes(needle))
  if (missing.length > 0) {
    throw new Error(
      `${config.path} snapshot is missing expected markup: ${missing.join(' | ')}`,
    )
  }

  return html
}

/**
 * The root URL is not a language page: it forwards to /en/ or /id/ following
 * the visitor's saved preference (English by default) and defers to /en/ as the
 * canonical, x-default version.
 *
 * Built from the shell so the verification meta, JSON-LD, Open Graph image and
 * hreflang data stay defined once, in index.html.
 */
function redirectPage(shell) {
  const target = languages[defaultLang]

  if (!shell.includes('<head>') || !/<div id=["']?app["']?>\s*<\/div>/.test(shell)) {
    throw new Error(
      'Unexpected dist/index.html shape — cannot build the redirect page for /.',
    )
  }

  const html = shell
    // Drop the app entry and its CSS: `/` must not boot the SPA, and the
    // redirect should cost a few kB, not the whole bundle.
    .replace(/[ \t]*<script[^>]+type=["']?module["']?[^>]*>\s*<\/script>\s*/g, '')
    .replace(/[ \t]*<link[^>]+rel=["']?stylesheet["']?[^>]*>\s*/g, '')
    .replace(
      '<head>',
      `<head>
    <meta http-equiv="refresh" content="0; url=${target.path}">
    <style>
      body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #262b33; color: #e6e9ef; font: 400 15px/1.6 system-ui, sans-serif }
      a { color: #e6e9ef }
    </style>
    <script>
      // Saved choice first, then the browser's own preference, then English.
      // The meta refresh above is the no-JS fallback and points at /en/.
      (function () {
        var saved = null
        try {
          saved = localStorage.getItem('lang')
        } catch (e) {}
        var lang =
          saved === 'id' || saved === 'en'
            ? saved
            : /^id\\b/i.test(navigator.language || '')
              ? 'id'
              : 'en'
        location.replace(lang === 'id' ? '/id/' : '/en/')
      })()
    </script>`,
    )
    .replace(
      /<div id=["']?app["']?>\s*<\/div>/,
      `<div id="app">
      <p>Redirecting to <a href="/en/">English</a> or <a href="/id/">Bahasa Indonesia</a>…</p>
    </div>`,
    )

  if (/type=["']?module["']?/.test(html)) {
    throw new Error('Failed to strip the SPA entry from the redirect page.')
  }

  return html
}

async function prerender() {
  if (!existsSync(distIndex)) {
    throw new Error('dist/index.html not found — run `npm run build-only` first.')
  }

  // Read the shell before it is replaced: it is the template for `/`.
  const shell = readFileSync(distIndex, 'utf8')

  // The preview server must answer /en/ and /id/ before the snapshots exist, so
  // seed both with the shell first — the SPA boots there and takes its language
  // from the URL, which is exactly what we want to capture.
  for (const lang of LANGS) {
    mkdirSync(join(distDir, lang), { recursive: true })
    writeFileSync(join(distDir, lang, 'index.html'), shell)
  }

  const server = spawn(
    process.execPath,
    [viteBin, 'preview', '--port', String(PORT), '--strictPort'],
    { cwd: root, stdio: 'ignore' },
  )

  let browser
  try {
    await waitForServer()

    browser = await puppeteer.launch({
      executablePath: resolveChrome(),
      headless: true,
      defaultViewport: { width: 1440, height: 900 },
    })

    const page = await browser.newPage()
    // Reveal animations (and Lenis) opt out under reduced motion, which keeps
    // the captured markup free of inline opacity/transform styles.
    await page.emulateMediaFeatures([
      { name: 'prefers-reduced-motion', value: 'reduce' },
    ])

    for (const lang of LANGS) {
      const file = join(distDir, lang, 'index.html')
      const before = readFileSync(file).length
      const html = await snapshot(page, lang)
      writeFileSync(file, html, 'utf8')
      console.log(
        `prerendered ${languages[lang].path.padEnd(5)} — ${kB(before)} → ${kB(html.length)}`,
      )
    }

    const rootHtml = redirectPage(shell)
    writeFileSync(distIndex, rootHtml, 'utf8')
    console.log(
      `prerendered /     — redirect to ${languages[defaultLang].path} (${kB(rootHtml.length)})`,
    )
  } finally {
    await browser?.close()
    server.kill()
  }
}

prerender().catch((error) => {
  console.error(`Prerender failed: ${error.message}`)
  process.exit(1)
})
