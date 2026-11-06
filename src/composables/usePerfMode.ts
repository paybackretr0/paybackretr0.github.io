export type PerfMode = 'high' | 'low'

/**
 * Decides how much animation budget this device gets, once per session.
 *
 * The full composition — drifting aurora, grain, backdrop blur, a live WebGL
 * hero — is cheap on a laptop and expensive on a phone or an old integrated
 * GPU. Rather than guess per effect, the whole app reads one attribute
 * (`data-perf` on <html>) and style.css turns the expensive layers off for
 * `low`, while the page keeps its layout and colour.
 */
const STORAGE_KEY = 'perf'

/**
 * Manual override — `?perf=low` / `?perf=high`, remembered for later visits.
 * Handy when a machine sits right on the edge of the automatic detection.
 */
function fromOverride(): PerfMode | null {
  if (typeof window === 'undefined') return null

  try {
    const value = new URLSearchParams(window.location.search).get('perf')
    if (value === 'low' || value === 'high') {
      localStorage.setItem(STORAGE_KEY, value)
      return value
    }
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'low' || saved === 'high') return saved
  } catch {
    /* private mode / unavailable storage */
  }

  return null
}

function detect(): PerfMode {
  if (typeof window === 'undefined') return 'high'

  const nav = navigator as Navigator & {
    deviceMemory?: number
    connection?: { saveData?: boolean }
  }

  const memory = nav.deviceMemory ?? 8
  const cores = navigator.hardwareConcurrency ?? 8
  const saveData = nav.connection?.saveData ?? false
  const coarse = window.matchMedia('(pointer: coarse)').matches

  if (saveData || memory <= 4 || cores <= 4) return 'low'
  // Mid-range phones often report 8 cores but still stall on blur + WebGL.
  if (coarse && cores <= 6) return 'low'

  return 'high'
}

const mode: PerfMode = fromOverride() ?? detect()

/** True when expensive ambient effects should be skipped. */
export function isLowPower(): boolean {
  return mode === 'low'
}

export function usePerfMode() {
  if (typeof document !== 'undefined') {
    document.documentElement.dataset.perf = mode
  }

  return { perfMode: mode, isLowPower: mode === 'low' }
}
