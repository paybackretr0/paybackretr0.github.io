<template>
  <div aria-hidden="true" class="fixed inset-x-0 top-[env(safe-area-inset-top)] z-[70] h-[2px]">
    <div
      class="h-full origin-left bg-gradient-to-r from-primary via-violet to-cyan shadow-[0_0_14px_var(--glow)]"
      :style="{ transform: `scaleX(${progress})` }"
    />
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

const progress = ref(0)
let raf = 0

function update() {
  const doc = document.documentElement
  const max = doc.scrollHeight - doc.clientHeight
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
  update()
  window.addEventListener('scroll', onScroll, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  if (raf) cancelAnimationFrame(raf)
})
</script>
