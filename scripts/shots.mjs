/**
 * Captures visual-QA screenshots of the built site.
 *
 * It does not build anything: it screenshots `dist/`, so run `npm run build`
 * (or `npm run build-only` + `npm run prerender`) first. Every language ×
 * theme × viewport combination is captured in a single run, which makes a
 * redesign easy to compare against the previous state:
 *
 *   node scripts/shots.mjs --label before
 *   node scripts/shots.mjs --label after
 *
 * Output: .screenshots/<label>/<lang>-<theme>-<viewport>.png
 *
 * Screenshots run with prefers-reduced-motion so motion never decides what a
 * frame looks like — the captured page is the same one crawlers and reduced
 * motion users get, and two runs of the same code produce identical images.
 *
 * Requires Google Chrome; override its location with CHROME_PATH.
 */
import { spawn } from 'node:child_process'
import { existsSync, mkdirSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import puppeteer from 'puppeteer-core'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const distIndex = join(root, 'dist', 'index.html')
const viteBin = join(root, 'node_modules', 'vite', 'bin', 'vite.js')

const PORT = Number(process.env.SHOTS_PORT ?? 4180)
const PAGE_ORIGIN = `http://localhost:${PORT}`

/** `--label before` → .screenshots/before/… */
function parseLabel() {
  const at = process.argv.indexOf('--label')
  const value = at === -1 ? '' : process.argv[at + 1]
  return (value ?? '').replace(/[^\w.-]/g, '') || 'latest'
}

const LANGS = ['en', 'id']
const THEMES = ['dark', 'light']
const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900, isMobile: false },
  { name: 'mobile', width: 390, height: 844, isMobile: true },
]

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
    throw new Error('Chrome not found. Install Google Chrome or point CHROME_PATH at the binary.')
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

const kB = (bytes) => `${Math.round(bytes / 1024)} kB`

async function capture(browser, outDir, lang, theme, viewport) {
  const page = await browser.newPage()

  try {
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
    await page.setViewport({
      width: viewport.width,
      height: viewport.height,
      isMobile: viewport.isMobile,
      hasTouch: viewport.isMobile,
      deviceScaleFactor: 1,
    })

    // The theme is read from localStorage by the inline <head> script, so it
    // has to be seeded before the app boots.
    await page.evaluateOnNewDocument((value) => {
      try {
        localStorage.setItem('theme', value)
      } catch {
        /* ignore */
      }
    }, theme)

    await page.goto(`${PAGE_ORIGIN}/${lang}/`, { waitUntil: 'networkidle2', timeout: 60_000 })
    // One extra frame batch lets fonts settle before the capture.
    await new Promise((resolve) => setTimeout(resolve, 700))

    const file = join(outDir, `${lang}-${theme}-${viewport.name}.jpg`)
    // JPEG rather than PNG: a full-page capture of this site is several
    // megapixels, and JPEG keeps runs fast and the output easy to review.
    await page.screenshot({ path: file, fullPage: true, type: 'jpeg', quality: 82 })
    console.log(`  ${lang}/${theme}/${viewport.name} → ${kB(statSync(file).size)}`)
  } finally {
    await page.close()
  }
}

async function main() {
  if (!existsSync(distIndex)) {
    throw new Error('dist/index.html not found — run `npm run build` first.')
  }

  const label = parseLabel()
  const outDir = join(root, '.screenshots', label)
  mkdirSync(outDir, { recursive: true })
  console.log(`Capturing ${label} → ${outDir}`)

  const server = spawn(
    process.execPath,
    [viteBin, 'preview', '--port', String(PORT), '--strictPort'],
    { cwd: root, stdio: 'ignore' },
  )

  let browser
  try {
    await waitForServer()
    browser = await puppeteer.launch({ executablePath: resolveChrome(), headless: true })

    for (const viewport of VIEWPORTS) {
      for (const lang of LANGS) {
        for (const theme of THEMES) {
          await capture(browser, outDir, lang, theme, viewport)
        }
      }
    }

    console.log('Done.')
  } finally {
    await browser?.close()
    server.kill()
  }
}

main().catch((error) => {
  console.error(`Screenshots failed: ${error.message}`)
  process.exit(1)
})
