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

| File in `public/` | Shown on | Label |
| --- | --- | --- |
| `CV-Khalied-EN-SD.pdf` | `/en/` | Resume |
| `CV-Khalied-ID-SD.pdf` | `/id/` | CV |
| `Khalied-Portfolio.pdf` | both languages | Portfolio / Portofolio |

The mapping lives in [`src/data/docs.ts`](src/data/docs.ts) and every URL is
built from `import.meta.env.BASE_URL`, so it resolves to an absolute path
(`/CV-Khalied-EN-SD.pdf`) instead of a page-relative one. That matters because
the site is prerendered per language: a relative `./cv.pdf` was resolved against
the language folder (`/en/cv.pdf`), which returned 404 on GitHub Pages even
though it appeared to work in development. To swap a PDF, replace the file in
`public/` and keep the name — or update the name in `src/data/docs.ts`.

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

3. Open the repository on GitHub → **Settings → Pages** → under *Build and
   deployment* set **Source** to **GitHub Actions**.
4. The first deploy runs automatically from the push. When it finishes, the
   site is live at `https://paybackretr0.github.io/`.

From then on, every `git push` to `main` builds and deploys the latest version.
