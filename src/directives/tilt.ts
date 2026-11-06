import type { Directive } from 'vue'

import { useReducedMotion } from '@/composables/useReducedMotion'

export interface TiltBinding {
  /** Maximum rotation in degrees on each axis. */
  max?: number
  /** Scale while the pointer is inside. */
  scale?: number
}

interface TiltState {
  frame: number
  currentX: number
  currentY: number
  targetX: number
  targetY: number
  onMove: (event: PointerEvent) => void
  onLeave: () => void
}

const states = new WeakMap<HTMLElement, TiltState>()

/**
 * `v-tilt` — pointer-driven 3D tilt on the element itself.
 *
 * A directive rather than a wrapper component: cards live inside grids where an
 * extra `<div>` would become the grid item and change the layout.
 *
 * One rAF loop lerps towards the target angles, so the handler never animates
 * more than one element per frame. Bails out for touch (a card following a
 * finger shifts under the tap) and for reduced motion.
 */
export const vTilt: Directive<HTMLElement, TiltBinding | undefined> = {
  mounted(el, binding) {
    const { reducedMotion } = useReducedMotion()
    if (reducedMotion.value) return
    if (window.matchMedia('(pointer: coarse)').matches) return

    const max = binding.value?.max ?? 8
    const scale = binding.value?.scale ?? 1.02

    el.classList.add('tilt-target')

    const state: TiltState = {
      frame: 0,
      currentX: 0,
      currentY: 0,
      targetX: 0,
      targetY: 0,
      onMove: () => {},
      onLeave: () => {},
    }

    const render = () => {
      state.currentX += (state.targetX - state.currentX) * 0.14
      state.currentY += (state.targetY - state.currentY) * 0.14

      const settled =
        Math.abs(state.targetX - state.currentX) < 0.02 &&
        Math.abs(state.targetY - state.currentY) < 0.02

      if (settled) {
        state.currentX = state.targetX
        state.currentY = state.targetY
      }

      el.style.transform = `perspective(1000px) rotateX(${state.currentX.toFixed(
        2,
      )}deg) rotateY(${state.currentY.toFixed(2)}deg) scale(${settled ? 1 : scale})`

      state.frame = settled ? 0 : requestAnimationFrame(render)
    }

    state.onMove = (event: PointerEvent) => {
      const rect = el.getBoundingClientRect()
      const px = (event.clientX - rect.left) / rect.width - 0.5
      const py = (event.clientY - rect.top) / rect.height - 0.5

      state.targetX = -py * max * 2
      state.targetY = px * max * 2
      el.dataset.tiltActive = 'true'
      if (!state.frame) state.frame = requestAnimationFrame(render)
    }

    state.onLeave = () => {
      state.targetX = 0
      state.targetY = 0
      delete el.dataset.tiltActive
      if (!state.frame) state.frame = requestAnimationFrame(render)
    }

    el.addEventListener('pointermove', state.onMove)
    el.addEventListener('pointerleave', state.onLeave)

    states.set(el, state)
  },

  unmounted(el) {
    const state = states.get(el)
    if (!state) return

    el.removeEventListener('pointermove', state.onMove)
    el.removeEventListener('pointerleave', state.onLeave)
    if (state.frame) cancelAnimationFrame(state.frame)

    states.delete(el)
  },
}
