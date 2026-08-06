import { onBeforeUnmount, onMounted, ref } from 'vue'

/**
 * Magnetic hover effect: the element gently follows the cursor and
 * springs back on leave. Returns template refs `el` and `style` to
 * bind in the template (e.g. `:style="style"`).
 */
export function useMagnetic(strength = 0.32) {
  const el = ref<HTMLElement | null>(null)
  const x = ref(0)
  const y = ref(0)

  const style = ref({ transform: 'translate3d(0px, 0px, 0px)' })

  let raf = 0
  let currentX = 0
  let currentY = 0

  onMounted(() => {
    const target = el.value
    if (!target) return

    // Touch devices have no hover — following a finger while tapping
    // shifts the button under the finger and causes mis-taps.
    if (window.matchMedia('(pointer: coarse)').matches) return

    const onMove = (e: PointerEvent) => {
      const rect = target.getBoundingClientRect()
      const dx = e.clientX - (rect.left + rect.width / 2)
      const dy = e.clientY - (rect.top + rect.height / 2)
      x.value = dx * strength
      y.value = dy * strength
      if (!raf) loop()
    }

    const onLeave = () => {
      x.value = 0
      y.value = 0
      if (!raf) loop()
    }

    const loop = () => {
      currentX += (x.value - currentX) * 0.18
      currentY += (y.value - currentY) * 0.18
      style.value = {
        transform: `translate3d(${currentX.toFixed(2)}px, ${currentY.toFixed(2)}px, 0)`,
      }
      if (Math.abs(x.value - currentX) > 0.1 || Math.abs(y.value - currentY) > 0.1) {
        raf = requestAnimationFrame(loop)
      } else {
        raf = 0
      }
    }

    target.addEventListener('pointermove', onMove)
    target.addEventListener('pointerleave', onLeave)

    onBeforeUnmount(() => {
      target.removeEventListener('pointermove', onMove)
      target.removeEventListener('pointerleave', onLeave)
      if (raf) cancelAnimationFrame(raf)
    })
  })

  return { el, style }
}
