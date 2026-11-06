<template>
  <div ref="host" class="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
    <!-- Static stand-in: what reduced-motion users, browsers without WebGL and
         the prerenderer see. It fades out as soon as the scene is live. -->
    <HeroFallback :hidden="ready" />

    <canvas
      v-if="enabled"
      ref="canvas"
      class="absolute inset-x-0 top-0 h-svh w-full transition-opacity duration-1000"
      :class="ready ? canvasOpacity : 'opacity-0'"
    />

    <!-- Fades the scene into the section below so the hero has no hard edge,
         and keeps the stat cards legible where the table would otherwise be
         at its busiest. -->
    <div
      class="absolute inset-x-0 bottom-0 h-60 bg-gradient-to-t from-ink via-ink/55 via-40% to-transparent"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import type { ScenePalette } from '@/components/three/billiardScene.three'
import type { HeroSceneHandle } from '@/components/three/heroScene.three'
import HeroFallback from '@/components/ui/HeroFallback.vue'
import { isLowPower } from '@/composables/usePerfMode'
import { useReducedMotion } from '@/composables/useReducedMotion'
import { useTheme } from '@/composables/useTheme'
import { useWebGLSupport } from '@/composables/useWebGLSupport'

/**
 * The hero has two scene modules behind one switch. `?scene=orb` brings the old
 * particle shell back, which makes an A/B comparison — and a rollback — a query
 * parameter instead of a revert.
 */
type SceneKind = 'orb' | 'billiard'

interface SceneHandle {
  start(): void
  stop(): void
  resize(): void
  dispose(): void
  setPalette?(palette: ScenePalette): void
  setScroll?(progress: number): void
}

function resolveSceneKind(): SceneKind {
  if (typeof window === 'undefined') return 'billiard'
  const value = new URLSearchParams(window.location.search).get('scene')
  return value === 'orb' ? 'orb' : 'billiard'
}

const sceneKind = resolveSceneKind()

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

let handle: SceneHandle | null = null
/** Re-tints the live scene after a theme switch (each scene module has its own). */
let repaint: (() => void) | null = null
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

/** Every colour the billiard scene needs, straight from the CSS tokens. */
function readPalette(): ScenePalette {
  return {
    ink: cssColor('--ink', '#06070b'),
    accent: cssColor('--accent', '#8fb6ff'),
    violet: cssColor('--violet', '#a78bfa'),
    cyan: cssColor('--cyan', '#5ee6f5'),
    felt: cssColor('--scene-felt', '#0b101b'),
    feltLine: cssColor('--scene-felt-line', '#324a70'),
    cushion: cssColor('--scene-cushion', '#141c2b'),
    rail: cssColor('--scene-rail', '#0d131f'),
    pocket: cssColor('--scene-pocket', '#020306'),
    ball: cssColor('--scene-ball', '#101725'),
    ballRim: cssColor('--scene-ball-rim', '#cfe0ff'),
    cue: cssColor('--scene-cue', '#232c3f'),
    cueTip: cssColor('--scene-cue-tip', '#8fb6ff'),
    fog: cssColor('--scene-fog', '#05060a'),
  }
}

/**
 * The table is busier than the old particle shell, so it sits a little further
 * back behind the type. Below ~0.7 the felt stops reading as a table at all.
 */
const canvasOpacity = computed(() => (sceneKind === 'billiard' ? 'opacity-[0.60]' : 'opacity-60'))

/**
 * How far the hero has scrolled out of view, 0→1. Measured from the canvas box
 * instead of `window.scrollY` so it stays correct if the hero ever moves.
 */
function scrollProgress(): number {
  const el = host.value
  if (!el) return 0
  const rect = el.getBoundingClientRect()
  if (rect.height <= 0) return 0
  return Math.min(Math.max(-rect.top / rect.height, 0), 1)
}

function pushScroll(): void {
  handle?.setScroll?.(scrollProgress())
}

/**
 * Boots the scene on demand. `three` is imported here — not at the top of the
 * file — so it lands in its own chunk and never delays first paint.
 */
async function boot() {
  if (disposed || handle || !canvas.value) return

  try {
    if (sceneKind === 'orb') {
      const { createHeroScene } = await import('@/components/three/heroScene.three')
      if (disposed || !canvas.value) return

      const orb: HeroSceneHandle = createHeroScene(canvas.value, {
        accent: cssColor('--accent', '#8fb6ff'),
        violet: cssColor('--violet', '#a78bfa'),
        mobile: lowPower,
      })
      handle = orb
      repaint = () =>
        orb.setColors(cssColor('--accent', '#8fb6ff'), cssColor('--violet', '#a78bfa'))
    } else {
      const { createBilliardScene } = await import('@/components/three/billiardScene.three')
      if (disposed || !canvas.value) return

      const billiard = createBilliardScene(canvas.value, {
        palette: readPalette(),
        mobile: lowPower,
      })
      handle = billiard
      repaint = () => billiard.setPalette(readPalette())
    }

    handle.start()
    ready.value = true

    onWindowResize = () => handle?.resize()
    window.addEventListener('resize', onWindowResize, { passive: true })

    // Scroll only nudges the camera, so it is polled on a rAF tick instead of
    // running any view maths on every scroll event (same pattern as
    // ScrollProgress.vue).
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
    // context limits). Keep the CSS fallback and stay quiet for the visitor.
    console.warn('[hero] WebGL scene unavailable:', error)
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
  repaint = null
  ready.value = false
}

// Theme switch re-tints the scene instead of rebuilding it.
watch(theme, () => repaint?.())

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
