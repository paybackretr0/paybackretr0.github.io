/**
 * TEMPORARY preview harness for the redesign: screenshots the live dev server
 * at a few viewports/themes so a change can be judged without a full build.
 *
 *   node scripts/tmp-preview.mjs [viewport] [theme] [yOffset] [outName]
 *
 * Deleted once the rebuild is signed off.
 */
import { spawn } from 'node:child_process'
import { existsSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import puppeteer from 'puppeteer-core'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const PORT = 4195
const ORIGIN = `http://localhost:${PORT}`

const CHROME = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  join(process.env.LOCALAPPDATA ?? '', 'Google/Chrome/Application/chrome.exe'),
  '/usr/bin/google-chrome',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].find((path) => path && existsSync(path))
if (!CHROME) throw new Error('Chrome not found')

const VIEWPORTS = {
  desktop: { width: 1440, height: 900 },
  laptop: { width: 1280, height: 800 },
  tablet: { width: 834, height: 1112 },
  mobile: { width: 390, height: 844 },
}

const [viewportName = 'desktop', theme = 'dark', offsetRaw = '0', outName] = process.argv.slice(2)
const viewport = VIEWPORTS[viewportName] ?? VIEWPORTS.desktop
const offset = Number(offsetRaw) || 0
const label = outName ?? `${viewportName}-${theme}-${offset}`

const outDir = join(root, '.screenshots', 'marble')
mkdirSync(outDir, { recursive: true })

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const server = spawn(
  process.execPath,
  [join(root, 'node_modules', 'vite', 'bin', 'vite.js'), '--port', String(PORT), '--strictPort'],
  { cwd: root, stdio: 'ignore' },
)

let browser
try {
  for (let i = 0; i < 120; i += 1) {
    try {
      if ((await fetch(ORIGIN, { method: 'HEAD' })).ok) break
    } catch {
      /* not up yet */
    }
    await sleep(250)
  }

  browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: true,
    args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader', '--ignore-gpu-blocklist'],
  })

  const page = await browser.newPage()
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })

  await page.setViewport({ ...viewport, deviceScaleFactor: 1, isMobile: false })
  await page.evaluateOnNewDocument((value) => {
    try {
      localStorage.setItem('theme', value)
      localStorage.setItem('perf', 'high')
    } catch {
      /* ignore */
    }
  }, theme)

  await page.goto(`${ORIGIN}/en/`, { waitUntil: 'networkidle2' })
  await sleep(900)
  if (offset) {
    await page.evaluate((y) => window.scrollTo(0, y), offset)
    await sleep(700)
  }

  await page.screenshot({ path: join(outDir, `${label}.png`) })

  const report = await page.evaluate(() => {
    const box = (selector) => {
      const el = document.querySelector(selector)
      if (!el) return null
      const r = el.getBoundingClientRect()
      return {
        x: Math.round(r.x),
        y: Math.round(r.y),
        w: Math.round(r.width),
        h: Math.round(r.height),
      }
    }
    const style = (selector, prop) => {
      const el = document.querySelector(selector)
      return el ? getComputedStyle(el).getPropertyValue(prop).trim() : null
    }
    return {
      overflowX: document.documentElement.scrollWidth - window.innerWidth,
      pageHeight: document.documentElement.scrollHeight,
      grid: box('.hero-grid'),
      copy: box('.hero-grid > div:first-child'),
      portrait: box('.portrait'),
      name: box('.hero-name'),
      stats: box('.hero-stats'),
      portraitSrc: document.querySelector('.portrait__print')?.getAttribute('src') ?? null,
      portraitLoaded: document.querySelector('.portrait__print')?.naturalWidth ?? 0,
      portraitMean: (() => {
        const img = document.querySelector('.portrait__print')
        if (!img || !img.complete || !img.naturalWidth) return 'not-ready'
        const c = document.createElement('canvas')
        c.width = 48
        c.height = 60
        const cx = c.getContext('2d')
        cx.drawImage(img, 0, 0, 48, 60)
        const d = cx.getImageData(0, 0, 48, 60).data
        let r = 0
        let g = 0
        let b = 0
        for (let i = 0; i < d.length; i += 4) {
          r += d[i]
          g += d[i + 1]
          b += d[i + 2]
        }
        const n = d.length / 4
        return [Math.round(r / n), Math.round(g / n), Math.round(b / n)].join(',')
      })(),
      printOpacity: style('.portrait__print', 'opacity'),
      printFilter: style('.portrait__print', 'filter'),
      stagePosterOpacity: style('.stage-poster', 'opacity'),
      stageCanvas: document.querySelectorAll('section canvas').length,
      glassBlend: style('.portrait__glass', 'mix-blend-mode'),
      topAtPortrait: (() => {
        const el = document.elementFromPoint(1038, 500)
        return el ? `${el.tagName}.${el.className}`.slice(0, 60) : null
      })(),
      ink: style('html', '--ink').trim(),
      accent: style('html', '--accent').trim(),
      nameFont: style('.hero-name', 'font-family'),
    }
  })

  console.log(`${label} → ${viewport.width}x${viewport.height}`)
  console.log(JSON.stringify(report, null, 2))
  console.log(errors.length ? `errors: ${errors.slice(0, 5).join(' | ')}` : 'errors: none')
} finally {
  await browser?.close()
  server.kill()
}
