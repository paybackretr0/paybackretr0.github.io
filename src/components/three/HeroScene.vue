<template>
  <div ref="host" class="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
    <!-- Static stand-in: what reduced-motion users, browsers without WebGL and
         the prerenderer see. It fades out as soon as the scene is live. -->
    <div class="hero-fallback absolute inset-0" :class="ready ? 'opacity-0' : 'opacity-100'" />

    <canvas
      v-if="enabled"
      ref="canvas"
      class="absolute inset-0 h-full w-full transition-opacity duration-1000"
      :class="ready ? 'opacity-60' : 'opacity-0'"
    />

    <!-- Fades the scene into the section below so the hero has no hard edge -->
    <div class="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-ink to-transparent" />
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import type { HeroSceneHandle } from '@/components/three/heroScene.three'
import { isLowPower } from '@/composables/usePerfMode'
import { useReducedMotion } from '@/composables/useReducedMotion'
import { useTheme } from '@/composables/useTheme'
import { useWebGLSupport } from '@/composables/useWebGLSupport'

const { reducedMotion } = useReducedMotion()
const { theme } = useTheme()
const { supported, lowPower } = useWebGLSupport()

/** Low-power devices skip the scene entirely and keep the CSS fallback. */
const lowPowerMode = isLowPower()

const host = ref<HTMLElement | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)
/** True once the scene is rendering, i.e. the fallback can fade away. */
const ready = ref(false)

const enabled = computed(() => supported && !reducedMotion.value && !lowPowerMode)

let handle: HeroSceneHandle | null = null
let observer: IntersectionObserver | null = null
let visibilityObserver: IntersectionObserver | null = null
let onVisibility: (() => void) | null = null
let onWindowResize: (() => void) | null = null
let disposed = false

function cssColor(name: string, fallback: string): string {
  if (typeof window === 'undefined') return fallback
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  return value || fallback
}

/**
 * Boots the scene on demand. `three` is imported here — not at the top of the
 * file — so it lands in its own chunk and never delays first paint.
 */
async function boot() {
  if (disposed || handle || !canvas.value) return

  try {
    const { createHeroScene } = await import('@/components/three/heroScene.three')
    if (disposed || !canvas.value) return

    handle = createHeroScene(canvas.value, {
      accent: cssColor('--accent', '#8fb6ff'),
      violet: cssColor('--violet', '#a78bfa'),
      mobile: lowPower,
    })
    handle.start()
    ready.value = true

    onWindowResize = () => handle?.resize()
    window.addEventListener('resize', onWindowResize, { passive: true })

    // A backgrounded tab must not keep burning GPU time.
    onVisibility = () => {
      if (document.hidden) handle?.stop()
      else handle?.start()
    }
    document.addEventListener('visibilitychange', onVisibility)

    // …and neither should a canvas the visitor has already scrolled past.
    if (host.value) {
      visibilityObserver = new IntersectionObserver(
        (entries) => {
          if (entries[0]?.isIntersecting) handle?.start()
          else handle?.stop()
        },
        { threshold: 0 },
      )
      visibilityObserver.observe(host.value)
    }
  } catch (error) {
    // The probe can pass and the real context still fail (driver blacklists,
    // context limits). Keep the CSS fallback and stay quiet for the visitor.
    console.warn('[hero] WebGL scene unavailable:', error)
    handle = null
    ready.value = false
  }
}

function teardown() {
  if (onWindowResize) window.removeEventListener('resize', onWindowResize)
  if (onVisibility) document.removeEventListener('visibilitychange', onVisibility)
  onWindowResize = null
  onVisibility = null

  visibilityObserver?.disconnect()
  visibilityObserver = null

  handle?.dispose()
  handle = null
  ready.value = false
}

// Theme switch re-tints the scene instead of rebuilding it.
watch(theme, () => {
  handle?.setColors(cssColor('--accent', '#8fb6ff'), cssColor('--violet', '#a78bfa'))
})

watch(reducedMotion, (reduced) => {
  if (reduced) teardown()
  else void boot()
})

onMounted(() => {
  if (!enabled.value || !host.value) return

  // Only pay for the scene once the hero is on screen — a deep link to
  // #contact should not spin up WebGL at all.
  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0]?.isIntersecting) {
        void boot()
        observer?.disconnect()
        observer = null
      }
    },
    { rootMargin: '150px' },
  )
  observer.observe(host.value)
})

onBeforeUnmount(() => {
  disposed = true
  observer?.disconnect()
  observer = null
  teardown()
})
</script>
