<template>
  <div ref="host" class="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
    <!-- Static stand-in: what reduced-motion visitors, browsers without WebGL,
         ?perf=low and the prerenderer see. It fades out once the room is live. -->
    <div class="stage-poster absolute inset-0" :class="ready ? 'opacity-0' : 'opacity-100'" />

    <canvas
      v-if="enabled"
      ref="canvas"
      class="absolute inset-0 h-full w-full transition-opacity duration-1000"
      :class="ready ? 'opacity-[0.85]' : 'opacity-0'"
    />

    <!-- Fades the room into the section below so the hero has no hard edge -->
    <div class="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-ink to-transparent" />
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import type { RoomPalette, RoomSceneHandle } from '@/components/three/roomScene.three'
import { isLowPower } from '@/composables/usePerfMode'
import { useReducedMotion } from '@/composables/useReducedMotion'
import { useTheme } from '@/composables/useTheme'
import { useWebGLSupport } from '@/composables/useWebGLSupport'

const { reducedMotion } = useReducedMotion()
const { theme } = useTheme()
const { supported, lowPower } = useWebGLSupport()

/** Low-power devices skip the scene entirely and keep the CSS poster. */
const lowPowerMode = isLowPower()

const host = ref<HTMLElement | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)
const ready = ref(false)

const enabled = computed(() => supported && !reducedMotion.value && !lowPowerMode)

let handle: RoomSceneHandle | null = null
let observer: IntersectionObserver | null = null
let visibilityObserver: IntersectionObserver | null = null
let onVisibility: (() => void) | null = null
let onWindowResize: (() => void) | null = null
let onScroll: (() => void) | null = null
let scrollRaf = 0
let disposed = false

function cssColor(name: string, fallback: string): string {
  if (typeof window === 'undefined') return fallback
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  return value || fallback
}

/** Every colour the room needs, straight from the CSS tokens. */
function readPalette(): RoomPalette {
  return {
    ink: cssColor('--ink', '#0c0a08'),
    wall: cssColor('--room-wall', '#17140f'),
    floor: cssColor('--room-floor', '#0f0d0a'),
    beam: cssColor('--room-beam', '#ffe3b0'),
    dust: cssColor('--room-dust', '#ffefd2'),
    fog: cssColor('--room-fog', '#0b0a08'),
    bronze: cssColor('--primary', '#b08d57'),
    shadow: cssColor('--room-shadow', '#050403'),
  }
}

/** How far the hero has scrolled out of view, 0 → 1. */
function scrollProgress(): number {
  const el = host.value
  if (!el) return 0
  const rect = el.getBoundingClientRect()
  if (rect.height <= 0) return 0
  return Math.min(Math.max(-rect.top / rect.height, 0), 1)
}

function pushScroll(): void {
  handle?.setScroll(scrollProgress())
}

/**
 * Boots the scene on demand. `three` is imported here — not at the top of the
 * file — so it lands in its own chunk and never delays first paint.
 */
async function boot() {
  if (disposed || handle || !canvas.value) return

  try {
    const { createRoomScene } = await import('@/components/three/roomScene.three')
    if (disposed || !canvas.value) return

    handle = createRoomScene(canvas.value, {
      palette: readPalette(),
      mobile: lowPower,
    })
    handle.start()
    ready.value = true

    onWindowResize = () => handle?.resize()
    window.addEventListener('resize', onWindowResize, { passive: true })

    // Scroll only nudges the camera, so it is polled on a rAF tick rather than
    // doing view maths on every scroll event (same pattern as ScrollProgress).
    onScroll = () => {
      if (scrollRaf) return
      scrollRaf = requestAnimationFrame(() => {
        scrollRaf = 0
        pushScroll()
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    pushScroll()

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
    // context limits). Keep the CSS poster and stay quiet for the visitor.
    console.warn('[room] WebGL scene unavailable:', error)
    handle = null
    ready.value = false
  }
}

function teardown() {
  if (onWindowResize) window.removeEventListener('resize', onWindowResize)
  if (onVisibility) document.removeEventListener('visibilitychange', onVisibility)
  if (onScroll) window.removeEventListener('scroll', onScroll)
  onWindowResize = null
  onVisibility = null
  onScroll = null

  if (scrollRaf) cancelAnimationFrame(scrollRaf)
  scrollRaf = 0

  visibilityObserver?.disconnect()
  visibilityObserver = null

  handle?.dispose()
  handle = null
  ready.value = false
}

// Theme switch re-tints the room instead of rebuilding it.
watch(theme, () => handle?.setPalette(readPalette()))

watch(reducedMotion, (reduced) => {
  if (reduced) teardown()
  else void boot()
})

onMounted(() => {
  if (!enabled.value || !host.value) return

  // Only pay for the scene once the hero is on screen.
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
