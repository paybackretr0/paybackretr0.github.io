<template>
  <footer class="relative bg-ink shadow-[inset_0_18px_26px_-26px_var(--neu-dark)]">
    <div class="mx-auto max-w-6xl px-6 pt-14 pb-[calc(3.5rem+env(safe-area-inset-bottom))]">
      <div class="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
        <div>
          <a href="#home" class="flex items-center gap-3" @click.prevent="scrollToTop">
            <span class="text-base font-bold tracking-tight text-copy">{{ site.name }}</span>
          </a>
          <p class="mt-3 max-w-sm text-sm leading-6 text-muted">{{ t.footer.tagline }}</p>
        </div>

        <SocialLinks />
      </div>

      <div
        class="mt-10 flex flex-col items-start justify-between gap-4 border-t border-line pt-6 text-xs text-muted-2 sm:flex-row sm:items-center"
      >
        <p>© {{ year }} {{ site.name }}. {{ t.footer.rights }}</p>
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8">
          <p>{{ t.footer.built }}</p>
          <a
            href="#home"
            class="inline-flex items-center gap-1.5 transition-colors hover:text-accent"
            @click.prevent="scrollToTop"
          >
            {{ t.footer.backToTop }}
            <ArrowUp class="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { ArrowUp } from 'lucide-vue-next'
import { useLang } from '@/composables/useLang'
import { site } from '@/data/site'
import SocialLinks from '@/components/SocialLinks.vue'
import { scrollToTarget } from '@/composables/useSmoothScroll'

const { t } = useLang()

const year = new Date().getFullYear()

function scrollToTop() {
  scrollToTarget(0)
}
</script>
