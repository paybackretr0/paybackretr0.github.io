import type { Directive } from 'vue'

import { useReducedMotion } from '@/composables/useReducedMotion'

interface SpotlightState {
  frame: number
  rect: DOMRect | null
  x: number
  y: number
  onEnter: () => void
  onMove: (event: PointerEvent) => void
  onLeave: () => void
}

const states = new WeakMap<HTMLElement, SpotlightState>()

/**
 * `v-spotlight` — cursor-following glow on a card.
 *
 * The handler writes only two custom properties (`--mx` / `--my`); the gradient
 * itself lives in CSS (`.spotlight-card::after`), so the browser never has to
 * re-parse a gradient while the pointer moves.
 */
export const vSpotlight: Directive<HTMLElement> = {
  mounted(el) {
    const { reducedMotion } = useReducedMotion()
    if (reducedMotion.value) return
    if (window.matchMedia('(pointer: coarse)').matches) return

    el.classList.add('spotlight-card')

    const state: SpotlightState = {
      frame: 0,
      rect: null,
      x: 0,
      y: 0,
      onEnter: () => {},
      onMove: () => {},
      onLeave: () => {},
    }

    const flush = () => {
      state.frame = 0
      el.style.setProperty('--mx', `${state.x.toFixed(1)}px`)
      el.style.setProperty('--my', `${state.y.toFixed(1)}px`)
    }

    state.onEnter = () => {
      state.rect = el.getBoundingClientRect()
    }

    state.onMove = (event: PointerEvent) => {
      state.rect ??= el.getBoundingClientRect()
      state.x = event.clientX - state.rect.left
      state.y = event.clientY - state.rect.top
      if (!state.frame) state.frame = requestAnimationFrame(flush)
    }

    state.onLeave = () => {
      state.rect = null
    }

    el.addEventListener('pointerenter', state.onEnter)
    el.addEventListener('pointermove', state.onMove)
    el.addEventListener('pointerleave', state.onLeave)

    states.set(el, state)
  },

  unmounted(el) {
    const state = states.get(el)
    if (!state) return

    el.removeEventListener('pointerenter', state.onEnter)
    el.removeEventListener('pointermove', state.onMove)
    el.removeEventListener('pointerleave', state.onLeave)
    if (state.frame) cancelAnimationFrame(state.frame)

    states.delete(el)
  },
}
