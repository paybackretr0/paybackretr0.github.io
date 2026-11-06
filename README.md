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

## Design system — Aurora Glass

The UI is built from one visual language, all of it defined in
[`src/style.css`](src/style.css):

- **Tokens** — `--ink` / `--surface` / `--glass` / `--glass-border`, the solid
  brand colours (`--primary`, `--violet`, `--cyan` — buttons and accent text use
  them flat, never as a gradient), motion easings (`--ease-out-expo`) and the
  aurora washes (`--aurora-1..3`). The light theme overrides the same names under
  `[data-theme='light']`, so a single attribute re-themes everything.
- **Surfaces** — `.glass`, `.glass-strong`, `.nav-glass`, `.nav-panel` and the
  legacy `.neu-*` names, kept as aliases so older markup keeps rendering.
- **Type** — `accent-serif` (Instrument Serif italic) and `.accent-text` (solid
  accent colour) for the accent word inside a heading.
- **Effects** — `.aurora-blob` + `.grain-layer` (background, in
  `AuroraBackground.vue`), `.spotlight-card` (cursor glow, driven by `v-spotlight`),
  `.tilt-target` (3D tilt, driven by `v-tilt`), `.marquee-track` (`Marquee.vue`).
- **Motion** — `v-reveal` (fade/rise/blur on scroll), `MaskedLines.vue` (masked
  line reveal with GSAP), `.scroll-rise` / `.scroll-grow` (CSS scroll-driven
  animations where supported), `useMagnetic` (magnetic buttons) and the page /
  language View Transitions.

### 3D hero

`components/three/HeroScene.vue` mounts the WebGL object in
`components/three/heroScene.three.ts`. `three` is imported dynamically, so it
ships as its own lazy chunk and only loads once the hero is on screen. The scene
skips itself for `prefers-reduced-motion`, touch/low-memory devices get fewer
particles and a lower pixel ratio, a frame-time governor degrades it further if
needed, and a CSS fallback (`.hero-fallback`) covers everything else — including
the prerenderer, which always runs with reduced motion.

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
