import type { Directive } from 'vue'
import { animate } from 'motion-v'

export interface RevealOptions {
  /** Transition delay in ms — used for staggering. */
  delay?: number
  /** Vertical offset in px, or 'grow' for scaleY reveal (timeline lines). */
  y?: number | 'grow'
}

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

/** Elements awaiting reveal, checked on every scroll frame. */
const pending = new Set<HTMLElement>()
/** Stagger timeout ids, so unmounting cancels a pending reveal. */
const staggerTimers = new WeakMap<HTMLElement, number>()
let scrollRaf = 0

/** Animates the element from hidden to visible using Motion-V. */
function revealElement(el: HTMLElement) {
  const grow = el.dataset.revealGrow === '1'
  const delay = Number(el.dataset.revealDelay ?? 0)

  // Delay is applied outside of `animate` — motion-v's own delay option
  // proved unreliable here (staggered elements never animated).
  const start = () =>
    animate(
      el,
      grow
        ? { scaleY: [0, 1] }
        : { opacity: [0, 1], y: [24, 0] },
      {
        duration: grow ? 0.7 : 0.5,
        ease: EASE,
        onComplete: () => {
          // Clear inline styles so CSS (hover, keyframe animations) works normally.
          el.style.opacity = ''
          el.style.transform = ''
        },
      },
    )

  if (delay > 0) staggerTimers.set(el, window.setTimeout(start, delay))
  else start()
  pending.delete(el)
}

function onScroll() {
  if (scrollRaf) return
  scrollRaf = requestAnimationFrame(() => {
    scrollRaf = 0
    if (pending.size === 0) return
    for (const el of pending) {
      // Reveal once the element reaches (or passes) the viewport bottom —
      // this also catches anything an IntersectionObserver would miss at
      // high scroll speeds.
      if (el.getBoundingClientRect().top < window.innerHeight) revealElement(el)
    }
  })
}

if (typeof window !== 'undefined') {
  window.addEventListener('scroll', onScroll, { passive: true })
}

/**
 * Scroll-reveal directive: Motion-V's `animate` engine with a rAF-throttled
 * scroll check as the trigger.
 *
 * Fail-safes (content is NEVER permanently hidden):
 * - Reduced motion → element stays visible.
 * - Elements already inside the viewport on mount are revealed immediately,
 *   so a page refresh never leaves above-the-fold text invisible.
 * - The scroll check runs on every frame, so no element can be skipped,
 *   regardless of scroll speed (Lenis, wheel flick, anchor jump, etc.).
 */
export const vReveal: Directive<HTMLElement, RevealOptions> = {
  mounted(el, binding) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const { delay = 0, y = 24 } = binding.value ?? {}
    const grow = y === 'grow'

    el.dataset.revealGrow = grow ? '1' : '0'
    el.dataset.revealDelay = String(delay)

    el.style.opacity = '0'
    el.style.transform = grow ? 'scaleY(0)' : `translateY(${y}px)`
    if (grow) el.style.transformOrigin = 'top'

    const rect = el.getBoundingClientRect()
    const alreadyInView = rect.top < window.innerHeight && rect.bottom > 0

    if (alreadyInView) {
      requestAnimationFrame(() => revealElement(el))
      return
    }

    pending.add(el)
    onScroll() // immediate check (also covers layout shifts right after mount)
  },
  unmounted(el) {
    pending.delete(el)
    const timer = staggerTimers.get(el)
    if (timer) {
      clearTimeout(timer)
      staggerTimers.delete(el)
    }
  },
}
