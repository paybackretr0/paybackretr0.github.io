<template>
  <span ref="el">{{ display }}</span>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const props = withDefaults(
  defineProps<{
    to: number
    suffix?: string
    duration?: number
  }>(),
  { suffix: '', duration: 1200 },
)

const el = ref<HTMLElement | null>(null)
const value = ref(0)

const display = computed(() => `${Math.round(value.value).toLocaleString('en-US')}${props.suffix}`)

let raf = 0
let observer: IntersectionObserver | null = null

function animateCount() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    value.value = props.to
    return
  }
  const start = performance.now()
  const tick = (now: number) => {
    const p = Math.min((now - start) / props.duration, 1)
    // easeOutCubic — soft deceleration
    const eased = 1 - Math.pow(1 - p, 3)
    value.value = props.to * eased
    if (p < 1) {
      raf = requestAnimationFrame(tick)
    } else {
      value.value = props.to
    }
  }
  raf = requestAnimationFrame(tick)
}

onMounted(() => {
  if (!el.value) return
  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0]?.isIntersecting) {
        animateCount()
        observer?.disconnect()
      }
    },
    { threshold: 0.1 },
  )
  observer.observe(el.value)
})

onBeforeUnmount(() => {
  observer?.disconnect()
  cancelAnimationFrame(raf)
})
</script>
