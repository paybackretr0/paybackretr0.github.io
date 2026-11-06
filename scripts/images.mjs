/**
 * Builds the web-ready portrait set from `assets-src/portrait.jpg`.
 *
 *   node scripts/images.mjs
 *
 * Output (committed, so a normal build never pays for this):
 *   public/img/portrait-{480,720,1080,1440}.webp        untinted
 *   public/img/portrait-print-{…}.webp                  warm print grade
 *   public/img/portrait-duotone-{…}.webp                strong duotone
 *   public/img/og-cover.jpg                             1200x630 social card
 *
 * No image library is installed, so the resize and the grade run in Chrome —
 * the same binary puppeteer-core already needs for `prerender` and `shots`.
 * WebP only: every browser this site targets decodes it, and it is roughly a
 * third of the JPEG at the same visual quality.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import puppeteer from 'puppeteer-core'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const SOURCE = join(root, 'assets-src', 'portrait.jpg')
const OUT_DIR = join(root, 'public', 'img')

if (!existsSync(SOURCE)) {
  throw new Error(`Missing source image: ${SOURCE}`)
}
mkdirSync(OUT_DIR, { recursive: true })

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

const chromePath = CHROME_CANDIDATES.find((path) => existsSync(path))
if (!chromePath) {
  throw new Error('Chrome not found. Install Google Chrome or set CHROME_PATH.')
}

const WIDTHS = [480, 720, 1080, 1440]
const GRADES = ['none', 'print', 'duotone']
const dataUrl = `data:image/jpeg;base64,${readFileSync(SOURCE).toString('base64')}`

const browser = await puppeteer.launch({
  executablePath: chromePath,
  headless: true,
  args: ['--disable-dev-shm-usage'],
})

try {
  const page = await browser.newPage()
  await page.setContent('<img id="src" />', { waitUntil: 'domcontentloaded' })

  const results = await page.evaluate(
    async ({ src, widths, grades }) => {
      const image = document.getElementById('src')
      image.src = src
      await image.decode()

      const sw = image.naturalWidth
      const sh = image.naturalHeight
      // 4:5 portrait, cropped from the centre if the source ever differs.
      const ratio = 4 / 5
      const cropH = Math.min(sh, Math.round(sw / ratio))
      const cropW = Math.round(cropH * ratio)
      const sx = Math.round((sw - cropW) / 2)
      const sy = Math.round((sh - cropH) / 2)

      /** Warm print grade / strong duotone. Runs once per output size. */
      function applyGrade(ctx, w, h, grade) {
        if (grade === 'none') return
        const frame = ctx.getImageData(0, 0, w, h)
        const d = frame.data
        for (let i = 0; i < d.length; i += 4) {
          const r0 = d[i]
          const g0 = d[i + 1]
          const b0 = d[i + 2]
          const lum = 0.2126 * r0 + 0.7152 * g0 + 0.0722 * b0

          if (grade === 'duotone') {
            // Dark bronze to bone, the way a toned silver print reads.
            const t = Math.pow(lum / 255, 0.92)
            d[i] = 22 + (240 - 22) * t
            d[i + 1] = 18 + (231 - 18) * t
            d[i + 2] = 14 + (214 - 14) * t
          } else {
            // Keep the luminance, drain most of the colour, warm what is left.
            const keep = 0.22
            let r = lum + (r0 - lum) * keep
            let g = lum + (g0 - lum) * keep
            let b = lum + (b0 - lum) * keep
            r = Math.min(255, r * 1.05)
            g = Math.min(255, g * 1.0)
            b = Math.min(255, b * 0.94)
            // Gentle S-curve: a print has more bite than a phone JPEG.
            d[i] = 255 * Math.pow(r / 255, 1.08)
            d[i + 1] = 255 * Math.pow(g / 255, 1.08)
            d[i + 2] = 255 * Math.pow(b / 255, 1.08)
          }
        }
        ctx.putImageData(frame, 0, 0)
      }

      function render(width, height, grade) {
        // Two-step downscale: one big jump from 3640px loses the fine texture
        // in the hair and the cloth.
        const half = document.createElement('canvas')
        half.width = width * 2
        half.height = height * 2
        const hctx = half.getContext('2d')
        hctx.imageSmoothingQuality = 'high'
        hctx.drawImage(image, sx, sy, cropW, cropH, 0, 0, half.width, half.height)

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.imageSmoothingQuality = 'high'
        ctx.drawImage(half, 0, 0, half.width, half.height, 0, 0, width, height)
        applyGrade(ctx, width, height, grade)
        return canvas.toDataURL('image/webp', 0.86)
      }

      const files = []
      for (const grade of grades) {
        for (const width of widths) {
          const height = Math.round(width / ratio)
          files.push({
            name: grade === 'none' ? `portrait-${width}.webp` : `portrait-${grade}-${width}.webp`,
            data: render(width, height, grade),
          })
        }
      }

      // Social card: dark plate, the print on the right, name on the left.
      const og = document.createElement('canvas')
      og.width = 1200
      og.height = 630
      const octx = og.getContext('2d')
      octx.fillStyle = '#0C0A08'
      octx.fillRect(0, 0, 1200, 630)

      const cardH = 470
      const cardW = Math.round(cardH * ratio)
      const cardX = 1200 - cardW - 96
      const cardY = Math.round((630 - cardH) / 2)

      const card = document.createElement('canvas')
      card.width = cardW
      card.height = cardH
      const cctx = card.getContext('2d')
      cctx.imageSmoothingQuality = 'high'
      cctx.drawImage(image, sx, sy, cropW, cropH, 0, 0, cardW, cardH)
      applyGrade(cctx, cardW, cardH, 'duotone')
      octx.drawImage(card, cardX, cardY)

      octx.strokeStyle = 'rgba(201,174,134,0.5)'
      octx.lineWidth = 1
      octx.strokeRect(cardX + 0.5, cardY + 0.5, cardW - 1, cardH - 1)

      octx.fillStyle = '#C9AE86'
      octx.font = '500 15px "Segoe UI", system-ui, sans-serif'
      octx.letterSpacing = '6px'
      octx.fillText('PORTFOLIO · 2026', 96, 232)

      octx.fillStyle = '#EFEAE1'
      octx.font = 'italic 76px Georgia, "Times New Roman", serif'
      octx.letterSpacing = '-1px'
      octx.fillText('Khalied Nauly', 92, 320)
      octx.fillText('Maturino', 92, 404)

      octx.fillStyle = '#A7A093'
      octx.font = '400 22px "Segoe UI", system-ui, sans-serif'
      octx.letterSpacing = '1px'
      octx.fillText('Software Developer — Mobile & Web', 96, 452)

      files.push({ name: 'og-cover.jpg', data: og.toDataURL('image/jpeg', 0.86) })
      return files
    },
    { src: dataUrl, widths: WIDTHS, grades: GRADES },
  )

  let total = 0
  for (const file of results) {
    const base64 = file.data.slice(file.data.indexOf(',') + 1)
    const buffer = Buffer.from(base64, 'base64')
    writeFileSync(join(OUT_DIR, file.name), buffer)
    total += buffer.length
    const kb = String(Math.round(buffer.length / 1024)).padStart(4)
    console.log(`  ${file.name.padEnd(30)} ${kb} kB`)
  }
  console.log(`\n${results.length} files, ${Math.round(total / 1024)} kB total → public/img/`)
} finally {
  await browser.close()
}
