export interface WebGLCapability {
  /** A WebGL context can actually be created in this browser. */
  supported: boolean
  /** Phone-class device: fewer particles, lower DPR, no antialiasing. */
  lowPower: boolean
}

let cached: WebGLCapability | null = null

/**
 * Feature-detects WebGL once per session.
 *
 * The probe canvas is released again immediately (`loseContext`), because a
 * live context counts against the browser's small per-page limit — leaking one
 * per mount would eventually make the real scene fail to start.
 */
export function useWebGLSupport(): WebGLCapability {
  if (cached) return cached

  if (typeof window === 'undefined' || typeof document === 'undefined') {
    cached = { supported: false, lowPower: true }
    return cached
  }

  let supported = false
  try {
    const probe = document.createElement('canvas')
    const context =
      probe.getContext('webgl2') ??
      probe.getContext('webgl') ??
      probe.getContext('experimental-webgl')
    supported = Boolean(context)
    if (context) {
      const lose = (context as WebGLRenderingContext).getExtension('WEBGL_lose_context')
      lose?.loseContext()
    }
  } catch {
    supported = false
  }

  const coarse = window.matchMedia('(pointer: coarse)').matches
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8
  const cores = navigator.hardwareConcurrency ?? 8
  const lowPower = coarse || memory < 4 || cores <= 4

  cached = { supported, lowPower }
  return cached
}
