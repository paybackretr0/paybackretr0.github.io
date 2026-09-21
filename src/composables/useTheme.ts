import { ref } from 'vue'

export type Theme = 'dark' | 'light'

const STORAGE_KEY = 'theme'

/** Resolve initial theme — saved preference, fall back to dark. */
function resolveInitial(): Theme {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'light' || saved === 'dark') return saved
  } catch {
    /* private mode / unavailable storage */
  }
  return 'dark'
}

const theme = ref<Theme>(resolveInitial())

function apply(t: Theme) {
  const root = document.documentElement
  root.setAttribute('data-theme', t)

  // Keep the browser UI (address bar) in sync on mobile.
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) {
    meta.setAttribute('content', t === 'light' ? '#e0e5ec' : '#262b33')
  }
}

export function useTheme() {
  const toggleTheme = () => {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
    apply(theme.value)
    try {
      localStorage.setItem(STORAGE_KEY, theme.value)
    } catch {
      /* ignore */
    }
  }

  return { theme, toggleTheme }
}

// Apply on first import (App mounts) so the attribute is present even if
// the inline <head> script is stripped (e.g. during tests).
apply(theme.value)
