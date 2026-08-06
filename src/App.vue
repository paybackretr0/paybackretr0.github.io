<template>
  <ScrollProgress />
  <Backdrop />

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

import Navbar from '@/components/Navbar.vue'
import Footer from '@/components/Footer.vue'
import ScrollProgress from '@/components/ScrollProgress.vue'
import Backdrop from '@/components/Backdrop.vue'

useSmoothScroll()
useTheme()
</script>
