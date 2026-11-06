# porto-lied

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

## CV and portfolio downloads

The hero buttons and the mobile menu download the PDFs in `public/`:

| File in `public/`       | Shown on       | Label                  |
| ----------------------- | -------------- | ---------------------- |
| `CV-Khalied-EN-SD.pdf`  | `/en/`         | Resume                 |
| `CV-Khalied-ID-SD.pdf`  | `/id/`         | CV                     |
| `Khalied-Portfolio.pdf` | both languages | Portfolio / Portofolio |

The mapping lives in [`src/data/docs.ts`](src/data/docs.ts) and every URL is
built from `import.meta.env.BASE_URL`, so it resolves to an absolute path
(`/CV-Khalied-EN-SD.pdf`) instead of a page-relative one. That matters because
the site is prerendered per language: a relative `./cv.pdf` was resolved against
the language folder (`/en/cv.pdf`), which returned 404 on GitHub Pages even
though it appeared to work in development. To swap a PDF, replace the file in
`public/` and keep the name — or update the name in `src/data/docs.ts`.

## Design system — Studio Marble

A gallery at night: warm near-black walls, bone type, a single bronze accent and
one soft skylight. Everything lives in [`src/style.css`](src/style.css).

- **Tokens** — `--ink` / `--surface` / `--elevated`, the bone `--copy` ramp
  (`--muted`, `--muted-2`), one bronze accent family (`--primary`, `--accent`),
  motion easings (`--ease-out-*`) and the skylight wash (`--aurora-1..3`, still
  named for the layer they replaced). The light theme is the same room at
  midday — plaster walls, warm ink type — and overrides the same names under
  `[data-theme='light']`, so one attribute re-themes everything.
- **Depth** — physical, not glassy: `--shadow-ambient` / `--shadow-lift` are
  contact + ambient + key shadow stacks, `--edge-light` is the 1px highlight on
  the edge facing the light, and `--hairline` draws the rules. The legacy
  `.neu-*` / `.glass` classes remain as aliases so untouched markup keeps
  rendering while sections are rebuilt one at a time.
- **Type** — Instrument Serif carries the display voice (`.hero-name`,
  section headings, stat numerals); Cabinet Grotesk handles UI weight, Manrope
  body copy, JetBrains Mono the captions, indices and brackets.
- **Hero** — an editorial two-column spread (`.hero-grid`): type on the left,
  the portrait print on the right, and nothing centred. On a phone the print
  moves up between the role and the body copy so the face arrives early.
- **Portrait** — `.portrait*` renders the photograph as a physical object: a
  bronze hairline, a paper mat, a sheen across the glass and a contact shadow.
  Deliberately **not** a `mix-blend-mode` layer — a blend mode there forces the
  frame into its own compositing layer, and some GPU/driver combinations then
  paint the print black.
- **Effects** — `.grain-layer` (film grain, `AuroraBackground.vue`),
  `.spotlight-card` (cursor glow, `v-spotlight`), `.tilt-target` (3D tilt,
  `v-tilt`), `.marquee-track` (`Marquee.vue`).
- **Motion** — `v-reveal`, `.scroll-rise` / `.scroll-grow` (CSS scroll-driven
  where supported), `useMagnetic` (magnetic buttons), a single expo ease family
  and the page / language View Transitions.

### Portrait images

`assets-src/portrait.jpg` is the source; `node scripts/images.mjs` turns it into
everything under `public/img/` — `portrait-{480,720,1080,1440}.webp` (untinted),
`portrait-print-*` (warm print grade, what the site uses) and
`portrait-duotone-*`, plus `public/og-cover.jpg` for social previews. The
script runs in Chrome via `puppeteer-core`, so there is no image library to
install; its output is committed, so a normal build never pays for it.

`components/ui/PortraitFrame.vue` is a plain `<img>` with `srcset`, explicit
`width`/`height` and `fetchpriority="high"` — it is the LCP candidate, it is
what the prerenderer captures, and it stays on screen for everyone whose device
skips WebGL.

### 3D stage

`components/stage/RoomStage.vue` owns the lifecycle and mounts
`components/three/roomScene.three.ts`. `three` is imported dynamically, so it
ships as its own lazy chunk and only loads once the hero is on screen.

- **`roomScene.three.ts`** — a dark room with one shaft of light, dust in the
  air and a pool of light on the floor. Everything is procedural: the plaster is
  a generated `CanvasTexture` used as both colour and bump, the dust sprite is
  drawn to a canvas, and the environment is a `PMREMGenerator` over a two-panel
  scene. There is no model, no texture file and no HDRI.
- **The shaft is quads, not a box.** Two planes crossed at 90° per layer. A box
  puts every one of its faces on the fallout edge of the shader (alpha 0), so it
  renders as nothing — that bug shipped once already.
- **Themes are re-balanced, not re-tinted.** `applyTuning()` derives a 0→1
  "night or day" value from `--room-wall`'s luminance and drives everything from
  it. Night: the shaft is additive light in the air. Day: the same window
  pattern is drawn as **shadow on the wall** with normal blending, because an
  additive beam on plaster just burns the wall white — which is why the light
  theme used to look like a flat empty page. It runs at boot as well as on a
  theme switch, otherwise a visitor who loads the site in the day theme gets the
  night intensities.
- **Shadows need their own token.** `--room-shadow` exists because `--ink` is
  the *light* colour in the day theme; painting the shadow with it made the
  shadow brighter than the wall.
- **`HeroScene.vue` / `heroScene.three.ts` / `billiardScene.three.ts`** are the
  previous stages, still on disk and still switchable, so a rollback is a query
  parameter rather than a revert.

`components/stage/RoomStage.vue` skips the scene entirely for
`prefers-reduced-motion`, `?perf=low` and browsers without WebGL, stops the loop
when the tab is hidden or the hero leaves the viewport, and degrades the pixel
ratio if frames get slow. In all of those cases `.stage-poster` — a CSS-only
stand-in painted from the same `--room-*` tokens — is what the visitor sees, and
it is what the prerenderer captures.

Both scenes skip themselves for `prefers-reduced-motion`, drop resolution and
antialiasing on touch/low-memory devices, degrade further if the frame-time
governor trips, and stop rendering when the hero leaves the viewport or the tab
is hidden.

`components/ui/HeroFallback.vue` is the static poster: an SVG table painted from
the same `--scene-*` tokens. It is what the prerenderer, reduced-motion visitors,
`?perf=low` and browsers without WebGL see, so it has to look deliberate rather
than empty — it is also what ends up in the prerendered HTML.

### Performance mode

`usePerfMode` writes `<html data-perf="high|low">` before the first frame. On
`low` (save-data, ≤4 GB RAM, ≤4 cores, or a phone with ≤6 cores) the always-on
decoration is dropped: aurora drift, film grain, blueprint grid, backdrop blur,
floating cards, Lenis smooth scrolling and the WebGL hero. Layout and colour stay
the same. Force it either way with `?perf=low` / `?perf=high` — the choice is
remembered in `localStorage` under `perf`.

Heavy effects are also skipped/disabled elsewhere: the aurora blobs are plain
radial gradients (a `filter: blur()` on an animated layer forces a full
re-rasterise every frame), the grain has no `mix-blend-mode`, backdrop blur is
off below 900px, and the WebGL loop stops whenever the hero leaves the viewport
or the tab is hidden.

## Visual QA screenshots

```sh
npm run build            # produces dist/ and the prerendered /en/ + /id/ pages
npm run shots -- --label before
npm run shots -- --label after
```

Output lands in `.screenshots/<label>/` (git-ignored): every language × theme ×
viewport combination, captured with reduced motion so a frame never depends on
where an animation happened to be. Requires Google Chrome, like the prerenderer
(`CHROME_PATH` overrides the binary).

## Deploy to GitHub Pages

The site is hosted as a GitHub Pages **user page** at
`https://paybackretr0.github.io/` and redeploys **automatically on every push
to `main`** via [GitHub Actions](.github/workflows/deploy.yml).

### First-time setup

1. Create a public repository on GitHub named `paybackretr0.github.io`
   (exactly — user pages must match your account name; don't initialize it
   with a README, the project already has one).
2. From the project root:

   ```sh
   git remote add origin git@github.com:paybackretr0/paybackretr0.github.io.git
   git push -u origin main
   ```

   Or, with the GitHub CLI (after `gh auth login`):

   ```sh
   gh repo create paybackretr0.github.io --public --source . --remote origin --push
   ```

3. Open the repository on GitHub → **Settings → Pages** → under _Build and
   deployment_ set **Source** to **GitHub Actions**.
4. The first deploy runs automatically from the push. When it finishes, the
   site is live at `https://paybackretr0.github.io/`.

From then on, every `git push` to `main` builds and deploys the latest version.
