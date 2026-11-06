import { computed, ref } from 'vue'

/**
 * Tracks the `prefers-reduced-motion` media query once for the whole app.
 *
 * Every motion-heavy component (tilt, spotlight, masked text, the WebGL hero)
 * checks this first and renders its static state instead. The same rule keeps
 * scripts/prerender.mjs — which emulates reduced motion before snapshotting —
 * from capturing a half-animated page.
 */
const query =
  typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null

const reduced = ref(query?.matches ?? false)

query?.addEventListener('change', (event) => {
  reduced.value = event.matches
})

export function useReducedMotion() {
  const reducedMotion = computed(() => reduced.value)
  return { reducedMotion }
}
