import { onBeforeUnmount, onMounted } from 'vue'
import Lenis from 'lenis'

let lenis: Lenis | null = null
let rafId = 0

/** Initializes Lenis smooth scrolling for the app (App.vue). */
export function useSmoothScroll() {
  onMounted(() => {
    // Respect reduced motion: keep native scrolling.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    lenis = new Lenis({
      duration: 1.1,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    })

    const raf = (time: number) => {
      lenis?.raf(time)
      rafId = requestAnimationFrame(raf)
    }
    rafId = requestAnimationFrame(raf)
  })

  onBeforeUnmount(() => {
    cancelAnimationFrame(rafId)
    lenis?.destroy()
    lenis = null
  })
}

/**
 * Smooth-scroll to a target (selector string or pixel offset).
 * Uses Lenis when available; falls back to native smooth scrolling.
 * `offset` compensates for the fixed navbar (e.g. -96).
 */
/** Pause smooth scrolling (e.g. while a modal/drawer is open). */
export function stopSmoothScroll() {
  lenis?.stop()
}

/** Resume smooth scrolling after it was paused. */
export function startSmoothScroll() {
  lenis?.start()
}

export function scrollToTarget(target: string | number, offset = 0) {
  if (lenis) {
    lenis.scrollTo(target, { offset, duration: 1.2 })
  } else if (typeof target === 'string') {
    document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' })
  } else {
    window.scrollTo({ top: target, behavior: 'smooth' })
  }
}
