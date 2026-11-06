<template>
  <ScrollProgress />
  <AuroraBackground />

  <Navbar />

  <main class="relative z-10">
    <RouterView v-slot="{ Component }">
      <Transition name="page" mode="out-in">
        <component :is="Component" />
      </Transition>
    </RouterView>
  </main>

  <div class="relative z-10">
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useSmoothScroll } from '@/composables/useSmoothScroll'
import { useTheme } from '@/composables/useTheme'
import { usePerfMode } from '@/composables/usePerfMode'

import Navbar from '@/components/Navbar.vue'
import Footer from '@/components/Footer.vue'
import ScrollProgress from '@/components/ScrollProgress.vue'
import AuroraBackground from '@/components/ui/AuroraBackground.vue'

useSmoothScroll()
useTheme()
// Marks <html data-perf="high|low"> before the first frame, so the expensive
// ambient layers never even start on weak devices.
usePerfMode()
</script>
