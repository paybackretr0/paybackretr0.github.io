<template>
  <div aria-hidden="true" class="fixed inset-x-0 top-[env(safe-area-inset-top)] z-[70] h-[2px]">
    <div
      class="h-full origin-left bg-primary shadow-[0_0_14px_var(--glow)]"
      :style="{ transform: `scaleX(${progress})` }"
    />
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

const progress = ref(0)

let raf = 0
/** Cached scrollable height — reading scrollHeight forces a layout pass. */
let max = 0
let resizeObserver: ResizeObserver | null = null

function measure() {
  const doc = document.documentElement
  max = doc.scrollHeight - doc.clientHeight
  update()
}

function update() {
  progress.value = max > 0 ? Math.min(window.scrollY / max, 1) : 0
}

function onScroll() {
  if (raf) return
  raf = requestAnimationFrame(() => {
    update()
    raf = 0
  })
}

onMounted(() => {
  measure()
  window.addEventListener('scroll', onScroll, { passive: true })

  // Content height changes on language switch and on font load; observing the
  // body keeps the cached max correct without polling it on every frame.
  resizeObserver = new ResizeObserver(measure)
  resizeObserver.observe(document.body)
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  resizeObserver?.disconnect()
  resizeObserver = null
  if (raf) cancelAnimationFrame(raf)
})
</script>
