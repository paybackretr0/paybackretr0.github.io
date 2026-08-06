<template>
  <section id="contact" class="section section-loose scroll-mt-24">
    <div v-reveal class="glass-strong relative overflow-hidden rounded-[26px] px-6 py-16 text-center sm:px-14 sm:py-20">
      <span class="absolute inset-x-0 top-0 h-px bg-primary/50" />

      <div class="relative">
        <p class="flex items-center justify-center gap-3 font-mono text-[11px] tracking-[0.28em] text-accent uppercase">
          <span class="text-muted-2">06</span>
          <span class="h-px w-8 bg-accent/40" />
          <span>{{ t.contact.eyebrow }}</span>
        </p>
        <h2 class="mx-auto mt-5 max-w-3xl text-4xl leading-[1.08] font-bold tracking-tight text-copy sm:text-5xl lg:text-6xl">
          <template v-if="titleParts.length > 1">
            <span v-for="(part, i) in titleParts" :key="i">
              <em v-if="i % 2 === 1" class="accent-serif text-gradient">{{ part }}</em>
              <template v-else>{{ part }}</template>
            </span>
          </template>
          <template v-else>{{ t.contact.title }}</template>
        </h2>
        <p class="mx-auto mt-5 max-w-xl text-base leading-7 text-muted">{{ t.contact.desc }}</p>

        <div class="mt-10 flex justify-center">
          <MagneticButton>
            <a :href="`mailto:${site.email}`" class="btn btn-primary px-8 py-4 text-base">
              <Mail class="h-4.5 w-4.5" />
              {{ t.contact.emailCta }}
            </a>
          </MagneticButton>
        </div>

        <p class="mt-5 flex items-center justify-center gap-2 text-xs text-muted-2">
          <Clock class="h-3.5 w-3.5" />
          {{ t.contact.reply }}
        </p>

        <div class="mt-10 flex justify-center">
          <SocialLinks />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Clock, Mail } from 'lucide-vue-next'
import { useLang } from '@/composables/useLang'
import { site } from '@/data/site'
import SocialLinks from '@/components/SocialLinks.vue'
import MagneticButton from '@/components/MagneticButton.vue'

const { t } = useLang()

/** Split the title around the serif-accented word (mirrors SectionHeading).
    Falls back to the full title when the accent isn't found. */
const titleParts = computed(() => {
  const accent = t.value.contact.accent
  const title = t.value.contact.title
  if (!accent || !title.includes(accent)) return [title]
  const at = title.indexOf(accent)
  return [title.slice(0, at), accent, title.slice(at + accent.length)]
})
</script>
