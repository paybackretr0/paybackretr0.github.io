<template>
  <component :is="as" ref="root">
    <span v-for="(line, i) in items" :key="`${i}-${line.text}`" class="block overflow-hidden">
      <span
        class="block will-change-transform"
        :class="line.class"
        :style="hidden ? maskStyle : undefined"
      >
        {{ line.text }}
      </span>
    </span>
  </component>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import gsap from 'gsap'

import { useReducedMotion } from '@/composables/useReducedMotion'

/**
 * One masked line. Extra classes (e.g. the serif gradient accent) are applied
 * to the sliding span, not the mask box.
 */
interface MaskedLine {
  text: string
  class?: string
}

/**
 * Masked line reveal: each line sits inside an `overflow-hidden` box and slides
 * up from below — the editorial "type rises into place" move.
 *
 * One span per line is rendered up front (no runtime text splitting), so the
 * markup stays readable, localized text keeps working, and a line break never
 * depends on measuring font metrics.
 */
const props = withDefaults(
  defineProps<{
    /** One entry per visual line. */
    lines: Array<string | MaskedLine>
    /** Wrapper element. */
    as?: string
    /** Delay before the first line, in ms. */
    delay?: number
    /** Stagger between lines, in ms. */
    stagger?: number
  }>(),
  { as: 'span', delay: 0, stagger: 70 },
)

const { reducedMotion } = useReducedMotion()

const root = ref<HTMLElement | null>(null)
/** Lines start masked; flipped to false as soon as the tween runs. */
const hidden = ref(!reducedMotion.value)
const maskStyle = { transform: 'translateY(110%)' }

const items = computed<MaskedLine[]>(() =>
  props.lines.map((line) => (typeof line === 'string' ? { text: line } : line)),
)

let observer: IntersectionObserver | null = null

onMounted(() => {
  const node = root.value
  if (!node) return

  const lines = Array.from(node.querySelectorAll<HTMLElement>('span > span'))

  if (reducedMotion.value || lines.length === 0) {
    hidden.value = false
    return
  }

  const play = () => {
    hidden.value = false
    gsap.fromTo(
      lines,
      { yPercent: 110, opacity: 0 },
      {
        yPercent: 0,
        opacity: 1,
        duration: 0.9,
        ease: 'expo.out',
        stagger: props.stagger / 1000,
        delay: props.delay / 1000,
        onComplete: () => {
          for (const line of lines) {
            line.style.transform = ''
            line.style.opacity = ''
          }
        },
      },
    )
  }

  const rect = node.getBoundingClientRect()
  if (rect.top < window.innerHeight && rect.bottom > 0) {
    play()
    return
  }

  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0]?.isIntersecting) {
        play()
        observer?.disconnect()
      }
    },
    { threshold: 0.2 },
  )
  observer.observe(node)
})

onBeforeUnmount(() => {
  observer?.disconnect()
  observer = null
})
</script>
